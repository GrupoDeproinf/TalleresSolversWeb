import { useEffect, useMemo, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    HiOutlineEye,
    HiOutlineMinus,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineLocationMarker,
} from 'react-icons/hi'
import { FaCamera } from 'react-icons/fa'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, ColumnSort } from '@tanstack/react-table'
import {
    collection,
    documentId,
    getDocs,
    query,
    Timestamp,
    where,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { exportStyledExcel } from '@/utils/excelExport'
import dayjs from 'dayjs'
import DatePicker from '@/components/ui/DatePicker'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
import Tooltip from '@/components/ui/Tooltip'

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
    categoriaId?: string
    descripcion: string
    fecha_solicitud?: Timestamp
    /** Algunos documentos usan nombre_servicio, otros nombre_solicitud */
    nombre_servicio?: string
    nombre_solicitud?: string
    nombre_usuario: string
    phone_usuario: string
    solicitud_images?: string[]
    uid_usuario: string
    urgencia: string
    vehiculo?: Vehiculo
    /** Estado del ciclo de la solicitud (p. ej. Cancelado) */
    status?: string
    latitude?: number
    longitude?: number
    uid_taller?: string
    /** Ciudad u otra ubicación si viene en el documento */
    ciudad?: string
    /** A veces el estado (entidad) se guarda como ubicación */
    estado?: string
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

function firestoreKeyLabel(key: string): string {
    if (key === 'id') return 'ID documento'
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function isPlainTimestampLike(
    v: unknown,
): v is { seconds: number; nanoseconds?: number } {
    return (
        typeof v === 'object' &&
        v !== null &&
        'seconds' in v &&
        typeof (v as { seconds: unknown }).seconds === 'number'
    )
}

/** Texto para valores crudos de Firestore en el detalle del modal. */
function formatValorDetalleFirestore(v: unknown): string {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'boolean') return v ? 'Sí' : 'No'
    if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '—'
    if (typeof v === 'string') return v.trim() || '—'
    if (v instanceof Timestamp) return formatFecha(v)
    if (typeof v === 'object' && v !== null && 'toDate' in v) {
        try {
            return formatFecha(v as Timestamp)
        } catch {
            /* continuar */
        }
    }
    if (isPlainTimestampLike(v)) {
        try {
            const ns =
                typeof v.nanoseconds === 'number' ? v.nanoseconds : 0
            return formatFecha(new Timestamp(v.seconds, ns))
        } catch {
            return '—'
        }
    }
    if (Array.isArray(v)) {
        if (v.length === 0) return '—'
        if (v.every((x) => x === null || ['string', 'number', 'boolean'].includes(typeof x))) {
            return v.map((x) => (x === null || x === undefined ? '—' : String(x))).join(', ')
        }
        try {
            return JSON.stringify(v, null, 2)
        } catch {
            return String(v)
        }
    }
    if (typeof v === 'object') {
        try {
            return JSON.stringify(v, null, 2)
        } catch {
            return String(v)
        }
    }
    return String(v)
}

function entriesSorted(obj: Record<string, unknown>): [string, unknown][] {
    return Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, obj[k]] as [string, unknown])
}

function solicitudDetalleEntriesSinVehiculo(s: Solicitud): [string, unknown][] {
    const o = { ...(s as unknown as Record<string, unknown>) }
    delete o.vehiculo
    delete o.solicitud_images
    delete o.descripcion
    return entriesSorted(o)
}

function vehiculoDetalleEntries(v: Vehiculo | undefined): [string, unknown][] {
    if (!v || typeof v !== 'object') return []
    return entriesSorted(v as unknown as Record<string, unknown>)
}

function ValorDetalleCell({ value }: { value: unknown }) {
    const text = formatValorDetalleFirestore(value)
    const isLong = text.length > 160 || text.includes('\n')
    if (isLong) {
        return (
            <pre className="mt-0 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-gray-100 px-2 py-1.5 font-mono text-xs text-gray-800">
                {text}
            </pre>
        )
    }
    return <span className="break-words">{text}</span>
}

