import { useEffect, useMemo, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { Drawer } from '@/components/ui'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
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
    reviews_count?: number
    latest_reviews?: {
        comentario: string
        puntuacion: number
        fecha_texto: string
        usuario_nombre: string
    }[]
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

type ServiceReview = {
    comentario: string
    puntuacion: number
    fecha_texto: string
    usuario_nombre: string
}

type FilterSelectOption = { value: string; label: string }

const STATUS_FILTER_OPTIONS: FilterSelectOption[] = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
]

function getCategoryFilterKey(s: Service): string {
    const label = (s.categoria || s.nombre_categoria || '').trim()
    const uid = (s.uid_categoria || '').trim()
    if (label) return `name:${label.toLowerCase()}`
    if (uid) return `uid:${uid}`
    return 'key:__none__'
}

function getCategoryFilterLabel(s: Service): string {
    const label = (s.categoria || s.nombre_categoria || '').trim()
    const uid = (s.uid_categoria || '').trim()
    if (label) return label
    if (uid) return uid
    return 'Sin categoría'
}

function subcategoriaToSearchParts(
    sub: Service['subcategoria'],
): string[] {
    const out: string[] = []
    if (sub == null) return out
    if (typeof sub === 'string') {
        out.push(sub)
        return out
    }
    if (Array.isArray(sub)) {
        for (const item of sub) {
            if (item == null) continue
            if (typeof item === 'object') {
                const o = item as Record<string, unknown>
                const name =
                    (o.nombre_subcategoria as string) ||
                    (o.nombre as string) ||
                    ''
                if (name) out.push(name)
                else out.push(JSON.stringify(o))
            } else {
                out.push(String(item))
            }
        }
        return out
    }
    if (typeof sub === 'object') {
        const o = sub as Record<string, unknown>
        out.push(
            String(o.nombre_subcategoria ?? o.nombre ?? ''),
        )
    }
    return out
}

function serviceSearchableText(s: Service): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        s.nombre_servicio,
        s.descripcion,
        s.taller,
        s.categoria,
        s.nombre_categoria,
        s.precio,
        s.typeService,
        s.uid_taller,
        s.uid_servicio,
        s.uid_categoria,
        s.uid_subcategoria,
        s.id,
        s.garantia,
    )
    parts.push(...subcategoriaToSearchParts(s.subcategoria))
    if (s.estatus === true) parts.push('activo')
    if (s.estatus === false) parts.push('inactivo')
    if (s.puntuacion !== undefined && s.puntuacion !== null) {
        parts.push(String(s.puntuacion))
    }
    if (Array.isArray(s.service_image)) {
        for (const url of s.service_image) {
            if (url) parts.push(String(url))
        }
    }
    return parts.join(' ').toLowerCase()
}

