import { useEffect, useState } from 'react'
import { collection, getDocs, Timestamp } from 'firebase/firestore'
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
    ColumnFiltersState,
    ColumnSort,
} from '@tanstack/react-table'
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa'
import { HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineCreditCard, HiChevronRight } from 'react-icons/hi'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'

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

type ServicioConCalificaciones = {
    nombre_servicio: string;
    uid_servicio: string; // ID del servicio
    calificaciones: Calificacion[]; // Subcolección de calificaciones
    taller: string,
};

type TallerActivo = {
    id: string;
    nombre: string;
    image_perfil?: string;
    serviciosActivos: number;
    nombrePlan?: string;
    diasRestantes: number;
};

const isSameDay = (dateA: Date, dateB: Date) => {
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    )
}

const fetchDashboardData = async () => {
    const usersSnapshot = await getDocs(collection(db, 'Usuarios'))
    const subsSnapshot = await getDocs(collection(db, 'Subscripciones'))

    let clientesCount = 0
    let tallerCount = 0
    let talleresStats = {
        aprobados: 0,
        rechazados: 0,
        espera: 0,
    }
    let subscripcionesCount = 0
    let totalMonto = 0
    const usuariosPorEstado: Record<string, number> = {}
    const talleresPorEstado: Record<string, number> = {}
    let talleresVencidosHoy = 0

    const hoy = new Date()

    // Procesar usuarios y talleres
    usersSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.typeUser === 'Cliente') {
            clientesCount++
            if (data.estado) {
                usuariosPorEstado[data.estado] =
                    (usuariosPorEstado[data.estado] || 0) + 1
            }
        }
        if (data.typeUser === 'Taller') {
            tallerCount++
            if (data.estado) {
                talleresPorEstado[data.estado] =
                    (talleresPorEstado[data.estado] || 0) + 1
            }
            const subscripcionActual = data.subscripcion_actual

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
            switch (data.status) {
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

    // Procesar subscripciones
    subsSnapshot.forEach((doc) => {
        const data = doc.data()
        totalMonto += data.monto || 0
    })
    subscripcionesCount = subsSnapshot.size

    return {
        clientesCount,
        tallerCount,
        talleresStats,
        subscripcionesCount,
        totalMonto,
        usuariosPorEstado,
        talleresPorEstado,
        talleresVencidosHoy,
    }
}

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
        usuariosPorEstado: {} as Record<string, number>,
        talleresPorEstado: {} as Record<string, number>,
        talleresVencidosHoy: 0,
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
    }, [])

    useEffect(() => {
        if (isDashboardDataReady) {
            setIsResumenCriticoPopupOpen(true)
        }
    }, [isDashboardDataReady])

    const [dataPuntuacion, setDataPuntuacion] = useState<
        { nombre_servicio: string; taller: string; promedio_puntuacion: number }[]
    >([]);

    const getAllData = async () => {
        try {
            const serviciosSnapshot = await getDocs(collection(db, 'Servicios'));
            const serviciosConCalificaciones: ServicioConCalificaciones[] = [];

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

                    serviciosConCalificaciones.push({
                        nombre_servicio: servicioData.nombre_servicio,
                        taller: servicioData.taller || 'Sin taller',
                        uid_servicio,
                        calificaciones,
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
                        promedio_puntuacion: promedioPuntuacion,
                    };
                })
                .filter((servicio) => servicio.promedio_puntuacion > 0); // Excluye servicios con promedio 0

            setDataPuntuacion(dataPuntuacion);
        } catch (error) {
            console.error('Error obteniendo los datos:', error);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);

    const [topTalleresActivos, setTopTalleresActivos] = useState<TallerActivo[]>([])

    const fetchTopTalleresActivos = async () => {
        try {
            const usuariosSnapshot = await getDocs(collection(db, 'Usuarios'))
            const serviciosSnapshot = await getDocs(collection(db, 'Servicios'))

            const serviciosPorTaller: Record<string, number> = {}

            serviciosSnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.estatus === true && data.uid_taller) {
                    const uidTaller = data.uid_taller as string
                    serviciosPorTaller[uidTaller] =
                        (serviciosPorTaller[uidTaller] || 0) + 1
                }
            })

            const talleresActivos: TallerActivo[] = []

            usuariosSnapshot.forEach((doc) => {
                const data = doc.data()

                if (data.typeUser !== 'Taller') return
                if (data.status !== 'Aprobado') return

                const subscripcionActual = data.subscripcion_actual
                const subsStatus = subscripcionActual?.status

                if (subsStatus !== 'Aprobado') return

                const uidTaller = doc.id
                const cantidadServiciosActivos = serviciosPorTaller[uidTaller] || 0

                if (cantidadServiciosActivos <= 0) return

                const nombreTaller =
                    (data.nombre_taller as string) ||
                    (data.nombre as string) ||
                    'Sin nombre'

                const imagePerfil = data.image_perfil as string | undefined
                const nombrePlan = subscripcionActual?.nombre as string | undefined

                let diasRestantes = 0
                const fechaFin = subscripcionActual?.fecha_fin
                if (fechaFin && typeof fechaFin.toDate === 'function') {
                    const fin = (fechaFin as Timestamp).toDate()
                    const hoy = new Date()
                    const diffMs = fin.getTime() - hoy.getTime()
                    diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
                }

                talleresActivos.push({
                    id: uidTaller,
                    nombre: nombreTaller,
                    image_perfil: imagePerfil,
                    serviciosActivos: cantidadServiciosActivos,
                    nombrePlan,
                    diasRestantes,
                })
            })

            const talleresOrdenados = [...talleresActivos].sort(
                (a, b) => b.serviciosActivos - a.serviciosActivos,
            )

            setTopTalleresActivos(talleresOrdenados)
        } catch (error) {
            console.error('Error al obtener talleres más activos:', error)
        }
    }

    useEffect(() => {
        fetchTopTalleresActivos()
    }, [])

    const [talleresPage, setTalleresPage] = useState(1)
    const talleresPerPage = 4

