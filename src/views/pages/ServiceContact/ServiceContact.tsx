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
            header: 'Taller',
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
            const r = row.original
            const nombre = (r.nombre_servicio ?? '').toLowerCase()
            const taller = (r.taller ?? '').toLowerCase()
            const precio = String(r.precio ?? '')
            return nombre.includes(term) || taller.includes(term) || precio.includes(term)
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
        const formattedData = dataServicesContact
            .filter((service) => {
                const creationDate = service.fecha_creacion?.toDate();
                console.log("Creation date aquí", creationDate);
                return creationDate && creationDate >= adjustedStartDate && creationDate <= adjustedEndDate;
            })
            .map((service) => ({
                'Nombre del Servicio': service.nombre_servicio || 'N/A',
                Taller: service.taller || 'N/A',
                Precio: service.precio || 'N/A',
                'Fecha de Creación': service.fecha_creacion
                    ? service.fecha_creacion.toDate().toLocaleString()
                    : 'N/A',
                'Nombre del Usuario': service.usuario?.nombre || 'N/A',
                'Correo del Usuario': service.usuario?.email || 'N/A',
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
                            Servicios Solicitados
                        </span>
                        <button
                            className="p-2  bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                            onClick={handleRefresh}
                        >
                            <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                        </button>
                    </h1>
                    <div className="flex justify-end items-center gap-4 flex-nowrap">
                        <div className="relative w-80 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Buscar por servicio, taller o precio..."
                                className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                        <button
                            style={{ backgroundColor: '#000B7E' }}
                            className="p-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 active:bg-blue-700 transition duration-200 hover:opacity-80 flex-shrink-0"
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

export default Services