function DetalleFilasFirestore({
    entries,
    className,
}: {
    entries: [string, unknown][]
    className?: string
}) {
    if (entries.length === 0) {
        return (
            <p className="text-sm text-gray-500 italic">
                Sin campos en este registro.
            </p>
        )
    }
    return (
        <div
            className={`divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white ${className ?? ''}`}
        >
            {entries.map(([key, val]) => (
                <div
                    key={key}
                    className="grid grid-cols-1 gap-1 px-3 py-2.5 sm:grid-cols-[minmax(7rem,0.95fr)_2fr] sm:items-start sm:gap-4"
                >
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        {firestoreKeyLabel(key)}
                    </dt>
                    <dd className="min-w-0 text-sm text-gray-900">
                        <ValorDetalleCell value={val} />
                    </dd>
                </div>
            ))}
        </div>
    )
}

function solicitudFechaMs(s: Solicitud): number {
    const ts = s.fecha_solicitud
    if (!ts) return 0
    if (ts instanceof Timestamp) return ts.toMillis()
    if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
        return (ts as { seconds: number }).seconds * 1000
    }
    return 0
}

function creationRangeToYmd(range: DatePickerRangeValue): {
    from: string
    to: string
} {
    const [start, end] = range
    return {
        from: start ? dayjs(start).format('YYYY-MM-DD') : '',
        to: end ? dayjs(end).format('YYYY-MM-DD') : '',
    }
}

function solicitudMatchesFechaYmd(
    s: Solicitud,
    fromYmd: string,
    toYmd: string,
): boolean {
    if (!fromYmd && !toYmd) return true
    const timestampNumber = solicitudFechaMs(s)
    if (!timestampNumber) return false

    const fromDate = fromYmd ? new Date(fromYmd + 'T00:00:00') : null
    const toDate = toYmd ? new Date(toYmd + 'T23:59:59.999') : null

    if (fromDate && !toDate) {
        return timestampNumber >= fromDate.getTime()
    }
    if (!fromDate && toDate) {
        return timestampNumber <= toDate.getTime()
    }
    if (fromDate && toDate) {
        const a = fromDate.getTime()
        const b = toDate.getTime()
        return timestampNumber >= a && timestampNumber <= b
    }
    return true
}

function getPropuestaStatusBucket(
    status: string | undefined,
): 'accepted' | 'rejected' | 'pending' | 'expired' | 'cancelled' {
    const normalized = String(status || '').toLowerCase()
    if (normalized.includes('cancel')) return 'cancelled'
    if (normalized.includes('acept')) return 'accepted'
    if (normalized.includes('rechaz')) return 'rejected'
    if (normalized.includes('expir')) return 'expired'
    return 'pending'
}

function propuestaStatusPillClass(status: string | undefined): string {
    const b = getPropuestaStatusBucket(status)
    if (b === 'accepted') return 'bg-emerald-100 text-emerald-800'
    if (b === 'rejected') return 'bg-red-100 text-red-800'
    if (b === 'expired') return 'bg-slate-200 text-slate-800'
    if (b === 'cancelled') return 'bg-zinc-200 text-zinc-800'
    return 'bg-amber-100 text-amber-900'
}

type PropuestaAgg = {
    count: number
    hasAccepted: boolean
    hasRejected: boolean
    hasPending: boolean
    hasExpired: boolean
    hasCancelled: boolean
}

function buildPropuestaAggMap(propuestas: Propuesta[]): Map<string, PropuestaAgg> {
    const map = new Map<string, PropuestaAgg>()
    for (const p of propuestas) {
        const sid = p.uid_solicitud
        if (!sid) continue
        let agg = map.get(sid)
        if (!agg) {
            agg = {
                count: 0,
                hasAccepted: false,
                hasRejected: false,
                hasPending: false,
                hasExpired: false,
                hasCancelled: false,
            }
            map.set(sid, agg)
        }
        agg.count += 1
        const b = getPropuestaStatusBucket(p.status)
        if (b === 'accepted') agg.hasAccepted = true
        else if (b === 'rejected') agg.hasRejected = true
        else if (b === 'expired') agg.hasExpired = true
        else if (b === 'cancelled') agg.hasCancelled = true
        else agg.hasPending = true
    }
    return map
}

