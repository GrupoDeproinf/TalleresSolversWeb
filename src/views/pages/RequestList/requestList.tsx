import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlineRefresh, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi'
import {
    FaCheckCircle,
    FaTimesCircle,
    FaCamera,
} from 'react-icons/fa'
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
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import * as XLSX from 'xlsx'

type Solicitud = {
    id: string
    categoria?: string
    descripcion?: string
    estatus?: boolean
    nombre_solicitud?: string
    precio?: number | null
    solicitud_image?: string[]
    taller?: string | null
    uid_categoria?: string
    uid_taller?: string | null
}

const RequestList = () => {
    const [dataSolicitudes, setDataSolicitudes] = useState<Solicitud[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('todos')
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const fetchData = async () => {
        try {
            const solicitudesQuery = query(collection(db, 'Solicitudes'))
            const snapshot = await getDocs(solicitudesQuery)
            const solicitudes = snapshot.docs.map(
                (docSnap) => ({ ...docSnap.data(), id: docSnap.id }) as Solicitud,
            )
            setDataSolicitudes(solicitudes)
        } catch (error) {
            console.error('Error al cargar solicitudes:', error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [statusFilter])

    const handleRefresh = async () => {
        await fetchData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const handleStatusFilterChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setStatusFilter(event.target.value)
    }

    const applyFilters = () => {
        const filters: ColumnFiltersState = []
        if (statusFilter !== 'todos') {
            filters.push({
                id: 'estatus',
                value: statusFilter === 'activo',
            })
        }
        setFiltering(filters)
    }

    const getStatusIcon = (estatus: boolean) => {
        if (estatus) {
            return (
                <div className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    <span>Activo</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center text-red-600">
                    <FaTimesCircle className="mr-1" />
                    <span>Inactivo</span>
                </div>
            )
        }
    }

    const openSolicitudDetails = (solicitud: Solicitud) => {
        setSelectedSolicitud(solicitud)
        setModalIsOpen(true)
    }

    const handleModalClose = () => {
        setModalIsOpen(false)
        setSelectedSolicitud(null)
    }

    const handleExportToExcel = () => {
        const encabezados: Record<string, string> = {
            nombre_solicitud: 'Nombre de la solicitud',
            categoria: 'Categoría',
            descripcion: 'Descripción',
            taller: 'Taller',
            precio: 'Precio',
            estatus: 'Estado',
        }
        const rowsToExport = table.getFilteredRowModel().rows
        const tableData = rowsToExport.map((row) => {
            const r = row.original
            return {
                [encabezados.nombre_solicitud]: r.nombre_solicitud ?? '',
                [encabezados.categoria]: r.categoria ?? '',
                [encabezados.descripcion]: r.descripcion ?? '',
                [encabezados.taller]: r.taller ?? '—',
                [encabezados.precio]:
                    r.precio != null ? Number(r.precio).toLocaleString() : '—',
                [encabezados.estatus]: r.estatus ? 'Activo' : 'Inactivo',
            }
        })
        if (tableData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles para exportar.
                </Notification>,
            )
            return
        }
        const worksheet = XLSX.utils.json_to_sheet(tableData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes')
        XLSX.writeFile(workbook, 'solicitudes.xlsx')
        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        )
    }

    const columns: ColumnDef<Solicitud>[] = [
        {
            header: 'Imagen',
            accessorKey: 'solicitud_image',
            cell: ({ row }) => {
                const solicitud = row.original
                const images = solicitud.solicitud_image
                if (images && images.length > 0) {
                    return (
                        <div className="flex items-center">
                            <img
                                src={images[0]}
                                alt={solicitud.nombre_solicitud}
                                className="w-12 h-12 object-cover rounded-lg"
                            />
                        </div>
                    )
                }
                return (
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaCamera className="text-gray-400" />
                        </div>
                    </div>
                )
            },
        },
        {
            header: 'Nombre de la solicitud',
            accessorKey: 'nombre_solicitud',
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">
                    {row.original.nombre_solicitud}
                </div>
            ),
        },
        {
            header: 'Categoría',
            accessorKey: 'categoria',
            cell: ({ row }) => (
                <div className="text-gray-700">{row.original.categoria}</div>
            ),
        },
        {
            header: 'Descripción',
            accessorKey: 'descripcion',
            cell: ({ row }) => {
                const desc = row.original.descripcion || ''
                const truncated = desc.length > 50 ? `${desc.slice(0, 50)}...` : desc
                return <div className="text-gray-700 max-w-xs">{truncated}</div>
            },
        },
        {
            header: 'Taller',
            accessorKey: 'taller',
            cell: ({ row }) => (
                <div className="text-gray-700">
                    {row.original.taller ?? '—'}
                </div>
            ),
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
            cell: ({ row }) => {
                const precio = row.original.precio
                if (precio == null) return <div className="text-gray-500">—</div>
                return (
                    <div className="font-semibold text-green-600">
                        ${Number(precio).toLocaleString()}
                    </div>
                )
            },
        },
        {
            header: 'Estado',
            accessorKey: 'estatus',
            filterFn: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId)
                return Boolean(cellValue) === Boolean(filterValue)
            },
            cell: ({ row }) => getStatusIcon(row.original.estatus ?? false),
        },
        {
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => openSolicitudDetails(row.original)}
                        className="flex items-center gap-1"
                    >
                        <HiOutlineEye className="w-4 h-4" />
                        Ver Detalles
                    </Button>
                </div>
            ),
        },
    ]

    const { Tr, Th, Td, THead, TBody } = Table

    const table = useReactTable({
        data: dataSolicitudes,
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
            const nombre = (r.nombre_solicitud ?? '').toLowerCase()
            const categoria = (r.categoria ?? '').toLowerCase()
            const descripcion = (r.descripcion ?? '').toLowerCase()
            const taller = (r.taller ?? '').toLowerCase()
            return (
                nombre.includes(term) ||
                categoria.includes(term) ||
                descripcion.includes(term) ||
                taller.includes(term)
            )
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            customFilter: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId)
                if (cellValue === null || cellValue === undefined) return false
                if (columnId === 'estatus') {
                    return Boolean(cellValue) === Boolean(filterValue)
                }
                const stringValue = String(cellValue).toLowerCase()
                const searchValue = String(filterValue).toLowerCase()
                if (Array.isArray(cellValue)) {
                    return cellValue.some((item: any) => {
                        if (typeof item === 'object' && item !== null) {
                            return Object.values(item).some((val: any) =>
                                String(val).toLowerCase().includes(searchValue)
                            )
                        }
                        return String(item).toLowerCase().includes(searchValue)
                    })
                }
                if (typeof cellValue === 'object' && cellValue !== null) {
                    return Object.values(cellValue).some((val: any) =>
                        String(val).toLowerCase().includes(searchValue)
                    )
                }
                return stringValue.includes(searchValue)
            },
        },
    })

    const data = table.getRowModel().rows
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

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    <span className="text-[#000B7E]">
                        Histórico de Solicitudes
                    </span>
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end items-end gap-4 flex-nowrap">
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <label htmlFor="filter-estado" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Estado
                        </label>
                        <select
                            id="filter-estado"
                            className="h-10 w-32 py-2 px-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                            onChange={handleStatusFilterChange}
                            value={statusFilter}
                        >
                            <option value="todos">Todos</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <label htmlFor="filter-buscar" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Buscar
                        </label>
                        <div className="relative">
                            <input
                                id="filter-buscar"
                                type="text"
                                placeholder="Nombre, categoría, descripción..."
                                className="w-80 py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10 text-sm"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                    <button
                        style={{ backgroundColor: '#10B981' }}
                        className="p-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 active:bg-blue-700 transition duration-200 hover:opacity-80 flex-shrink-0"
                        onClick={handleExportToExcel}
                    >
                        Exportar a Excel
                    </button>
                </div>
            </div>

            <div className="p-3 rounded-lg shadow">
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
                                                        header.column.columnDef
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
                            .rows.slice(startIndex, endIndex)
                            .map((row) => {
                                return (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <Td key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef
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

                {/* Paginación */}
                <Pagination
                    onChange={onPaginationChange}
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            </div>

            {/* Modal para mostrar detalles de la solicitud */}
            <Dialog
                isOpen={modalIsOpen}
                onClose={handleModalClose}
                onRequestClose={handleModalClose}
                width="90%"
                height="85vh"
                contentClassName="max-h-[90vh] overflow-y-auto sm:mt-16 sm:mb-24"
                closable={false}
            >
                {selectedSolicitud && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#000B7E]">
                                Detalles de la Solicitud
                            </h2>
                            <Button
                                variant="default"
                                onClick={handleModalClose}
                                className="px-6 py-2 bg-red-500 text-red-500 hover:bg-red-600 border-red-500 hover:text-white hover:border-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                ✕ Cerrar
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {selectedSolicitud.solicitud_image && selectedSolicitud.solicitud_image.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Imágenes de la solicitud</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedSolicitud.solicitud_image.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Imagen ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Información básica</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium text-gray-700">Nombre de la solicitud:</span>
                                            <p className="text-gray-900 font-semibold">{selectedSolicitud.nombre_solicitud}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Categoría:</span>
                                            <p className="text-gray-900">{selectedSolicitud.categoria}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Taller:</span>
                                            <p className="text-gray-900">{selectedSolicitud.taller ?? '—'}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Precio:</span>
                                            <p className="text-gray-900">
                                                {selectedSolicitud.precio != null
                                                    ? `$${Number(selectedSolicitud.precio).toLocaleString()}`
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Estado:</span>
                                            <div className="mt-1">
                                                {getStatusIcon(selectedSolicitud.estatus ?? false)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Descripción</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {selectedSolicitud.descripcion || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    )
}

export default RequestList
