// Pendientes del administrador: lo que hay que atender hoy.
//
// Lo usan la portada «Hoy» y los contadores del menú. Una sola escucha de
// Firestore compartida por todos los que lo usan: se abre con el primero y se
// cierra cuando ya nadie lo necesita, así el menú y la portada no descargan
// las colecciones dos veces.
import { useEffect, useState } from 'react'
import {
    collection,
    onSnapshot,
    Timestamp,
    type DocumentData,
    type QuerySnapshot,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import {
    collectActiveTallerDocIdsFromUsersSnapshot,
    getSubscriptionTallerUid,
    isTallerUsuarioEliminado,
} from '@/utils/activeTallerSubscriptionGuards'
import { isPendingPaymentValidationSubscription } from '@/utils/pendingPaymentValidation'

export type Vencimiento = {
    uid: string
    nombre: string
    fechaFin: Date
    telefono: string
}

export type PendientesAdmin = {
    listo: boolean
    /** No se pudieron leer los datos: las cifras pueden no estar completas. */
    error: boolean
    enEspera: number
    pagosPorValidar: number
    vencenHoy: number
    registrosIncompletos: number
    /** Planes que vencen en los próximos 7 días (incluye hoy), del más cercano al más lejano. */
    proximosVencimientos: Vencimiento[]
}

const VACIO: PendientesAdmin = {
    listo: false,
    error: false,
    enEspera: 0,
    pagosPorValidar: 0,
    vencenHoy: 0,
    registrosIncompletos: 0,
    proximosVencimientos: [],
}

const DIA = 24 * 60 * 60 * 1000

const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const aFecha = (v: unknown): Date | null => {
    if (v instanceof Timestamp) return v.toDate()
    if (v && typeof v === 'object' && 'seconds' in v) {
        const s = Number((v as { seconds: unknown }).seconds)
        return Number.isFinite(s) ? new Date(s * 1000) : null
    }
    return null
}

const enEsperaDeAprobacion = (status: unknown) =>
    String(status || '').toLowerCase().includes('esper')

/** Cálculo puro a partir de las colecciones descargadas (exportado para pruebas). */
export const calcularPendientes = (
    usuarios: QuerySnapshot<DocumentData>,
    subs: QuerySnapshot<DocumentData>,
    registrosIncompletos: number,
    ahora = new Date(),
): PendientesAdmin => {
    const hoy = inicioDelDia(ahora)
    const enUnaSemana = new Date(hoy.getTime() + 7 * DIA)
    let enEspera = 0
    let vencenHoy = 0
    const proximos: Vencimiento[] = []

    usuarios.forEach((d) => {
        const data = d.data() as Record<string, unknown>
        const tipo = String(data.typeUser || '').trim().toLowerCase()
        if (tipo !== 'taller' || isTallerUsuarioEliminado(data.status)) return
        if (enEsperaDeAprobacion(data.status)) enEspera += 1

        const sub = data.subscripcion_actual as Record<string, unknown> | undefined
        const fin = aFecha(sub?.fecha_fin)
        if (!fin) return
        const diaFin = inicioDelDia(fin)
        if (diaFin.getTime() === hoy.getTime()) vencenHoy += 1
        if (diaFin >= hoy && diaFin < enUnaSemana) {
            proximos.push({
                uid: d.id,
                nombre:
                    String(data.nombre || data.nombre_taller || '')
                        .replace(/\s+/g, ' ')
                        .trim() || 'Sin nombre',
                fechaFin: fin,
                telefono: String(data.phone || data.telefono || data.whatsapp || '').trim(),
            })
        }
    })

    const activos = collectActiveTallerDocIdsFromUsersSnapshot(usuarios)
    let pagosPorValidar = 0
    subs.forEach((d) => {
        const data = d.data() as Record<string, unknown>
        const uid = getSubscriptionTallerUid(data)
        // Mismo criterio que la lista de Validación de pagos, para que el
        // contador coincida con lo que se ve al abrirla.
        if (uid && !activos.has(uid)) return
        if (isPendingPaymentValidationSubscription(data)) pagosPorValidar += 1
    })

    proximos.sort((a, b) => a.fechaFin.getTime() - b.fechaFin.getTime())

    return {
        listo: true,
        error: false,
        enEspera,
        pagosPorValidar,
        vencenHoy,
        registrosIncompletos,
        proximosVencimientos: proximos,
    }
}

// --- Escucha compartida ---------------------------------------------------

let estado: PendientesAdmin = VACIO
const oyentes = new Set<(p: PendientesAdmin) => void>()
let cerrar: (() => void) | null = null

const emitir = (p: PendientesAdmin) => {
    estado = p
    oyentes.forEach((fn) => fn(p))
}

const abrir = () => {
    let usuarios: QuerySnapshot<DocumentData> | null = null
    let subs: QuerySnapshot<DocumentData> | null = null
    let incompletos = 0
    // Error por fuente: el aviso se mantiene hasta que esa misma fuente
    // vuelva a responder bien.
    const fallos = { usuarios: false, subs: false }
    const hayError = () => fallos.usuarios || fallos.subs
    const recalcular = () => {
        if (!usuarios || !subs) {
            if (hayError()) emitir({ ...estado, listo: true, error: true })
            return
        }
        try {
            emitir({
                ...calcularPendientes(usuarios, subs, incompletos),
                error: hayError(),
            })
        } catch (error) {
            console.error('No se pudieron calcular los pendientes:', error)
            emitir({ ...estado, listo: true, error: true })
        }
    }
    const falloDe = (fuente: keyof typeof fallos) => (error: unknown) => {
        console.error('No se pudieron leer los pendientes:', error)
        fallos[fuente] = true
        recalcular()
    }
    const cancelar = [
        onSnapshot(
            collection(db, 'Usuarios'),
            (s) => {
                usuarios = s
                fallos.usuarios = false
                recalcular()
            },
            falloDe('usuarios'),
        ),
        onSnapshot(
            collection(db, 'Subscripciones'),
            (s) => {
                subs = s
                fallos.subs = false
                recalcular()
            },
            falloDe('subs'),
        ),
        onSnapshot(
            collection(db, 'RegistrosIncompletos'),
            (s) => {
                incompletos = s.size
                recalcular()
            },
            // Sin permiso para esta colección, el resto sigue funcionando.
            () => undefined,
        ),
    ]
    return () => cancelar.forEach((c) => c())
}

/**
 * @param activo solo escucha si es true (p. ej. solo para el rol Admin).
 */
const usePendientesAdmin = (activo = true): PendientesAdmin => {
    const [valor, setValor] = useState<PendientesAdmin>(estado)

    useEffect(() => {
        if (!activo) return
        oyentes.add(setValor)
        if (!cerrar) cerrar = abrir()
        setValor(estado)
        return () => {
            oyentes.delete(setValor)
            if (oyentes.size === 0 && cerrar) {
                cerrar()
                cerrar = null
                estado = VACIO
            }
        }
    }, [activo])

    return activo ? valor : VACIO
}

export default usePendientesAdmin