const ServicesList = () => {
    const userAuthority = useAppSelector((state) => state.auth.user.authority)
    const loggedInUserId = useAppSelector((state) => state.auth.user.key)
    const isTallerUser = (userAuthority || []).some(
        (role) => String(role).toLowerCase() === 'taller',
    )

    const [dataServices, setDataServices] = useState<Service[]>([])
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('todos')
    const [categoryFilter, setCategoryFilter] = useState<string>('todos')
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [reviewsModalIsOpen, setReviewsModalIsOpen] = useState(false)
    const [selectedServiceReviews, setSelectedServiceReviews] = useState<ServiceReview[]>([])

    const fetchData = async () => {
        try {
            // Si es taller y aún no hay UID de sesión, evitamos traer servicios globales.
            if (isTallerUser && !loggedInUserId) {
                setDataServices([])
                return
            }

            // Consultas para obtener datos
            const servicesQuery =
                isTallerUser && loggedInUserId
                    ? query(
                          collection(db, 'Servicios'),
                          where('uid_taller', '==', loggedInUserId),
                      )
                    : query(collection(db, 'Servicios'))
            const garagesQuery = query(collection(db, 'Usuarios'))

            // Ejecutar todas las consultas en paralelo
            const [servicesSnapshot, garagesSnapshot] = await Promise.all([
                getDocs(servicesQuery),
                getDocs(garagesQuery),
            ])

            // Procesar los datos obtenidos de las colecciones
            const servicios = await Promise.all(
                servicesSnapshot.docs.map(async (docSnap) => {
                    const serviceData = docSnap.data() as Service
                    const reviewsSnap = await getDocs(
                        collection(db, 'Servicios', docSnap.id, 'calificaciones'),
                    )
                    const reviews = reviewsSnap.docs.map((reviewDoc) => {
                        const reviewRaw = reviewDoc.data() as {
                            comentario?: string
                            puntuacion?: number
                            fecha_creacion?: Timestamp | Date
                            usuario?: { nombre?: string }
                        }
                        const createdAt =
                            reviewRaw.fecha_creacion instanceof Timestamp
                                ? reviewRaw.fecha_creacion.toDate()
                                : reviewRaw.fecha_creacion instanceof Date
                                  ? reviewRaw.fecha_creacion
                                  : null
                        return {
                            comentario: String(reviewRaw.comentario || '').trim(),
                            puntuacion: Number(reviewRaw.puntuacion || 0),
                            fechaMs: createdAt?.getTime() || 0,
                            fecha_texto: createdAt
                                ? createdAt.toLocaleString('es-VE')
                                : 'Sin fecha',
                            usuario_nombre:
                                String(reviewRaw.usuario?.nombre || '').trim() ||
                                'Usuario sin nombre',
                        }
                    })

                    const validScores = reviews
                        .map((review) => review.puntuacion)
                        .filter((score) => Number.isFinite(score))
                    const averageScore =
                        validScores.length > 0
                            ? validScores.reduce((acc, score) => acc + score, 0) /
                              validScores.length
                            : 0

                    const latestReviews = reviews
                        .slice()
                        .sort((a, b) => b.fechaMs - a.fechaMs)
                        .map((review) => ({
                            comentario: review.comentario || 'Sin comentario',
                            puntuacion: review.puntuacion,
                            fecha_texto: review.fecha_texto,
                            usuario_nombre: review.usuario_nombre,
                        }))

                    return {
                        ...serviceData,
                        id: docSnap.id,
                        puntuacion: averageScore,
                        reviews_count: latestReviews.length,
                        latest_reviews: latestReviews,
                    } as Service
                }),
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
    }, [isTallerUser, loggedInUserId])

    const categoryFilterOptions = useMemo(() => {
        const byKey = new Map<string, FilterSelectOption>()
        byKey.set('todos', { value: 'todos', label: 'Todas las categorías' })
        for (const s of dataServices) {
            const key = getCategoryFilterKey(s)
            if (!byKey.has(key)) {
                byKey.set(key, {
                    value: key,
                    label: getCategoryFilterLabel(s),
                })
            }
        }
        const rest = [...byKey.entries()]
            .filter(([k]) => k !== 'todos')
            .sort((a, b) =>
                a[1].label.localeCompare(b[1].label, 'es', {
                    sensitivity: 'base',
                }),
            )
            .map(([, v]) => v)
        return [byKey.get('todos')!, ...rest]
    }, [dataServices])

    useEffect(() => {
        if (categoryFilter === 'todos') return
        const ok = categoryFilterOptions.some((o) => o.value === categoryFilter)
        if (!ok) setCategoryFilter('todos')
    }, [categoryFilterOptions, categoryFilter])

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

    const applyFilters = () => {
        const filters: ColumnFiltersState = []
        if (statusFilter !== 'todos') {
            filters.push({
                id: 'estatus',
                value: statusFilter === 'activo' ? true : false,
            })
        }
        if (categoryFilter !== 'todos') {
            filters.push({
                id: 'categoria',
                value: categoryFilter,
            })
        }
        setFiltering(filters)
    }

    // Aplicar filtros de estado y categoría cuando cambien
    useEffect(() => {
        applyFilters()
    }, [statusFilter, categoryFilter])

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

    const openServiceReviews = (service: Service) => {
        setSelectedService(service)
        setSelectedServiceReviews(service.latest_reviews || [])
        setReviewsModalIsOpen(true)
    }

    const handleReviewsModalClose = () => {
        setReviewsModalIsOpen(false)
        setSelectedServiceReviews([])
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
            header: 'Negocio',
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
            filterFn: (row, _columnId, filterValue) => {
                if (!filterValue || filterValue === 'todos') return true
                return getCategoryFilterKey(row.original) === filterValue
            },
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
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue === 'todos') return true
                const typeService = (row.getValue(columnId) as string) || 'local'
                if (filterValue === 'local') return typeService === 'local'
                if (filterValue === 'domicilio') return typeService !== 'local'
                return true
            },
            cell: ({ row }) => {
                const service = row.original
                return getTypeServiceIcon(service.typeService || 'local')
            },
        },
        {
            header: 'Estado',
            accessorKey: 'estatus',
            filterFn: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId)
                return Boolean(cellValue) === Boolean(filterValue)
            },
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
                        <Button
                            size="sm"
                            variant="solid"
                            onClick={() => openServiceReviews(service)}
                            className="flex items-center gap-1"
                        >
                            Ver reseñas
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
            return serviceSearchableText(row.original).includes(term)
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

    const statusFilterOption =
        STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter) ??
        STATUS_FILTER_OPTIONS[0]
    const categoryFilterOption =
        categoryFilterOptions.find((o) => o.value === categoryFilter) ??
        categoryFilterOptions[0]

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-[#000B7E]">
                        Servicios de Negocios
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
                <div className="flex flex-wrap justify-end items-end gap-3">
                    <div className="flex min-w-[10.5rem] max-w-[13rem] shrink-0 flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Estado
                        </span>
                        <Select<FilterSelectOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[10.5rem]"
                            options={STATUS_FILTER_OPTIONS}
                            value={statusFilterOption}
                            onChange={(opt) =>
                                setStatusFilter(opt?.value ?? 'todos')
                            }
                            placeholder="Estado"
                        />
                    </div>
                    <div className="flex min-w-[11rem] max-w-[18rem] shrink-0 flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Categoría
                        </span>
                        <Select<FilterSelectOption, false>
                            size="sm"
                            isSearchable={categoryFilterOptions.length > 8}
                            className="min-w-[11rem]"
                            options={categoryFilterOptions}
                            value={categoryFilterOption}
                            onChange={(opt) =>
                                setCategoryFilter(opt?.value ?? 'todos')
                            }
                            placeholder="Categoría"
                        />
                    </div>
                    <div className="w-full min-w-[12rem] max-w-sm shrink-0 sm:w-80">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            Buscar en la tabla
                        </span>
                        <div className="relative">
                            <input
                                id="filter-buscar"
                                type="text"
                                placeholder="Nombre, negocio, categoría, precio, garantía, ids…"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
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
                                            <span className="font-medium text-gray-700">Negocio:</span>
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

            <Dialog
                isOpen={reviewsModalIsOpen}
                onClose={handleReviewsModalClose}
                onRequestClose={handleReviewsModalClose}
                width={800}
            >
                <div className="p-2">
                    <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                        <h5 className="text-gray-900">Reseñas del servicio</h5>
                        <p className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Servicio:</span>{' '}
                            {selectedService?.nombre_servicio || 'Sin servicio'}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Promedio:</span>{' '}
                            {(selectedService?.puntuacion || 0).toFixed(1)}
                        </p>
                    </div>

                    <div className="mt-4 space-y-3">
                        {selectedServiceReviews.length ? (
                            selectedServiceReviews.map((review, idx) => (
                                <div
                                    key={`${selectedService?.id || 'service'}-${idx}`}
                                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {review.usuario_nombre}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {selectedService?.nombre_servicio}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                            {review.fecha_texto}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs font-medium text-blue-800">
                                            Puntuación: {review.puntuacion}
                                        </span>
                                        <FaStar className="text-amber-400" />
                                    </div>
                                    <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                                        {review.comentario}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Este servicio aún no tiene reseñas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ServicesList
