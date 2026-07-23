import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, getDocs, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import SalesByCategories from './components/SalesByCategories'
import SplineArea from './components/SplineArea'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import Pagination from '@/components/ui/Pagination'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type {
    ColumnDef,
    ColumnSort,
} from '@tanstack/react-table'
import { FaRegStar, FaStar } from 'react-icons/fa'
import {
    HiOutlineUserGroup,
    HiOutlineOfficeBuilding,
    HiOutlineCreditCard,
    HiChevronDown,
    HiChevronRight,
    HiOutlineEye,
    HiOutlineClipboardList,
    HiOutlinePhone,
} from 'react-icons/hi'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import DatePicker from '@/components/ui/DatePicker'
import Tooltip from '@/components/ui/Tooltip'
import {
    collectActiveTallerDocIdsFromUsersSnapshot,
    getSubscriptionTallerUid,
    isTallerUsuarioEliminado,
} from '@/utils/activeTallerSubscriptionGuards'
import { getSubscriptionPlanName } from '@/utils/subscriptionPlanLabel'
import {
    isPendingPaymentValidationSubscription,
    subscriptionMontoNumerico,
} from '@/utils/pendingPaymentValidation'

type Calificacion = {
    taller?: string;
    puntuacion?: number;
    fecha_creacion?: Timestamp;
    usuario?: {
        email?: string;
        uid?: string;
        nombre?: string;
    };
    id?: string; // ID de la calificación
};

type ServicioCategoriaCampos = {
    categoria?: string
    nombre_categoria?: string
    uid_categoria?: string
}

const getCategoryFilterKeyFromFields = (s: ServicioCategoriaCampos): string => {
    const label = (s.categoria || s.nombre_categoria || '').trim()
    const uid = (s.uid_categoria || '').trim()
    if (label) return `name:${label.toLowerCase()}`
    if (uid) return `uid:${uid}`
    return 'key:__none__'
}

const getCategoryFilterLabelFromFields = (s: ServicioCategoriaCampos): string => {
    const label = (s.categoria || s.nombre_categoria || '').trim()
    const uid = (s.uid_categoria || '').trim()
    if (label) return label
    if (uid) return uid
    return 'Sin categoría'
}

type ServicioConCalificaciones = {
    nombre_servicio: string;
    uid_servicio: string; // ID del servicio
    uid_taller: string;
    calificaciones: Calificacion[]; // Subcolección de calificaciones
    taller: string,
    categoria_filtro_key: string
    categoria_display: string
};

type EngagementViewEvent = {
    id: string
    uid_taller: string
    uid_servicio: string
    fecha: Date | null
    type: string
    nombre_taller: string
    nombre_servicio: string
    usuarioNombre: string
    usuarioEmail: string
    usuarioId: string
}

type EngagementDetallePersona = {
    id: string
    nombre: string
    email: string
    fecha: Date | null
    detalle: string
}

type CalificacionDetalleRow = {
    id: string
    uid_taller: string
    taller: string
    nombre_servicio: string
    puntuacion: number
    usuarioNombre: string
    usuarioEmail: string
    fecha: Date | null
}

type DestacadoDetalleKind =
    | 'vistaTaller'
    | 'vistaServicio'
    | 'contacto'
    | 'calidad'

const SERVICE_CONTACT_TYPES = new Set([
    'contactar',
    'llamada',
    'whatsapp',
])

const isServiceContactInteractionType = (type: unknown) => {
    const t = String(type || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    return SERVICE_CONTACT_TYPES.has(t)
}

const formatEngagementFecha = (fecha: Date | null) => {
    if (!fecha) return 'Sin fecha'
    return fecha.toLocaleString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const mapEventToDetallePersona = (
    event: EngagementViewEvent,
    detalle: string,
): EngagementDetallePersona => ({
    id: event.id,
    nombre: event.usuarioNombre || 'Usuario no identificado',
    email: event.usuarioEmail || 'Sin correo',
    fecha: event.fecha,
    detalle,
})

type ServicioCatalogoItem = {
    nombre: string
    uid_taller: string
    tallerNombre: string
}

type TallerActivo = {
    id: string;
    nombre: string;
    image_perfil?: string;
    solicitudesAtendidas: number;
};

type UsuarioActivo = {
    id: string
    nombre: string
    image_perfil?: string
    acciones: number
}

type EstadoActividadNegocio = 'activo' | 'suspendido'

type PeriodoMeses = 1 | 3 | 6

type FirestoreTimestampLike =
    | Timestamp
    | Date
    | {
          seconds?: number
          nanoseconds?: number
          _seconds?: number
          _nanoseconds?: number
      }
    | null
    | undefined

const toDateFromUnknownTimestamp = (
    value: FirestoreTimestampLike,
): Date | null => {
    if (!value) {
        return null
    }

    if (value instanceof Timestamp) {
        return value.toDate()
    }

    if (value instanceof Date) {
        return value
    }

    const seconds = value.seconds ?? value._seconds
    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
        return new Date(seconds * 1000)
    }

    return null
}

const isSameDay = (dateA: Date, dateB: Date) => {
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    )
}

const getStartDateFromMonths = (months: PeriodoMeses) => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    return startDate
}

const ESTADOS_NEGOCIO_FIJOS = [
    'Aprobado',
    'Rechazado',
    'En espera por aprobación',
] as const

type EstadoNegocioFiltro = 'todos' | (typeof ESTADOS_NEGOCIO_FIJOS)[number]

const normalizeBusinessStatus = (status: unknown): (typeof ESTADOS_NEGOCIO_FIJOS)[number] | null => {
    const raw = String(status || '').toLowerCase()
    // Importante: "En espera por aprobación" también contiene "aprob",
    // por eso se evalúa primero "espera".
    if (raw.includes('esper')) return 'En espera por aprobación'
    if (raw.includes('rechaz')) return 'Rechazado'
    if (raw.includes('aprob')) return 'Aprobado'
    return null
}

const getRegionFromEstado = (estado: unknown) => {
    if (typeof estado !== 'string') {
        return 'Sin estado'
    }
    const normalized = estado
        .normalize('NFC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    if (!normalized.length) {
        return 'Sin estado'
    }

    // Unifica variaciones como "Mérida", "merida", " Mérida ".
    const normalizedKey = normalized
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

    return normalizedKey
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const isSubscriptionPaid = (data: Record<string, unknown>) => {
    const planName = getSubscriptionPlanName(data).toLowerCase()
    if (planName === 'gratis') {
        return false
    }

    if (planName.length > 0) {
        return true
    }

    const comprobante = data.comprobante_pago
    if (typeof comprobante === 'string' && comprobante.trim().length > 0) {
        return true
    }

    if (typeof data.pagado === 'boolean') {
        return data.pagado
    }

    const pagoStatus = String(data.status_pago || data.estado_pago || '')
        .trim()
        .toLowerCase()
    return (
        pagoStatus.includes('pag') ||
        pagoStatus.includes('aprob') ||
        pagoStatus.includes('confirm')
    )
}

const fetchDashboardData = async () => {
    const usersSnapshot = await getDocs(collection(db, 'Usuarios'))
    const activeTallerDocIds =
        collectActiveTallerDocIdsFromUsersSnapshot(usersSnapshot)
    const subsSnapshot = await getDocs(collection(db, 'Subscripciones'))

    let clientesCount = 0
    let tallerCount = 0
    const talleresStats = {
        aprobados: 0,
        rechazados: 0,
        espera: 0,
    }
    let subscripcionesCount = 0
    let totalMonto = 0
    let subscripcionesPagasCount = 0
    const usuariosPorEstado: Record<string, number> = {}
    const talleresPorEstado: Record<string, number> = {}
    const subscripcionesPorPlan: Record<string, number> = {}
    const subscripcionesPagasPorPlan: Record<string, number> = {}
    const talleresPorEstadoYStatus: Record<
        string,
        Record<(typeof ESTADOS_NEGOCIO_FIJOS)[number], number>
    > = {}
    const talleresActividadPorCiudad: Array<{
        ciudad: string
        actividad: EstadoActividadNegocio
        fechaFin: Date | null
        status: (typeof ESTADOS_NEGOCIO_FIJOS)[number] | null
    }> = []
    const talleresMetaByUid: Record<
        string,
        { nombre: string; ciudad: string }
    > = {}
    let talleresVencidosHoy = 0

    const hoy = new Date()

    // Procesar usuarios y talleres
    usersSnapshot.forEach((doc) => {
        const data = doc.data()
        const dataRecord = data as Record<string, unknown>
        const normalizedTypeUser = String(data.typeUser || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()

        if (normalizedTypeUser === 'cliente') {
            clientesCount++
            if (dataRecord.estado || dataRecord.Estado || dataRecord.region) {
                const estadoUsuario = getRegionFromEstado(
                    dataRecord.estado ?? dataRecord.Estado ?? dataRecord.region,
                )
                usuariosPorEstado[estadoUsuario] =
                    (usuariosPorEstado[estadoUsuario] || 0) + 1
            }
        }
        if (normalizedTypeUser === 'taller') {
            if (isTallerUsuarioEliminado(dataRecord.status ?? data.status)) {
                return
            }
            const estado = getRegionFromEstado(
                dataRecord.estado ?? dataRecord.Estado ?? dataRecord.region,
            )
            const nombreTaller =
                String(
                    data.nombre ||
                        data.nombre_taller ||
                        dataRecord.nombre ||
                        '',
                )
                    .replace(/\s+/g, ' ')
                    .trim() || 'Sin nombre'
            talleresMetaByUid[doc.id] = {
                nombre: nombreTaller,
                ciudad: estado,
            }
            tallerCount++
            talleresPorEstado[estado] = (talleresPorEstado[estado] || 0) + 1

            if (!talleresPorEstadoYStatus[estado]) {
                talleresPorEstadoYStatus[estado] = {
                    Aprobado: 0,
                    Rechazado: 0,
                    'En espera por aprobación': 0,
                }
            }

            const normalizedStatus = normalizeBusinessStatus(
                String(data.status || '').replace(/\s+/g, ' ').trim(),
            )
            if (normalizedStatus) {
                talleresPorEstadoYStatus[estado][normalizedStatus] += 1
            }
            const subscripcionActual = data.subscripcion_actual

            const fechaFinSubscripcion = toDateFromUnknownTimestamp(
                (subscripcionActual as Record<string, unknown> | undefined)?.fecha_fin as
                    | FirestoreTimestampLike
                    | undefined,
            )
            const actividadNegocio: EstadoActividadNegocio =
                fechaFinSubscripcion && fechaFinSubscripcion >= hoy
                    ? 'activo'
                    : 'suspendido'
            talleresActividadPorCiudad.push({
                ciudad: estado,
                actividad: actividadNegocio,
                fechaFin: fechaFinSubscripcion,
                status: normalizedStatus,
            })

            if (
                subscripcionActual &&
                subscripcionActual.fecha_fin instanceof Timestamp
            ) {
                const fechaFin: Date = subscripcionActual.fecha_fin.toDate()

                // Contar los talleres cuyo plan vence hoy
                if (isSameDay(fechaFin, hoy)) {
                    talleresVencidosHoy++
                }
            }
            switch (normalizedStatus) {
                case 'Aprobado':
                    talleresStats.aprobados++
                    break
                case 'Rechazado':
                    talleresStats.rechazados++
                    break
                case 'En espera por aprobación':
                    talleresStats.espera++
                    break
                default:
                    break
            }
        }
    })

    // Procesar subscripciones (solo talleres activos, no eliminados)
    let pagosPendientesValidar = 0
    subsSnapshot.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>
        const tallerUid = getSubscriptionTallerUid(data)
        if (tallerUid && !activeTallerDocIds.has(tallerUid)) {
            return
        }

        totalMonto += subscriptionMontoNumerico(data)
        const planName = getSubscriptionPlanName(data)
        subscripcionesPorPlan[planName] = (subscripcionesPorPlan[planName] || 0) + 1
        subscripcionesCount += 1
        if (isSubscriptionPaid(data)) {
            subscripcionesPagasCount += 1
            subscripcionesPagasPorPlan[planName] =
                (subscripcionesPagasPorPlan[planName] || 0) + 1
        }
        if (isPendingPaymentValidationSubscription(data)) {
            pagosPendientesValidar += 1
        }
    })

    return {
        clientesCount,
        tallerCount,
        talleresStats,
        subscripcionesCount,
        totalMonto,
        subscripcionesPagasCount,
        subscripcionesPorPlan,
        subscripcionesPagasPorPlan,
        usuariosPorEstado,
        talleresPorEstado,
        talleresPorEstadoYStatus,
        talleresActividadPorCiudad,
        talleresMetaByUid,
        talleresVencidosHoy,
        pagosPendientesValidar,
    }
}

