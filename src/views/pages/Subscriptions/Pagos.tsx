// Validación de pagos: una sola pantalla con todos los pagos de los negocios
// (pendientes, pagados y vencidos), con la tasa BCV, el IVA y el monto en Bs.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from 'firebase/firestore'
import axios from 'axios'
import {
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlinePencil,
} from 'react-icons/hi'
import { FaRegEye, FaTrash, FaCheck } from 'react-icons/fa'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { Dialog, Drawer } from '@/components/ui'
import { exportStyledExcel } from '@/utils/excelExport'
import {
    collectActiveTallerDocIdsFromUsersSnapshot,
    getSubscriptionTallerUid,
} from '@/utils/activeTallerSubscriptionGuards'
import {
    approveSubscriptionAsApproved,
    type Subscriptions,
} from '@/views/pages/PaymentValidation/PaymentValidationPending'
import {
    aFecha,
    aNumero,
    bs,
    calcularMontos,
    diaVE,
    estatusPago,
    fechaCorta,
    redondear,
    tasaDelDia,
    tasaTexto,
    usd,
    type EstatusPago,
    type TasaBcv,
} from '@/utils/pagos'

const API = 'https://apisolvers.solversapp.com/api'

type Fila = {
    uid: string
    tallerUid: string
    crudo: Subscriptions
    fechaRegistro: Date | null
    fechaVencimiento: Date | null
    negocio: string
    rif: string
    correo: string
    plan: string
    tasa: number | null
    tasaFecha: string
    tasaManual: boolean
    subtotal: number
    iva: number
    total: number
    montoBs: number | null
    estatus: EstatusPago
    metodo: string
    fechaPago: Date | null
    fechaPagoTexto: string
    bancoEmisor: string
    referencia: string
    montoPagado: string
    /** Cómo queda lo que reportó frente a lo que debía pagar. */
    diferencia: 'ok' | 'menos' | 'mas' | null
    notaDiferencia: string
    duplicado: boolean
    telefonoEmisor: string
    cedulaEmisor: string
    comprobanteUrl: string
    busqueda: string
}

const ESTILO_ESTATUS: Record<EstatusPago, string> = {
    Pagado: 'bg-green-100 text-green-800 ring-green-600/20',
    Pendiente: 'bg-yellow-100 text-yellow-800 ring-yellow-600/30',
    Vencido: 'bg-red-100 text-red-700 ring-red-600/20',
}

const FILTROS: { clave: 'todos' | EstatusPago; etiqueta: string }[] = [
    { clave: 'todos', etiqueta: 'Todos' },
    { clave: 'Pendiente', etiqueta: 'Pendientes' },
    { clave: 'Pagado', etiqueta: 'Pagados' },
    { clave: 'Vencido', etiqueta: 'Vencidos' },
]

const txt = (v: unknown): string => {
    if (v === undefined || v === null) return ''
    const t = String(v).trim()
    return t === '0' ? '' : t
}

/** Métodos que se pagan en dólares; el resto se compara contra el monto en Bs. */
const esMetodoEnDolares = (metodo: string) => /zelle|paypal|binance|usdt|efectivo|divisa|d[oó]lar/i.test(metodo)

const numeroSuelto = (n: number) =>
    n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "Plan Bronce" → "Bronce", para no escribir "Plan Plan Bronce". */
const sinPrefijoPlan = (plan: string) => plan.replace(/^plan\s+/i, '')

const filtroDesdeUrl = (v: string | null): 'todos' | EstatusPago => {
    const k = (v || '').toLowerCase()
    if (k.startsWith('pend')) return 'Pendiente'
    if (k.startsWith('pag')) return 'Pagado'
    if (k.startsWith('venc')) return 'Vencido'
    return 'todos'
}