function propuestaAggSummary(agg: PropuestaAgg | undefined): string {
    if (!agg || agg.count === 0) return 'Sin propuestas'
    const parts: string[] = []
    if (agg.hasAccepted) parts.push('Aceptada(s)')
    if (agg.hasRejected) parts.push('Rechazada(s)')
    if (agg.hasPending) parts.push('Pendiente(s)')
    if (agg.hasExpired) parts.push('Expirada(s)')
    if (agg.hasCancelled) parts.push('Cancelada(s)')
    return parts.join(', ')
}

/** Texto mostrado como nombre del pedido (Firestore: nombre_solicitud o nombre_servicio). */
function servicioNombreSolicitud(s: Solicitud): string {
    const a = String(s.nombre_solicitud ?? '').trim()
    const b = String(s.nombre_servicio ?? '').trim()
    return a || b || '—'
}

function categoriaNombre(
    s: Solicitud,
    categoriaNombrePorId: Record<string, string>,
): string {
    const id = s.categoriaId
    if (!id) return '—'
    return categoriaNombrePorId[id] || id
}

/** Ciudad / estado solo si vienen en el documento de la solicitud (sin lat/lng). */
function solicitudCiudadMostrar(s: Solicitud): string {
    return String(s.ciudad ?? s.estado ?? '').trim()
}

/** Campo `estado` en Usuarios: arreglo de nombres o un solo string. */
function normalizeUsuarioEstadoField(raw: unknown): string[] {
    if (raw == null) return []
    if (Array.isArray(raw)) {
        return raw.map((x) => String(x).trim()).filter(Boolean)
    }
    const one = String(raw).trim()
    return one ? [one] : []
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const out: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size))
    }
    return out
}

/**
 * Ubicación en tabla/filtros: estados desde Usuarios (uid_taller) si hay datos;
 * si no, ciudad/estado del documento Solicitud.
 */
function solicitudUbicacionLabels(
    s: Solicitud,
    estadosDesdeTaller: Record<string, string[]>,
): string[] {
    const desdeTaller = estadosDesdeTaller[s.id]
    if (desdeTaller?.length) return desdeTaller
    const c = solicitudCiudadMostrar(s)
    return c ? [c] : []
}

function urgencyEqualsFilter(urgenciaDoc: string | undefined, filterValue: string): boolean {
    if (filterValue === 'todos') return true
    const a = String(urgenciaDoc ?? '')
        .trim()
        .toLowerCase()
    const b = filterValue.trim().toLowerCase()
    return a === b
}

function solicitudEstadoBadge(status: string | undefined) {
    const st = String(status ?? '').trim() || '—'
    const n = st.toLowerCase()
    let cls = 'bg-gray-100 text-gray-800'
    if (n.includes('cancel')) cls = 'bg-slate-200 text-slate-800'
    else if (
        n.includes('pend') ||
        n.includes('abiert') ||
        n.includes('espera')
    )
        cls = 'bg-amber-100 text-amber-900'
    else if (
        n.includes('complet') ||
        n.includes('cerr') ||
        n.includes('aprob')
    )
        cls = 'bg-emerald-100 text-emerald-900'
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
        >
            {st}
        </span>
    )
}

type UrgenciaFilterOption = { value: string; label: string }

const URGENCY_FILTER_OPTIONS: UrgenciaFilterOption[] = [
    { value: 'todos', label: 'Todas las urgencias' },
    { value: 'Emergencia', label: 'Emergencia' },
    { value: 'Urgente', label: 'Urgente' },
    { value: 'Normal', label: 'Normal' },
]

type RequestHistoryProps = {
    exportSignal?: number
    refreshSignal?: number
    searchTerm?: string
}

