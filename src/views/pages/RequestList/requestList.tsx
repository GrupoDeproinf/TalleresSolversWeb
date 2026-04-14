import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineMinus,
    HiOutlinePlus,
} from 'react-icons/hi'
import { FaCamera } from 'react-icons/fa'
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
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import * as XLSX from 'xlsx'

type Vehiculo = {
    KM?: number
    KM_correa_tiempo?: string
    KM_ultima_rotacion_cauchos?: string
    activo?: boolean
    contratacion_RCV?: boolean
    grua?: boolean
    id?: string
    por_defecto?: boolean
    proximo_cambio_aceite?: string
    tipo_vehiculo?: string
    uid_tipo_vehiculo?: string
    ultima_vez_alineacion?: string
    ultima_vez_gasolina?: string
    ultimo_cambio_bujias_filtro?: string
    ultimo_cambio_pila_gasolina?: string
    ultimo_lavado?: string
    vehiculo_anio?: number
    vehiculo_color?: string
    vehiculo_marca?: string
    vehiculo_modelo?: string
    vehiculo_placa?: string
}

type Solicitud = {
    id: string
    categoriaId: string
    descripcion: string
    fecha_solicitud?: Timestamp
    nombre_servicio: string
    nombre_usuario: string
    phone_usuario: string
    solicitud_images: string[]
    uid_usuario: string
    urgencia: string
    vehiculo?: Vehiculo
}

type Propuesta = {
    id: string
    fecha_aceptada?: Timestamp
    fecha_propuesta?: Timestamp
    nombre_solicitud: string
    nombre_taller: string
    nombre_usuario: string
    phone_usuario: string
    precio_estimado?: string
    status: string
    tiempo_estimado?: string
    uid_solicitud: string
    uid_taller: string
    uid_usuario: string
    urgencia?: string
}

