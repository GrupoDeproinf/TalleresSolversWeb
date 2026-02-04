import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { Drawer } from '@/components/ui'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Avatar } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi'
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
    FaStar,
    FaStarHalfAlt,
    FaTrash,
    FaEdit,
    FaCamera,
    FaMapMarkerAlt,
    FaHome,
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
    getDoc,
    doc,
    updateDoc,
    Timestamp,
    addDoc,
    where,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useAppSelector } from '@/store'

type Service = {
    nombre_servicio?: string
    descripcion?: string
    precio?: string
    uid_taller?: string
    taller?: string
    uid_servicio?: string
    estatus?: boolean
    garantia?: string
    puntuacion?: number
    id?: string
    uid_categoria?: string
    nombre_categoria?: string
    subcategoria?: string | any[] | any
    typeService?: string
    service_image?: string[]
    categoria?: string
    uid_subcategoria?: string
    updatedAt?: Timestamp
}

type Garage = {
    nombre?: string
    email?: string
    rif?: string
    phone?: string
    uid: string
    typeUser?: string
    servicios?: string[]
    id?: string
    status?: string
}

const ServicesList = () => {
    const userAuthority = useAppSelector((state) => state.auth.user.authority)
    const loggedInUserId = useAppSelector((state) => state.auth.user.key)

    const [dataServices, setDataServices] = useState<Service[]>([])
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre_servicio')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('todos')
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const fetchData = async () => {
        try {
            // Consultas para obtener datos
            const servicesQuery = query(collection(db, 'Servicios'))
            const garagesQuery = query(collection(db, 'Usuarios'))

            // Ejecutar todas las consultas en paralelo
            const [servicesSnapshot, garagesSnapshot] = await Promise.all([
                getDocs(servicesQuery),
                getDocs(garagesQuery),
            ])

            // Procesar los datos obtenidos de las colecciones
            const servicios = servicesSnapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id }) as Service,
            )

            const talleres = garagesSnapshot.docs
                .map((doc) => ({ ...doc.data(), id: doc.id }) as Garage)
                .filter((garage) => garage.typeUser === 'Taller')

            // Asignar datos a los estados correspondientes
            setDataServices(servicios)
            setDataGarages(talleres)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Aplicar filtros cuando cambien los valores
    useEffect(() => {
        applyFilters()
    }, [searchTerm, statusFilter, selectedColumn])

    const handleRefresh = async () => {
        await fetchData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)
    }

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value
        setSelectedColumn(value)

        // Limpiar filtros cuando se cambia la columna
        setSearchTerm('')
    }

    const handleStatusFilterChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value
        setStatusFilter(value)
    }

    const applyFilters = () => {
        const filters: any[] = []

        // Aplicar filtro de búsqueda si existe
        if (searchTerm.trim()) {
            filters.push({
                id: selectedColumn,
                value: searchTerm.toLowerCase(),
            })
        }

        // Aplicar filtro de estado si no es "todos"
        if (statusFilter !== 'todos') {
            filters.push({
                id: 'estatus',
                value: statusFilter === 'activo' ? true : false,
            })
        }

        console.log('Aplicando filtros:', filters)
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

    const getTypeServiceIcon = (typeService: string) => {
        if (typeService === 'local') {
            return (
                <div className="flex items-center text-blue-600">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>En el Local</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center text-purple-600">
                    <FaHome className="mr-1" />
                    <span>A Domicilio</span>
                </div>
            )
        }
    }

    const getRatingStars = (puntuacion: number) => {
        const stars = []
        const fullStars = Math.floor(puntuacion)
        const hasHalfStar = puntuacion % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-yellow-400" />)
        }

        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />)
        }

        const emptyStars = 5 - Math.ceil(puntuacion)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />)
        }

        return (
            <div className="flex items-center">
                <div className="flex">{stars}</div>
                <span className="ml-2 text-sm text-gray-600">({puntuacion})</span>
            </div>
        )
    }

    const openServiceDetails = (service: Service) => {
        setSelectedService(service)
        setModalIsOpen(true)
    }

    const handleModalClose = () => {
        setModalIsOpen(false)
        setSelectedService(null)
    }

    const columns: ColumnDef<Service>[] = [
        {
            header: 'Imagen',
            accessorKey: 'service_image',
            cell: ({ row }) => {
                const service = row.original
                const images = service.service_image
                
                if (images && images.length > 0) {
                    return (
                        <div className="flex items-center">
                            <img
                                src={images[0]}
                                alt={service.nombre_servicio}
                                className="w-12 h-12 object-cover rounded-lg"
                            />
                        </div>
                    )
                } else {
                    return (
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FaCamera className="text-gray-400" />
                            </div>
                        </div>
                    )
                }
            },
        },
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
            cell: ({ row }) => {
                const service = row.original
                return (
                    <div className="font-medium text-gray-900">
                        {service.nombre_servicio}
                    </div>
                )
            },
        },
        {
            header: 'Taller',
            accessorKey: 'taller',
            cell: ({ row }) => {
                const service = row.original
                return (
                    <div className="text-gray-700">
                        {service.taller}
                    </div>
                )
            },
        },
        {
            header: 'Categoría',
            accessorKey: 'categoria',
            cell: ({ row }) => {
                const service = row.original
                return (
                    <div className="text-gray-700">
                        {service.categoria || service.nombre_categoria}
                    </div>
                )
            },
        },
        {
            header: 'Subcategoría',
            accessorKey: 'subcategoria',
            cell: ({ row }) => {
                const service = row.original
                const subcategoria = service.subcategoria
                
                // Si subcategoria es un string, mostrarlo directamente
                if (typeof subcategoria === 'string') {
                    return (
                        <div className="text-gray-700">
                            {subcategoria}
                        </div>
                    )
                }
                
                // Si subcategoria es un array de objetos, mostrar los nombres
                if (Array.isArray(subcategoria) && subcategoria.length > 0) {
                    return (
                        <div className="text-gray-700">
                            {subcategoria.map((sub: any, index: number) => (
                                <span key={index}>
                                    {sub.nombre_subcategoria || sub.nombre || sub}
                                    {index < subcategoria.length - 1 && ', '}
                                </span>
                            ))}
                        </div>
                    )
                }
                
                // Si es un objeto individual, mostrar su nombre
                if (subcategoria && typeof subcategoria === 'object') {
                    return (
                        <div className="text-gray-700">
                            {subcategoria.nombre_subcategoria || subcategoria.nombre || 'N/A'}
                        </div>
                    )
                }
                
                return (
                    <div className="text-gray-700">
                        N/A
                    </div>
                )
            },
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
            cell: ({ row }) => {
                const service = row.original
                const precio = parseFloat(service.precio || '0')
                return (
                    <div className="font-semibold text-green-600">
                        ${precio.toLocaleString()}
                    </div>
                )
            },
        },
        {
            header: 'Tipo de Servicio',
            accessorKey: 'typeService',
            cell: ({ row }) => {
                const service = row.original
                return getTypeServiceIcon(service.typeService || 'local')
            },
        },
        {
            header: 'Estado',
            accessorKey: 'estatus',
            cell: ({ row }) => {
                const service = row.original
                return getStatusIcon(service.estatus || false)
            },
        },
        {
            header: 'Puntuación',
            accessorKey: 'puntuacion',
            cell: ({ row }) => {
                const service = row.original
                return getRatingStars(service.puntuacion || 0)
            },
        },
        {
            header: 'Acciones',
            cell: ({ row }) => {
                const service = row.original
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => openServiceDetails(service)}
                            className="flex items-center gap-1"
                        >
                            <HiOutlineEye className="w-4 h-4" />
                            Ver Detalles
                        </Button>
                    </div>
                )
            },
        },
    ]

    const { Tr, Th, Td, THead, TBody } = Table

    const table = useReactTable({
        data: dataServices,
        columns,
        state: {
            sorting,
            columnFilters: filtering,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            // Filtro personalizado para manejar diferentes tipos de datos
            customFilter: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId)
                
                if (cellValue === null || cellValue === undefined) {
                    return false
                }
                
                // Manejo especial para el campo estatus (booleano)
                if (columnId === 'estatus') {
                    const cellBool = Boolean(cellValue)
                    const filterBool = Boolean(filterValue)
                    console.log(`Filtro estatus - cellValue: ${cellValue}, cellBool: ${cellBool}, filterValue: ${filterValue}, filterBool: ${filterBool}, resultado: ${cellBool === filterBool}`)
                    return cellBool === filterBool
                }
                
                // Convertir a string para comparación
                const stringValue = String(cellValue).toLowerCase()
                const searchValue = String(filterValue).toLowerCase()
                
                // Para arrays (como subcategorías)
                if (Array.isArray(cellValue)) {
                    return cellValue.some(item => {
                        if (typeof item === 'object' && item !== null) {
                            return Object.values(item).some(val => 
                                String(val).toLowerCase().includes(searchValue)
                            )
                        }
                        return String(item).toLowerCase().includes(searchValue)
                    })
                }
                
                // Para objetos
                if (typeof cellValue === 'object' && cellValue !== null) {
                    return Object.values(cellValue).some(val => 
                        String(val).toLowerCase().includes(searchValue)
                    )
                }
                
                // Para strings y números
                return stringValue.includes(searchValue)
            },
        },
        globalFilterFn: 'customFilter' as any,
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
                        Servicios de Talleres
                    </span>
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="relative w-32">
                            <select
                                className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleSelectChange}
                                value={selectedColumn}
                            >
                                <option value="" disabled>
                                    Seleccionar columna...
                                </option>
                                <option value="nombre_servicio">Nombre del Servicio</option>
                                <option value="taller">Taller</option>
                                <option value="categoria">Categoría</option>
                                <option value="subcategoria">Subcategoría</option>
                                <option value="precio">Precio</option>
                            </select>
                        </div>
                        <div className="relative w-32 ml-4">
                            <select
                                className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleStatusFilterChange}
                                value={statusFilter}
                            >
                                <option value="todos">Todos</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="relative w-70 ml-4">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                    </div>
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

            {/* Modal para mostrar detalles del servicio */}
            <Dialog
                isOpen={modalIsOpen}
                onClose={handleModalClose}
                onRequestClose={handleModalClose}
                width="90%"
                height="85vh"
                contentClassName="max-h-[90vh] overflow-y-auto sm:mt-16 sm:mb-24"
                closable={false}
            >
                {selectedService && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#000B7E]">
                                Detalles del Servicio
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
                            {/* Imágenes del servicio */}
                            {selectedService.service_image && selectedService.service_image.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Imágenes del Servicio</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedService.service_image.map((image, index) => (
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

                            {/* Información básica */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Información Básica</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium text-gray-700">Nombre:</span>
                                            <p className="text-gray-900 font-semibold">{selectedService.nombre_servicio}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Taller:</span>
                                            <p className="text-gray-900">{selectedService.taller}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Precio:</span>
                                            <p className="text-green-600 font-bold text-lg">
                                                ${parseFloat(selectedService.precio || '0').toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Estado:</span>
                                            <div className="mt-1">
                                                {getStatusIcon(selectedService.estatus || false)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Categorización</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium text-gray-700">Categoría:</span>
                                            <p className="text-gray-900">
                                                {selectedService.categoria || selectedService.nombre_categoria}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Subcategoría:</span>
                                            <p className="text-gray-900">
                                                {(() => {
                                                    const subcategoria = selectedService.subcategoria
                                                    
                                                    if (typeof subcategoria === 'string') {
                                                        return subcategoria
                                                    }
                                                    
                                                    if (Array.isArray(subcategoria) && subcategoria.length > 0) {
                                                        return subcategoria.map((sub: any, index: number) => (
                                                            <span key={index}>
                                                                {sub.nombre_subcategoria || sub.nombre || sub}
                                                                {index < subcategoria.length - 1 && ', '}
                                                            </span>
                                                        ))
                                                    }
                                                    
                                                    if (subcategoria && typeof subcategoria === 'object') {
                                                        return subcategoria.nombre_subcategoria || subcategoria.nombre || 'N/A'
                                                    }
                                                    
                                                    return 'N/A'
                                                })()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Tipo de Servicio:</span>
                                            <div className="mt-1">
                                                {getTypeServiceIcon(selectedService.typeService || 'local')}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Puntuación:</span>
                                            <div className="mt-1">
                                                {getRatingStars(selectedService.puntuacion || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Descripción</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {selectedService.descripcion}
                                </p>
                            </div>

                            {/* Garantía */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 text-[#000B7E]">Garantía</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {selectedService.garantia}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    )
}

export default ServicesList
