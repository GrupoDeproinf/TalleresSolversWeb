import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
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
import {
    collection,
    getDocs,
    query,
    Timestamp,
    doc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import * as XLSX from 'xlsx'
import { FaRegStar, FaStar } from 'react-icons/fa'

type Calificacion = {
    nombre_taller?: string;
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
};

const Puntuacion = () => {
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedPuntuacion, setSelectedPuntuacion] =
        useState<Calificacion | null>(null)
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre_taller')
    const [searchTerm, setSearchTerm] = useState('')
    const [dataPuntuacion, setDataPuntuacion] = useState<
    Calificacion[]
    >([])
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const getAllData = async () => {
        try {
            // Obtén todos los servicios
            const serviciosSnapshot = await getDocs(collection(db, 'Servicios'));
            const serviciosConCalificaciones: ServicioConCalificaciones[] = [];
    
            // Itera por cada servicio y carga las calificaciones
            await Promise.all(
                serviciosSnapshot.docs.map(async (doc) => {
                    const servicioData = doc.data();
                    const uid_servicio = doc.id;
    
                    // Obtén la subcolección 'calificaciones' para cada servicio
                    const calificacionesSnapshot = await getDocs(
                        collection(db, 'Servicios', uid_servicio, 'calificaciones')
                    );
    
                    const calificaciones: Calificacion[] = calificacionesSnapshot.docs.map((calDoc) => ({
                        ...calDoc.data(),
                        id: calDoc.id,
                    })) as Calificacion[];

                    serviciosConCalificaciones.push({
                        nombre_servicio: servicioData.nombre_servicio,
                        uid_servicio,
                        calificaciones,
                    });
                })
            );
    
            // Aplana las calificaciones para mostrarlas en la tabla
            const dataPuntuacion = serviciosConCalificaciones.flatMap((servicio) =>
                servicio.calificaciones.map((calificacion) => ({
                    ...calificacion,
                    nombre_servicio: servicio.nombre_servicio, // Incluye el nombre del servicio en cada calificación
                }))
            );
    
            setDataPuntuacion(dataPuntuacion);
        } catch (error) {
            console.error('Error obteniendo los datos:', error);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);
    
    

    const handleRefresh = async () => {
        await getAllData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }
        
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)

        // Aplica el filtro dinámico según la columna seleccionada
        const newFilters = [
            {
                id: selectedColumn, // Usar la columna seleccionada
                value,
            },
        ]
        setFiltering(newFilters)
    }

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value
        setSelectedColumn(value)

        // Aplicar filtro vacío cuando se cambia la columna
        if (searchTerm !== '') {
            const newFilters = [
                {
                    id: value, // La columna seleccionada
                    value: searchTerm, // Filtrar por el término de búsqueda actual
                },
            ]
            setFiltering(newFilters)
        }
    }

    const [dialogIsOpen, setIsOpen] = useState(false)
    
    const handleOpenDialog = () => {
        setIsOpen(true)
    }

    const handleCloseDialog = () => {
        setIsOpen(false)
        setStartDate('')
        setEndDate('')
    }


    const columns: ColumnDef<Calificacion>[] = [
        {
            header: 'Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Taller',
            accessorKey: 'nombre_taller',
        },
        {
            header: 'Nombre del Usuario',
            accessorKey: 'usuario.nombre',
        },
        {
            header: 'Correo del Usuario',
            accessorKey: 'usuario.email',
        },
        {
            header: 'Puntuación',
            cell: ({ row }) => {
                const puntuacion = row.original.puntuacion || 0;
                const maxPuntuacion = 5;
    
                const estrellas = Array.from({ length: maxPuntuacion }, (_, index) =>
                    index < puntuacion ? (
                        <FaStar key={index} color="gold" />
                    ) : (
                        <FaRegStar key={index} color="gray" />
                    )
                );
    
                return <div style={{ display: 'flex', gap: '2px' }}>{estrellas}</div>;
            },
        },
        {
            header: 'Comentario',
            accessorKey: 'comentario',
        },
        {
            header: 'Fecha de Creación',
            cell: ({ row }) => {
                const fechaCreacion = row.original.fecha_creacion;
                if (fechaCreacion) {
                    if (fechaCreacion.toDate) {
                        return fechaCreacion.toDate().toLocaleString();
                    }
                    if (fechaCreacion instanceof Date) {
                        return fechaCreacion.toLocaleString();
                    }
                }
                return 'Sin fecha';
            },
        },
    ];
    
    const { Tr, Th, Td, THead, TBody, Sorter } = Table

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
    const rowsPerPage = 6 // Puedes cambiar esto si deseas un número diferente

    // Suponiendo que tienes un array de datos
    const data = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        console.log('onPaginationChange', page)
        setCurrentPage(page) // Actualiza la página actual
    }

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleExportToExcel = () => {
        if (!startDate || !endDate) {
            toast.push(
                <Notification title="Fechas incompletas">
                    Por favor, selecciona ambas fechas para continuar.
                </Notification>,
            );
            return;
        }
    
        // Ajustar fecha de inicio y fin al inicio y fin del día en UTC
        const adjustedStartDate = new Date(startDate);
        adjustedStartDate.setUTCHours(0, 0, 0, 0); // Ajustar al inicio del día UTC
    
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setUTCHours(23, 59, 59, 999); // Ajustar al final del día UTC
    
        console.log({
            startDate: adjustedStartDate,
            endDate: adjustedEndDate,
        });
    
        // Filtrar los datos
        const formattedData = dataPuntuacion
            .filter((puntuacion) => {
                const creationDate = puntuacion.fecha_creacion?.toDate();
                console.log("Creation date aquí", creationDate);
                return creationDate && creationDate >= adjustedStartDate && creationDate <= adjustedEndDate;
            })
            .map((puntuacion) => ({
                'Nombre del taller': puntuacion.nombre_taller || 'N/A',
                'Puntuación': puntuacion.puntuacion || 'N/A',
                'Fecha de Creación': puntuacion.fecha_creacion
                    ? puntuacion.fecha_creacion.toDate().toLocaleString()
                    : 'N/A',
                'Nombre del Usuario': puntuacion.usuario?.nombre || 'N/A',
                'Correo del Usuario': puntuacion.usuario?.email || 'N/A',
            }));
    
        if (formattedData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles en el rango de fechas seleccionado.
                </Notification>,
            );
            return;
        }
    
        // Exportar a Excel
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Servicios');
        XLSX.writeFile(workbook, 'ServiciosSolicitados.xlsx');
    
        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        );
    
        handleCloseDialog();
        console.log('Start date aquí: ', adjustedStartDate, 'End date aquí', adjustedEndDate);
    };
    
    
    
    
    
    return (
        <>
            <div>
                <div className="grid grid-cols-2">
                    <h1 className="mb-6 flex justify-start items-center space-x-4">
                        {' '}
                        <span className="text-[#000B7E]">
                            Puntuación de talleres
                        </span>
                        <button
                            className="p-2  bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                            onClick={handleRefresh}
                        >
                            <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                        </button>
                    </h1>
                    <div className="flex justify-end">
                        <div className="flex items-center">
                            <div className="relative w-32">
                                {' '}
                                <select
                                    className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={handleSelectChange}
                                    value={selectedColumn} // Se mantiene el valor predeterminado
                                >
                                    <option value="nombre_taller">Taller</option>                                  
                                </select>
                            </div>
                            <div className="relative w-80 ml-4">
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <HiOutlineSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                            <button
                            style={{ backgroundColor: '#000B7E' }}
                            className="p-2 ml-4 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 active:bg-blue-700 transition duration-200 hover:opacity-80"
                            onClick={handleOpenDialog}
                        >
                            Exportar a Excel
                        </button>
                        </div>
                    </div>
                </div>
                <div className="p-1 rounded-lg shadow">
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
                    />
                </div>
                <Dialog isOpen={dialogIsOpen} onClose={handleCloseDialog}>
                <div className="p-4">
                    <h3 className="text-lg font-bold">Seleccionar Rango de Fechas</h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm">
                                Fecha de Inicio:
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm">
                                Fecha de Fin:
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button onClick={handleExportToExcel} 
                        className="text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        >
                            Exportar
                        </Button>
                    </div>
                </div>
            </Dialog>
            </div>
        </>
    )
}

export default Puntuacion
