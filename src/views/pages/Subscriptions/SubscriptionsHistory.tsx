import { useEffect, useMemo, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { FaRegEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    Timestamp,
    getDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import {
    collectActiveTallerDocIdsFromUsersSnapshot,
    subscriptionIsFromActiveTaller,
} from '@/utils/activeTallerSubscriptionGuards'
import { getSubscriptionPlanName } from '@/utils/subscriptionPlanLabel'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { Dialog, Drawer } from '@/components/ui'
import { exportStyledExcel } from '@/utils/excelExport'

type Subscriptions = {
    nombre?: string
    taller_uid?: string
    status?: string
    cantidad_servicios?: string
    fecha_inicio: Timestamp
    fecha_fin: Timestamp
    vigencia: string
    monto?: string
    uid: string
    id: string
    nombre_taller: string
    /** Se completa al cargar desde Firestore junto con `nombre_taller`. */
    correo_taller?: string
    ciudad_taller?: string
    comprobante_pago?: {
        monto?: number
        metodo?: string
        banco?: string
        cedula?: number
        receiptFile?: string
        numReferencia?: string
        telefono?: number
        fechaPago?: Timestamp
        correo?: string
        bancoOrigen?: string
        bancoDestino?: string
    }
}

function firestoreTimestampMs(value: unknown): number {
    if (value == null) return 0
    if (value instanceof Timestamp) return value.toMillis()
    if (
        typeof value === 'object' &&
        value !== null &&
        'seconds' in value &&
        typeof (value as { seconds: unknown }).seconds === 'number'
    ) {
        return (value as { seconds: number }).seconds * 1000
    }
    return 0
}

/** Fecha más reciente asociada al registro (útil para listar el histórico de más nuevo a más viejo). */
function subscriptionRecencyMs(row: Subscriptions): number {
    const raw = row as unknown as Record<string, unknown>
    return Math.max(
        firestoreTimestampMs(raw.fechaCreacion),
        firestoreTimestampMs(raw.fecha_creacion),
        firestoreTimestampMs(row.fecha_inicio),
        firestoreTimestampMs(row.fecha_fin),
        firestoreTimestampMs(row.comprobante_pago?.fechaPago),
    )
}

type StatusFilterOption = { value: string; label: string }
type MethodFilterOption = { value: string; label: string }
type CityFilterOption = { value: string; label: string }

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'Aprobado', label: 'Aprobados' },
    { value: 'Por Aprobar', label: 'Por aprobar' },
]

const ALL_METHODS_OPTION: MethodFilterOption = {
    value: '',
    label: 'Todos los métodos',
}

const ALL_CITIES_OPTION: CityFilterOption = {
    value: '',
    label: 'Todas las ciudades',
}

type PlanFiltroHistorico = 'todos' | 'gratis' | 'oro' | 'plata' | 'bronce'

type PlanFilterOption = { value: PlanFiltroHistorico; label: string }

const PLAN_FILTER_OPTIONS: PlanFilterOption[] = [
    { value: 'todos', label: 'Todos los planes' },
    { value: 'gratis', label: 'Gratis' },
    { value: 'bronce', label: 'Bronce' },
    { value: 'plata', label: 'Plata' },
    { value: 'oro', label: 'Oro' },
]

const PLAN_FILTRO_KEYS: Record<
    Exclude<PlanFiltroHistorico, 'todos'>,
    string
> = {
    gratis: 'GRATIS',
    oro: 'Plan Oro',
    plata: 'Plan Plata',
    bronce: 'Plan Bronce',
}

const normalizePlanLabel = (s: string) =>
    s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')

const subscriptionRowMatchesPlanFilter = (
    row: Subscriptions,
    filtro: PlanFiltroHistorico,
): boolean => {
    if (filtro === 'todos') {
        return true
    }
    const label = getSubscriptionPlanName(row as unknown as Record<string, unknown>)
    const n = normalizePlanLabel(label)
    if (filtro === 'gratis') {
        return (
            n === 'gratis' ||
            n.includes('gratis') ||
            label.trim().toUpperCase() === 'GRATIS'
        )
    }
    const target = normalizePlanLabel(PLAN_FILTRO_KEYS[filtro])
    return n === target
}

function formatTsForSearch(ts: unknown): string {
    if (!ts) return ''
    if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }
    return String(ts)
}

