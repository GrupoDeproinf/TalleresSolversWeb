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

type ServicesContact = {
    nombre_servicio?: string
    uid_servicio: string
    taller?: string
    uid_taller?: string
    fecha_creacion?: Timestamp
    precio?: number
    usuario?: {
        email?: string
        id?: string
        nombre?: string
    }
    id?: string
}

function formatFechaCreacionContact(
    ts: Timestamp | Date | undefined,
): string {
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

function serviceContactSearchableText(r: ServicesContact): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        r.nombre_servicio,
        r.taller,
        r.uid_taller,
        r.uid_servicio,
        r.id,
    )
    if (r.precio !== undefined && r.precio !== null) {
        parts.push(String(r.precio))
    }
    parts.push(formatFechaCreacionContact(r.fecha_creacion))
    const u = r.usuario
    if (u) {
        push(u.nombre, u.email, u.id)
    }
    return parts.join(' ').toLowerCase()
}

const Services = () => {
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedServicesContact, setSelectedServicesContact] =
        useState<ServicesContact | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [dataServicesContact, setDataServicesContact] = useState<
        ServicesContact[]
    >([])
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const getAllData = async () => {
        try {
            const servicesQuery = query(collection(db, 'servicesContact'))
            const [servicesSnapshot] = await Promise.all([
                getDocs(servicesQuery),
            ])
            const services: ServicesContact[] = servicesSnapshot.docs.map(
                (doc) => ({
                    ...doc.data(),
                    uid_servicio: doc.id,
                }),
            ) as ServicesContact[]

            setDataServicesContact(services)
        } catch (error) {
            console.error('Error obteniendo los datos:', error)
        }
    }

    useEffect(() => {
        getAllData()
    }, [])

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

    const [dialogIsOpen, setIsOpen] = useState(false)
    
    const handleOpenDialog = () => {
        setIsOpen(true)
    }

    const handleCloseDialog = () => {
        setIsOpen(false)
        setStartDate('')
        setEndDate('')
    }


    const columns: ColumnDef<ServicesContact>[] = [
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Negocio',
            accessorKey: 'taller',
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
        },
        {
            header: 'Fecha de Creación',
            cell: ({ row }) => {
                // Asegúrate de acceder correctamente al valor
                const fechaCreacion = row.original.fecha_creacion;
                const userName = row.original.usuario?.nombre;
                if (fechaCreacion) {
                    // Si es un Timestamp, conviértelo a Date y formatea
                    if (fechaCreacion.toDate) {
                        return fechaCreacion.toDate().toLocaleString(); // Formato de fecha y hora
                    }
                    // Si ya es un Date, formatea directamente
                    if (fechaCreacion instanceof Date) {
                        return fechaCreacion.toLocaleString();
                    }
                }
                return 'Sin fecha'; // Para valores no válidos
            },
        },
        {
            header: 'Nombre del Usuario',
            accessorKey: 'usuario.nombre', // Acceso directo al campo anidado
        },
        {
            header: 'Correo del Usuario',
            accessorKey: 'usuario.email', // Acceso directo al campo anidado
        },
    ];

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const table = useReactTable({
        data: dataServicesContact,
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
            return serviceContactSearchableText(row.original).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // console.log('Datos de servicios antes de renderizar:', dataServicesContact) // Verifica el estado de los datos

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
        const formattedData = dataServicesContact
            .filter((service) => {
                const creationDate = service.fecha_creacion?.toDate();
                console.log("Creation date aquí", creationDate);
                return creationDate && creationDate >= adjustedStartDate && creationDate <= adjustedEndDate;
            })
            .map((service) => ({
                nombreServicio: service.nombre_servicio || 'N/A',
                negocio: service.taller || 'N/A',
                precio: String(service.precio ?? 'N/A'),
                fechaCreacion: service.fecha_creacion
                    ? service.fecha_creacion.toDate().toLocaleString()
                    : 'N/A',
                nombreUsuario: service.usuario?.nombre || 'N/A',
                correoUsuario: service.usuario?.email || 'N/A',
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
                { header: 'Nombre del Servicio', key: 'nombreServicio' },
                { header: 'Negocio', key: 'negocio' },
                { header: 'Precio', key: 'precio' },
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
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-[#000B7E]">
                            Servicios Solicitados
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
                    <div className="flex flex-wrap items-end justify-end gap-3">
                        <div className="w-full min-w-[12rem] max-w-sm shrink-0 sm:w-80">
                            <span className="mb-1 block text-xs font-medium text-gray-600">
                                Buscar en la tabla
                            </span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Servicio, negocio, precio, usuario, correo, ids, fecha…"
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
                            className="h-10 shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90"
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

export default Services