const DASHBOARD_FILTER_SELECT_CLASS =
    'peer block w-full min-w-0 h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-xs font-medium text-gray-800 shadow-sm transition-[border-color,box-shadow,background-color] duration-150 hover:border-gray-300 hover:bg-gray-50/60 focus:border-[#000B7E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000B7E]/18'

type DashboardFilterSelectFieldProps = {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    children: ReactNode
}

const DashboardFilterSelectField = ({
    label,
    value,
    onChange,
    children,
}: DashboardFilterSelectFieldProps) => (
    <div className="min-w-0">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            {label}
        </label>
        <div className="relative">
            <select value={value} onChange={onChange} className={DASHBOARD_FILTER_SELECT_CLASS}>
                {children}
            </select>
            <span
                className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-lg text-gray-400 transition-colors peer-focus:text-[#000B7E]"
                aria-hidden
            >
                <HiChevronDown className="h-4 w-4 shrink-0 opacity-70" />
            </span>
        </div>
    </div>
)

const SalesDashboard = () => {
    const [isResumenCriticoPopupOpen, setIsResumenCriticoPopupOpen] = useState(false)
    const [isDashboardDataReady, setIsDashboardDataReady] = useState(false)
    const [dashboardData, setDashboardData] = useState({
        clientesCount: 0,
        tallerCount: 0,
        talleresStats: {
            aprobados: 0,
            rechazados: 0,
            espera: 0,
        },
        subscripcionesCount: 0,
        totalMonto: 0,
        subscripcionesPagasCount: 0,
        subscripcionesPorPlan: {} as Record<string, number>,
        subscripcionesPagasPorPlan: {} as Record<string, number>,
        usuariosPorEstado: {} as Record<string, number>,
        talleresPorEstado: {} as Record<string, number>,
        talleresPorEstadoYStatus: {} as Record<
            string,
            Record<(typeof ESTADOS_NEGOCIO_FIJOS)[number], number>
        >,
        talleresActividadPorCiudad: [] as Array<{
            ciudad: string
            actividad: EstadoActividadNegocio
            fechaFin: Date | null
            status: (typeof ESTADOS_NEGOCIO_FIJOS)[number] | null
        }>,
        talleresMetaByUid: {} as Record<
            string,
            { nombre: string; ciudad: string }
        >,
        talleresVencidosHoy: 0,
        pagosPendientesValidar: 0,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchDashboardData()
                setDashboardData(data)
                setIsDashboardDataReady(true)
            } catch (error) {
                console.error(
                    'Error al obtener los datos del dashboard:',
                    error,
                )
                setIsDashboardDataReady(true)
            }
        }

        fetchData()

        const unsubscribeUsers = onSnapshot(
            collection(db, 'Usuarios'),
            () => void fetchData(),
        )
        const unsubscribeSubs = onSnapshot(
            collection(db, 'Subscripciones'),
            () => void fetchData(),
        )

        return () => {
            unsubscribeUsers()
            unsubscribeSubs()
        }
    }, [])

    useEffect(() => {
        if (isDashboardDataReady) {
            setIsResumenCriticoPopupOpen(true)
        }
    }, [isDashboardDataReady])

    const [dataPuntuacion, setDataPuntuacion] = useState<
        {
            nombre_servicio: string
            taller: string
            uid_taller: string
            promedio_puntuacion: number
            categoria_filtro_key: string
            categoria_display: string
        }[]
    >([]);
    const [calificacionesDetalle, setCalificacionesDetalle] = useState<
        CalificacionDetalleRow[]
    >([])

    const getAllData = async () => {
        try {
            const serviciosSnapshot = await getDocs(collection(db, 'Servicios'));
            const serviciosConCalificaciones: ServicioConCalificaciones[] = [];
            const calificacionesFlat: CalificacionDetalleRow[] = []

            // Itera por cada servicio y carga las calificaciones
            await Promise.all(
                serviciosSnapshot.docs.map(async (doc) => {
                    const servicioData = doc.data();
                    const uid_servicio = doc.id;

                    const calificacionesSnapshot = await getDocs(
                        collection(db, 'Servicios', uid_servicio, 'calificaciones')
                    );

                    const calificaciones: Calificacion[] = calificacionesSnapshot.docs.map((calDoc) => ({
                        ...calDoc.data(),
                        id: calDoc.id,
                    })) as Calificacion[];

                    const catFields: ServicioCategoriaCampos = {
                        categoria: servicioData.categoria as string | undefined,
                        nombre_categoria: servicioData.nombre_categoria as
                            | string
                            | undefined,
                        uid_categoria: servicioData.uid_categoria as string | undefined,
                    }

                    const uidTaller = String(servicioData.uid_taller || '')
                    const tallerNombre = String(servicioData.taller || 'Sin negocio')
                    const nombreServicio = String(
                        servicioData.nombre_servicio || 'Servicio',
                    )

                    calificaciones.forEach((calificacion) => {
                        calificacionesFlat.push({
                            id: `${uid_servicio}-${calificacion.id || ''}`,
                            uid_taller: uidTaller,
                            taller: tallerNombre,
                            nombre_servicio: nombreServicio,
                            puntuacion: Number(calificacion.puntuacion ?? 0),
                            usuarioNombre:
                                calificacion.usuario?.nombre?.trim() ||
                                'Usuario no identificado',
                            usuarioEmail:
                                calificacion.usuario?.email?.trim() || 'Sin correo',
                            fecha: toDateFromUnknownTimestamp(
                                calificacion.fecha_creacion as FirestoreTimestampLike,
                            ),
                        })
                    })

                    serviciosConCalificaciones.push({
                        nombre_servicio: servicioData.nombre_servicio,
                        taller: servicioData.taller || 'Sin negocio',
                        uid_servicio,
                        uid_taller: uidTaller,
                        calificaciones,
                        categoria_filtro_key: getCategoryFilterKeyFromFields(catFields),
                        categoria_display: getCategoryFilterLabelFromFields(catFields),
                    });
                })
            );

            // Calcula los promedios y filtra servicios con promedio > 0
            const dataPuntuacion = serviciosConCalificaciones
                .map((servicio) => {
                    const totalPuntuacion = servicio.calificaciones.reduce(
                        (sum, calificacion) => sum + (calificacion.puntuacion ?? 0),
                        0
                    );
                    const promedioPuntuacion =
                        servicio.calificaciones.length > 0
                            ? totalPuntuacion / servicio.calificaciones.length
                            : 0;

                    return {
                        nombre_servicio: servicio.nombre_servicio,
                        taller: servicio.taller,
                        uid_taller: servicio.uid_taller,
                        promedio_puntuacion: promedioPuntuacion,
                        categoria_filtro_key: servicio.categoria_filtro_key,
                        categoria_display: servicio.categoria_display,
                    };
                })
                .filter((servicio) => servicio.promedio_puntuacion > 0); // Excluye servicios con promedio 0

            setDataPuntuacion(dataPuntuacion);
            setCalificacionesDetalle(calificacionesFlat)
        } catch (error) {
            console.error('Error obteniendo los datos:', error);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);

    const [topTalleresActivos, setTopTalleresActivos] = useState<TallerActivo[]>([])
    const [usuariosMasActivos, setUsuariosMasActivos] = useState<UsuarioActivo[]>([])
    const [talleresPeriodoMeses, setTalleresPeriodoMeses] =
        useState<PeriodoMeses>(1)
    const [usuariosPeriodoMeses, setUsuariosPeriodoMeses] =
        useState<PeriodoMeses>(1)
    const [responseMetrics, setResponseMetrics] = useState({
        responseRate: 0,
        averageMinutes: 0,
        totalSolicitudes: 0,
        totalAtendidas: 0,
    })

    const fetchTopTalleresActivos = async () => {
        try {
            const usuariosSnapshot = await getDocs(collection(db, 'Usuarios'))
            const propuestasSnapshot = await getDocs(collection(db, 'Propuestas'))

            const usuariosInfo = new Map<
                string,
                { nombre: string; image_perfil?: string; typeUser?: string }
            >()

            usuariosSnapshot.forEach((userDoc) => {
                const userData = userDoc.data()
                usuariosInfo.set(userDoc.id, {
                    nombre:
                        (userData.nombre as string) ||
                        (userData.nombre_taller as string) ||
                        'Sin nombre',
                    image_perfil: userData.image_perfil as string | undefined,
                    typeUser: userData.typeUser as string | undefined,
                })
            })

            const solicitudesPorUsuario: Record<string, number> = {}
            const solicitudesAtendidasPorTaller: Record<string, number> = {}
            const nombreUsuarioPorUid: Record<string, string> = {}
            const nombreTallerPorUid: Record<string, string> = {}
            const fechaInicioUsuarios = getStartDateFromMonths(usuariosPeriodoMeses)
            const fechaInicioTalleres = getStartDateFromMonths(talleresPeriodoMeses)

            propuestasSnapshot.forEach((proposalDoc) => {
                const proposalData = proposalDoc.data() as {
                    uid_usuario?: string
                    uid_taller?: string
                    nombre_usuario?: string
                    nombre_taller?: string
                    status?: string
                    fecha_propuesta?: FirestoreTimestampLike
                    fecha_aceptada?: FirestoreTimestampLike
                }

                const fechaPropuesta = toDateFromUnknownTimestamp(
                    proposalData.fecha_propuesta,
                )
                const uidUsuario = proposalData.uid_usuario
                if (
                    uidUsuario &&
                    fechaPropuesta &&
                    fechaPropuesta >= fechaInicioUsuarios
                ) {
                    solicitudesPorUsuario[uidUsuario] =
                        (solicitudesPorUsuario[uidUsuario] || 0) + 1
                    if (proposalData.nombre_usuario) {
                        nombreUsuarioPorUid[uidUsuario] = proposalData.nombre_usuario
                    }
                }

                const uidTaller = proposalData.uid_taller
                if (!uidTaller) {
                    return
                }

                const fechaAceptada = toDateFromUnknownTimestamp(
                    proposalData.fecha_aceptada,
                )
                const statusNormalizado = String(proposalData.status || '').toLowerCase()
                const solicitudAtendida =
                    Boolean(fechaAceptada) || statusNormalizado.includes('acept')

                if (!solicitudAtendida) {
                    return
                }

                const fechaActividadTaller = fechaAceptada || fechaPropuesta
                if (
                    !fechaActividadTaller ||
                    fechaActividadTaller < fechaInicioTalleres
                ) {
                    return
                }

                solicitudesAtendidasPorTaller[uidTaller] =
                    (solicitudesAtendidasPorTaller[uidTaller] || 0) + 1
                if (proposalData.nombre_taller) {
                    nombreTallerPorUid[uidTaller] = proposalData.nombre_taller
                }
            })

            const talleresOrdenados: TallerActivo[] = Object.entries(
                solicitudesAtendidasPorTaller,
            )
                .map(([uidTaller, solicitudesAtendidas]) => {
                    const info = usuariosInfo.get(uidTaller)
                    return {
                        id: uidTaller,
                        nombre:
                            nombreTallerPorUid[uidTaller] ||
                            info?.nombre ||
                            'Sin nombre',
                        image_perfil: info?.image_perfil,
                        solicitudesAtendidas,
                    }
                })
                .sort((a, b) => b.solicitudesAtendidas - a.solicitudesAtendidas)

            const usuariosOrdenados: UsuarioActivo[] = Object.entries(
                solicitudesPorUsuario,
            )
                .map(([uidUsuario, acciones]) => {
                    const info = usuariosInfo.get(uidUsuario)
                    return {
                        id: uidUsuario,
                        nombre:
                            nombreUsuarioPorUid[uidUsuario] ||
                            info?.nombre ||
                            'Sin nombre',
                        image_perfil: info?.image_perfil,
                        acciones,
                    }
                })
                .sort((a, b) => b.acciones - a.acciones)

            setTopTalleresActivos(talleresOrdenados)
            setUsuariosMasActivos(usuariosOrdenados)
        } catch (error) {
            console.error('Error al obtener talleres más activos:', error)
        }
    }

    useEffect(() => {
        fetchTopTalleresActivos()
    }, [talleresPeriodoMeses, usuariosPeriodoMeses])

    useEffect(() => {
        setTalleresPage(1)
    }, [talleresPeriodoMeses])

    useEffect(() => {
        setUsuariosPage(1)
    }, [usuariosPeriodoMeses])

    const fetchResponseMetrics = async () => {
        try {
            const propuestasSnapshot = await getDocs(collection(db, 'Propuestas'))

            let totalSolicitudes = 0
            let totalAtendidas = 0
            let totalResponseTimeMs = 0

            propuestasSnapshot.forEach((propuestaDoc) => {
                const propuestaData = propuestaDoc.data() as {
                    fecha_propuesta?: FirestoreTimestampLike
                    fecha_aceptada?: FirestoreTimestampLike
                }

                const fechaPropuesta = toDateFromUnknownTimestamp(
                    propuestaData.fecha_propuesta,
                )

                if (!fechaPropuesta) {
                    return
                }

                totalSolicitudes++

                const fechaAceptada = toDateFromUnknownTimestamp(
                    propuestaData.fecha_aceptada,
                )

                if (!fechaAceptada) {
                    return
                }

                const diffMs = fechaAceptada.getTime() - fechaPropuesta.getTime()
                if (diffMs < 0) {
                    return
                }

                totalAtendidas++
                totalResponseTimeMs += diffMs
            })

            const responseRate =
                totalSolicitudes > 0 ? (totalAtendidas / totalSolicitudes) * 100 : 0

            const averageMinutes =
                totalAtendidas > 0
                    ? totalResponseTimeMs / totalAtendidas / (1000 * 60)
                    : 0

            setResponseMetrics({
                responseRate,
                averageMinutes,
                totalSolicitudes,
                totalAtendidas,
            })
        } catch (error) {
            console.error('Error al obtener métricas de respuesta:', error)
        }
    }

    useEffect(() => {
        fetchResponseMetrics()
    }, [])

    const [talleresPage, setTalleresPage] = useState(1)
    const talleresPerPage = 4
    const [usuariosPage, setUsuariosPage] = useState(1)
    const usuariosPerPage = 4
    const periodosMeses: PeriodoMeses[] = [1, 3, 6]

const columns: ColumnDef<{
    nombre_servicio: string
    taller: string
    uid_taller: string
    promedio_puntuacion: number
    categoria_filtro_key: string
    categoria_display: string
}>[] = [
    {
        header: 'Negocio',
        accessorKey: 'taller',
    },
    {
        header: 'Categoría',
        accessorKey: 'categoria_display',
    },
    {
        header: 'Servicio calificado',
        accessorKey: 'nombre_servicio',
    },
    {
        header: 'Promedio de Calificación',
        cell: ({ row }) => {
            // Misma lógica visual que Puntuacion.tsx: estrellas enteras (llena / vacía), sin medias.
            const raw = row.original.promedio_puntuacion || 0
            const puntuacion = Math.min(
                5,
                Math.max(0, Math.round(Number.isFinite(raw) ? raw : 0)),
            )
            const maxPuntuacion = 5
            const estrellas = Array.from({ length: maxPuntuacion }, (_, index) =>
                index < puntuacion ? (
                    <FaStar key={index} color="gold" />
                ) : (
                    <FaRegStar key={index} color="gray" />
                ),
            )

            return (
                <div style={{ display: 'flex', gap: '2px' }}>{estrellas}</div>
            )
        },
    }
];

    const { Tr, Th, Td, THead, TBody } = Table
    const { TabNav, TabList, TabContent } = Tabs
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtroNegocio, setFiltroNegocio] = useState('todos')
    const [filtroCategoria, setFiltroCategoria] = useState('todos')
    const [filtroEstrellas, setFiltroEstrellas] = useState('todos')
    const negociosDisponibles = useMemo(
        () => Array.from(new Set(dataPuntuacion.map((item) => item.taller))).sort(),
        [dataPuntuacion],
    )
    const opcionesCategoriaFiltro = useMemo(() => {
        const byKey = new Map<string, { value: string; label: string }>()
        byKey.set('todos', { value: 'todos', label: 'Todas las categorías' })
        for (const item of dataPuntuacion) {
            if (!byKey.has(item.categoria_filtro_key)) {
                byKey.set(item.categoria_filtro_key, {
                    value: item.categoria_filtro_key,
                    label: item.categoria_display,
                })
            }
        }
        const rest = [...byKey.entries()]
            .filter(([k]) => k !== 'todos')
            .sort((a, b) =>
                a[1].label.localeCompare(b[1].label, 'es', {
                    sensitivity: 'base',
                }),
            )
            .map(([, v]) => v)
        return [byKey.get('todos')!, ...rest]
    }, [dataPuntuacion])

    useEffect(() => {
        if (filtroCategoria === 'todos') {
            return
        }
        const ok = opcionesCategoriaFiltro.some((o) => o.value === filtroCategoria)
        if (!ok) {
            setFiltroCategoria('todos')
        }
    }, [opcionesCategoriaFiltro, filtroCategoria])

    const dataPuntuacionFiltrada = useMemo(() => {
        return dataPuntuacion.filter((item) => {
            const cumpleNegocio =
                filtroNegocio === 'todos' || item.taller === filtroNegocio
            const cumpleCategoria =
                filtroCategoria === 'todos' ||
                item.categoria_filtro_key === filtroCategoria
            const cumpleEstrellas =
                filtroEstrellas === 'todos' ||
                item.promedio_puntuacion >= Number(filtroEstrellas)
            return cumpleNegocio && cumpleCategoria && cumpleEstrellas
        })
    }, [dataPuntuacion, filtroNegocio, filtroCategoria, filtroEstrellas])
    const table = useReactTable({
        data: dataPuntuacionFiltrada,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(5)

    const data = table.getRowModel().rows
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const {
        clientesCount,
        talleresStats,
        subscripcionesCount,
        totalMonto,
        subscripcionesPagasCount,
        subscripcionesPorPlan,
        usuariosPorEstado,
        talleresActividadPorCiudad,
        talleresMetaByUid,
        talleresVencidosHoy,
        pagosPendientesValidar,
    } = dashboardData

    const [engagementViews, setEngagementViews] = useState<EngagementViewEvent[]>(
        [],
    )
    const [serviciosCatalogo, setServiciosCatalogo] = useState<
        Record<string, ServicioCatalogoItem>
    >({})
    const [engagementCiudad, setEngagementCiudad] = useState('todos')
    const [destacadoDetalleOpen, setDestacadoDetalleOpen] = useState(false)
    const [destacadoDetalleKind, setDestacadoDetalleKind] =
        useState<DestacadoDetalleKind | null>(null)

    const openDestacadoDetalle = (kind: DestacadoDetalleKind) => {
        setDestacadoDetalleKind(kind)
        setDestacadoDetalleOpen(true)
    }

    const closeDestacadoDetalle = () => {
        setDestacadoDetalleOpen(false)
        setDestacadoDetalleKind(null)
    }

    useEffect(() => {
        let cancelled = false
        const loadEngagement = async () => {
            try {
                const [vSnap, sSnap] = await Promise.all([
                    getDocs(collection(db, 'servicesContact')),
                    getDocs(collection(db, 'Servicios')),
                ])
                if (cancelled) {
                    return
                }
                const views: EngagementViewEvent[] = []
                vSnap.forEach((d) => {
                    const x = d.data() as Record<string, unknown>
                    const usuario =
                        x.usuario && typeof x.usuario === 'object'
                            ? (x.usuario as Record<string, unknown>)
                            : {}
                    views.push({
                        id: d.id,
                        uid_taller: String(x.uid_taller || ''),
                        uid_servicio: String(x.uid_servicio || ''),
                        fecha: toDateFromUnknownTimestamp(
                            (x.fecha_creacion ||
                                x.createdAt ||
                                x.fecha) as FirestoreTimestampLike,
                        ),
                        type: String(x.type || ''),
                        nombre_taller: String(x.nombre_taller || x.taller || '').trim(),
                        nombre_servicio: String(x.nombre_servicio || '').trim(),
                        usuarioNombre: String(
                            usuario.nombre || x.nombre_usuario || '',
                        ).trim(),
                        usuarioEmail: String(
                            usuario.email || x.email_usuario || '',
                        ).trim(),
                        usuarioId: String(
                            usuario.id || usuario.uid || x.uid_usuario || '',
                        ).trim(),
                    })
                })
                const catalog: Record<string, ServicioCatalogoItem> = {}
                sSnap.forEach((docRef) => {
                    const x = docRef.data() as Record<string, unknown>
                    catalog[docRef.id] = {
                        nombre: String(x.nombre_servicio || 'Servicio'),
                        uid_taller: String(x.uid_taller || ''),
                        tallerNombre: String(x.taller || ''),
                    }
                })
                setEngagementViews(views)
                setServiciosCatalogo(catalog)
            } catch (error) {
                console.error('Error métricas de vistas y contactos:', error)
            }
        }
        void loadEngagement()
        return () => {
            cancelled = true
        }
    }, [])

    const ciudadesEngagementLista = useMemo(() => {
        const u = new Set(
            Object.values(talleresMetaByUid)
                .map((m) => m.ciudad)
                .filter((c) => c && c !== 'Sin estado'),
        )
        return Array.from(u).sort()
    }, [talleresMetaByUid])

    const engagementResumen = useMemo(() => {
        const ciudadOk = (uid: string) => {
            if (engagementCiudad === 'todos') {
                return true
            }
            const meta = talleresMetaByUid[uid]
            return Boolean(meta && meta.ciudad === engagementCiudad)
        }

        const enCiudad = (v: EngagementViewEvent) =>
            Boolean(v.uid_taller && ciudadOk(v.uid_taller))

        const vistasFiltradas = engagementViews.filter(
            (v) =>
                enCiudad(v) && !isServiceContactInteractionType(v.type),
        )

        const vistasPorTaller = new Map<string, number>()
        const vistasPorServicio = new Map<string, number>()
        vistasFiltradas.forEach((v) => {
            vistasPorTaller.set(
                v.uid_taller,
                (vistasPorTaller.get(v.uid_taller) || 0) + 1,
            )
            if (v.uid_servicio) {
                vistasPorServicio.set(
                    v.uid_servicio,
                    (vistasPorServicio.get(v.uid_servicio) || 0) + 1,
                )
            }
        })

        let topVistaTallerUid = ''
        let topVistaTallerCount = 0
        vistasPorTaller.forEach((n, uid) => {
            if (n > topVistaTallerCount) {
                topVistaTallerCount = n
                topVistaTallerUid = uid
            }
        })

        let topVistaServicioId = ''
        let topVistaServicioCount = 0
        vistasPorServicio.forEach((n, sid) => {
            if (n > topVistaServicioCount) {
                topVistaServicioCount = n
                topVistaServicioId = sid
            }
        })

        const catTopServicio = serviciosCatalogo[topVistaServicioId]
        const topServicioNombre = catTopServicio?.nombre || '—'
        const topServicioNegocio =
            catTopServicio?.tallerNombre ||
            (catTopServicio?.uid_taller
                ? talleresMetaByUid[catTopServicio.uid_taller]?.nombre
                : '') ||
            '—'

        const contactosFiltrados = engagementViews.filter(
            (v) =>
                enCiudad(v) && isServiceContactInteractionType(v.type),
        )
        const contactosPorTaller = new Map<string, number>()
        const nombreTallerContactoPorUid = new Map<string, string>()
        contactosFiltrados.forEach((c) => {
            contactosPorTaller.set(
                c.uid_taller,
                (contactosPorTaller.get(c.uid_taller) || 0) + 1,
            )
            if (
                c.nombre_taller &&
                !nombreTallerContactoPorUid.has(c.uid_taller)
            ) {
                nombreTallerContactoPorUid.set(c.uid_taller, c.nombre_taller)
            }
        })
        let topContactoUid = ''
        let topContactoCount = 0
        contactosPorTaller.forEach((n, uid) => {
            if (n > topContactoCount) {
                topContactoCount = n
                topContactoUid = uid
            }
        })

        const acumRating: Record<string, { sum: number; n: number }> = {}
        dataPuntuacion.forEach((row) => {
            if (!row.uid_taller || !ciudadOk(row.uid_taller)) {
                return
            }
            if (!acumRating[row.uid_taller]) {
                acumRating[row.uid_taller] = { sum: 0, n: 0 }
            }
            acumRating[row.uid_taller].sum += row.promedio_puntuacion
            acumRating[row.uid_taller].n += 1
        })
        const rankingMejor = Object.entries(acumRating)
            .map(([uid, { sum, n }]) => ({
                uid,
                nombre: talleresMetaByUid[uid]?.nombre || 'Sin nombre',
                promedio: n > 0 ? sum / n : 0,
                servicios: n,
            }))
            .sort((a, b) => b.promedio - a.promedio)
            .slice(0, 8)

        const mejorTallerUid = rankingMejor[0]?.uid || ''

        const sortByFechaDesc = (
            a: EngagementDetallePersona,
            b: EngagementDetallePersona,
        ) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0)

        const detalleTopVistaTaller = topVistaTallerUid
            ? vistasFiltradas
                  .filter((v) => v.uid_taller === topVistaTallerUid)
                  .map((v) =>
                      mapEventToDetallePersona(
                          v,
                          v.nombre_servicio ||
                              serviciosCatalogo[v.uid_servicio]?.nombre ||
                              'Vista de perfil/servicio',
                      ),
                  )
                  .sort(sortByFechaDesc)
            : []

        const detalleTopServicio = topVistaServicioId
            ? vistasFiltradas
                  .filter((v) => v.uid_servicio === topVistaServicioId)
                  .map((v) =>
                      mapEventToDetallePersona(
                          v,
                          v.nombre_servicio ||
                              catTopServicio?.nombre ||
                              'Servicio',
                      ),
                  )
                  .sort(sortByFechaDesc)
            : []

        const detalleTopContacto = topContactoUid
            ? contactosFiltrados
                  .filter((c) => c.uid_taller === topContactoUid)
                  .map((c) => {
                      const tipo = c.type
                          ? c.type.charAt(0).toUpperCase() + c.type.slice(1)
                          : 'Contacto'
                      return mapEventToDetallePersona(
                          c,
                          `${tipo}${c.nombre_servicio ? ` · ${c.nombre_servicio}` : ''}`,
                      )
                  })
                  .sort(sortByFechaDesc)
            : []

        const detalleMejorCalidad = mejorTallerUid
            ? calificacionesDetalle
                  .filter(
                      (c) =>
                          c.uid_taller === mejorTallerUid &&
                          ciudadOk(c.uid_taller) &&
                          c.puntuacion > 0,
                  )
                  .map(
                      (c): EngagementDetallePersona => ({
                          id: c.id,
                          nombre: c.usuarioNombre,
                          email: c.usuarioEmail,
                          fecha: c.fecha,
                          detalle: `${c.nombre_servicio} · ${c.puntuacion.toFixed(1)}★`,
                      }),
                  )
                  .sort(sortByFechaDesc)
            : []

        return {
            topVistaTallerUid,
            topVistaTallerCount,
            topVistaTallerNombre:
                talleresMetaByUid[topVistaTallerUid]?.nombre || '—',
            topVistaServicioId,
            topServicioNombre,
            topServicioNegocio,
            topVistaServicioCount,
            topContactoUid,
            topContactoCount,
            topContactoNombre:
                talleresMetaByUid[topContactoUid]?.nombre ||
                nombreTallerContactoPorUid.get(topContactoUid) ||
                '—',
            rankingMejor,
            detalleTopVistaTaller,
            detalleTopServicio,
            detalleTopContacto,
            detalleMejorCalidad,
        }
    }, [
        engagementViews,
        engagementCiudad,
        talleresMetaByUid,
        serviciosCatalogo,
        dataPuntuacion,
        calificacionesDetalle,
    ])

    const destacadoDetalleMeta = useMemo(() => {
        if (!destacadoDetalleKind) {
            return {
                title: '',
                subtitle: '',
                rows: [] as EngagementDetallePersona[],
                countLabel: '',
                Icon: HiOutlineEye,
            }
        }

        switch (destacadoDetalleKind) {
            case 'vistaTaller':
                return {
                    title: 'Más visto',
                    subtitle: engagementResumen.topVistaTallerNombre,
                    rows: engagementResumen.detalleTopVistaTaller,
                    countLabel: 'vistas',
                    Icon: HiOutlineEye,
                }
            case 'vistaServicio':
                return {
                    title: 'Servicio top',
                    subtitle: `${engagementResumen.topServicioNombre} · ${engagementResumen.topServicioNegocio}`,
                    rows: engagementResumen.detalleTopServicio,
                    countLabel: 'vistas',
                    Icon: HiOutlineClipboardList,
                }
            case 'contacto':
                return {
                    title: 'Más contactado',
                    subtitle: engagementResumen.topContactoNombre,
                    rows: engagementResumen.detalleTopContacto,
                    countLabel: 'contactos',
                    Icon: HiOutlinePhone,
                }
            case 'calidad':
                return {
                    title: 'Mejor calidad',
                    subtitle: engagementResumen.rankingMejor[0]?.nombre || '—',
                    rows: engagementResumen.detalleMejorCalidad,
                    countLabel: 'calificaciones',
                    Icon: FaStar,
                }
            default:
                return {
                    title: '',
                    subtitle: '',
                    rows: [] as EngagementDetallePersona[],
                    countLabel: '',
                    Icon: HiOutlineEye,
                }
        }
    }, [destacadoDetalleKind, engagementResumen])

    const talleresNuevosEnEspera = talleresStats.espera

    const totalTalleres =
        talleresStats.aprobados + talleresStats.rechazados + talleresStats.espera

    const PLANES_FIJOS = ['GRATIS', 'Plan Bronce', 'Plan Plata', 'Plan Oro'] as const
    const planesFijosConConteo = PLANES_FIJOS.map((plan) => [
        plan,
        subscripcionesPorPlan[plan] || 0,
    ] as const)
    const maxPlanCount =
        Math.max(...planesFijosConConteo.map(([, count]) => count), 0) || 1

    const [vistaEstados, setVistaEstados] = useState<'usuarios' | 'talleres'>(
        'usuarios',
    )
    const [estadoNegocioFiltro, setEstadoNegocioFiltro] =
        useState<EstadoNegocioFiltro>('todos')
    const [actividadNegocioFiltro, setActividadNegocioFiltro] = useState<
        'todos' | EstadoActividadNegocio
    >('todos')
    const [actividadDesde, setActividadDesde] = useState<Date | null>(null)
    const [actividadHasta, setActividadHasta] = useState<Date | null>(null)

    const ESTADOS_COLOR_PALETTE = [
        '#000B7E',
        '#16A34A',
        '#EAB308',
        '#F97316',
        '#EF4444',
        '#0EA5E9',
        '#6366F1',
        '#14B8A6',
    ]

    const chartEstados = useMemo(() => {
        const colorAt = (index: number) =>
            ESTADOS_COLOR_PALETTE[index % ESTADOS_COLOR_PALETTE.length]

        if (vistaEstados === 'usuarios') {
            const labelsBase = Object.keys(usuariosPorEstado || {}).sort()
            const series = labelsBase.map((estado) => ({
                estado,
                valor: usuariosPorEstado[estado] || 0,
            }))
            return {
                labels: series.map((item) => item.estado),
                data: series.map((item) => item.valor),
                colors: series.map((_, index) => colorAt(index)),
            }
        }

        const desde = actividadDesde
            ? new Date(
                  actividadDesde.getFullYear(),
                  actividadDesde.getMonth(),
                  actividadDesde.getDate(),
                  0,
                  0,
                  0,
              )
            : null
        const hasta = actividadHasta
            ? new Date(
                  actividadHasta.getFullYear(),
                  actividadHasta.getMonth(),
                  actividadHasta.getDate(),
                  23,
                  59,
                  59,
              )
            : null

        const acumulado: Record<string, number> = {}
        talleresActividadPorCiudad.forEach((item) => {
            if (estadoNegocioFiltro !== 'todos') {
                if (item.status !== estadoNegocioFiltro) {
                    return
                }
            }
            if (
                actividadNegocioFiltro !== 'todos' &&
                item.actividad !== actividadNegocioFiltro
            ) {
                return
            }
            if (desde || hasta) {
                if (!item.fechaFin) {
                    return
                }
                if (desde && item.fechaFin < desde) {
                    return
                }
                if (hasta && item.fechaFin > hasta) {
                    return
                }
            }
            acumulado[item.ciudad] = (acumulado[item.ciudad] || 0) + 1
        })

        let series = Object.entries(acumulado)
            .map(([estado, valor]) => ({ estado, valor }))
            .sort((a, b) => b.valor - a.valor)

        const recortePorFiltro =
            estadoNegocioFiltro !== 'todos' ||
            actividadNegocioFiltro !== 'todos' ||
            Boolean(desde) ||
            Boolean(hasta)

        if (recortePorFiltro) {
            series = series.filter((item) => item.valor > 0)
        }

        return {
            labels: series.map((item) => item.estado),
            data: series.map((item) => item.valor),
            colors: series.map((_, index) => colorAt(index)),
        }
    }, [
        vistaEstados,
        usuariosPorEstado,
        talleresActividadPorCiudad,
        estadoNegocioFiltro,
        actividadNegocioFiltro,
        actividadDesde,
        actividadHasta,
    ])

    const responseRateLabel = `${responseMetrics.responseRate.toFixed(1)}%`
    const responseProgressWidth = `${Math.max(
        0,
        Math.min(100, responseMetrics.responseRate),
    )}%`
    const averageResponseLabel =
        responseMetrics.totalAtendidas > 0
            ? `${responseMetrics.averageMinutes.toFixed(1)} min`
            : '— min'

    const resumenDiaItems = [
        {
            concepto: 'Negocios en espera de revisión',
            valor: talleresNuevosEnEspera,
            Icono: HiOutlineOfficeBuilding,
            colorBadge: 'bg-blue-100 text-blue-700',
            emptyMessage: 'Sin negocios en espera hoy',
            activeMessage: 'Negocios por revisar hoy',
        },
        {
            concepto: 'Pagos pendientes por validar',
            valor: pagosPendientesValidar,
            Icono: HiOutlineCreditCard,
            colorBadge: 'bg-amber-100 text-amber-700',
            emptyMessage: 'Sin pagos por validar',
            activeMessage: 'Pagos por validar en cola',
        },
        {
            concepto: 'Negocios que vencieron hoy',
            valor: talleresVencidosHoy,
            Icono: HiOutlineUserGroup,
            colorBadge: 'bg-rose-100 text-rose-700',
            emptyMessage: 'Sin negocios vencidos hoy',
            activeMessage: 'Negocios por gestionar hoy',
        },
    ]

    const DestacadoDetalleIcon = destacadoDetalleMeta.Icon

    return (
        <div className="flex flex-col min-h-[calc(100vh-6rem)] bg-gray-100">
            <Dialog
                isOpen={isResumenCriticoPopupOpen}
                onClose={() => setIsResumenCriticoPopupOpen(false)}
                onRequestClose={() => setIsResumenCriticoPopupOpen(false)}
                width={560}
            >
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                        Resumen diario
                    </p>
                    <h4 className="mt-1 text-2xl font-extrabold text-[#000B7E] leading-tight">
                        Buen día, estas son tus alertas clave
                    </h4>
                    <p className="mt-2 text-sm text-gray-600">
                        Estado operativo del panel administrativo para hoy.
                    </p>
                </div>

                <div className="mt-4 grid gap-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 flex items-center justify-between">
                        <p className="text-base font-semibold text-blue-900">
                            Negocios nuevos en espera de revisión
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-blue-700">
                            {talleresNuevosEnEspera}
                        </span>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 flex items-center justify-between">
                        <p className="text-base font-semibold text-amber-900">
                            Pagos pendientes por validar
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-amber-700">
                            {pagosPendientesValidar}
                        </span>
                    </div>

                    <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 flex items-center justify-between">
                        <p className="text-base font-semibold text-rose-900">
                            Negocios con vencimiento hoy
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-rose-700">
                            {talleresVencidosHoy}
                        </span>
                    </div>
                </div>

                <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                    <Button
                        variant="solid"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setIsResumenCriticoPopupOpen(false)}
                    >
                        <span className="text-sm font-semibold">Ver dashboard</span>
                    </Button>
                </div>
            </Dialog>

            <Dialog
                isOpen={destacadoDetalleOpen}
                onClose={closeDestacadoDetalle}
                onRequestClose={closeDestacadoDetalle}
                width={680}
                closable={false}
                contentClassName="!p-0 overflow-hidden"
            >
                <div className="overflow-hidden">
                    <div className="bg-[#000B7E] px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                                    <DestacadoDetalleIcon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                                        Detalle del indicador
                                    </p>
                                    <h4 className="mt-0.5 text-lg font-semibold text-white leading-tight truncate">
                                        {destacadoDetalleMeta.title}
                                    </h4>
                                    <p className="mt-1 text-xs text-white/85 truncate">
                                        {destacadoDetalleMeta.subtitle}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-2xl font-bold tabular-nums leading-none text-white">
                                    {destacadoDetalleMeta.rows.length}
                                </p>
                                <p className="mt-1 text-[10px] font-medium text-white/80">
                                    {destacadoDetalleMeta.countLabel}
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] text-white/75">
                            {engagementCiudad !== 'todos'
                                ? `Ciudad: ${engagementCiudad}`
                                : 'Todas las ciudades'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-b from-gray-50/90 to-white p-3">
                        <div className="max-h-[420px] overflow-y-auto space-y-2.5 pr-0.5">
                            {destacadoDetalleMeta.rows.length > 0 ? (
                                destacadoDetalleMeta.rows.map((row, index) => (
                                    <div
                                        key={`${row.id}-${index}`}
                                        className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03]"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#000B7E]/10 text-xs font-bold text-[#000B7E]">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                                                    {row.nombre}
                                                </p>
                                                <p className="text-[11px] text-gray-500 truncate">
                                                    {row.email}
                                                </p>
                                                <p className="text-[11px] text-gray-600 truncate">
                                                    {row.detalle}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Fecha
                                                </p>
                                                <p className="mt-0.5 text-[11px] font-medium text-gray-600 tabular-nums leading-snug">
                                                    {formatEngagementFecha(row.fecha)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">
                                        No hay registros para mostrar en este indicador.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
                        <p className="text-xs text-gray-500">
                            {destacadoDetalleMeta.rows.length}{' '}
                            {destacadoDetalleMeta.countLabel} sincronizados
                        </p>
                        <Button
                            size="sm"
                            variant="solid"
                            style={{ backgroundColor: '#000B7E' }}
                            onClick={closeDestacadoDetalle}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Dialog>

            <div className="flex-1 min-h-0 mt-3 bg-gray-100 pb-4">
                <Tabs
                    defaultValue="operativo"
                    className="flex flex-col flex-1 min-h-0 bg-gray-100"
                >
                    <div className="mb-3 border-b border-gray-200 bg-white rounded-t-xl px-3 pt-2">
                        <TabList>
                            <TabNav value="operativo">
                                Visión general
                            </TabNav>
                            <TabNav value="estadistico">
                                Análisis estadístico
                            </TabNav>
                        </TabList>
                    </div>
                    <div className="flex-1 min-h-0 bg-gray-100">
                        <TabContent value="operativo" className="h-full bg-gray-100 pb-3">
                            {/* Fila 1: 3 cards KPI */}
                            <section className="flex-none grid grid-cols-3 gap-3 mb-3">
                                <a
                                    href={`${APP_PREFIX_PATH}/users`}
                                    className="rounded-xl bg-[#000B7E] p-8 shadow-sm transition-all hover:shadow-md min-h-[132px] flex flex-col justify-between text-white overflow-hidden relative group"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" aria-hidden />
                                    <div className="flex items-start justify-between gap-3 relative">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/20">
                                                <HiOutlineUserGroup className="text-6xl" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium uppercase tracking-wider text-white/90">
                                                    Clientes
                                                </p>
                                                <p className="text-3xl font-bold tabular-nums mt-1 leading-none">
                                                    {clientesCount}
                                                </p>
                                            </div>
                                        </div>
                                        <HiChevronRight className="text-2xl text-white/70 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                                    </div>
                                    <p className="text-md text-white/80 mt-2 relative leading-snug">
                                        Total de clientes registrados en la plataforma
                                    </p>
                                </a>
                                <a
                                    href={`${APP_PREFIX_PATH}/garages`}
                                    className="rounded-xl bg-blue-800 p-8 shadow-sm transition-all hover:shadow-md min-h-[132px] flex flex-col justify-between text-white overflow-hidden relative group"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" aria-hidden />
                                    <div className="flex items-start justify-between gap-3 relative">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/20">
                                                <HiOutlineOfficeBuilding className="text-6xl" />
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-medium uppercase tracking-wider text-white/90">
                                                        Negocios
                                                    </p>
                                                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                                                        {talleresStats.espera} en espera
                                                    </span>
                                                </div>
                                                <p className="text-3xl font-bold tabular-nums mt-1 leading-none">
                                                    {totalTalleres}
                                                </p>
                                            </div>
                                        </div>
                                        <HiChevronRight className="text-2xl text-white/70 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                                    </div>
                                    <p className="text-md text-white/80 mt-2 relative leading-snug">
                                        Aprobados, rechazados y pendientes de revisión
                                    </p>
                                    <div className="mt-3 grid gap-1.5 relative">
                                        {[
                                            {
                                                label: 'Aprobados',
                                                value: talleresStats.aprobados,
                                                color: 'bg-emerald-300',
                                            },
                                            {
                                                label: 'En espera',
                                                value: talleresStats.espera,
                                                color: 'bg-sky-300',
                                            },
                                            {
                                                label: 'Rechazados',
                                                value: talleresStats.rechazados,
                                                color: 'bg-rose-300',
                                            },
                                        ].map((item) => {
                                            const width =
                                                totalTalleres > 0
                                                    ? `${(item.value / totalTalleres) * 100}%`
                                                    : '0%'
                                            return (
                                                <div key={item.label}>
                                                    <div className="flex items-center justify-between text-[11px] text-white/90">
                                                        <span>{item.label}</span>
                                                        <span className="font-semibold">
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.color}`}
                                                            style={{ width }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </a>
                                <a
                                    href={`${APP_PREFIX_PATH}/subscriptions`}
                                    className="rounded-xl bg-blue-600 p-8 shadow-sm transition-all hover:shadow-md min-h-[132px] flex flex-col justify-between text-white overflow-hidden relative group"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" aria-hidden />
                                    <div className="flex items-start justify-between gap-3 relative">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/20">
                                                <HiOutlineCreditCard className="text-6xl" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium uppercase tracking-wider text-white/90">
                                                    Subscripciones
                                                </p>
                                                <p className="text-3xl font-bold tabular-nums mt-1 leading-none">
                                                    {subscripcionesCount}
                                                </p>
                                            </div>
                                        </div>
                                        <HiChevronRight className="text-2xl text-white/70 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                                    </div>
                                    <p className="text-white/85 mt-2 relative leading-tight">
                                        <span className="text-lg font-bold tabular-nums">
                                            ${totalMonto.toFixed(0)}
                                        </span>{' '}
                                        <span className="text-md">total recaudado</span>
                                    </p>
                                    <p className="mt-1 text-xs text-white/80">
                                        {subscripcionesPagasCount} suscripciones pagas
                                    </p>
                                    <div className="mt-2 grid gap-1.5">
                                        {planesFijosConConteo.map(([plan, count]) => {
                                            const percent = (count / maxPlanCount) * 100
                                            return (
                                                <div key={plan}>
                                                    <div className="flex items-center justify-between text-[11px] text-white/90">
                                                        <span className="truncate">{plan}</span>
                                                        <span className="font-semibold">
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-white/80"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </a>
                            </section>

                            {/* Fila 2: Gráfico + Resumen del día */}
                            <section className="flex-1 min-h-0 grid grid-cols-3 gap-3 mb-3">
                                <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-hidden flex flex-col min-h-0">
                                    <SplineArea />
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
                                    <div className="bg-[#000B7E] px-4 py-2">
                                        <h3 className="text-sm font-semibold text-white">
                                            Resumen del día
                                        </h3>
                                    </div>
                                    <div className="flex-1 min-h-0 p-2.5 bg-gray-50/70 grid grid-rows-3 gap-2.5">
                                        {resumenDiaItems.map((item) => {
                                            const isEmpty = item.valor === 0

                                            return (
                                                <div
                                                    key={item.concepto}
                                                    className="h-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm flex flex-col justify-between"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-start gap-2">
                                                            <span className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-600">
                                                                <item.Icono className="text-sm" />
                                                            </span>
                                                            <p className="text-xs text-gray-600 leading-tight">
                                                                {item.concepto}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                isEmpty
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : item.colorBadge
                                                            }`}
                                                        >
                                                            {isEmpty ? 'Sin pendientes' : 'Pendiente'}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 flex items-center gap-2 px-1">
                                                        <p className="flex-1 text-[11px] text-gray-500 leading-tight text-center">
                                                            {isEmpty ? item.emptyMessage : item.activeMessage}
                                                        </p>
                                                        <p className="text-xl font-bold text-gray-900 tabular-nums leading-none flex-shrink-0 order-first">
                                                            {item.valor}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </section>

                            {/* Fila 3: Destacados (30%) + Tabla de calificaciones (70%) */}
                            <section className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,30%)_minmax(0,1fr)] gap-3">
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0 min-w-0 max-h-[520px] lg:max-h-none">
                                    <div className="bg-[#000B7E] px-4 py-3 flex-none shrink-0">
                                        <h2 className="text-sm font-semibold text-white leading-tight">
                                            Destacados
                                        </h2>
                                        <p className="text-xs text-white/85 mt-1 leading-snug">
                                            Indicadores por ciudad
                                        </p>
                                    </div>
                                    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50/90 to-white">
                                        <div className="rounded-lg border border-gray-200/80 bg-white px-3 py-2.5 shadow-sm ring-1 ring-black/[0.02]">
                                            <DashboardFilterSelectField
                                                label="Ciudad"
                                                value={engagementCiudad}
                                                onChange={(e) =>
                                                    setEngagementCiudad(e.target.value)
                                                }
                                            >
                                                <option value="todos">Todas las ciudades</option>
                                                {ciudadesEngagementLista.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </DashboardFilterSelectField>
                                        </div>
                                        <div className="grid gap-2.5">
                                            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03]">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#000B7E]/10 text-[#000B7E]">
                                                        <HiOutlineEye className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                                            Más visto
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                                                            {engagementResumen.topVistaTallerNombre}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 flex items-start gap-1.5">
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold tabular-nums leading-none text-[#000B7E]">
                                                                {engagementResumen.topVistaTallerCount}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-gray-400 mt-1">
                                                                vistas
                                                            </p>
                                                        </div>
                                                        <Tooltip title="Ver detalle">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    engagementResumen.topVistaTallerCount <=
                                                                    0
                                                                }
                                                                onClick={() =>
                                                                    openDestacadoDetalle(
                                                                        'vistaTaller',
                                                                    )
                                                                }
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#000B7E] hover:bg-[#000B7E]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <HiOutlineEye className="h-7 w-7" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03]">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#000B7E]/10 text-[#000B7E]">
                                                        <HiOutlineClipboardList className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                                            Servicio top
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                                                            {engagementResumen.topServicioNombre}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate">
                                                            {engagementResumen.topServicioNegocio}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 flex items-start gap-1.5">
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold tabular-nums leading-none text-[#000B7E]">
                                                                {engagementResumen.topVistaServicioCount}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-gray-400 mt-1">
                                                                vistas
                                                            </p>
                                                        </div>
                                                        <Tooltip title="Ver detalle">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    engagementResumen.topVistaServicioCount <=
                                                                    0
                                                                }
                                                                onClick={() =>
                                                                    openDestacadoDetalle(
                                                                        'vistaServicio',
                                                                    )
                                                                }
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#000B7E] hover:bg-[#000B7E]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <HiOutlineEye className="h-7 w-7" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03]">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#000B7E]/10 text-[#000B7E]">
                                                        <HiOutlinePhone className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                                            Más contactado
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 leading-snug">
                                                            Contactar, Llamada y Whatsapp
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                                                            {engagementResumen.topContactoNombre}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 flex items-start gap-1.5">
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold tabular-nums leading-none text-[#000B7E]">
                                                                {engagementResumen.topContactoCount}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-gray-400 mt-1">
                                                                contactos
                                                            </p>
                                                        </div>
                                                        <Tooltip title="Ver detalle">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    engagementResumen.topContactoCount <=
                                                                    0
                                                                }
                                                                onClick={() =>
                                                                    openDestacadoDetalle(
                                                                        'contacto',
                                                                    )
                                                                }
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#000B7E] hover:bg-[#000B7E]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <HiOutlineEye className="h-7 w-7" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03]">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                                        <FaStar className="h-4 w-4" />
                                                    </span>
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                                            Mejor calidad
                                                        </p>
                                                        {engagementResumen.rankingMejor[0] ? (
                                                            <>
                                                                <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                                                                    {
                                                                        engagementResumen
                                                                            .rankingMejor[0].nombre
                                                                    }
                                                                </p>
                                                                <div className="flex gap-0.5 pt-0.5">
                                                                    {Array.from({ length: 5 }, (_, index) =>
                                                                        index <
                                                                        Math.min(
                                                                            5,
                                                                            Math.max(
                                                                                0,
                                                                                Math.round(
                                                                                    engagementResumen
                                                                                        .rankingMejor[0]
                                                                                        .promedio,
                                                                                ),
                                                                            ),
                                                                        ) ? (
                                                                            <FaStar
                                                                                key={index}
                                                                                className="h-3 w-3"
                                                                                color="gold"
                                                                            />
                                                                        ) : (
                                                                            <FaRegStar
                                                                                key={index}
                                                                                className="h-3 w-3"
                                                                                color="gray"
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-gray-400">—</p>
                                                        )}
                                                    </div>
                                                    {engagementResumen.rankingMejor[0] ? (
                                                        <div className="shrink-0 flex items-start gap-1.5">
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold tabular-nums leading-none text-[#000B7E]">
                                                                    {engagementResumen.rankingMejor[0].promedio.toFixed(
                                                                        1,
                                                                    )}
                                                                </p>
                                                                <p className="text-[10px] font-medium text-gray-400 mt-1">
                                                                    de 5
                                                                </p>
                                                            </div>
                                                            <Tooltip title="Ver detalle">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        engagementResumen
                                                                            .detalleMejorCalidad
                                                                            .length <= 0
                                                                    }
                                                                    onClick={() =>
                                                                        openDestacadoDetalle(
                                                                            'calidad',
                                                                        )
                                                                    }
                                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#000B7E] hover:bg-[#000B7E]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    <HiOutlineEye className="h-7 w-7" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0 min-w-0">
                                    <div className="bg-[#000B7E] px-4 py-2 flex-none">
                                        <h2 className="text-sm font-semibold text-white">
                                            Calificaciones de los servicios
                                        </h2>
                                        <p className="text-xs text-white/90 mt-0.5">
                                            Promedio por categoría, negocio y servicio
                                            calificado
                                        </p>
                                    </div>
                                    <div className="flex-1 min-h-0 overflow-auto">
                                        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/95 to-gray-50/40 p-3">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-2.5">
                                                <DashboardFilterSelectField
                                                    label="Negocio"
                                                    value={filtroNegocio}
                                                    onChange={(e) => {
                                                        setFiltroNegocio(e.target.value)
                                                        setCurrentPage(1)
                                                    }}
                                                >
                                                    <option value="todos">Todos los negocios</option>
                                                    {negociosDisponibles.map((negocio) => (
                                                        <option key={negocio} value={negocio}>
                                                            {negocio}
                                                        </option>
                                                    ))}
                                                </DashboardFilterSelectField>
                                                <DashboardFilterSelectField
                                                    label="Categoría"
                                                    value={filtroCategoria}
                                                    onChange={(e) => {
                                                        setFiltroCategoria(e.target.value)
                                                        setCurrentPage(1)
                                                    }}
                                                >
                                                    {opcionesCategoriaFiltro.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </DashboardFilterSelectField>
                                                <DashboardFilterSelectField
                                                    label="Calificación mín."
                                                    value={filtroEstrellas}
                                                    onChange={(e) => {
                                                        setFiltroEstrellas(e.target.value)
                                                        setCurrentPage(1)
                                                    }}
                                                >
                                                    <option value="todos">Todas las estrellas</option>
                                                    <option value="4.5">4.5+ estrellas</option>
                                                    <option value="4">4+ estrellas</option>
                                                    <option value="3">3+ estrellas</option>
                                                </DashboardFilterSelectField>
                                            </div>
                                        </div>
                                        <Table className="w-full text-sm">
                                            <THead>
                                                {table.getHeaderGroups().map((headerGroup) => (
                                                    <Tr key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => (
                                                            <Th
                                                                key={header.id}
                                                                colSpan={header.colSpan}
                                                                className="!bg-gray-100 !text-gray-700 !text-xs"
                                                            >
                                                                {header.isPlaceholder ? null : (
                                                                    <div
                                                                        {...{
                                                                            className:
                                                                                header.column.getCanSort()
                                                                                    ? 'cursor-pointer select-none'
                                                                                    : '',
                                                                            onClick: header.column.getToggleSortingHandler(),
                                                                        }}
                                                                    >
                                                                        {flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext(),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </Th>
                                                        ))}
                                                    </Tr>
                                                ))}
                                            </THead>
                                            <TBody>
                                                {table
                                                    .getRowModel()
                                                    .rows.slice(
                                                        (currentPage - 1) * rowsPerPage,
                                                        currentPage * rowsPerPage,
                                                    )
                                                    .map((row, rowIndex) => (
                                                        <Tr
                                                            key={row.id}
                                                            className={
                                                                rowIndex % 2 === 1 ? 'bg-gray-50' : ''
                                                            }
                                                        >
                                                            {row.getVisibleCells().map((cell) => (
                                                                <Td key={cell.id} className="text-xs">
                                                                    {flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext(),
                                                                    )}
                                                                </Td>
                                                            ))}
                                                        </Tr>
                                                    ))}
                                            </TBody>
                                        </Table>
                                    </div>
                                    <div className="border-t border-gray-200 px-3 py-2 flex-none">
                                        <Pagination
                                            onChange={onPaginationChange}
                                            currentPage={currentPage}
                                            totalRows={totalRows}
                                            rowsPerPage={rowsPerPage}
                                        />
                                    </div>
                                </div>
                            </section>
                        </TabContent>

                        <TabContent value="estadistico" className="h-full bg-gray-100 pb-3">
                            <section className="grid grid-cols-3 gap-3 mb-3">
                                <div className="col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                Usuarios y negocios por estado
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Por región: estatus de aprobación, suscripción activa o
                                                vencida y rango de fechas de fin de plan.
                                            </p>
                                        </div>
                                        <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVistaEstados('usuarios')
                                                    setEstadoNegocioFiltro('todos')
                                                    setActividadNegocioFiltro('todos')
                                                    setActividadDesde(null)
                                                    setActividadHasta(null)
                                                }}
                                                className={`px-3 py-1 rounded-full transition-colors ${
                                                    vistaEstados === 'usuarios'
                                                        ? 'bg-[#000B7E] text-white shadow-sm'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                Usuarios
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVistaEstados('talleres')
                                                    setEstadoNegocioFiltro('todos')
                                                }}
                                                className={`px-3 py-1 rounded-full transition-colors ${
                                                    vistaEstados === 'talleres'
                                                        ? 'bg-[#000B7E] text-white shadow-sm'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                Negocios
                                            </button>
                                        </div>
                                    </div>
                                    {vistaEstados === 'talleres' && (
                                        <div className="px-4 py-3 border-b border-gray-100 bg-white space-y-4">
                                            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                        Estatus de aprobación
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEstadoNegocioFiltro('todos')
                                                            }
                                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                                estadoNegocioFiltro === 'todos'
                                                                    ? 'bg-[#000B7E] text-white'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            Todos
                                                        </button>
                                                        {ESTADOS_NEGOCIO_FIJOS.map((estado) => (
                                                            <button
                                                                key={estado}
                                                                type="button"
                                                                onClick={() =>
                                                                    setEstadoNegocioFiltro(estado)
                                                                }
                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                                    estadoNegocioFiltro === estado
                                                                        ? 'bg-[#000B7E] text-white'
                                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {estado}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Suscripción (activo / vencimiento)
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="text-[11px] font-semibold text-[#000B7E] hover:underline"
                                                            onClick={() => {
                                                                setActividadNegocioFiltro('todos')
                                                                setActividadDesde(null)
                                                                setActividadHasta(null)
                                                            }}
                                                        >
                                                            Limpiar fechas y actividad
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 inline-flex flex-wrap rounded-full bg-gray-100 p-1 text-[11px] font-medium">
                                                        {[
                                                            { key: 'todos', label: 'Todos' },
                                                            { key: 'activo', label: 'Activos' },
                                                            {
                                                                key: 'suspendido',
                                                                label: 'Suspendidos',
                                                            },
                                                        ].map((option) => (
                                                            <button
                                                                key={option.key}
                                                                type="button"
                                                                onClick={() =>
                                                                    setActividadNegocioFiltro(
                                                                        option.key as
                                                                            | 'todos'
                                                                            | EstadoActividadNegocio,
                                                                    )
                                                                }
                                                                className={`rounded-full px-2.5 py-1 transition-colors ${
                                                                    actividadNegocioFiltro ===
                                                                    option.key
                                                                        ? 'bg-[#000B7E] text-white shadow-sm'
                                                                        : 'text-gray-600'
                                                                }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                        <DatePicker
                                                            value={actividadDesde}
                                                            onChange={setActividadDesde}
                                                            inputFormat="DD/MM/YYYY"
                                                            placeholder="Fin plan desde"
                                                            clearable
                                                            className="w-full"
                                                        />
                                                        <DatePicker
                                                            value={actividadHasta}
                                                            onChange={setActividadHasta}
                                                            inputFormat="DD/MM/YYYY"
                                                            placeholder="Fin plan hasta"
                                                            clearable
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <p className="mt-1.5 text-[10px] text-gray-400 leading-snug">
                                                        El rango filtra por fecha de fin de suscripción.
                                                        Sin fechas, cuenta todos los negocios que cumplan
                                                        estatus y actividad.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 min-h-0 p-4">
                                        {chartEstados.labels.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">
                                                Aún no hay datos de estados disponibles.
                                            </p>
                                        ) : (
                                            <SalesByCategories
                                                data={chartEstados}
                                                donutText={
                                                    vistaEstados === 'usuarios'
                                                        ? 'Cantidad de usuarios'
                                                        : 'Cantidad de negocios'
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-[#000B7E] via-indigo-700 to-sky-500 p-5 shadow-md flex flex-col gap-5 text-white">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                                            Tasa de respuesta promedio
                                        </p>
                                        <div className="mt-2 flex items-end gap-3">
                                            <p className="text-3xl font-bold tabular-nums">
                                                {responseRateLabel}
                                            </p>
                                            <span className="text-xs text-white/80">
                                                de solicitudes atendidas
                                            </span>
                                        </div>
                                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-emerald-300/90 transition-all"
                                                style={{ width: responseProgressWidth }}
                                            />
                                        </div>
                                        <p className="mt-2 text-[11px] text-white/80">
                                            {responseMetrics.totalAtendidas} de{' '}
                                            {responseMetrics.totalSolicitudes} solicitudes tienen
                                            respuesta registrada.
                                        </p>
                                    </div>
                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                                            Tiempo promedio de respuesta
                                        </p>
                                        <div className="mt-2 flex items-end gap-3">
                                            <p className="text-3xl font-bold tabular-nums">
                                                {averageResponseLabel}
                                            </p>
                                            <span className="text-xs text-white/80">
                                                desde que el cliente envía la solicitud
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] text-white/80">
                                            Basado en las solicitudes para obtener el promedio.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                Negocios más activos
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Ranking según solicitudes atendidas
                                            </p>
                                        </div>
                                        <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
                                            {periodosMeses.map((meses) => (
                                                <button
                                                    key={`talleres-${meses}`}
                                                    type="button"
                                                    onClick={() =>
                                                        setTalleresPeriodoMeses(meses)
                                                    }
                                                    className={`px-2 py-1 rounded-full transition-colors ${
                                                        talleresPeriodoMeses === meses
                                                            ? 'bg-[#000B7E] text-white shadow-sm'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {meses === 1 ? '1 mes' : `${meses} meses`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0 p-3 overflow-auto">
                                        {topTalleresActivos.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">
                                                Aún no hay negocios con solicitudes atendidas en los
                                                últimos {talleresPeriodoMeses}{' '}
                                                {talleresPeriodoMeses === 1 ? 'mes' : 'meses'}.
                                            </p>
                                        ) : (
                                            <>
                                                <ul className="space-y-2">
                                                    {topTalleresActivos
                                                        .slice(
                                                            (talleresPage - 1) * talleresPerPage,
                                                            talleresPage * talleresPerPage,
                                                        )
                                                        .map((taller, index) => (
                                                            <li
                                                                key={taller.id}
                                                                className="rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between gap-3"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    {taller.image_perfil ? (
                                                                        <img
                                                                            src={taller.image_perfil}
                                                                            alt={taller.nombre}
                                                                            className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                                                                            {taller.nombre.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-semibold text-gray-800 truncate">
                                                                                {taller.nombre}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right sm:text-right text-[11px] text-gray-500">
                                                                            <p>
                                                                                {taller.solicitudesAtendidas}{' '}
                                                                                solicitudes atendidas
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="ml-2 text-xs font-semibold text-[#000B7E]">
                                                                    #{(talleresPage - 1) * talleresPerPage + index + 1}
                                                                </span>
                                                            </li>
                                                        ))}
                                                </ul>
                                                <div className="mt-3 border-t border-gray-200 pt-2">
                                                    <Pagination
                                                        currentPage={talleresPage}
                                                        totalRows={topTalleresActivos.length}
                                                        rowsPerPage={talleresPerPage}
                                                        onChange={setTalleresPage}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                Usuarios más activos
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Ranking según solicitudes creadas
                                            </p>
                                        </div>
                                        <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
                                            {periodosMeses.map((meses) => (
                                                <button
                                                    key={`usuarios-${meses}`}
                                                    type="button"
                                                    onClick={() =>
                                                        setUsuariosPeriodoMeses(meses)
                                                    }
                                                    className={`px-2 py-1 rounded-full transition-colors ${
                                                        usuariosPeriodoMeses === meses
                                                            ? 'bg-[#000B7E] text-white shadow-sm'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {meses === 1 ? '1 mes' : `${meses} meses`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0 p-3 overflow-auto">
                                        {usuariosMasActivos.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">
                                                Aún no hay solicitudes registradas por usuarios en los
                                                últimos {usuariosPeriodoMeses}{' '}
                                                {usuariosPeriodoMeses === 1 ? 'mes' : 'meses'}.
                                            </p>
                                        ) : (
                                            <>
                                                <ul className="space-y-2">
                                                    {usuariosMasActivos
                                                        .slice(
                                                            (usuariosPage - 1) * usuariosPerPage,
                                                            usuariosPage * usuariosPerPage,
                                                        )
                                                        .map((usuario, index) => (
                                                            <li
                                                                key={usuario.id}
                                                                className="rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between gap-3"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    {usuario.image_perfil ? (
                                                                        <img
                                                                            src={usuario.image_perfil}
                                                                            alt={usuario.nombre}
                                                                            className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                                                                            {usuario.nombre.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-semibold text-gray-800 truncate">
                                                                            {usuario.nombre}
                                                                        </p>
                                                                        <p className="text-[11px] text-gray-500">
                                                                            {usuario.acciones} solicitudes creadas
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs font-semibold text-[#000B7E]">
                                                                    #{(usuariosPage - 1) * usuariosPerPage + index + 1}
                                                                </span>
                                                            </li>
                                                        ))}
                                                </ul>
                                                <div className="mt-3 border-t border-gray-200 pt-2">
                                                    <Pagination
                                                        currentPage={usuariosPage}
                                                        totalRows={usuariosMasActivos.length}
                                                        rowsPerPage={usuariosPerPage}
                                                        onChange={setUsuariosPage}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

export default SalesDashboard