const formatFecha = (ts: Timestamp | undefined): string => {
    if (!ts) return '—'
    const d = ts.toDate?.() ?? new Date(ts as unknown as number)
    return d.toLocaleString('es-VE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const RequestList = () => {
    const [dataSolicitudes, setDataSolicitudes] = useState<Solicitud[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [urgenciaFilter, setUrgenciaFilter] = useState<string>('todos')
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [imagePopupOpen, setImagePopupOpen] = useState(false)
    const [imagePopupUrl, setImagePopupUrl] = useState<string | null>(null)
    const [imageZoom, setImageZoom] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [activeTab, setActiveTab] = useState<'detalle' | 'propuestas'>('detalle')
    const [propuestas, setPropuestas] = useState<Propuesta[]>([])
    const [loadingPropuestas, setLoadingPropuestas] = useState(false)

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
        const filters: ColumnFiltersState = []
        if (urgenciaFilter !== 'todos') {
            filters.push({ id: 'urgencia', value: urgenciaFilter })
        }
        setFiltering(filters)
    }, [urgenciaFilter])

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

    const handleUrgenciaFilterChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setUrgenciaFilter(event.target.value)
    }

    const getUrgenciaBadge = (urgencia: string) => {
        const u = (urgencia || '').toLowerCase()
        if (u.includes('emergencia')) {
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {urgencia}
                </span>
            )
        }
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {urgencia || '—'}
            </span>
        )
    }

    const fetchPropuestasBySolicitud = async (solicitudId: string) => {
        try {
            setLoadingPropuestas(true)
            const propuestasQuery = query(
                collection(db, 'Propuestas'),
                where('uid_solicitud', '==', solicitudId),
            )
            const snapshot = await getDocs(propuestasQuery)
            const data = snapshot.docs.map(
                (docSnap) => ({ ...docSnap.data(), id: docSnap.id }) as Propuesta,
            )
            setPropuestas(data)
        } catch (error) {
            console.error('Error al cargar propuestas:', error)
        } finally {
            setLoadingPropuestas(false)
        }
    }

    const openSolicitudDetails = (solicitud: Solicitud) => {
        setSelectedSolicitud(solicitud)
        setModalIsOpen(true)
        setActiveTab('detalle')
        setPropuestas([])
        void fetchPropuestasBySolicitud(solicitud.id)
    }

    const handleModalClose = () => {
        setModalIsOpen(false)
        setSelectedSolicitud(null)
        setPropuestas([])
        setActiveTab('detalle')
    }

    const openImagePopup = (url: string, index: number) => {
        setCurrentImageIndex(index)
        setImagePopupUrl(url)
        setImageZoom(1)
        setImagePopupOpen(true)
    }

    const closeImagePopup = () => {
        setImagePopupOpen(false)
        setImagePopupUrl(null)
        setImageZoom(1)
        setCurrentImageIndex(0)
    }

    const ZOOM_MIN = 0.5
    const ZOOM_MAX = 3
    const ZOOM_STEP = 0.25

    const handleZoomIn = () => {
        setImageZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
    }

    const handleZoomOut = () => {
        setImageZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
    }

    const handlePrevImage = () => {
        if (!selectedSolicitud?.solicitud_images?.length) return
        setCurrentImageIndex((prev) => {
            const newIndex = Math.max(0, prev - 1)
            const newUrl = selectedSolicitud.solicitud_images[newIndex]
            setImagePopupUrl(newUrl)
            return newIndex
        })
    }

    const handleNextImage = () => {
        if (!selectedSolicitud?.solicitud_images?.length) return
        const total = selectedSolicitud.solicitud_images.length
        setCurrentImageIndex((prev) => {
            const newIndex = Math.min(total - 1, prev + 1)
            const newUrl = selectedSolicitud.solicitud_images[newIndex]
            setImagePopupUrl(newUrl)
            return newIndex
        })
    }

    const handleExportToExcel = () => {
        const encabezados: Record<string, string> = {
            nombre_servicio: 'Servicio',
            nombre_usuario: 'Usuario',
            phone_usuario: 'Teléfono',
            urgencia: 'Urgencia',
            fecha_solicitud: 'Fecha solicitud',
            vehiculo: 'Vehículo',
            descripcion: 'Descripción',
        }
        const rowsToExport = table.getFilteredRowModel().rows
        const tableData = rowsToExport.map((row) => {
            const r = row.original
            const v = r.vehiculo
            const vehiculoStr = v
                ? [v.vehiculo_marca, v.vehiculo_modelo, v.vehiculo_placa]
                      .filter(Boolean)
                      .join(' ') || '—'
                : '—'
            return {
                [encabezados.nombre_servicio]: r.nombre_servicio ?? '',
                [encabezados.nombre_usuario]: r.nombre_usuario ?? '',
                [encabezados.phone_usuario]: r.phone_usuario ?? '',
                [encabezados.urgencia]: r.urgencia ?? '',
                [encabezados.fecha_solicitud]: formatFecha(r.fecha_solicitud),
                [encabezados.vehiculo]: vehiculoStr,
                [encabezados.descripcion]: (r.descripcion ?? '').slice(0, 200),
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
            accessorKey: 'solicitud_images',
            cell: ({ row }) => {
                const solicitud = row.original
                const images = solicitud.solicitud_images ?? []
                if (images.length > 0) {
                    return (
                        <div className="flex items-center">
                            <img
                                src={images[0]}
                                alt={solicitud.nombre_servicio}
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
            header: 'Servicio',
            accessorKey: 'nombre_servicio',
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">
                    {row.original.nombre_servicio}
                </div>
            ),
        },
        {
            header: 'Usuario',
            accessorKey: 'nombre_usuario',
            cell: ({ row }) => (
                <div className="text-gray-700">{row.original.nombre_usuario}</div>
            ),
        },
        {
            header: 'Teléfono',
            accessorKey: 'phone_usuario',
            cell: ({ row }) => (
                <div className="text-gray-700">{row.original.phone_usuario ?? '—'}</div>
            ),
        },
        {
            header: 'Urgencia',
            accessorKey: 'urgencia',
            filterFn: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId) as string
                return (filterValue ?? '') === '' || cellValue === filterValue
            },
            cell: ({ row }) => getUrgenciaBadge(row.original.urgencia ?? ''),
        },
        {
            header: 'Fecha',
            accessorKey: 'fecha_solicitud',
            cell: ({ row }) => (
                <div className="text-gray-700 text-sm whitespace-nowrap">
                    {formatFecha(row.original.fecha_solicitud)}
                </div>
            ),
        },
        {
            header: 'Vehículo',
            accessorKey: 'vehiculo',
            cell: ({ row }) => {
                const v = row.original.vehiculo
                if (!v) return <div className="text-gray-500">—</div>
                const parts = [v.vehiculo_marca, v.vehiculo_modelo, v.vehiculo_placa].filter(Boolean)
                return (
                    <div className="text-gray-700 text-sm">
                        {parts.length ? parts.join(' · ') : '—'}
                    </div>
                )
            },
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
            const nombreServicio = (r.nombre_servicio ?? '').toLowerCase()
            const nombreUsuario = (r.nombre_usuario ?? '').toLowerCase()
            const descripcion = (r.descripcion ?? '').toLowerCase()
            const phone = (r.phone_usuario ?? '').toLowerCase()
            const urgencia = (r.urgencia ?? '').toLowerCase()
            const v = r.vehiculo
            const vehiculoStr = v
                ? [v.vehiculo_marca, v.vehiculo_modelo, v.vehiculo_placa]
                      .filter(Boolean)
                      .join(' ')
                      .toLowerCase()
                : ''
            return (
                nombreServicio.includes(term) ||
                nombreUsuario.includes(term) ||
                descripcion.includes(term) ||
                phone.includes(term) ||
                urgencia.includes(term) ||
                vehiculoStr.includes(term)
            )
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            customFilter: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId)
                if (cellValue === null || cellValue === undefined) return false
                if (columnId === 'urgencia') {
                    return String(cellValue) === String(filterValue)
                }
                const stringValue = String(cellValue).toLowerCase()
                const searchValue = String(filterValue).toLowerCase()
                if (Array.isArray(cellValue)) {
                    return cellValue.some((item: unknown) => {
                        if (typeof item === 'object' && item !== null) {
                            return Object.values(item).some((val: unknown) =>
                                String(val).toLowerCase().includes(searchValue)
                            )
                        }
                        return String(item).toLowerCase().includes(searchValue)
                    })
                }
                if (typeof cellValue === 'object' && cellValue !== null) {
                    return Object.values(cellValue).some((val: unknown) =>
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
                        <label htmlFor="filter-urgencia" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Urgencia
                        </label>
                        <select
                            id="filter-urgencia"
                            className="h-10 w-36 py-2 px-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                            onChange={handleUrgenciaFilterChange}
                            value={urgenciaFilter}
                        >
                            <option value="todos">Todos</option>
                            <option value="Emergencia">Emergencia</option>
                            <option value="Normal">Normal</option>
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
                                placeholder="Servicio, usuario, descripción, vehículo..."
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
                        <div className="flex justify-between items-center mb-4">
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

                        <div className="border-b mb-4">
                            <nav className="flex gap-4">
                                <button
                                    type="button"
                                    className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'detalle'
                                            ? 'border-[#000B7E] text-[#000B7E]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('detalle')}
                                >
                                    Detalle de la solicitud
                                </button>
                                <button
                                    type="button"
                                    className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'propuestas'
                                            ? 'border-[#000B7E] text-[#000B7E]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('propuestas')}
                                >
                                    Propuestas del taller
                                </button>
                            </nav>
                        </div>

                        {activeTab === 'detalle' && (
                            <div className="space-y-6">
                                {selectedSolicitud.solicitud_images && selectedSolicitud.solicitud_images.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Imágenes de la solicitud</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {selectedSolicitud.solicitud_images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                                    onClick={() => openImagePopup(image, index)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Información de la solicitud</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium text-gray-700">Servicio:</span>
                                                <p className="text-gray-900 font-semibold">{selectedSolicitud.nombre_servicio}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Urgencia:</span>
                                                <div className="mt-1">{getUrgenciaBadge(selectedSolicitud.urgencia ?? '')}</div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Fecha de solicitud:</span>
                                                <p className="text-gray-900">{formatFecha(selectedSolicitud.fecha_solicitud)}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Usuario:</span>
                                                <p className="text-gray-900">{selectedSolicitud.nombre_usuario}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Teléfono:</span>
                                                <p className="text-gray-900">{selectedSolicitud.phone_usuario ?? '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedSolicitud.vehiculo && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Vehículo</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-gray-600">Marca / Modelo:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {[selectedSolicitud.vehiculo.vehiculo_marca, selectedSolicitud.vehiculo.vehiculo_modelo].filter(Boolean).join(' ') || '—'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-gray-600">Placa:</span>
                                                    <span className="font-medium text-gray-900">{selectedSolicitud.vehiculo.vehiculo_placa ?? '—'}</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-gray-600">Año:</span>
                                                    <span className="font-medium text-gray-900">{selectedSolicitud.vehiculo.vehiculo_anio ?? '—'}</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-gray-600">KM:</span>
                                                    <span className="font-medium text-gray-900">{selectedSolicitud.vehiculo.KM != null ? selectedSolicitud.vehiculo.KM.toLocaleString() : '—'}</span>
                                                </div>
                                                {selectedSolicitud.vehiculo.vehiculo_color && (
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-gray-600">Color:</span>
                                                        <span className="font-medium text-gray-900">{selectedSolicitud.vehiculo.vehiculo_color}</span>
                                                    </div>
                                                )}
                                                {selectedSolicitud.vehiculo.grua && (
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-gray-600">Grúa:</span>
                                                        <span className="font-medium text-gray-900">{selectedSolicitud.vehiculo.grua ? 'Sí' : 'No'}</span>
                                                    </div>
                                                )}
                                                {selectedSolicitud.vehiculo.contratacion_RCV && (
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-gray-600">RCV:</span>
                                                        <span className="font-medium text-gray-900">{selectedSolicitud.vehiculo.contratacion_RCV ? 'Sí' : 'No'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Descripción</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {selectedSolicitud.descripcion || '—'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'propuestas' && (
                            <div className="space-y-4">
                                {loadingPropuestas && (
                                    <p className="text-sm text-gray-500">Cargando propuestas...</p>
                                )}
                                {!loadingPropuestas && propuestas.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        Esta solicitud aún no tiene propuestas registradas.
                                    </p>
                                )}
                                {!loadingPropuestas && propuestas.length > 0 && (
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {propuestas.map((p) => (
                                            <div
                                                key={p.id}
                                                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                                                    <div>
                                                        <p className="text-xs uppercase text-gray-400 tracking-wide">
                                                            Taller
                                                        </p>
                                                        <p className="font-semibold text-gray-900">
                                                            {p.nombre_taller}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs uppercase text-gray-400 tracking-wide">
                                                            Estado
                                                        </p>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                p.status === 'Aceptada'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : p.status === 'Rechazada'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Servicio
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.nombre_solicitud}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Urgencia
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.urgencia || '—'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Precio estimado
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.precio_estimado
                                                                ? `${p.precio_estimado} USD`
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Tiempo estimado
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.tiempo_estimado || '—'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Fecha propuesta
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {formatFecha(p.fecha_propuesta)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Fecha aceptada
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.fecha_aceptada
                                                                ? formatFecha(p.fecha_aceptada)
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Usuario
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.nombre_usuario}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            Teléfono usuario
                                                        </p>
                                                        <p className="text-gray-800">
                                                            {p.phone_usuario || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Popup de imagen con zoom (reutilizado de Users) */}
            <Dialog
                isOpen={imagePopupOpen}
                onClose={closeImagePopup}
                onRequestClose={closeImagePopup}
                width={640}
                className="overflow-hidden"
            >
                <div className="flex flex-col h-full max-h-[85vh] pr-8">
                    <div className="flex items-center gap-4 mb-3">
                        <h5 className="mb-0">Imagen de la solicitud</h5>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={handlePrevImage}
                                    disabled={
                                        !selectedSolicitud?.solicitud_images?.length ||
                                        currentImageIndex === 0
                                    }
                                >
                                    ← Anterior
                                </Button>
                                <span className="text-xs text-gray-500">
                                    {selectedSolicitud?.solicitud_images?.length
                                        ? `${currentImageIndex + 1} de ${selectedSolicitud.solicitud_images.length}`
                                        : ''}
                                </span>
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={handleNextImage}
                                    disabled={
                                        !selectedSolicitud?.solicitud_images?.length ||
                                        currentImageIndex >=
                                            (selectedSolicitud.solicitud_images.length - 1)
                                    }
                                >
                                    Siguiente →
                                </Button>
                            </div>
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={handleZoomOut}
                                disabled={imageZoom <= ZOOM_MIN}
                                icon={<HiOutlineMinus className="text-lg" />}
                                title="Alejar"
                            />
                            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                                {Math.round(imageZoom * 100)}%
                            </span>
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={handleZoomIn}
                                disabled={imageZoom >= ZOOM_MAX}
                                icon={<HiOutlinePlus className="text-lg" />}
                                title="Acercar"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-100 rounded-lg flex items-center justify-center p-2 min-h-[300px]">
                        {imagePopupUrl && (
                            <img
                                src={imagePopupUrl}
                                alt="Imagen de la solicitud"
                                className="max-w-full max-h-[70vh] object-contain transition-transform duration-150 select-none"
                                style={{ transform: `scale(${imageZoom})` }}
                                draggable={false}
                            />
                        )}
                    </div>
                    <div className="text-right mt-3">
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={closeImagePopup}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default RequestList