const Pagos = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [filas, setFilas] = useState<Fila[]>([])
    const [tasas, setTasas] = useState<TasaBcv[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [desde, setDesde] = useState('')
    const [hasta, setHasta] = useState('')
    const [pagina, setPagina] = useState(1)
    const [porPagina, setPorPagina] = useState(10)
    const [detalle, setDetalle] = useState<Fila | null>(null)
    const [tasaPago, setTasaPago] = useState('')
    const [aEliminar, setAEliminar] = useState<Fila | null>(null)
    const [aAprobar, setAAprobar] = useState<Fila | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [dialogoTasa, setDialogoTasa] = useState(false)
    const [tasaFecha, setTasaFecha] = useState(diaVE())
    const [tasaValor, setTasaValor] = useState('')

    const filtro = filtroDesdeUrl(searchParams.get('estado'))
    const cambiarFiltro = (clave: 'todos' | EstatusPago) => {
        const next = new URLSearchParams(searchParams)
        next.delete('tab')
        if (clave === 'todos') next.delete('estado')
        else next.set('estado', clave.toLowerCase())
        setSearchParams(next, { replace: true })
        setPagina(1)
    }

    const cargar = useCallback(async (avisar = false) => {
        setCargando(true)
        setError('')
        try {
            const [usersSnap, subsSnap, tasasSnap] = await Promise.all([
                getDocs(collection(db, 'Usuarios')),
                getDocs(collection(db, 'Subscripciones')),
                getDocs(collection(db, 'TasasBCV')).catch(() => null),
            ])

            const listaTasas: TasaBcv[] = (tasasSnap ? tasasSnap.docs : [])
                .map((d) => {
                    const x = d.data() as Record<string, unknown>
                    return {
                        fecha: String(x.fecha || d.id),
                        tasa: Number(x.tasa),
                        manual: x.manual === true,
                        fuente: String(x.fuente || ''),
                    }
                })
                .filter((t) => Number.isFinite(t.tasa) && t.tasa > 0)
                .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
            setTasas(listaTasas)

            const activos = collectActiveTallerDocIdsFromUsersSnapshot(usersSnap)
            const usuarios = new Map<string, Record<string, unknown>>()
            usersSnap.forEach((u) => usuarios.set(u.id, u.data()))

            const ahora = new Date()
            const lista: Fila[] = []
            subsSnap.forEach((d) => {
                const s = d.data() as Record<string, unknown>
                const tallerUid = getSubscriptionTallerUid(s)
                if (tallerUid && !activos.has(tallerUid)) return

                const precio = aNumero(s.subtotal) ?? aNumero(s.monto) ?? 0
                // El plan gratuito no es un pago: no entra en esta pantalla.
                if (precio < 0.0001) return

                const c = (s.comprobante_pago || {}) as Record<string, unknown>
                const u = usuarios.get(tallerUid) || {}
                const fechaRegistro = aFecha(s.fecha_registro) || aFecha(s.fecha_inicio)
                const fechaVencimiento = aFecha(s.fecha_fin)
                const fechaPago = aFecha(c.fechaPago)
                const diaPago = diaVE(fechaPago || fechaRegistro || ahora)

                // Si el pago guardó su tasa al reportarse, esa manda; si no
                // (pagos anteriores), se usa la tasa BCV del día del pago.
                const tasaGuardada = aNumero(s.tasa_bcv)
                const delDia = tasaGuardada ? null : tasaDelDia(listaTasas, diaPago)
                const tasa = tasaGuardada ?? (delDia ? delDia.tasa : null)
                const m = calcularMontos(precio, tasa)

                // Lo que el taller dijo haber pagado frente a lo que debía.
                const pagadoNum = aNumero(txt(c.monto).replace(/[^\d.,-]/g, ''))
                const enDolares = esMetodoEnDolares(txt(c.metodo))
                const esperado = enDolares ? m.total : m.montoBs
                let diferencia: Fila['diferencia'] = null
                let notaDiferencia = ''
                if (pagadoNum !== null && esperado) {
                    const delta = pagadoNum - esperado
                    const esperadoTxt = enDolares ? usd(esperado) : bs(esperado)
                    if (Math.abs(delta) <= Math.max(esperado * 0.01, 0.01)) {
                        diferencia = 'ok'
                        notaDiferencia = `Coincide con lo que debía pagar (${esperadoTxt}).`
                    } else if (delta < 0) {
                        diferencia = 'menos'
                        notaDiferencia = `Reportó menos de lo que debía pagar (${esperadoTxt}). Faltan ${numeroSuelto(-delta)}.`
                    } else {
                        diferencia = 'mas'
                        notaDiferencia = `Reportó más de lo que debía pagar (${esperadoTxt}). Sobran ${numeroSuelto(delta)}.`
                    }
                }

                const fila: Fila = {
                    uid: d.id,
                    tallerUid,
                    crudo: { ...(s as unknown as Subscriptions), uid: d.id },
                    fechaRegistro,
                    fechaVencimiento,
                    negocio: txt(u.nombre) || txt(s.nombre_taller) || 'Negocio no encontrado',
                    rif: txt(u.rif) || txt(u.rifIdFiscal),
                    correo: txt(u.email),
                    plan: txt(s.nombre),
                    tasa,
                    tasaFecha: tasaGuardada ? txt(s.tasa_fecha) : delDia ? delDia.fecha : '',
                    tasaManual: s.tasa_manual === true,
                    subtotal: m.subtotal,
                    iva: m.iva,
                    total: m.total,
                    montoBs: m.montoBs,
                    estatus: estatusPago(s.status, fechaVencimiento, ahora),
                    metodo: txt(c.metodo),
                    fechaPago,
                    fechaPagoTexto: fechaPago ? fechaCorta(fechaPago) : txt(c.fechaPago),
                    bancoEmisor: txt(c.bancoOrigen) || txt(c.banco),
                    referencia: txt(c.numReferencia),
                    montoPagado: pagadoNum !== null ? numeroSuelto(pagadoNum) : txt(c.monto),
                    diferencia,
                    notaDiferencia,
                    duplicado: false,
                    telefonoEmisor: txt(c.telefono),
                    cedulaEmisor: txt(c.cedula),
                    comprobanteUrl: txt(c.comprobante) || txt(c.receiptFile),
                    busqueda: '',
                }
                fila.busqueda = [
                    fila.negocio,
                    fila.rif,
                    fila.correo,
                    fila.plan,
                    fila.estatus,
                    fila.metodo,
                    fila.bancoEmisor,
                    fila.referencia,
                    fila.montoPagado,
                    fila.telefonoEmisor,
                    fila.cedulaEmisor,
                    fechaCorta(fila.fechaRegistro),
                    fila.fechaPagoTexto,
                ]
                    .join(' ')
                    .toLowerCase()
                lista.push(fila)
            })

            // Mismo negocio, método y referencia más de una vez: se marca para revisarlo.
            const vistos = new Map<string, Fila[]>()
            lista.forEach((f) => {
                if (!f.referencia) return
                const k = `${f.tallerUid}|${f.metodo}|${f.referencia}`
                vistos.set(k, [...(vistos.get(k) || []), f])
            })
            vistos.forEach((grupo) => {
                if (grupo.length > 1) grupo.forEach((f) => (f.duplicado = true))
            })

            // Primero lo que hay que atender, y dentro de cada grupo lo más reciente.
            const orden: Record<EstatusPago, number> = { Pendiente: 0, Pagado: 1, Vencido: 2 }
            lista.sort(
                (a, b) =>
                    orden[a.estatus] - orden[b.estatus] ||
                    (b.fechaRegistro?.getTime() || 0) - (a.fechaRegistro?.getTime() || 0),
            )
            setFilas(lista)
            if (avisar) {
                toast.push(
                    <Notification title="Datos actualizados">
                        La tabla se actualizó.
                    </Notification>,
                )
            }
        } catch (e) {
            console.error('Pagos: error cargando', e)
            setError('No pudimos cargar los pagos. Intenta de nuevo.')
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        void cargar()
    }, [cargar])

    const tasaHoy = useMemo(() => tasaDelDia(tasas, diaVE()), [tasas])
    const tasaProxima = useMemo(() => {
        const ultima = tasas[tasas.length - 1]
        return ultima && ultima.fecha > diaVE() ? ultima : null
    }, [tasas])

    const conteo = useMemo(() => {
        const c = { todos: filas.length, Pendiente: 0, Pagado: 0, Vencido: 0 }
        filas.forEach((f) => {
            c[f.estatus] += 1
        })
        return c
    }, [filas])

    const visibles = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return filas.filter((f) => {
            if (filtro !== 'todos' && f.estatus !== filtro) return false
            if (q && !f.busqueda.includes(q)) return false
            if (desde || hasta) {
                const dia = f.fechaRegistro ? diaVE(f.fechaRegistro) : ''
                if (!dia) return false
                if (desde && dia < desde) return false
                if (hasta && dia > hasta) return false
            }
            return true
        })
    }, [filas, filtro, busqueda, desde, hasta])

    const totalPendienteBs = useMemo(
        () =>
            filas
                .filter((f) => f.estatus === 'Pendiente')
                .reduce((acc, f) => acc + (f.montoBs || 0), 0),
        [filas],
    )

    const enPagina = visibles.slice((pagina - 1) * porPagina, pagina * porPagina)

    const abrirDetalle = (f: Fila) => {
        setDetalle(f)
        setTasaPago(f.tasa ? String(f.tasa) : '')
    }

    const notificar = async (tallerUid: string, body: string) => {
        try {
            const u = await getDoc(doc(db, 'Usuarios', tallerUid))
            const token = u.exists() ? String((u.data() as Record<string, unknown>).token || '').trim() : ''
            if (!token) return
            await axios.post(`${API}/usuarios/sendNotification`, {
                token,
                title: 'Codigo Validado',
                body,
                secretCode: 'Validar codigo',
            })
        } catch (e) {
            console.error('Pagos: no se pudo notificar', e)
        }
    }

    const aprobar = async () => {
        if (!aAprobar) return
        setOcupado(true)
        try {
            // Deja escrita la tasa y los montos con los que se validó.
            await updateDoc(doc(db, 'Subscripciones', aAprobar.uid), {
                subtotal: aAprobar.subtotal,
                iva: aAprobar.iva,
                total: aAprobar.total,
                iva_porcentaje: 16,
                tasa_bcv: aAprobar.tasa,
                tasa_fecha: aAprobar.tasaFecha || null,
                monto_bs: aAprobar.montoBs,
            })
            await approveSubscriptionAsApproved(aAprobar.crudo)
            toast.push(
                <Notification title="Pago validado">
                    El plan de {aAprobar.negocio} quedó activo.
                </Notification>,
            )
            setAAprobar(null)
            setDetalle(null)
            await cargar()
        } catch (e) {
            console.error('Pagos: error aprobando', e)
            toast.push(
                <Notification title="Error">
                    {e instanceof Error && e.message === 'INVALID_VIGENCIA'
                        ? 'El plan de este pago no tiene una vigencia válida.'
                        : 'No se pudo validar el pago.'}
                </Notification>,
            )
        } finally {
            setOcupado(false)
        }
    }

    const avisarRechazo = async (f: Fila) => {
        setOcupado(true)
        await notificar(f.tallerUid, 'Hola, se ha rechazado su pago')
        setOcupado(false)
        toast.push(
            <Notification title="Aviso enviado">
                Se le avisó a {f.negocio} que su pago fue rechazado. El pago
                sigue pendiente hasta que lo reporte de nuevo o lo elimines.
            </Notification>,
        )
    }

    const eliminar = async () => {
        if (!aEliminar) return
        setOcupado(true)
        try {
            await deleteDoc(doc(db, 'Subscripciones', aEliminar.uid))
            if (aEliminar.tallerUid) {
                const ref = doc(db, 'Usuarios', aEliminar.tallerUid)
                const u = await getDoc(ref)
                if (u.exists()) await updateDoc(ref, { subscripcion_actual: null })
            }
            toast.push(
                <Notification title="Pago eliminado">
                    El registro fue eliminado.
                </Notification>,
            )
            setAEliminar(null)
            setDetalle(null)
            await cargar()
        } catch (e) {
            console.error('Pagos: error eliminando', e)
            toast.push(
                <Notification title="Error">No se pudo eliminar.</Notification>,
            )
        } finally {
            setOcupado(false)
        }
    }

    const guardarTasaDelPago = async () => {
        if (!detalle) return
        const t = aNumero(tasaPago)
        if (!t || t <= 0) {
            toast.push(
                <Notification title="Tasa inválida">
                    Escribe la tasa en bolívares por dólar, por ejemplo 875,65.
                </Notification>,
            )
            return
        }
        setOcupado(true)
        try {
            const m = calcularMontos(detalle.subtotal, t)
            await updateDoc(doc(db, 'Subscripciones', detalle.uid), {
                subtotal: m.subtotal,
                iva: m.iva,
                total: m.total,
                iva_porcentaje: 16,
                tasa_bcv: redondear(t, 4),
                tasa_manual: true,
                monto_bs: m.montoBs,
            })
            toast.push(
                <Notification title="Tasa corregida">
                    Este pago quedó calculado a {tasaTexto(t)} Bs por dólar.
                </Notification>,
            )
            setDetalle(null)
            await cargar()
        } catch (e) {
            console.error('Pagos: error guardando tasa del pago', e)
            toast.push(
                <Notification title="Error">No se pudo guardar la tasa.</Notification>,
            )
        } finally {
            setOcupado(false)
        }
    }

    const abrirDialogoTasa = () => {
        setTasaFecha(diaVE())
        setTasaValor(tasaHoy ? String(tasaHoy.tasa) : '')
        setDialogoTasa(true)
    }

    const guardarTasaDelDia = async () => {
        const t = aNumero(tasaValor)
        if (!t || t <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(tasaFecha)) {
            toast.push(
                <Notification title="Datos inválidos">
                    Indica el día y la tasa en bolívares por dólar.
                </Notification>,
            )
            return
        }
        setOcupado(true)
        try {
            await setDoc(
                doc(db, 'TasasBCV', tasaFecha),
                {
                    fecha: tasaFecha,
                    tasa: redondear(t, 4),
                    fuente: 'manual',
                    manual: true,
                    actualizadoEn: new Date(),
                },
                { merge: true },
            )
            toast.push(
                <Notification title="Tasa guardada">
                    Los pagos que se reporten ese día usarán {tasaTexto(t)} Bs
                    por dólar. Los ya reportados no cambian.
                </Notification>,
            )
            setDialogoTasa(false)
            await cargar()
        } catch (e) {
            console.error('Pagos: error guardando tasa', e)
            toast.push(
                <Notification title="Error">No se pudo guardar la tasa.</Notification>,
            )
        } finally {
            setOcupado(false)
        }
    }

    const exportar = async () => {
        if (!visibles.length) {
            toast.push(
                <Notification title="Sin datos">
                    No hay pagos para exportar con los filtros actuales.
                </Notification>,
            )
            return
        }
        const num = (n: number | null) => (n === null ? '' : n.toFixed(2))
        await exportStyledExcel({
            sheetName: 'Pagos',
            fileName: `pagos_solvers_${diaVE()}.xlsx`,
            columns: [
                { header: 'Fecha de registro', key: 'fechaRegistro' },
                { header: 'Fecha de vencimiento', key: 'fechaVencimiento' },
                { header: 'Nombre negocio', key: 'negocio' },
                { header: 'RIF del negocio', key: 'rif' },
                { header: 'Plan', key: 'plan' },
                { header: 'Tasa del día', key: 'tasa' },
                { header: 'Sub-total ($)', key: 'subtotal' },
                { header: 'IVA ($)', key: 'iva' },
                { header: 'Total ($)', key: 'total' },
                { header: 'Monto Bs', key: 'montoBs' },
                { header: 'Estatus', key: 'estatus' },
                { header: 'Método de pago', key: 'metodo' },
                { header: 'Fecha de pago', key: 'fechaPago' },
                { header: 'Banco emisor', key: 'bancoEmisor' },
                { header: 'Referencia / Nro. de comprobante', key: 'referencia' },
                { header: 'Monto pagado', key: 'montoPagado' },
                { header: 'Nro. teléfono emisor', key: 'telefonoEmisor' },
                { header: 'Cédula emisor', key: 'cedulaEmisor' },
                { header: 'Comprobante', key: 'comprobante', linkType: 'url' },
            ],
            rows: visibles.map((f) => ({
                fechaRegistro: f.fechaRegistro ? fechaCorta(f.fechaRegistro) : '',
                fechaVencimiento: f.fechaVencimiento ? fechaCorta(f.fechaVencimiento) : '',
                negocio: f.negocio,
                rif: f.rif,
                plan: f.plan,
                tasa: f.tasa === null ? '' : String(f.tasa),
                subtotal: num(f.subtotal),
                iva: num(f.iva),
                total: num(f.total),
                montoBs: num(f.montoBs),
                estatus: f.estatus,
                metodo: f.metodo,
                fechaPago: f.fechaPagoTexto,
                bancoEmisor: f.bancoEmisor,
                referencia: f.referencia,
                montoPagado: f.montoPagado,
                telefonoEmisor: f.telefonoEmisor,
                cedulaEmisor: f.cedulaEmisor,
                comprobante: f.comprobanteUrl,
            })),
        })
    }

    const th = 'whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600'
    const td = 'whitespace-nowrap px-3 py-3 text-sm text-gray-800'
    const tdNum = `${td} text-right tabular-nums`
    const campo = 'h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-[#151D61] focus:outline-none focus:ring-2 focus:ring-[#151D61]/20'

    return (
        <div>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold text-[#151D61]">
                        Validación de pagos
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-gray-600">
                        Todos los pagos de planes en un solo lugar. Los montos
                        incluyen IVA (16%) y se convierten a bolívares con la
                        tasa oficial del BCV del día del pago.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Tasa BCV de hoy
                        </div>
                        <div className="text-2xl font-bold tabular-nums text-[#151D61]">
                            {tasaHoy ? `Bs ${tasaTexto(tasaHoy.tasa)}` : 'Sin tasa'}
                        </div>
                        <div className="text-xs text-gray-500">
                            {tasaHoy
                                ? `Fecha valor ${fechaCorta(aFecha(tasaHoy.fecha))}${tasaHoy.manual ? ' · corregida a mano' : ''}`
                                : 'Aún no se ha cargado la tasa'}
                            {tasaProxima
                                ? ` · Próxima (${fechaCorta(aFecha(tasaProxima.fecha))}): ${tasaTexto(tasaProxima.tasa)}`
                                : ''}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-[#151D61] hover:bg-gray-50"
                        onClick={abrirDialogoTasa}
                    >
                        <HiOutlinePencil className="h-4 w-4" />
                        Corregir
                    </button>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-end gap-3">
                <div className="flex flex-wrap gap-2">
                    {FILTROS.map((f) => {
                        const activo = filtro === f.clave
                        return (
                            <button
                                key={f.clave}
                                type="button"
                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    activo
                                        ? 'bg-[#151D61] text-white shadow'
                                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => cambiarFiltro(f.clave)}
                            >
                                {f.etiqueta}
                                <span className={`ml-2 text-xs ${activo ? 'text-white/80' : 'text-gray-500'}`}>
                                    {conteo[f.clave]}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="ml-auto flex flex-wrap items-end gap-3">
                    <label className="text-xs font-medium text-gray-600">
                        Registrado desde
                        <input
                            type="date"
                            className={`${campo} mt-1 block`}
                            value={desde}
                            onChange={(e) => {
                                setDesde(e.target.value)
                                setPagina(1)
                            }}
                        />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                        hasta
                        <input
                            type="date"
                            className={`${campo} mt-1 block`}
                            value={hasta}
                            onChange={(e) => {
                                setHasta(e.target.value)
                                setPagina(1)
                            }}
                        />
                    </label>
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Negocio, RIF, referencia, banco…"
                            className={`${campo} w-full pl-10`}
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value)
                                setPagina(1)
                            }}
                        />
                        <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    </div>
                    <button
                        type="button"
                        title="Actualizar"
                        aria-label="Actualizar"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-[#151D61] hover:bg-gray-50"
                        onClick={() => void cargar(true)}
                    >
                        <HiOutlineRefresh className={`h-5 w-5 ${cargando ? 'animate-spin' : ''}`} />
                    </button>
                    <Button
                        style={{ backgroundColor: '#10B981' }}
                        className="h-10 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white hover:opacity-90"
                        onClick={() => void exportar()}
                    >
                        Exportar a Excel
                    </Button>
                </div>
            </div>

            {conteo.Pendiente > 0 && (
                <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                    Hay <strong>{conteo.Pendiente}</strong> pago
                    {conteo.Pendiente === 1 ? '' : 's'} por validar
                    {totalPendienteBs > 0 ? (
                        <>
                            {' '}
                            por un total de <strong>{bs(redondear(totalPendienteBs))}</strong>
                        </>
                    ) : null}
                    .
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white pb-3 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className={`${th} sticky left-0 z-10 bg-gray-50 shadow-[2px_0_0_0_#e5e7eb]`}>Nombre negocio</th>
                            <th className={th}>Acciones</th>
                            <th className={th}>Estatus</th>
                            <th className={th}>Fecha de registro</th>
                            <th className={th}>Fecha de vencimiento</th>
                            <th className={th}>RIF del negocio</th>
                            <th className={th}>Plan</th>
                            <th className={`${th} text-right`}>Tasa del día</th>
                            <th className={`${th} text-right`}>Sub-total</th>
                            <th className={`${th} text-right`}>IVA</th>
                            <th className={`${th} text-right`}>Total</th>
                            <th className={`${th} text-right`}>Monto Bs</th>
                            <th className={th}>Método de pago</th>
                            <th className={th}>Fecha de pago</th>
                            <th className={th}>Banco emisor</th>
                            <th className={th}>Referencia / Nro. comprobante</th>
                            <th className={`${th} text-right`}>Monto pagado</th>
                            <th className={th}>Nro. teléfono emisor</th>
                            <th className={th}>Cédula emisor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && !filas.length ? (
                            <tr>
                                <td colSpan={19} className="px-4 py-10 text-center text-sm text-gray-500">
                                    Cargando pagos…
                                </td>
                            </tr>
                        ) : !enPagina.length ? (
                            <tr>
                                <td colSpan={19} className="px-4 py-10 text-center text-sm text-gray-500">
                                    No hay pagos con estos filtros.
                                </td>
                            </tr>
                        ) : (
                            enPagina.map((f) => (
                                <tr key={f.uid} className="group hover:bg-gray-50">
                                    <td className={`${td} sticky left-0 z-10 max-w-[16rem] truncate bg-white font-medium shadow-[2px_0_0_0_#e5e7eb] group-hover:bg-gray-50`}>
                                        {f.tallerUid ? (
                                            <Link
                                                to={`/profilegarage/${f.tallerUid}`}
                                                className="text-[#151D61] hover:underline"
                                                title={f.negocio}
                                            >
                                                {f.negocio}
                                            </Link>
                                        ) : (
                                            f.negocio
                                        )}
                                    </td>
                                    <td className={td}>
                                        <div className="flex items-center gap-1">
                                            {f.estatus === 'Pendiente' && (
                                                <button
                                                    type="button"
                                                    title="Validar pago"
                                                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                                                    onClick={() => setAAprobar(f)}
                                                >
                                                    <FaCheck /> Validar
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                title="Ver detalle y comprobante"
                                                className="rounded p-2 text-[#151D61] hover:bg-blue-50"
                                                onClick={() => abrirDetalle(f)}
                                            >
                                                <FaRegEye />
                                            </button>
                                            <button
                                                type="button"
                                                title="Eliminar"
                                                className="rounded p-2 text-red-600 hover:bg-red-50"
                                                onClick={() => setAEliminar(f)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                    <td className={td}>
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${ESTILO_ESTATUS[f.estatus]}`}>
                                            {f.estatus}
                                        </span>
                                        {f.duplicado && (
                                            <span
                                                className="ml-2 inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800 ring-1 ring-inset ring-orange-600/30"
                                                title="Este negocio tiene otro registro con el mismo método y la misma referencia. Valida uno solo y elimina el repetido."
                                            >
                                                Posible duplicado
                                            </span>
                                        )}
                                    </td>
                                    <td className={td}>{fechaCorta(f.fechaRegistro)}</td>
                                    <td className={td}>{fechaCorta(f.fechaVencimiento)}</td>
                                    <td className={td}>{f.rif || '—'}</td>
                                    <td className={td}>{f.plan || '—'}</td>
                                    <td className={tdNum} title={f.tasaFecha ? `Fecha valor ${f.tasaFecha}` : ''}>
                                        {tasaTexto(f.tasa)}
                                        {f.tasaManual ? ' *' : ''}
                                    </td>
                                    <td className={tdNum}>{usd(f.subtotal)}</td>
                                    <td className={tdNum}>{usd(f.iva)}</td>
                                    <td className={`${tdNum} font-semibold`}>{usd(f.total)}</td>
                                    <td className={`${tdNum} font-semibold`}>{bs(f.montoBs)}</td>
                                    <td className={td}>{f.metodo || '—'}</td>
                                    <td className={td}>{f.fechaPagoTexto || '—'}</td>
                                    <td className={td}>{f.bancoEmisor || '—'}</td>
                                    <td className={td}>{f.referencia || '—'}</td>
                                    <td
                                        className={`${tdNum} ${
                                            f.diferencia === 'menos'
                                                ? 'font-semibold text-red-700'
                                                : f.diferencia === 'mas'
                                                  ? 'font-semibold text-orange-700'
                                                  : f.diferencia === 'ok'
                                                    ? 'text-green-700'
                                                    : ''
                                        }`}
                                        title={f.notaDiferencia}
                                    >
                                        {f.montoPagado || '—'}
                                        {f.diferencia === 'menos' ? ' ▼' : f.diferencia === 'mas' ? ' ▲' : ''}
                                    </td>
                                    <td className={td}>{f.telefonoEmisor || '—'}</td>
                                    <td className={td}>{f.cedulaEmisor || '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
                Monto pagado: en rojo ▼ si el negocio reportó menos de lo que
                debía, en naranja ▲ si reportó más. Pasa el cursor para ver la
                diferencia.
                {filas.some((f) => f.tasaManual) ? ' · * Tasa corregida a mano en ese pago.' : ''}
            </p>

            <div className="mt-4">
                <Pagination
                    currentPage={pagina}
                    totalRows={visibles.length}
                    rowsPerPage={porPagina}
                    onChange={(p: number) => setPagina(p)}
                    onRowsPerPageChange={(n: number) => {
                        setPorPagina(n)
                        setPagina(1)
                    }}
                />
            </div>

            <Drawer
                isOpen={Boolean(detalle)}
                width={460}
                title="Detalle del pago"
                onClose={() => setDetalle(null)}
                onRequestClose={() => setDetalle(null)}
            >
                {detalle && (
                    <div className="space-y-5">
                        <div>
                            <div className="text-lg font-bold text-[#151D61]">{detalle.negocio}</div>
                            <div className="text-sm text-gray-600">
                                {detalle.rif || 'Sin RIF'} · Plan {sinPrefijoPlan(detalle.plan) || '—'}
                            </div>
                            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${ESTILO_ESTATUS[detalle.estatus]}`}>
                                {detalle.estatus}
                            </span>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 text-sm">
                            {[
                                ['Sub-total', usd(detalle.subtotal)],
                                ['IVA (16%)', usd(detalle.iva)],
                                ['Total', usd(detalle.total)],
                                ['Tasa del día', tasaTexto(detalle.tasa)],
                                ['Monto a pagar', bs(detalle.montoBs)],
                                ['Monto que reportó', detalle.montoPagado || '—'],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between py-1">
                                    <span className="text-gray-600">{k}</span>
                                    <span className="font-semibold tabular-nums text-gray-900">{v}</span>
                                </div>
                            ))}
                            {detalle.notaDiferencia && (
                                <div
                                    className={`mt-2 rounded-md px-3 py-2 text-xs ${
                                        detalle.diferencia === 'ok'
                                            ? 'bg-green-50 text-green-800'
                                            : detalle.diferencia === 'menos'
                                              ? 'bg-red-50 text-red-800'
                                              : 'bg-orange-50 text-orange-800'
                                    }`}
                                >
                                    {detalle.notaDiferencia}
                                </div>
                            )}
                            {detalle.duplicado && (
                                <div className="mt-2 rounded-md bg-orange-50 px-3 py-2 text-xs text-orange-800">
                                    Este negocio tiene otro registro con el mismo método y la misma
                                    referencia. Valida uno solo y elimina el repetido.
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 text-sm">
                            {[
                                ['Método de pago', detalle.metodo],
                                ['Fecha de pago', detalle.fechaPagoTexto],
                                ['Banco emisor', detalle.bancoEmisor],
                                ['Referencia', detalle.referencia],
                                ['Teléfono emisor', detalle.telefonoEmisor],
                                ['Cédula emisor', detalle.cedulaEmisor],
                                ['Fecha de registro', fechaCorta(detalle.fechaRegistro)],
                                ['Fecha de vencimiento', fechaCorta(detalle.fechaVencimiento)],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-4 py-1">
                                    <span className="text-gray-600">{k}</span>
                                    <span className="text-right font-medium text-gray-900">{v || '—'}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600">
                                Corregir la tasa de este pago (Bs por dólar)
                                <div className="mt-1 flex gap-2">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        className={`${campo} w-full`}
                                        value={tasaPago}
                                        onChange={(e) => setTasaPago(e.target.value)}
                                    />
                                    <Button
                                        disabled={ocupado}
                                        className="h-10 whitespace-nowrap"
                                        onClick={() => void guardarTasaDelPago()}
                                    >
                                        Guardar tasa
                                    </Button>
                                </div>
                            </label>
                        </div>

                        {detalle.comprobanteUrl ? (
                            <a
                                href={detalle.comprobanteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-lg border border-gray-200 bg-gray-50 p-2"
                                title="Abrir comprobante en tamaño completo"
                            >
                                <img
                                    src={detalle.comprobanteUrl}
                                    alt="Comprobante de pago"
                                    className="max-h-80 w-full rounded object-contain"
                                />
                                <span className="mt-2 block text-center text-sm font-medium text-[#151D61]">
                                    Abrir comprobante
                                </span>
                            </a>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                Este pago no tiene imagen de comprobante.
                            </div>
                        )}

                        {detalle.estatus === 'Pendiente' && (
                            <div className="flex gap-2">
                                <Button
                                    disabled={ocupado}
                                    className="flex-1 text-white hover:opacity-90"
                                    style={{ backgroundColor: '#16A34A' }}
                                    onClick={() => setAAprobar(detalle)}
                                >
                                    Validar pago
                                </Button>
                                <Button
                                    disabled={ocupado}
                                    className="flex-1"
                                    onClick={() => void avisarRechazo(detalle)}
                                >
                                    Avisar rechazo
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            <Dialog isOpen={Boolean(aAprobar)} onClose={() => !ocupado && setAAprobar(null)}>
                {aAprobar && (
                    <div className="p-2">
                        <h3 className="text-lg font-bold text-gray-900">Validar pago</h3>
                        <p className="mt-2 text-sm text-gray-700">
                            Vas a dar por recibido el pago de <strong>{aAprobar.negocio}</strong> por el
                            plan <strong>{sinPrefijoPlan(aAprobar.plan)}</strong>: {usd(aAprobar.total)} con IVA
                            {aAprobar.montoBs !== null ? ` (${bs(aAprobar.montoBs)} a tasa ${tasaTexto(aAprobar.tasa)})` : ''}.
                            El plan se activa desde hoy y se le avisa al negocio.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button disabled={ocupado} onClick={() => setAAprobar(null)}>
                                Cancelar
                            </Button>
                            <Button
                                disabled={ocupado}
                                className="text-white hover:opacity-90"
                                style={{ backgroundColor: '#16A34A' }}
                                onClick={() => void aprobar()}
                            >
                                {ocupado ? 'Validando…' : 'Validar pago'}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog isOpen={Boolean(aEliminar)} onClose={() => !ocupado && setAEliminar(null)}>
                {aEliminar && (
                    <div className="p-2">
                        <h3 className="text-lg font-bold text-gray-900">Eliminar pago</h3>
                        <p className="mt-2 text-sm text-gray-700">
                            Se eliminará el registro de <strong>{aEliminar.negocio}</strong> (plan{' '}
                            {sinPrefijoPlan(aEliminar.plan)}) y el negocio quedará sin plan asignado. Esta acción no se
                            puede deshacer.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button disabled={ocupado} onClick={() => setAEliminar(null)}>
                                Cancelar
                            </Button>
                            <Button
                                disabled={ocupado}
                                className="text-white hover:opacity-90"
                                style={{ backgroundColor: '#DC2626' }}
                                onClick={() => void eliminar()}
                            >
                                {ocupado ? 'Eliminando…' : 'Eliminar'}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog isOpen={dialogoTasa} onClose={() => !ocupado && setDialogoTasa(false)}>
                <div className="p-2">
                    <h3 className="text-lg font-bold text-gray-900">Corregir tasa BCV</h3>
                    <p className="mt-2 text-sm text-gray-700">
                        La tasa se toma sola de la página del BCV. Usa esto solo si un día salió
                        distinta a la que deben pagar los negocios.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <label className="text-xs font-medium text-gray-600">
                            Día
                            <input
                                type="date"
                                className={`${campo} mt-1 block w-full`}
                                value={tasaFecha}
                                onChange={(e) => {
                                    setTasaFecha(e.target.value)
                                    const t = tasaDelDia(tasas, e.target.value)
                                    setTasaValor(t ? String(t.tasa) : '')
                                }}
                            />
                        </label>
                        <label className="text-xs font-medium text-gray-600">
                            Bs por dólar
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="875,65"
                                className={`${campo} mt-1 block w-full`}
                                value={tasaValor}
                                onChange={(e) => setTasaValor(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button disabled={ocupado} onClick={() => setDialogoTasa(false)}>
                            Cancelar
                        </Button>
                        <Button
                            disabled={ocupado}
                            className="text-white hover:opacity-90"
                            style={{ backgroundColor: '#151D61' }}
                            onClick={() => void guardarTasaDelDia()}
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default Pagos