const columns: ColumnDef<{ nombre_servicio: string; taller: string; promedio_puntuacion: number }>[] = [
    {
        header: 'Taller',
        accessorKey: 'taller',
    },
    {
        header: 'Servicio',
        accessorKey: 'nombre_servicio',
    },
    {
        header: 'Promedio de Calificación',
        cell: ({ row }) => {
            const puntuacion = row.original.promedio_puntuacion || 0;
            const maxPuntuacion = 5;
            const estrellas = Array.from({ length: maxPuntuacion }, (_, index) => {
                // Calcular la fracción de la estrella
                const valorEstrella = index + 1;
                if (valorEstrella <= puntuacion) {
                    return <FaStar key={index} color="gold" style={{ marginRight: '2px' }} />;
                } else if (valorEstrella - 0.5 <= puntuacion) {
                    return <FaStarHalfAlt key={index} color="gold" style={{ marginRight: '2px' }} />;
                } else {
                    return <FaRegStar key={index} color="gray" style={{ marginRight: '2px' }} />;
                }
            });

            return (
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <div style={{ display: 'flex' }}>{estrellas}</div>
                    <span style={{ marginLeft: '8px' }}>{puntuacion.toFixed(1)}</span> {/* Mostrar el valor numérico */}
                </div>
            );
        },
    }
];

    const { Tr, Th, Td, THead, TBody, Sorter } = Table
    const { TabNav, TabList, TabContent } = Tabs
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const table = useReactTable({
        data: dataPuntuacion,
        columns,
        state: {
            sorting,
            columnFilters: filtering, // Usar el array de filtros
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    const data = table.getRowModel().rows
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    const {
        clientesCount,
        tallerCount,
        talleresStats,
        subscripcionesCount,
        totalMonto,
        usuariosPorEstado,
        talleresPorEstado,
        talleresVencidosHoy,
    } = dashboardData

    // Resumen crítico del día (pagos y vencimientos se pueden conectar a BD después)
    const [pagosPendientesValidar, setPagosPendientesValidar] = useState(3)
    const talleresNuevosEnEspera = talleresStats.espera

    // Datos para el gráfico
    const chartData = {
        labels: ['Aprobados', 'Rechazados', 'En espera por aprobación'],
        data: [talleresStats.aprobados, talleresStats.rechazados, talleresStats.espera],
        colors: ['#15803D', '#C22F1C', '#2196F3'],
    }

    const totalTalleres =
        talleresStats.aprobados + talleresStats.rechazados + talleresStats.espera

    const porcentajeAprobados =
        totalTalleres > 0 ? (talleresStats.aprobados / totalTalleres) * 100 : 0
    const porcentajeRechazados =
        totalTalleres > 0 ? (talleresStats.rechazados / totalTalleres) * 100 : 0
    const porcentajeEspera =
        totalTalleres > 0 ? (talleresStats.espera / totalTalleres) * 100 : 0

    const arpu =
        subscripcionesCount > 0 ? totalMonto / subscripcionesCount : 0

    const [vistaEstados, setVistaEstados] = useState<'usuarios' | 'talleres'>(
        'usuarios',
    )

    const estadosUsuarios = Object.keys(usuariosPorEstado || {})
    const estadosTalleres = Object.keys(talleresPorEstado || {})

    const estadosLabels =
        vistaEstados === 'usuarios' ? estadosUsuarios : estadosTalleres

    const estadosData =
        vistaEstados === 'usuarios'
            ? estadosLabels.map((estado) => usuariosPorEstado[estado] || 0)
            : estadosLabels.map((estado) => talleresPorEstado[estado] || 0)

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

    const chartEstados = {
        labels: estadosLabels,
        data: estadosData,
        colors: estadosLabels.map(
            (_, index) =>
                ESTADOS_COLOR_PALETTE[index % ESTADOS_COLOR_PALETTE.length],
        ),
    }

    const usuariosMasActivos: { nombre: string; acciones: number }[] = []

    const topServicios = [...dataPuntuacion]
        .sort(
            (a, b) =>
                (b.promedio_puntuacion ?? 0) -
                (a.promedio_puntuacion ?? 0),
        )
        .slice(0, 5)

    const resumenDiaItems = [
        {
            concepto: 'Talleres en espera de revisión',
            valor: talleresNuevosEnEspera,
            Icono: HiOutlineOfficeBuilding,
            colorBadge: 'bg-blue-100 text-blue-700',
            emptyMessage: 'Sin talleres en espera hoy',
            activeMessage: 'Talleres por revisar hoy',
        },
        {
            concepto: 'Pagos pendientes por validar',
            valor: pagosPendientesValidar,
            Icono: HiOutlineCreditCard,
            colorBadge: 'bg-amber-100 text-amber-700',
            emptyMessage: 'Sin pagos pendientes hoy',
            activeMessage: 'Validaciones por atender hoy',
        },
        {
            concepto: 'Talleres que vencieron hoy',
            valor: talleresVencidosHoy,
            Icono: HiOutlineUserGroup,
            colorBadge: 'bg-rose-100 text-rose-700',
            emptyMessage: 'Sin talleres vencidos hoy',
            activeMessage: 'Talleres por gestionar hoy',
        },
    ]

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-gray-100 min-h-0">
            <Dialog
                isOpen={isResumenCriticoPopupOpen}
                onClose={() => setIsResumenCriticoPopupOpen(false)}
                onRequestClose={() => setIsResumenCriticoPopupOpen(false)}
                width={560}
            >
                <h4 className="mb-2 text-[#000B7E] font-bold">
                    Buen dia, hoy tienes:
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        <span className="font-semibold text-gray-900">
                            {talleresNuevosEnEspera}
                        </span>{' '}
                        talleres nuevos registrados (esperando revision).
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900">
                            {pagosPendientesValidar}
                        </span>{' '}
                        pagos pendientes por validar.
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900">
                            {talleresVencidosHoy}
                        </span>{' '}
                        talleres que vencieron hoy.
                    </p>
                </div>
                <div className="mt-5 flex justify-end">
                    <Button
                        variant="solid"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setIsResumenCriticoPopupOpen(false)}
                    >
                        Entendido
                    </Button>
                </div>
            </Dialog>

            <div className="flex-1 min-h-0 mt-3">
                <Tabs
                    defaultValue="operativo"
                    className="flex flex-col flex-1 min-h-0"
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
                    <div className="flex-1 min-h-0">
                        <TabContent value="operativo">
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
                                                        Talleres
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

                            {/* Fila 3: Gráfico de pastel + Tabla de calificaciones */}
                            <section className="flex-1 min-h-0 grid grid-cols-[30%_70%] gap-3">
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0 p-3">
                                    <div className="w-full h-full">
                                        <SalesByCategories data={chartData} />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
                                    <div className="bg-[#000B7E] px-4 py-2 flex-none">
                                        <h2 className="text-sm font-semibold text-white">
                                            Calificaciones de los servicios
                                        </h2>
                                        <p className="text-xs text-white/90 mt-0.5">
                                            Promedio por taller y servicio
                                        </p>
                                    </div>
                                    <div className="flex-1 min-h-0 overflow-auto">
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

                        <TabContent value="estadistico">
                            <section className="grid grid-cols-3 gap-3 mb-3">
                                <div className="col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                Usuarios y talleres por estado
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Cambia la vista para analizar la concentración por región
                                            </p>
                                        </div>
                                        <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
                                            <button
                                                type="button"
                                                onClick={() => setVistaEstados('usuarios')}
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
                                                onClick={() => setVistaEstados('talleres')}
                                                className={`px-3 py-1 rounded-full transition-colors ${
                                                    vistaEstados === 'talleres'
                                                        ? 'bg-[#000B7E] text-white shadow-sm'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                Talleres
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0 p-4">
                                        {chartEstados.labels.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">
                                                Aún no hay datos de estados disponibles.
                                            </p>
                                        ) : (
                                            <SalesByCategories data={chartEstados} />
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
                                                —%
                                            </p>
                                            <span className="text-xs text-white/80">
                                                de solicitudes atendidas
                                            </span>
                                        </div>
                                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                                            <div className="h-full w-1/3 rounded-full bg-emerald-300/90" />
                                        </div>
                                        <p className="mt-2 text-[11px] text-white/80">
                                            Este valor se calculará automáticamente al conectar los datos
                                            de solicitudes y respuestas de cada taller.
                                        </p>
                                    </div>
                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                                            Tiempo promedio de respuesta
                                        </p>
                                        <div className="mt-2 flex items-end gap-3">
                                            <p className="text-3xl font-bold tabular-nums">
                                                — min
                                            </p>
                                            <span className="text-xs text-white/80">
                                                desde que el cliente envía la solicitud
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] text-white/80">
                                            Una vez disponible la fuente de datos, aquí verás el tiempo
                                            medio de respuesta consolidado por taller.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Talleres más activos
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Ranking según cantidad de servicios activos
                                        </p>
                                    </div>
                                    <div className="flex-1 min-h-0 p-3 overflow-auto">
                                        {topTalleresActivos.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">
                                                No hay talleres activos con servicios publicados que cumplan los filtros.
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
                                                                            {taller.nombrePlan && (
                                                                                <p className="text-[11px] text-gray-600 truncate">
                                                                                    Plan: {taller.nombrePlan}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right sm:text-right text-[11px] text-gray-500">
                                                                            <p>
                                                                                {taller.serviciosActivos} servicios activos
                                                                            </p>
                                                                            <p>
                                                                                {taller.diasRestantes === 0
                                                                                    ? 'Vence hoy'
                                                                                    : `${taller.diasRestantes} día${taller.diasRestantes !== 1 ? 's' : ''} restante${taller.diasRestantes !== 1 ? 's' : ''}`}
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
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Usuarios más activos
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Ranking según interacciones (pendiente de integrar)
                                        </p>
                                    </div>
                                    <div className="flex-1 min-h-0 p-3 overflow-auto">
                                        {usuariosMasActivos.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">
                                                Cuando se conecte la fuente de datos de interacción,
                                                aquí verás el ranking de usuarios más activos.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {usuariosMasActivos.map((usuario, index) => (
                                                    <li
                                                        key={`${usuario.nombre}-${index}`}
                                                        className="rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-800">
                                                                {usuario.nombre}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500">
                                                                {usuario.acciones} acciones
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-semibold text-[#000B7E]">
                                                            #{index + 1}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
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
