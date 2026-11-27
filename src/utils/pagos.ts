// Cálculos de la pantalla de validación de pagos.
// El precio del plan es sin IVA; el taller paga el total con IVA, en bolívares
// a la tasa oficial del BCV del día del pago.

import {
    deleteField,
    doc,
    getDoc,
    runTransaction,
    Timestamp,
    updateDoc,
} from 'firebase/firestore'
import axios from 'axios'
import { db } from '@/configs/firebaseAssets.config'
import { maybeActivateServicesOnSubscription } from '@/utils/subscriptionServiceActivation'

export const IVA_RATE = 0.16

export type TasaBcv = { fecha: string; tasa: number; manual?: boolean; fuente?: string }

export const redondear = (n: number, dec = 2): number =>
    Math.round((n + Number.EPSILON) * 10 ** dec) / 10 ** dec

export const aNumero = (v: unknown): number | null => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    if (typeof v !== 'string' || !v.trim()) return null
    const n = Number(v.trim().replace(',', '.'))
    return Number.isFinite(n) ? n : null
}

/** Convierte lo que venga (Timestamp, ISO, dd/mm/aaaa) en fecha, o null. */
export const aFecha = (v: unknown): Date | null => {
    if (!v) return null
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v
    const o = v as { toDate?: () => Date; seconds?: number; _seconds?: number }
    if (typeof o.toDate === 'function') return o.toDate()
    if (typeof o.seconds === 'number') return new Date(o.seconds * 1000)
    if (typeof o._seconds === 'number') return new Date(o._seconds * 1000)
    if (typeof v === 'string') {
        const t = v.trim()
        const m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
        if (m) {
            const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12)
            return isNaN(d.getTime()) ? null : d
        }
        const soloDia = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        const d = soloDia
            ? new Date(Number(soloDia[1]), Number(soloDia[2]) - 1, Number(soloDia[3]), 12)
            : new Date(t)
        return isNaN(d.getTime()) ? null : d
    }
    return null
}

/** Día de Venezuela (UTC-4) como 'AAAA-MM-DD'. */
export const diaVE = (d: Date = new Date()): string =>
    new Date(d.getTime() - 4 * 3600000).toISOString().slice(0, 10)

export const fechaCorta = (d: Date | null): string =>
    d
        ? d.toLocaleDateString('es-VE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'America/Caracas',
          })
        : '—'