function subscriptionSearchableText(row: Subscriptions): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        row.nombre,
        row.nombre_taller,
        row.correo_taller,
        row.ciudad_taller,
        row.taller_uid,
        row.status,
        row.cantidad_servicios,
        row.monto,
        row.vigencia,
        row.uid,
        row.id,
    )
    parts.push(formatTsForSearch(row.fecha_inicio), formatTsForSearch(row.fecha_fin))
    const c = row.comprobante_pago
    if (c) {
        push(
            c.metodo,
            c.banco,
            c.correo,
            c.numReferencia,
            c.receiptFile,
            c.bancoOrigen,
            c.bancoDestino,
        )
        if (c.monto !== undefined && c.monto !== null) push(String(c.monto))
        if (c.cedula !== undefined && c.cedula !== null) push(String(c.cedula))
        if (c.telefono !== undefined && c.telefono !== null)
            push(String(c.telefono))
        parts.push(formatTsForSearch(c.fechaPago))
    }
    return parts.join(' ').toLowerCase()
}

type SubscriptionsHistoryProps = {
    exportSignal?: number
    refreshSignal?: number
    searchTerm?: string
}

const SubscriptionsHistory = ({
    exportSignal = 0,
    refreshSignal = 0,
    searchTerm = '',
}: SubscriptionsHistoryProps) => {
    const [dataSubs, setDataSubs] = useState<Subscriptions[]>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [selectedMethod, setSelectedMethod] = useState<string>('')
    const [selectedCity, setSelectedCity] = useState<string>('')
    const [selectedPlan, setSelectedPlan] =
        useState<PlanFiltroHistorico>('todos')
    const [selectedPerson, setSelectedPerson] = useState<Subscriptions | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [paymentDateRange, setPaymentDateRange] =
        useState<DatePickerRangeValue>([null, null])
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const getData = async () => {
        const q = query(collection(db, 'Subscripciones'))
        const [usersSnap, querySnapshot] = await Promise.all([
            getDocs(collection(db, 'Usuarios')),
            getDocs(q),
        ])
        const activeTallerIds =
            collectActiveTallerDocIdsFromUsersSnapshot(usersSnap)

        const promises = querySnapshot.docs.map(async (docSnap) => {
            const subsData = docSnap.data() as Subscriptions

            let nombre_taller = 'Negocio no encontrado'
            let correo_taller = 'Correo no encontrado'
            let ciudad_taller = 'Sin ciudad'
            if (subsData.taller_uid) {
                const tallerDoc = await getDoc(
                    doc(db, 'Usuarios', subsData.taller_uid),
                )
                if (tallerDoc.exists()) {
                    const tallerData = tallerDoc.data()
                    nombre_taller = tallerData.nombre || 'Negocio no encontrado'
                    correo_taller = tallerData.email || 'Correo no encontrado'
                    ciudad_taller =
                        tallerData.ciudad ||
                        (Array.isArray(tallerData.estado)
                            ? tallerData.estado[0]
                            : tallerData.estado) ||
                        'Sin ciudad'
                }
            }

            return {
                ...subsData,
                uid: docSnap.id,
                nombre_taller,
                correo_taller,
                ciudad_taller,
            }
        })

        const resolvedSubcripciones = await Promise.all(promises)
        const deTalleresActivos = resolvedSubcripciones.filter((sub) =>
            subscriptionIsFromActiveTaller(
                sub as unknown as Record<string, unknown>,
                activeTallerIds,
            ),
        )
        const ordenados = deTalleresActivos.slice().sort((a, b) => {
            const mb = subscriptionRecencyMs(b)
            const ma = subscriptionRecencyMs(a)
            if (mb !== ma) return mb - ma
            return (b.uid || '').localeCompare(a.uid || '')
        })
        //console.log('Data de suscripciones:', resolvedSubcripciones) // Agrega este console.log
        setDataSubs(ordenados)
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (refreshSignal > 0) {
            void getData()
            toast.push(
                <Notification title="Datos actualizados">
                    La tabla ha sido actualizada con éxito.
                </Notification>,
            )
        }
    }, [refreshSignal])

    useEffect(() => {
        if (exportSignal > 0) {
            setIsOpen(true)
        }
    }, [exportSignal])

    const handleCloseDialog = () => {
        setIsOpen(false)
        setStartDate('')
        setEndDate('')
    }

    const openDrawer = (person: Subscriptions) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true)
    }

    const formatDate = (timestamp: unknown): string => {
        if (timestamp instanceof Timestamp) {
            const dateObj = timestamp.toDate()
            return dateObj.toLocaleDateString('es-ES')
        }
        return '-'
    }

    const { Tr, Th, Td, THead, TBody } = Table

    const handleDrawerClose = () => {
        setDrawerIsOpen(false)
        setSelectedPerson(null)
    }

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleExportToExcel = async () => {
        if (!startDate || !endDate) {
            toast.push(
                <Notification title="Fechas incompletas">
                    Por favor, selecciona ambas fechas para continuar.
                </Notification>,
            )
            return
        }

        // Ajustar fecha de inicio al principio del día en UTC
        const adjustedStartDate = new Date(startDate)
        adjustedStartDate.setUTCHours(0, 0, 0, 0)

        // Ajustar fecha de fin al final del día en UTC
        const adjustedEndDate = new Date(endDate)
        adjustedEndDate.setUTCHours(23, 59, 59, 999)

        console.log({
            startDate: adjustedStartDate,
            endDate: adjustedEndDate,
        })

        // Filtrar los datos para las fechas dentro del rango
        const filteredData = dataSubs
            .filter((row) => {
            // Convertir `fecha_inicio` a Date si es un Timestamp
            const fechaInicio =
                row.fecha_inicio instanceof Timestamp
                    ? row.fecha_inicio.toDate() // Si es Timestamp, convertir a Date
                    : new Date(row.fecha_inicio) // Si ya es Date, dejarlo como está

            // Asegurarse de que `fechaInicio` sea una fecha válida
            if (
                !(fechaInicio instanceof Date) ||
                isNaN(fechaInicio.getTime())
            ) {
                return false // Si no es una fecha válida, no lo incluimos
            }

            console.log(
                'Fecha Inicio:',
                fechaInicio,
                'Inicio Range:',
                adjustedStartDate,
                'End Range:',
                adjustedEndDate,
            )

            // Comparar las fechas
            return (
                fechaInicio.getTime() >= adjustedStartDate.getTime() && // Fecha dentro del rango de inicio
                fechaInicio.getTime() <= adjustedEndDate.getTime() // Fecha dentro del rango de fin
            )
        })
            .slice()
            .sort((a, b) => {
                const mb = subscriptionRecencyMs(b)
                const ma = subscriptionRecencyMs(a)
                if (mb !== ma) return mb - ma
                return (b.uid || '').localeCompare(a.uid || '')
            })

        if (filteredData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles en el rango de fechas seleccionado.
                </Notification>,
            )
            return
        }

        const tableData = filteredData.map((row) => {
            const montoNum = Number(row.monto ?? 0)
            return {
                nombreCliente: row.nombre ?? '',
                nombreNegocio: row.nombre_taller ?? '',
                correoNegocio: row.correo_taller ?? '',
                cantidadServicios: String(row.cantidad_servicios ?? ''),
                montoTotal:
                    Number.isNaN(montoNum) || montoNum < 0.0001
                        ? 'GRATIS'
                        : String(row.monto ?? ''),
                fechaInicio:
                    row.fecha_inicio instanceof Timestamp
                        ? row.fecha_inicio.toDate().toISOString().split('T')[0]
                        : String(row.fecha_inicio ?? ''),
                fechaFin:
                    row.fecha_fin instanceof Timestamp
                        ? row.fecha_fin.toDate().toISOString().split('T')[0]
                        : String(row.fecha_fin ?? ''),
                estado: row.status ?? '',
                metodoComprobante: row.comprobante_pago?.metodo || '',
                bancoOrigen: row.comprobante_pago?.bancoOrigen || '',
                bancoDestino: row.comprobante_pago?.bancoDestino || '',
                cedulaComprobante: String(row.comprobante_pago?.cedula ?? ''),
                telefonoComprobante: String(row.comprobante_pago?.telefono ?? ''),
                montoComprobante: String(row.comprobante_pago?.monto ?? ''),
                recibo: row.comprobante_pago?.receiptFile || '',
                numeroReferencia: row.comprobante_pago?.numReferencia || '',
                fechaPago: row.comprobante_pago?.fechaPago
                    ? formatDate(row.comprobante_pago.fechaPago)
                    : '-',
                correoComprobante: row.comprobante_pago?.correo || '',
            }
        })

        await exportStyledExcel({
            rows: tableData,
            columns: [
                { header: 'Nombre Cliente', key: 'nombreCliente' },
                { header: 'Nombre Negocio', key: 'nombreNegocio' },
                {
                    header: 'Correo Negocio',
                    key: 'correoNegocio',
                    linkType: 'email',
                },
                { header: 'Cantidad de Servicios', key: 'cantidadServicios' },
                { header: 'Monto Total', key: 'montoTotal' },
                { header: 'Fecha de Inicio', key: 'fechaInicio' },
                { header: 'Fecha de Fin', key: 'fechaFin' },
                { header: 'Estado', key: 'estado' },
                { header: 'Método Comprobante', key: 'metodoComprobante' },
                { header: 'Banco Origen', key: 'bancoOrigen' },
                { header: 'Banco Destino', key: 'bancoDestino' },
                { header: 'Cédula', key: 'cedulaComprobante' },
                { header: 'Teléfono Comprobante', key: 'telefonoComprobante' },
                { header: 'Monto', key: 'montoComprobante' },
                { header: 'Recibo', key: 'recibo', linkType: 'url' },
                { header: 'Número Referencia', key: 'numeroReferencia' },
                { header: 'Fecha Pago', key: 'fechaPago' },
                {
                    header: 'Correo Comprobante',
                    key: 'correoComprobante',
                    linkType: 'email',
                },
            ],
            sheetName: 'Subscripciones',
            fileName: 'subscripciones.xlsx',
        })

        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        )
        handleCloseDialog()
    }

    const columns: ColumnDef<Subscriptions>[] = [
        {
            header: 'Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Negocio Subscrito',
            accessorKey: 'nombre_taller',
        },
        {
            header: 'Correo Negocio',
            accessorKey: 'correo_taller',
        },
        {
            header: 'Ciudad',
            accessorKey: 'ciudad_taller',
            cell: ({ row }) => row.original.ciudad_taller ?? '-',
        },
        {
            header: 'Cantidad de Servicios',
            accessorKey: 'cantidad_servicios',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
            cell: ({ row }) => {
                const monto = row.getValue('monto') as string | number | undefined
                
                if (!monto) {
                    return <span>-</span>
                }
                
                // Convertir a número si es string
                const montoNum = typeof monto === 'string' ? parseFloat(monto) : monto
                
                // Verificar si es un plan gratuito (monto muy pequeño, como 1e-16 o 0)
                if (isNaN(montoNum) || montoNum < 0.0001) {
                    return <span className="font-semibold text-green-600">GRATIS</span>
                }
                
                // Formatear el monto con separador de miles
                return <span>${montoNum.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            },
        },
        {
            header: 'Fecha de reporte de pago',
            accessorKey: 'fecha_inicio',
            cell: ({ row }) => {
                const fechaPago = row.original.comprobante_pago?.fechaPago
                return fechaPago ? formatDate(fechaPago) : '-'
            },
        },
        {
            header: 'Vigente Hasta',
            accessorKey: 'fecha_fin',
            cell: ({ row }) => {
                const fechaFin = row.original.fecha_fin
                return fechaFin ? formatDate(fechaFin) : '-'
            },
        },
        {
            header: 'Estado Subscripción',
            accessorKey: 'status',
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true
                return row.getValue(columnId) === filterValue
            },
            cell: ({ row }) => {
                const fechaFin = row.original.fecha_fin as
                    | Timestamp
                    | Date
                    | string
                    | number
                    | undefined
                    | null

                // Verificar si la fecha de vigencia ya pasó
                let isVencido = false
                if (fechaFin) {
                    const fechaFinDate =
                        fechaFin instanceof Timestamp
                            ? fechaFin.toDate()
                            : fechaFin instanceof Date
                              ? fechaFin
                              : new Date(fechaFin)
                    const fechaActual = new Date()
                    // Comparar solo fechas (sin horas)
                    fechaActual.setHours(0, 0, 0, 0)
                    fechaFinDate.setHours(0, 0, 0, 0)
                    isVencido = fechaFinDate < fechaActual
                }

                // Si está vencido, mostrar "Vencido" en rojo
                if (isVencido) {
                    return (
                        <div className="flex items-center text-red-500">
                            <FaTimesCircle className="text-red-500 mr-1" />
                            <span>Vencido</span>
                        </div>
                    )
                }

                // Si no está vencido, mostrar "Vigente" en verde
                return (
                    <div className="flex items-center text-green-500">
                        <FaCheckCircle className="text-green-500 mr-1" />
                        <span>Vigente</span>
                    </div>
                )
            },
        },
        {
            header: 'Acciones',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        {person.comprobante_pago && (
                            <button
                                className="text-blue-900 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                                title="Ver detalles del pago (solo consulta)"
                                onClick={() => openDrawer(person)}
                            >
                                <FaRegEye />
                            </button>
                        )}
                    </div>
                )
            },
        },
    ]

    const methodFilterOptions = useMemo<MethodFilterOption[]>(() => {
        const methods = new Set<string>()
        dataSubs.forEach((row) => {
            const method = row.comprobante_pago?.metodo?.trim()
            if (method) methods.add(method)
        })
        return [
            ALL_METHODS_OPTION,
            ...Array.from(methods)
                .sort((a, b) => a.localeCompare(b, 'es'))
                .map((m) => ({ value: m, label: m })),
        ]
    }, [dataSubs])

    const cityFilterOptions = useMemo<CityFilterOption[]>(() => {
        const cities = new Set<string>()
        dataSubs.forEach((row) => {
            const city = row.ciudad_taller?.trim()
            if (city) cities.add(city)
        })
        return [
            ALL_CITIES_OPTION,
            ...Array.from(cities)
                .sort((a, b) => a.localeCompare(b, 'es'))
                .map((c) => ({ value: c, label: c })),
        ]
    }, [dataSubs])

    const filteredSubs = useMemo(() => {
        const [rangeStartRaw, rangeEndRaw] = paymentDateRange
        const rangeStart = rangeStartRaw ? new Date(rangeStartRaw) : null
        const rangeEnd = rangeEndRaw ? new Date(rangeEndRaw) : null
        if (rangeStart) rangeStart.setHours(0, 0, 0, 0)
        if (rangeEnd) rangeEnd.setHours(23, 59, 59, 999)

        return dataSubs.filter((row) => {
            if (!subscriptionRowMatchesPlanFilter(row, selectedPlan)) {
                return false
            }
            if (selectedStatus && row.status !== selectedStatus) return false
            if (selectedMethod && row.comprobante_pago?.metodo !== selectedMethod)
                return false
            if (selectedCity && row.ciudad_taller !== selectedCity) return false

            if (rangeStart || rangeEnd) {
                const paymentDate =
                    row.comprobante_pago?.fechaPago instanceof Timestamp
                        ? row.comprobante_pago.fechaPago.toDate()
                        : null
                if (!paymentDate) return false
                if (rangeStart && paymentDate < rangeStart) return false
                if (rangeEnd && paymentDate > rangeEnd) return false
            }
            return true
        })
    }, [
        dataSubs,
        selectedPlan,
        selectedStatus,
        selectedMethod,
        selectedCity,
        paymentDateRange,
    ])

    const table = useReactTable({
        data: filteredSubs,
        columns,
        state: {
            globalFilter: searchTerm,
        },
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            return subscriptionSearchableText(row.original).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const data = table.getRowModel().rows
    const totalRows = data.length

    const statusFilterOption =
        STATUS_FILTER_OPTIONS.find((o) => o.value === selectedStatus) ??
        STATUS_FILTER_OPTIONS[0]
    const methodFilterOption =
        methodFilterOptions.find((o) => o.value === selectedMethod) ??
        methodFilterOptions[0]
    const cityFilterOption =
        cityFilterOptions.find((o) => o.value === selectedCity) ??
        cityFilterOptions[0]
    const planFilterOption =
        PLAN_FILTER_OPTIONS.find((o) => o.value === selectedPlan) ??
        PLAN_FILTER_OPTIONS[0]

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-nowrap items-end gap-3 overflow-x-auto pb-1">
                    <div className="w-[12rem] shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                            Estado de la suscripción
                        </span>
                        <Select<StatusFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[12rem]"
                            options={STATUS_FILTER_OPTIONS}
                            value={statusFilterOption}
                            placeholder="Estado"
                            onChange={(opt) => {
                                setSelectedStatus(opt?.value ?? '')
                            }}
                        />
                    </div>
                    <div className="w-[12rem] shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                            Método de pago
                        </span>
                        <Select<MethodFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[12rem]"
                            options={methodFilterOptions}
                            value={methodFilterOption}
                            placeholder="Método"
                            onChange={(opt) => setSelectedMethod(opt?.value ?? '')}
                        />
                    </div>
                    <div className="w-[12rem] shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                            Ciudad
                        </span>
                        <Select<CityFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[12rem]"
                            options={cityFilterOptions}
                            value={cityFilterOption}
                            placeholder="Ciudad"
                            onChange={(opt) => setSelectedCity(opt?.value ?? '')}
                        />
                    </div>
                    <div className="w-[15rem] shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                            Fecha de reporte
                        </span>
                        <DatePicker.DatePickerRange
                            clearable
                            className="w-full"
                            inputFormat="DD/MM/YYYY"
                            placeholder="Desde — hasta"
                            separator=" — "
                            size="sm"
                            value={paymentDateRange}
                            onChange={setPaymentDateRange}
                        />
                    </div>
                    <div className="w-[12rem] shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                            Plan
                        </span>
                        <Select<PlanFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[12rem]"
                            options={PLAN_FILTER_OPTIONS}
                            value={planFilterOption}
                            placeholder="Plan"
                            onChange={(opt) => {
                                setSelectedPlan(opt?.value ?? 'todos')
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="p-1 rounded-lg shadow">
                <Table className="w-full  rounded-lg">
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
                        {data.slice(startIndex, endIndex).map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
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
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                    onChange={onPaginationChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            </div>
            <Drawer
                isOpen={drawerIsOpen}
                className="rounded-md shadow"
                onClose={handleDrawerClose}
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Detalles del pago
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Solo consulta — no se pueden aprobar ni rechazar pagos desde aquí.
                    </p>
                    {selectedPerson?.status && (
                        <p className="text-sm font-medium text-gray-700 mt-2">
                            Estado: <span className="capitalize">{selectedPerson.status}</span>
                        </p>
                    )}
                </div>
                <div className="flex flex-col space-y-6">
                    {' '}
                    {selectedPerson?.comprobante_pago.metodo && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Metodo de Pago:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={selectedPerson.comprobante_pago.metodo}
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.fechaPago && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Fecha de Pago:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago
                                        .fechaPago instanceof Timestamp
                                        ? // Si es un Timestamp de Firebase, usar .toDate() para convertirlo a un objeto Date
                                        new Date(
                                            selectedPerson.comprobante_pago.fechaPago.toDate(),
                                        ).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : // Si es un string ISO, lo convertimos a Date y usamos toLocaleDateString
                                        new Date(
                                            selectedPerson.comprobante_pago.fechaPago,
                                        ).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.bancoOrigen && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Banco Origen:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.bancoOrigen
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.bancoDestino && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Banco Destino:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.bancoDestino
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.correo && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Correo:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={selectedPerson.comprobante_pago.correo}
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.cedula !== undefined &&
                        selectedPerson.comprobante_pago.cedula !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Cédula:
                                </span>
                                <input
                                    readOnly
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.cedula
                                    }
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.telefono !== undefined &&
                        selectedPerson.comprobante_pago.telefono !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Telefono:
                                </span>
                                <input
                                    readOnly
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.telefono
                                    }
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.monto !== undefined &&
                        selectedPerson.comprobante_pago.monto !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Monto:
                                </span>
                                <input
                                    readOnly
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.monto
                                    }
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.numReferencia && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Numero de referencia:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago
                                        .numReferencia
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.receiptFile && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Comprobante de pago:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.receiptFile
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                </div>
            </Drawer>
            <Dialog isOpen={dialogIsOpen} onClose={handleCloseDialog}>
                <div className="p-4">
                    <h3 className="text-lg font-bold">
                        Seleccionar Rango de Fechas
                    </h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label
                                htmlFor="startDate"
                                className="block text-sm"
                            >
                                Desde:
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                className="w-full border border-gray-300 rounded-md p-2"
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm">
                                Hasta:
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                className="w-full border border-gray-300 rounded-md p-2"
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button
                            className="text-white hover:opacity-80"
                            style={{ backgroundColor: '#10B981' }}
                            onClick={handleExportToExcel}
                        >
                            Exportar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default SubscriptionsHistory