const RequestList = ({
    exportSignal = 0,
    refreshSignal = 0,
    searchTerm = '',
}: RequestHistoryProps) => {
    const [dataSolicitudes, setDataSolicitudes] = useState<Solicitud[]>([])
    const [categoriaNombrePorId, setCategoriaNombrePorId] = useState<
        Record<string, string>
    >({})
    /** Estados (entidades) desde Usuarios, vía uid_taller (Solicitudes y Propuestas), por solicitud. */
    const [estadosPorSolicitudId, setEstadosPorSolicitudId] = useState<
        Record<string, string[]>
    >({})
    const [propuestaAggBySolicitud, setPropuestaAggBySolicitud] = useState<
        Map<string, PropuestaAgg>
    >(() => new Map())
    const [urgenciaFilter, setUrgenciaFilter] = useState<string>('todos')
    const [filterCiudad, setFilterCiudad] = useState('')
    const [filterCategoriaId, setFilterCategoriaId] = useState('')
    const [creationDateRange, setCreationDateRange] =
        useState<DatePickerRangeValue>([null, null])
    const [sorting, setSorting] = useState<ColumnSort[]>([
        { id: 'fecha_solicitud', desc: true },
    ])
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
            const [solicitudesSnap, propuestasSnap, categoriasSnap] =
                await Promise.all([
                    getDocs(query(collection(db, 'Solicitudes'))),
                    getDocs(query(collection(db, 'Propuestas'))),
                    getDocs(query(collection(db, 'Categorias'))),
                ])
            const catMap: Record<string, string> = {}
            categoriasSnap.forEach((d) => {
                const data = d.data() as { nombre?: string }
                catMap[d.id] =
                    (data.nombre && String(data.nombre).trim()) || d.id
            })
            const solicitudes = solicitudesSnap.docs.map(
                (docSnap) => ({ ...docSnap.data(), id: docSnap.id }) as Solicitud,
            )
            const propuestas = propuestasSnap.docs.map(
                (docSnap) => ({ ...docSnap.data(), id: docSnap.id }) as Propuesta,
            )

            const tallerUids = [
                ...new Set(
                    [
                        ...propuestas.map((p) =>
                            String(p.uid_taller ?? '').trim(),
                        ),
                        ...solicitudes.map((s) =>
                            String(s.uid_taller ?? '').trim(),
                        ),
                    ].filter(Boolean),
                ),
            ]
            const tallerUidToEstados = new Map<string, string[]>()
            for (const part of chunkArray(tallerUids, 10)) {
                const usuariosSnap = await getDocs(
                    query(
                        collection(db, 'Usuarios'),
                        where(documentId(), 'in', part),
                    ),
                )
                usuariosSnap.forEach((d) => {
                    const est = normalizeUsuarioEstadoField(d.data().estado)
                    if (est.length) tallerUidToEstados.set(d.id, est)
                })
            }

            const estadosPorSolicitud: Record<string, string[]> = {}
            const mergeEstadosEnSolicitud = (
                sid: string,
                arr: string[] | undefined,
            ) => {
                if (!sid || !arr?.length) return
                const prev = estadosPorSolicitud[sid] ?? []
                const merged = [...prev]
                for (const e of arr) {
                    if (!merged.includes(e)) merged.push(e)
                }
                estadosPorSolicitud[sid] = merged
            }
            for (const p of propuestas) {
                const sid = String(p.uid_solicitud ?? '').trim()
                const tid = String(p.uid_taller ?? '').trim()
                if (!sid || !tid) continue
                mergeEstadosEnSolicitud(sid, tallerUidToEstados.get(tid))
            }
            for (const s of solicitudes) {
                const tid = String(s.uid_taller ?? '').trim()
                if (!tid) continue
                mergeEstadosEnSolicitud(s.id, tallerUidToEstados.get(tid))
            }

            setEstadosPorSolicitudId(estadosPorSolicitud)
            setCategoriaNombrePorId(catMap)
            setDataSolicitudes(solicitudes)
            setPropuestaAggBySolicitud(buildPropuestaAggMap(propuestas))
        } catch (error) {
            console.error('Error al cargar solicitudes:', error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const ciudadOptions = useMemo(() => {
        const set = new Set<string>()
        for (const s of dataSolicitudes) {
            for (const label of solicitudUbicacionLabels(
                s,
                estadosPorSolicitudId,
            )) {
                if (label) set.add(label)
            }
        }
        return [...set].sort((a, b) => a.localeCompare(b, 'es'))
    }, [dataSolicitudes, estadosPorSolicitudId])

    type SimpleSelectOpt = { value: string; label: string }

    const ciudadSelectOptions = useMemo<SimpleSelectOpt[]>(
        () => [
            { value: '', label: 'Todas las ciudades' },
            ...ciudadOptions.map((c) => ({ value: c, label: c })),
        ],
        [ciudadOptions],
    )

    const categoriaFilterSelectOptions = useMemo<SimpleSelectOpt[]>(() => {
        const ids = new Set<string>()
        for (const s of dataSolicitudes) {
            if (s.categoriaId) ids.add(s.categoriaId)
        }
        const sorted = [...ids].sort((a, b) => {
            const na = categoriaNombrePorId[a] || a
            const nb = categoriaNombrePorId[b] || b
            return na.localeCompare(nb, 'es')
        })
        return [
            { value: '', label: 'Todas las categorías' },
            ...sorted.map((id) => ({
                value: id,
                label: categoriaNombrePorId[id] || id,
            })),
        ]
    }, [dataSolicitudes, categoriaNombrePorId])

    const solicitudesTrasFiltrosToolbar = useMemo(() => {
        const { from: fechaFromYmd, to: fechaToYmd } =
            creationRangeToYmd(creationDateRange)
        return dataSolicitudes.filter((s) => {
            if (filterCiudad) {
                const labels = solicitudUbicacionLabels(
                    s,
                    estadosPorSolicitudId,
                )
                if (!labels.includes(filterCiudad)) return false
            }
            if (
                filterCategoriaId &&
                String(s.categoriaId ?? '') !== filterCategoriaId
            ) {
                return false
            }
            if (!urgencyEqualsFilter(s.urgencia, urgenciaFilter)) {
                return false
            }
            if (!solicitudMatchesFechaYmd(s, fechaFromYmd, fechaToYmd)) {
                return false
            }
            return true
        })
    }, [
        dataSolicitudes,
        filterCiudad,
        filterCategoriaId,
        urgenciaFilter,
        creationDateRange,
        estadosPorSolicitudId,
    ])

    const solicitudesTrasBusqueda = useMemo(() => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return solicitudesTrasFiltrosToolbar
        return solicitudesTrasFiltrosToolbar.filter((s) => {
            const labels = solicitudUbicacionLabels(s, estadosPorSolicitudId)
            const parts = [
                servicioNombreSolicitud(s),
                categoriaNombre(s, categoriaNombrePorId),
                s.nombre_usuario,
                s.phone_usuario,
                s.urgencia,
                s.descripcion,
                s.status,
                ...labels,
            ]
            return parts
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(term)
        })
    }, [
        searchTerm,
        solicitudesTrasFiltrosToolbar,
        estadosPorSolicitudId,
        categoriaNombrePorId,
    ])

    useEffect(() => {
        if (refreshSignal > 0) {
            void fetchData()
            toast.push(
                <Notification title="Datos actualizados">
                    La tabla ha sido actualizada con éxito.
                </Notification>,
            )
        }
    }, [refreshSignal])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (exportSignal > 0) {
            void handleExportToExcel()
        }
    }, [exportSignal])

    const getUrgenciaBadge = (urgencia: string) => {
        const u = (urgencia || '').trim().toLowerCase()
        if (u.includes('emergencia')) {
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {urgencia}
                </span>
            )
        }
        if (u.includes('urgente')) {
            return (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    {urgencia}
                </span>
            )
        }
        if (u.includes('normal')) {
            return (
                <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900">
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
        const imgs = selectedSolicitud?.solicitud_images
        if (!imgs?.length) return
        setCurrentImageIndex((prev) => {
            const newIndex = Math.max(0, prev - 1)
            const newUrl = imgs[newIndex]
            setImagePopupUrl(newUrl)
            return newIndex
        })
    }

    const handleNextImage = () => {
        const imgs = selectedSolicitud?.solicitud_images
        if (!imgs?.length) return
        const total = imgs.length
        setCurrentImageIndex((prev) => {
            const newIndex = Math.min(total - 1, prev + 1)
            const newUrl = imgs[newIndex]
            setImagePopupUrl(newUrl)
            return newIndex
        })
    }

    const handleExportToExcel = async () => {
        const columns = [
            { header: 'Solicitud / servicio', key: 'servicio' },
            { header: 'Categoría', key: 'categoria' },
            { header: 'Ciudad', key: 'ciudad' },
            { header: 'Estado solicitud', key: 'estadoSolicitud' },
            { header: 'Usuario', key: 'usuario' },
            { header: 'Teléfono', key: 'telefono' },
            { header: 'Urgencia', key: 'urgencia' },
            { header: 'Fecha solicitud', key: 'fechaSolicitud' },
            { header: 'Estado propuestas', key: 'estadoPropuestas' },
            { header: 'Vehículo', key: 'vehiculo' },
            { header: 'Descripción', key: 'descripcion' },
        ]
        const rowsToExport = table.getFilteredRowModel().rows
        const tableData = rowsToExport.map((row) => {
            const r = row.original
            const v = r.vehiculo
            const vehiculoStr = v
                ? [v.vehiculo_marca, v.vehiculo_modelo, v.vehiculo_placa]
                      .filter(Boolean)
                      .join(' ') || '—'
                : '—'
            const agg = propuestaAggBySolicitud.get(r.id)
            return {
                servicio: servicioNombreSolicitud(r),
                categoria: categoriaNombre(r, categoriaNombrePorId),
                ciudad: (() => {
                    const labels = solicitudUbicacionLabels(
                        r,
                        estadosPorSolicitudId,
                    )
                    return labels.length ? labels.join(', ') : '—'
                })(),
                estadoSolicitud: String(r.status ?? '').trim() || '—',
                usuario: r.nombre_usuario ?? '',
                telefono: r.phone_usuario ?? '',
                urgencia: r.urgencia ?? '',
                fechaSolicitud: formatFecha(r.fecha_solicitud),
                estadoPropuestas: propuestaAggSummary(agg),
                vehiculo: vehiculoStr,
                descripcion: (r.descripcion ?? '').slice(0, 200),
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
        await exportStyledExcel({
            rows: tableData,
            columns,
            sheetName: 'Solicitudes',
            fileName: 'solicitudes.xlsx',
        })
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
                                alt={servicioNombreSolicitud(solicitud)}
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
            header: 'Solicitud',
            id: 'nombre_solicitud_col',
            accessorFn: (row) => servicioNombreSolicitud(row),
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">
                    {servicioNombreSolicitud(row.original)}
                </div>
            ),
        },
        {
            header: 'Categoría',
            id: 'categoria_col',
            accessorFn: (row) => categoriaNombre(row, categoriaNombrePorId),
            cell: ({ row }) => (
                <div className="text-gray-700 text-sm">
                    {categoriaNombre(row.original, categoriaNombrePorId)}
                </div>
            ),
        },
        {
            header: 'Ciudad',
            id: 'ciudad_col',
            accessorFn: (row) => {
                const labels = solicitudUbicacionLabels(
                    row,
                    estadosPorSolicitudId,
                )
                return labels[0] ?? ''
            },
            cell: ({ row }) => {
                const labels = solicitudUbicacionLabels(
                    row.original,
                    estadosPorSolicitudId,
                )
                const primary = labels[0] ?? '—'
                const showTip = labels.length > 1
                const inner = (
                    <div
                        className={`text-gray-700 text-sm max-w-[10rem] leading-snug underline decoration-dotted decoration-gray-400 underline-offset-2 ${showTip ? 'cursor-help' : ''}`}
                    >
                        {primary}
                    </div>
                )
                if (!showTip) {
                    return (
                        <div className="text-gray-700 text-sm max-w-[10rem] leading-snug">
                            {primary}
                        </div>
                    )
                }
                return (
                    <Tooltip
                        placement="top"
                        title={
                            <div className="min-w-[10rem] max-w-[18rem] px-0.5 py-0.5 text-left text-[11px] font-normal leading-snug">
                                <div className="mb-2 flex items-center gap-1.5 border-b border-white/25 pb-1.5 text-xs font-semibold tracking-wide text-white">
                                    <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0 opacity-90" />
                                    <span>Estados (negocio)</span>
                                </div>
                                <ul className="m-0 list-none space-y-1.5 pl-0">
                                    {labels.map((e, i) => (
                                        <li
                                            key={`${e}-${i}`}
                                            className="rounded-md bg-white/12 px-2.5 py-1.5 text-white/95 shadow-sm"
                                        >
                                            {e}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        }
                    >
                        {inner}
                    </Tooltip>
                )
            },
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
            cell: ({ row }) => getUrgenciaBadge(row.original.urgencia ?? ''),
        },
        {
            header: 'Propuestas',
            id: 'propuestas_resumen',
            enableSorting: false,
            cell: ({ row }) => (
                <div className="text-gray-700 text-xs max-w-[12rem] leading-snug">
                    {propuestaAggSummary(
                        propuestaAggBySolicitud.get(row.original.id),
                    )}
                </div>
            ),
        },
        {
            header: 'Fecha',
            accessorKey: 'fecha_solicitud',
            sortingFn: (rowA, rowB) =>
                solicitudFechaMs(rowA.original) - solicitudFechaMs(rowB.original),
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
        data: solicitudesTrasBusqueda,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
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

    const clearToolbarFilters = () => {
        setFilterCiudad('')
        setFilterCategoriaId('')
        setUrgenciaFilter('todos')
        setCreationDateRange([null, null])
    }

    const hayFiltrosToolbar =
        Boolean(filterCiudad) ||
        Boolean(filterCategoriaId) ||
        urgenciaFilter !== 'todos' ||
        Boolean(creationDateRange[0]) ||
        Boolean(creationDateRange[1])

    useEffect(() => {
        setCurrentPage(1)
    }, [filterCiudad, filterCategoriaId, urgenciaFilter, creationDateRange])

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const urgenciaFilterOption =
        URGENCY_FILTER_OPTIONS.find((o) => o.value === urgenciaFilter) ??
        URGENCY_FILTER_OPTIONS[0]

    return (
        <>
            <div className="mb-6 flex min-w-0 items-end justify-between gap-3 pb-1">
                <div className="flex min-w-0 flex-1 flex-nowrap items-end justify-end gap-x-2 overflow-x-auto pb-0.5">
                <div className="flex w-[11.25rem] shrink-0 flex-col gap-0.5 sm:w-[12rem]">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                        Categoría
                    </span>
                    <Select<SimpleSelectOpt, false>
                        size="sm"
                        isSearchable
                        className="w-full"
                        options={categoriaFilterSelectOptions}
                        value={
                            categoriaFilterSelectOptions.find(
                                (o) => o.value === filterCategoriaId,
                            ) ?? categoriaFilterSelectOptions[0]
                        }
                        onChange={(opt) =>
                            setFilterCategoriaId(opt?.value ?? '')
                        }
                        placeholder="Todas"
                    />
                </div>
                <div className="flex w-[11.25rem] shrink-0 flex-col gap-0.5 sm:w-[12rem]">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                        Urgencia
                    </span>
                    <Select<UrgenciaFilterOption, false>
                        size="sm"
                        isSearchable={false}
                        className="w-full"
                        options={URGENCY_FILTER_OPTIONS}
                        value={urgenciaFilterOption}
                        onChange={(opt) =>
                            setUrgenciaFilter(opt?.value ?? 'todos')
                        }
                        placeholder="Todas"
                    />
                </div>
                <div className="flex w-[11.25rem] shrink-0 flex-col gap-0.5 sm:w-[12rem]">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                        Ciudad
                    </span>
                    <Select<SimpleSelectOpt, false>
                        size="sm"
                        isSearchable={ciudadSelectOptions.length > 6}
                        className="w-full"
                        options={ciudadSelectOptions}
                        value={
                            ciudadSelectOptions.find(
                                (o) => o.value === filterCiudad,
                            ) ?? ciudadSelectOptions[0]
                        }
                        onChange={(opt) => setFilterCiudad(opt?.value ?? '')}
                        placeholder="Todas"
                    />
                </div>
                <div className="flex w-[13.75rem] shrink-0 flex-col gap-0.5 sm:w-[15rem]">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                        Fecha
                    </span>
                    <DatePicker.DatePickerRange
                        clearable
                        className="w-full"
                        inputFormat="DD/MM/YYYY"
                        placeholder="Desde — hasta"
                        separator=" — "
                        size="sm"
                        value={creationDateRange}
                        onChange={setCreationDateRange}
                    />
                </div>

                <button
                    type="button"
                    title="Limpiar filtros"
                    aria-label="Limpiar filtros"
                    onClick={clearToolbarFilters}
                    disabled={!hayFiltrosToolbar}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:border-[#000B7E]/40 hover:bg-[#000B7E]/5 hover:text-[#000B7E] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <HiOutlineX className="h-5 w-5" />
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
                                    Propuestas del negocio
                                </button>
                            </nav>
                        </div>

                        {activeTab === 'detalle' && (
                            <div className="space-y-6">
                                {selectedSolicitud.solicitud_images &&
                                    selectedSolicitud.solicitud_images.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">
                                                Imágenes de la solicitud
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                                {selectedSolicitud.solicitud_images.map(
                                                    (image, index) => (
                                                        <img
                                                            key={index}
                                                            src={image}
                                                            alt={`Imagen ${index + 1}`}
                                                            className="h-32 w-full cursor-pointer rounded-lg object-cover shadow-md transition-shadow hover:shadow-lg"
                                                            onClick={() =>
                                                                openImagePopup(image, index)
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
                                    <h3 className="mb-2 text-sm font-semibold text-[#000B7E]">
                                        Resumen rápido
                                    </h3>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                        <span>
                                            <span className="text-gray-600">Servicio: </span>
                                            <span className="font-medium text-gray-900">
                                                {servicioNombreSolicitud(selectedSolicitud)}
                                            </span>
                                        </span>
                                        {selectedSolicitud.categoriaId ? (
                                            <span>
                                                <span className="text-gray-600">
                                                    Categoría (nombre):{' '}
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {categoriaNombre(
                                                        selectedSolicitud,
                                                        categoriaNombrePorId,
                                                    )}
                                                </span>
                                            </span>
                                        ) : null}
                                        <span>
                                            <span className="text-gray-600">
                                                Ubicación (tabla / taller):{' '}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {(() => {
                                                    const labels =
                                                        solicitudUbicacionLabels(
                                                            selectedSolicitud,
                                                            estadosPorSolicitudId,
                                                        )
                                                    return labels.length
                                                        ? labels.join(', ')
                                                        : '—'
                                                })()}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="text-gray-600">Estado: </span>
                                            {solicitudEstadoBadge(
                                                selectedSolicitud.status,
                                            )}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="text-gray-600">Urgencia: </span>
                                            {getUrgenciaBadge(
                                                selectedSolicitud.urgencia ?? '',
                                            )}
                                        </span>
                                        {typeof selectedSolicitud.latitude === 'number' &&
                                        typeof selectedSolicitud.longitude === 'number' &&
                                        Number.isFinite(selectedSolicitud.latitude) &&
                                        Number.isFinite(selectedSolicitud.longitude) ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${selectedSolicitud.latitude},${selectedSolicitud.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#000B7E] underline"
                                            >
                                                Ver coordenadas en mapa
                                            </a>
                                        ) : null}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-[#000B7E]">
                                        Colección Solicitudes — todos los campos
                                    </h3>
                                    <p className="mb-3 text-xs text-gray-500">
                                        Incluye cada clave guardada en Firestore para este
                                        documento (excepto el objeto vehículo, que va aparte).
                                    </p>
                                    <DetalleFilasFirestore
                                        entries={solicitudDetalleEntriesSinVehiculo(
                                            selectedSolicitud,
                                        )}
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-[#000B7E]">
                                        Vehículo — todos los campos
                                    </h3>
                                    {vehiculoDetalleEntries(selectedSolicitud.vehiculo)
                                        .length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">
                                            Esta solicitud no incluye datos de vehículo.
                                        </p>
                                    ) : (
                                        <DetalleFilasFirestore
                                            entries={vehiculoDetalleEntries(
                                                selectedSolicitud.vehiculo,
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="rounded-lg bg-blue-50 p-4">
                                    <h3 className="mb-3 text-lg font-semibold text-[#000B7E]">
                                        Descripción
                                    </h3>
                                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                        {selectedSolicitud.descripcion?.trim()
                                            ? selectedSolicitud.descripcion
                                            : '—'}
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
                                    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                                        {propuestas.map((p) => (
                                            <div
                                                key={p.id}
                                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="mb-3 flex flex-col gap-2 border-b border-gray-100 pb-3 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                            Negocio
                                                        </p>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {p.nombre_taller || '—'}
                                                        </p>
                                                    </div>
                                                    <div className="md:text-right">
                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                            Estado de la propuesta
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${propuestaStatusPillClass(p.status)}`}
                                                        >
                                                            {p.status || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4 className="mb-2 text-sm font-semibold text-[#000B7E]">
                                                    Colección Propuestas — todos los campos
                                                </h4>
                                                <DetalleFilasFirestore
                                                    entries={entriesSorted(
                                                        p as unknown as Record<
                                                            string,
                                                            unknown
                                                        >,
                                                    )}
                                                />
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
