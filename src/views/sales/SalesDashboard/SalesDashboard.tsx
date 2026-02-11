import { useEffect, useState } from 'react'
import { collection, getDocs, Timestamp, } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Card from '@/components/ui/Card'
import SalesByCategories from './components/SalesByCategories'
import SalesDashboardHeader from './components/SalesDashboardHeader'
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
import Table from '@/components/ui/Table'

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
            } catch (error) {
                console.error(
                    'Error al obtener los datos del dashboard:',
                    error,
                )
            }
        }

        fetchData()
    }, [])

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
    const [rowsPerPage, setRowsPerPage] = useState(10)

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

    // Datos para el gráfico
    const chartData = {
        labels: ['Aprobados', 'Rechazados', 'En espera por aprobación'],
        data: [talleresStats.aprobados, talleresStats.rechazados, talleresStats.espera],
        colors: ['#15803D', '#C22F1C', '#2196F3'],
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Card 1 */}
                <a href={`${APP_PREFIX_PATH}/users`} className="hover:shadow-lg ease-in-out p-4">
                    <Card className='bg-gray-50 shadow'>
                        <h5 className="text-gray-500 text-base font-semibold">
                            Clientes
                        </h5>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-4xl font-bold text-gray-900">
                                {clientesCount}
                            </p>
                        </div>
                        <p className="text-base text-gray-500 mt-2">
                            Total de clientes
                        </p>
                    </Card>
                </a>

                {/* Card 2 */}
                <a href={`${APP_PREFIX_PATH}/garages`} className="hover:shadow-lg ease-in-out p-4">
                    <Card className='bg-gray-50 shadow'>
                        <h5 className="text-gray-500 text-base font-semibold">
                            Talleres
                        </h5>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-4xl font-bold text-gray-900">
                                {talleresStats.aprobados + talleresStats.rechazados + talleresStats.espera}
                            </p>
                            <span className="text-base font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                                {talleresStats.espera} en espera
                            </span>
                        </div>
                        <p className="text-base text-gray-500 mt-2">
                            Total Talleres
                        </p>
                    </Card>
                </a>

                {/* Card 3 */}
                <a href={`${APP_PREFIX_PATH}/subscriptions`} className="hover:shadow-lg ease-in-out p-4">
                    <Card className='bg-gray-50 shadow'>
                        <h5 className="text-gray-500 text-base font-semibold">
                            Subscripciones
                        </h5>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-4xl font-bold text-gray-900">
                                {subscripcionesCount}
                            </p>
                            <span className="text-base font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                ${totalMonto.toFixed(2)} Total
                            </span>
                        </div>
                        <p className="text-base text-gray-500 mt-2">
                            Subscripciones y monto total
                        </p>
                    </Card>
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                {/* Nuevo gráfico de área */}
                <SplineArea />

                {/* Gráfico de pastel */}
                <SalesByCategories data={chartData} /> 
            </div>
            <div className="p-1 rounded-lg shadow">
                <h2 className="mb-4">Calificaciones de los Servicios</h2>
                    <Table className="w-full rounded-lg">
                        <THead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <Th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        {...{
                                                            className:
                                                                header.column.getCanSort()
                                                                    ? 'cursor-pointer select-none'
                                                                    : '',
                                                            onClick:
                                                                header.column.getToggleSortingHandler(),
                                                        }}
                                                    >
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}
                                                        
                                                    </div>
                                                )}
                                            </Th>
                                        )
                                    })}
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
                                .map((row) => {
                                    return (
                                        <Tr key={row.id}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    return (
                                                        <Td key={cell.id}>
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </Td>
                                                    )
                                                })}
                                        </Tr>
                                    )
                                })}
                        </TBody>
                    </Table>
                    <Pagination
                        onChange={onPaginationChange}
                        currentPage={currentPage}
                        totalRows={totalRows}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={onRowsPerPageChange}
                    />
                </div>
        </div>
    )
}

export default SalesDashboard
