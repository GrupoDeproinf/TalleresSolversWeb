import { useEffect, useState } from 'react'
import { collection, getDocs, Timestamp, } from 'firebase/firestore'
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

    // Procesar usuarios y talleres
    usersSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.typeUser === 'Cliente') {
            clientesCount++
        }
        if (data.typeUser === 'Taller') {
            tallerCount++
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

    // console.log('Datos de servicios antes de renderizar:', dataPuntuacion) // Verifica el estado de los datos

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    // Suponiendo que tienes un array de datos
    const data = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const {
        clientesCount,
        tallerCount,
        talleresStats,
        subscripcionesCount,
        totalMonto,
    } = dashboardData

    // Resumen crítico del día (pagos y vencimientos se pueden conectar a BD después)
    const [pagosPendientesValidar, setPagosPendientesValidar] = useState(3)
    const [talleresVencidosHoy, setTalleresVencidosHoy] = useState(8)
    const talleresNuevosEnEspera = talleresStats.espera

    // Datos para el gráfico
    const chartData = {
        labels: ['Aprobados', 'Rechazados', 'En espera por aprobación'],
        data: [talleresStats.aprobados, talleresStats.rechazados, talleresStats.espera],
        colors: ['#15803D', '#C22F1C', '#2196F3'],
    }

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
                                    {talleresStats.aprobados + talleresStats.rechazados + talleresStats.espera}
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
                                            <Th key={header.id} colSpan={header.colSpan} className="!bg-gray-100 !text-gray-700 !text-xs">
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        {...{
                                                            className: header.column.getCanSort()
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
                                        <Tr key={row.id} className={rowIndex % 2 === 1 ? 'bg-gray-50' : ''}>
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
        </div>
    )
}

export default SalesDashboard