/** Tasa vigente un día: la más reciente con fecha valor igual o anterior. `tasas` ordenadas ascendente. */
export const tasaDelDia = (tasas: TasaBcv[], dia: string): TasaBcv | null => {
    let lo = 0
    let hi = tasas.length - 1
    let res: TasaBcv | null = null
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (tasas[mid].fecha <= dia) {
            res = tasas[mid]
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return res
}

export type MontosPago = {
    subtotal: number
    iva: number
    total: number
    tasa: number | null
    montoBs: number | null
}

export const calcularMontos = (precioPlan: number, tasa: number | null): MontosPago => {
    const subtotal = redondear(precioPlan)
    const iva = redondear(subtotal * IVA_RATE)
    const total = redondear(subtotal + iva)
    return {
        subtotal,
        iva,
        total,
        tasa,
        montoBs: tasa && tasa > 0 ? redondear(total * tasa) : null,
    }
}

export type EstatusPago = 'Pagado' | 'Pendiente' | 'Vencido'

const normalizar = (v: unknown) =>
    String(v ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '')

export const estatusPago = (status: unknown, fechaFin: Date | null, ahora = new Date()): EstatusPago => {
    const s = normalizar(status)
    if (s === 'poraprobar') return 'Pendiente'
    if (s === 'vencido') return 'Vencido'
    if (fechaFin && fechaFin.getTime() < ahora.getTime()) return 'Vencido'
    return 'Pagado'
}

export const usd = (n: number | null): string =>
    n === null ? '—' : `$${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const bs = (n: number | null): string =>
    n === null ? '—' : `Bs ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const tasaTexto = (n: number | null): string =>
    n === null ? '—' : n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

// --- Validación de un pago (escrituras en Firestore + aviso al taller) ---

export type Subscriptions = {
    nombre?: string
    taller_uid?: string
    status?: string
    cantidad_servicios?: string
    fecha_inicio: Timestamp
    fecha_fin: Timestamp
    vigencia: string
    monto?: string
    uid: string
    id: string
    nombre_taller: string
    correo_taller?: string
    comprobante_pago: {
        monto?: number
        metodo?: string
        banco?: string
        comprobante?: string
        cedula?: string | number
        receiptFile?: string
        numReferencia?: string
        telefono?: number
        fechaPago?: Timestamp
        correo?: string
        bancoOrigen?: string
        bancoDestino?: string
    }
}

/** FCM / push guardado en `Usuarios.token` (dispositivo del taller). */
function getUsuarioPushToken(
    userData: Record<string, unknown> | undefined,
): string | null {
    const raw = userData?.token
    if (typeof raw !== 'string') return null
    const t = raw.trim()
    return t.length > 0 ? t : null
}

/** Lanzado cuando el pago ya no está «Por aprobar» (otro admin lo procesó). */
export const PAGO_YA_PROCESADO = 'PAGO_YA_PROCESADO'
/** Lanzado cuando otra persona lo está validando en este momento. */
export const PAGO_EN_CURSO = 'PAGO_EN_CURSO'

const estaPorAprobar = (status: unknown) =>
    String(status ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '') === 'poraprobar'

/**
 * Aprueba un pago y activa el plan del negocio.
 *
 * 1. En una transacción comprueba que siga «Por aprobar», guarda los montos
 *    (`extra`) y lo reserva: dos administradores no pueden validarlo a la vez.
 * 2. Activa los servicios y copia la suscripción en el negocio.
 * 3. Marca el pago «Aprobado» y quita la reserva. Si el paso 2 falla, el pago
 *    sigue pendiente y se puede volver a validar. Repetir el paso 2 no
 *    duplica nada: enciende los mismos servicios y reescribe la misma copia.
 * 4. Solo al final avisa al teléfono del negocio.
 */
export async function approveSubscriptionAsApproved(
    sub: Subscriptions,
    extra: Record<string, unknown> = {},
): Promise<void> {
    const fechaInicio = new Date()
    const vigenciaDias = parseInt(sub.vigencia, 10)
    if (isNaN(vigenciaDias)) {
        throw new Error('INVALID_VIGENCIA')
    }
    const fechaFin = new Date(fechaInicio)
    fechaFin.setDate(fechaInicio.getDate() + vigenciaDias)

    const updateData = {
        nombre: sub.nombre,
        vigencia: sub.vigencia,
        fecha_inicio: Timestamp.fromDate(fechaInicio),
        fecha_fin: Timestamp.fromDate(fechaFin),
        status: 'Aprobado',
        cantidad_servicios: sub.cantidad_servicios,
        monto: sub.monto,
    }

    const ref = doc(db, 'Subscripciones', sub.uid)
    // Paso 1: reservar el pago. Mientras dura la validación queda marcado con
    // `validacion_en_curso`; otro administrador no puede validarlo a la vez.
    // Si algo falla después, el pago sigue «Por aprobar» y se puede volver a
    // validar (la reserva caduca a los 10 minutos). La reserva lleva un token
    // propio: solo quien la tiene puede cerrar la aprobación.
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    await runTransaction(db, async (tx) => {
        const actual = await tx.get(ref)
        const d = actual.exists() ? (actual.data() as Record<string, unknown>) : null
        if (!d || !estaPorAprobar(d.status)) {
            throw new Error(PAGO_YA_PROCESADO)
        }
        const reserva = d.validacion_en_curso
        const desde =
            reserva instanceof Timestamp ? reserva.toMillis() : Number.NaN
        if (Number.isFinite(desde) && Date.now() - desde < 10 * 60 * 1000) {
            throw new Error(PAGO_EN_CURSO)
        }
        tx.update(ref, {
            ...extra,
            validacion_en_curso: Timestamp.now(),
            validacion_token: token,
        })
    })

    if (sub.taller_uid) {
        const activation = await maybeActivateServicesOnSubscription({
            tallerUid: sub.taller_uid,
            subscriptionDocId: sub.uid,
            newPlanCantidadServiciosRaw: sub.cantidad_servicios,
            newPlanMontoRaw: sub.monto,
        })
        const usuarioSubscripcion =
            activation.usuarioCantidadServicios !== undefined
                ? {
                      ...updateData,
                      cantidad_servicios: activation.usuarioCantidadServicios,
                  }
                : updateData
        await updateDoc(doc(db, 'Usuarios', sub.taller_uid), {
            subscripcion_actual: usuarioSubscripcion,
        })
    }
    // Paso 3: el pago queda aprobado solo cuando todo lo anterior se guardó.
    await runTransaction(db, async (tx) => {
        const actual = await tx.get(ref)
        const d = actual.exists() ? (actual.data() as Record<string, unknown>) : null
        if (!d || d.validacion_token !== token || !estaPorAprobar(d.status)) {
            // Otra persona tomó la reserva vencida y la cierra ella.
            throw new Error(PAGO_YA_PROCESADO)
        }
        tx.update(ref, {
            ...updateData,
            validacion_en_curso: deleteField(),
            validacion_token: deleteField(),
        })
    })

    if (sub.taller_uid) {
        // El aviso sale solo cuando todo quedó guardado.
        try {
            const userDoc = await getDoc(doc(db, 'Usuarios', sub.taller_uid))
            const pushToken = userDoc.exists()
                ? getUsuarioPushToken(userDoc.data() as Record<string, unknown>)
                : null
            if (pushToken) {
                await axios.post(
                    'https://apisolvers.solversapp.com/api/usuarios/sendNotification',
                    {
                        token: pushToken,
                        title: 'Pago validado',
                        body: 'Hola, se ha validado su pago exitosamente',
                        secretCode: 'Validar codigo',
                    },
                )
            }
        } catch (error) {
            console.error('Error al enviar notificación:', error)
        }
    }
}
