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
import { exportStyledExcel } from '@/utils/excelExport'
import { FaRegStar, FaStar } from 'react-icons/fa'

type Calificacion = {
    nombre_taller?: string
    nombre_servicio?: string
    comentario?: string
    puntuacion?: number
    fecha_creacion?: Timestamp
    usuario?: {
        email?: string
        uid?: string
        nombre?: string
    }
    id?: string
}

function formatFechaCalificacion(ts: Timestamp | Date | undefined): string {
    if (!ts) return ''
    try {
        if (typeof (ts as Timestamp).toDate === 'function') {
            return (ts as Timestamp).toDate().toLocaleString('es-ES')
        }
        if (ts instanceof Date) return ts.toLocaleString('es-ES')
    } catch {
        /* ignorar */
    }
    return ''
}

function calificacionSearchableText(r: Calificacion): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(r.nombre_taller, r.nombre_servicio, r.comentario, r.id)
    if (r.puntuacion !== undefined && r.puntuacion !== null) {
        parts.push(String(r.puntuacion))
    }
    parts.push(formatFechaCalificacion(r.fecha_creacion))
    const u = r.usuario
    if (u) {
        push(u.nombre, u.email, u.uid)
    }
    return parts.join(' ').toLowerCase()
}

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
    const [searchTerm, setSearchTerm] = useState('')
    const [starFilter, setStarFilter] = useState<number | null>(null) // null = Todas, 1-5 = esa cantidad de estrellas
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
        setSearchTerm(event.target.value)
    }

    const handleStarFilterClick = (stars: number | null) => {
        setStarFilter((prev) => (prev === stars ? null : stars))
    }

    useEffect(() => {
        setFiltering(
            starFilter !== null && starFilter >= 1 && starFilter <= 5
                ? [{ id: 'puntuacion', value: starFilter }]
                : []
        )
    }, [starFilter])

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
            header: 'Negocio',
            accessorKey: 'nombre_taller',
        },
        {
            header: 'Servicio',
            accessorKey: 'nombre_servicio',
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
            accessorKey: 'puntuacion',
            filterFn: (row, columnId, filterValue) => {
                if (filterValue == null || filterValue === '') return true
                const val = row.getValue(columnId) as number | undefined
                const num = typeof val === 'number' ? val : Number(val)
                return num === Number(filterValue)
            },
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
    ];
    
    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const table = useReactTable({
        data: dataPuntuacion,
        columns,
        state: {
            sorting,
            columnFilters: filtering,
            globalFilter: searchTerm,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        onGlobalFilterChange: (updater) => {
            const next = typeof updater === 'function' ? updater(searchTerm) : updater
            setSearchTerm(next ?? '')
        },
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            return calificacionSearchableText(row.original).includes(term)
        },
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

    const handleExportToExcel = async () => {
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
                nombreNegocio: puntuacion.nombre_taller || 'N/A',
                puntuacion: String(puntuacion.puntuacion ?? 'N/A'),
                fechaCreacion: puntuacion.fecha_creacion
                    ? puntuacion.fecha_creacion.toDate().toLocaleString()
                    : 'N/A',
                nombreUsuario: puntuacion.usuario?.nombre || 'N/A',
                correoUsuario: puntuacion.usuario?.email || 'N/A',
            }));
    
        if (formattedData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles en el rango de fechas seleccionado.
                </Notification>,
            );
            return;
        }
    
        await exportStyledExcel({
            rows: formattedData,
            columns: [
                { header: 'Nombre del negocio', key: 'nombreNegocio' },
                { header: 'Puntuación', key: 'puntuacion' },
                { header: 'Fecha de Creación', key: 'fechaCreacion' },
                { header: 'Nombre del Usuario', key: 'nombreUsuario' },
                {
                    header: 'Correo del Usuario',
                    key: 'correoUsuario',
                    linkType: 'email',
                },
            ],
            sheetName: 'Servicios',
            fileName: 'ServiciosSolicitados.xlsx',
        });
    
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
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-[#000B7E]">
                            Puntuación de negocios
                        </h1>
                        <button
                            type="button"
                            title="Actualizar datos desde el servidor"
                            aria-label="Actualizar datos desde el servidor"
                            onClick={handleRefresh}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#000B7E] shadow-sm transition hover:border-[#000B7E]/35 hover:bg-[#000B7E]/5 active:scale-[0.98]"
                        >
                            <HiOutlineRefresh className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                                Estrellas:
                            </span>
                            <button
                                type="button"
                                onClick={() => handleStarFilterClick(null)}
                                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                                    starFilter === null
                                        ? 'bg-blue-100 text-blue-800 shadow-sm ring-1 ring-blue-400'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Todas
                            </button>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleStarFilterClick(num)}
                                    className={`flex items-center gap-0.5 rounded-lg p-1.5 transition-all hover:scale-105 ${
                                        starFilter === num
                                            ? 'bg-amber-100 ring-1 ring-amber-400'
                                            : 'hover:bg-amber-50'
                                    }`}
                                    title={`${num} estrella${num > 1 ? 's' : ''}`}
                                >
                                    {Array.from({ length: num }, (_, i) =>
                                        starFilter === num ? (
                                            <FaStar
                                                key={i}
                                                className="h-4 w-4 text-amber-500"
                                            />
                                        ) : (
                                            <FaRegStar
                                                key={i}
                                                className="h-4 w-4 text-gray-400"
                                            />
                                        )
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="w-full min-w-[12rem] max-w-sm shrink-0 sm:w-80">
                            <span className="mb-1 block text-xs font-medium text-gray-600">
                                Buscar en la tabla
                            </span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Negocio, servicio, usuario, correo, puntuación, comentario, id…"
                                    className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>
                        <button
                            type="button"
                            style={{ backgroundColor: '#10B981' }}
                            className="h-10 min-w-[120px] shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90"
                            onClick={handleOpenDialog}
                        >
                            Exportar a Excel
                        </button>
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
                        onRowsPerPageChange={onRowsPerPageChange}
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
                        style={{ backgroundColor: '#10B981' }}
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
