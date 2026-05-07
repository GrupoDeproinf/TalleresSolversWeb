import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, Timestamp, where } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useAppSelector } from '@/store'
import Chart from '@/components/shared/Chart'
import Progress from '@/components/ui/Progress'
import { Switcher } from '@/components/ui'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
import {
    HiChevronRight,
    HiOutlineChartBar,
    HiOutlineChartPie,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineXCircle,
} from 'react-icons/hi'

type Propuesta = {
    uid_taller?: string
    uid_solicitud?: string
    status?: string
    precio_estimado?: string | number
    uid_categoria?: string
    nombre_categoria?: string
    fecha_propuesta?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
    fecha_aceptada?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
    fecha_respuesta?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
    fecha_actualizacion?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
}

type Solicitud = {
    categoriaId?: string
    nombre_servicio?: string
}

type RecentProposalRow = {
    status: string
    budgetText: string
    dateText: string
}

type DashboardMetrics = {
    sentThisMonth: number
    accepted: number
    rejected: number
    pending: number
    expired: number
    closureRate: number
    myAveragePrice: number
    marketAveragePrice: number
    weeklyResponses: number[]
    myAverageResponseMinutes: number
    platformAverageResponseMinutes: number
    categoryLabels: string[]
    myCategoryPrices: number[]
    marketCategoryPrices: number[]
    myLocalRating: number
    localAverageRating: number
    localRanking: number
    localRankingTotal: number
    recentProposals: RecentProposalRow[]
    profileViewsTotal: number
    contactClicksTotal: number
    mostViewedServiceName: string
}

const EMPTY_METRICS: DashboardMetrics = {
    sentThisMonth: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
    expired: 0,
    closureRate: 0,
    myAveragePrice: 0,
    marketAveragePrice: 0,
    weeklyResponses: [0, 0, 0, 0, 0, 0, 0, 0],
    myAverageResponseMinutes: 0,
    platformAverageResponseMinutes: 0,
    categoryLabels: [],
    myCategoryPrices: [],
    marketCategoryPrices: [],
    myLocalRating: 0,
    localAverageRating: 0,
    localRanking: 0,
    localRankingTotal: 0,
    recentProposals: [],
    profileViewsTotal: 0,
    contactClicksTotal: 0,
    mostViewedServiceName: 'Sin datos',
}

const STATUS_LABELS = ['Aceptada', 'Rechazada', 'Pendiente', 'Expirada']
const STATUS_COLORS = ['#16A34A', '#EF4444', '#F59E0B', '#64748B']

const toDate = (
    value: Timestamp | Date | { seconds?: number; _seconds?: number } | null | undefined,
): Date | null => {
    if (!value) return null
    if (value instanceof Timestamp) return value.toDate()
    if (value instanceof Date) return value
    const seconds = value.seconds ?? value._seconds
    return typeof seconds === 'number' ? new Date(seconds * 1000) : null
}

const parseCurrencyToNumber = (value: string | number | undefined) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'string') return null
    const cleaned = value
        .replace(/[^\d.,-]/g, '')
        .replace(/\.(?=\d{3}(\D|$))/g, '')
        .replace(',', '.')
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : null
}

const parseRatingValue = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'string') return null
    const cleaned = value
        .replace(',', '.')
        .replace(/[^\d.\-]/g, '')
        .trim()
    if (!cleaned) return null
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : null
}

const normalizeLocationText = (value: unknown) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

const toDateFromUnknownTimestamp = (value: unknown): Date | null => {
    if (!value) return null
    if (value instanceof Timestamp) return value.toDate()
    if (value instanceof Date) return value
    if (
        typeof value === 'object' &&
        value !== null &&
        'seconds' in (value as { seconds?: unknown }) &&
        typeof (value as { seconds?: unknown }).seconds === 'number'
    ) {
        return new Date((value as { seconds: number }).seconds * 1000)
    }
    if (
        typeof value === 'object' &&
        value !== null &&
        '_seconds' in (value as { _seconds?: unknown }) &&
        typeof (value as { _seconds?: unknown })._seconds === 'number'
    ) {
        return new Date((value as { _seconds: number })._seconds * 1000)
    }
    return null
}

const getStatusBucket = (status: string | undefined) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized.includes('acept')) return 'accepted'
    if (normalized.includes('rechaz')) return 'rejected'
    if (normalized.includes('expir')) return 'expired'
    return 'pending'
}

const SERVICE_CONTACT_TYPES = new Set(['contactar', 'llamada', 'whatsapp'])

const isServiceContactInteractionType = (type: unknown) => {
    const normalized = String(type || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    return SERVICE_CONTACT_TYPES.has(normalized)
}

const getWeekStart = (date: Date) => {
    const weekStart = new Date(date)
    weekStart.setHours(0, 0, 0, 0)
    const day = weekStart.getDay()
    const diff = day === 0 ? -6 : 1 - day
    weekStart.setDate(weekStart.getDate() + diff)
    return weekStart
}

const buildLast8WeeksLabels = () => {
    const labels: string[] = []
    const currentWeekStart = getWeekStart(new Date())
    for (let i = 7; i >= 0; i--) {
        const start = new Date(currentWeekStart)
        start.setDate(currentWeekStart.getDate() - i * 7)
        labels.push(
            `${start.toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
            })}`,
        )
    }
    return labels
}

const startOfDay = (date: Date) => {
    const value = new Date(date)
    value.setHours(0, 0, 0, 0)
    return value
}

const endOfDay = (date: Date) => {
    const value = new Date(date)
    value.setHours(23, 59, 59, 999)
    return value
}

const getTodayRange = () => {
    const now = new Date()
    return { from: startOfDay(now), to: endOfDay(now) }
}

const getCurrentWeekRange = () => {
    const now = new Date()
    const from = getWeekStart(now)
    return { from: startOfDay(from), to: endOfDay(now) }
}

const getCurrentMonthRange = () => {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: startOfDay(from), to: endOfDay(now) }
}

const getCurrentYearRange = () => {
    const now = new Date()
    const from = new Date(now.getFullYear(), 0, 1)
    return { from: startOfDay(from), to: endOfDay(now) }
}

const TallerDashboard = () => {
    const { key: userKey } = useAppSelector((state) => state.auth.user)
    const { token } = useAppSelector((state) => state.auth.session)
    const loggedTallerUid = userKey || token || ''

    const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPlanName, setCurrentPlanName] = useState<string | null>(null)
    const [hasApprovedPlan, setHasApprovedPlan] = useState(false)
    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false)
    const [dateRangeDraft, setDateRangeDraft] = useState<DatePickerRangeValue>([null, null])
    const [appliedDateRange, setAppliedDateRange] = useState<{
        from: Date
        to: Date
    } | null>(null)

    const applyQuickRange = (range: { from: Date; to: Date }) => {
        setDateRangeDraft([range.from, range.to])
        setAppliedDateRange(range)
    }

    const applySelectedRange = () => {
        const [from, to] = dateRangeDraft
        if (!from || !to) {
            setAppliedDateRange(null)
            return
        }
        setAppliedDateRange({
            from: startOfDay(from as Date),
            to: endOfDay(to as Date),
        })
    }

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!loggedTallerUid) {
                setMetrics(EMPTY_METRICS)
                setCurrentPlanName(null)
                setHasApprovedPlan(false)
                setIsLoading(false)
                return
            }

            setIsLoading(true)

            try {
                const [
                    myPropuestasSnap,
                    allPropuestasSnap,
                    categoriasSnap,
                    solicitudesSnap,
                    tallerDocSnap,
                    usersSnap,
                    perfilViewsSnap,
                    serviceContactSnap,
                    serviciosSnap,
                ] =
                    await Promise.all([
                        getDocs(
                            query(
                                collection(db, 'Propuestas'),
                                where('uid_taller', '==', loggedTallerUid),
                            ),
                        ),
                        getDocs(collection(db, 'Propuestas')),
                        getDocs(collection(db, 'Categorias')),
                        getDocs(collection(db, 'Solicitudes')),
                        getDoc(doc(db, 'Usuarios', loggedTallerUid)),
                        getDocs(collection(db, 'Usuarios')),
                        getDocs(
                            query(
                                collection(db, 'perfilViews'),
                                where('uid_taller', '==', loggedTallerUid),
                            ),
                        ),
                        getDocs(
                            query(
                                collection(db, 'servicesContact'),
                                where('uid_taller', '==', loggedTallerUid),
                            ),
                        ),
                        getDocs(
                            query(
                                collection(db, 'Servicios'),
                                where('uid_taller', '==', loggedTallerUid),
                            ),
                        ),
                    ])

                const tallerData = tallerDocSnap.data() as
                    | { subscripcion_actual?: { nombre?: string; status?: string } }
                    | undefined
                const subscripcionActual = tallerData?.subscripcion_actual
                const planName = subscripcionActual?.nombre || null
                const statusNormalized = String(subscripcionActual?.status || '').toLowerCase()
                const isApprovedPlan = statusNormalized.includes('aprob')
                const isKnownPlan = ['Plan Oro', 'Plan Plata', 'Plan Bronce'].includes(
                    String(planName || ''),
                )

                setCurrentPlanName(isKnownPlan ? planName : null)
                setHasApprovedPlan(isApprovedPlan && isKnownPlan)

                const usersData: Array<Record<string, unknown> & { id: string }> =
                    usersSnap.docs.map(
                        (docSnap) =>
                            ({
                                id: docSnap.id,
                                ...(docSnap.data() as Record<string, unknown>),
                            }) as Record<string, unknown> & { id: string },
                    )

                const myPropuestas = myPropuestasSnap.docs.map(
                    (docSnap) => docSnap.data() as Propuesta,
                )
                const allPropuestas = allPropuestasSnap.docs.map(
                    (docSnap) => docSnap.data() as Propuesta,
                )

                const getProposalReferenceDate = (propuesta: Propuesta) =>
                    toDate(propuesta.fecha_propuesta) ||
                    toDate(propuesta.fecha_actualizacion) ||
                    toDate(propuesta.fecha_respuesta) ||
                    toDate(propuesta.fecha_aceptada)

                const shouldApplyDateFilter = isDateFilterEnabled && !!appliedDateRange
                const isInAppliedRange = (date: Date | null) => {
                    if (!shouldApplyDateFilter) return true
                    if (!appliedDateRange || !date) return false
                    const timestamp = date.getTime()
                    return (
                        timestamp >= appliedDateRange.from.getTime() &&
                        timestamp <= appliedDateRange.to.getTime()
                    )
                }

                const myPropuestasForMetrics = shouldApplyDateFilter
                    ? myPropuestas.filter((propuesta) =>
                          isInAppliedRange(getProposalReferenceDate(propuesta)),
                      )
                    : myPropuestas

                const allPropuestasForMetrics = shouldApplyDateFilter
                    ? allPropuestas.filter((propuesta) =>
                          isInAppliedRange(getProposalReferenceDate(propuesta)),
                      )
                    : allPropuestas

                const getUserRating = (user: Record<string, unknown>) => {
                    const ratingCollections = [
                        user.calificaciones,
                        user.ratings,
                        user.puntuaciones,
                    ]

                    for (const collectionCandidate of ratingCollections) {
                        if (!Array.isArray(collectionCandidate) || collectionCandidate.length === 0) {
                            continue
                        }

                        const values = collectionCandidate
                            .map((item) => {
                                if (typeof item === 'number') return item
                                if (typeof item === 'object' && item !== null) {
                                    const record = item as Record<string, unknown>
                                    const nestedCandidates = [
                                        record.puntuacion,
                                        record.calificacion,
                                        record.rating,
                                        record.promedio,
                                    ]
                                    for (const nested of nestedCandidates) {
                                        const parsed = parseRatingValue(nested)
                                        if (parsed !== null && parsed >= 0) return parsed
                                    }
                                }
                                return null
                            })
                            .filter((value): value is number => value !== null)

                        if (values.length > 0) {
                            return values.reduce((acc, value) => acc + value, 0) / values.length
                        }
                    }

                    const ratingCandidates = [
                        user.puntuacion_promedio,
                        user.calificacion_promedio,
                        user.rating_promedio,
                        user.promedio_calificacion,
                        user.promedio_puntuacion,
                        user.ratingAverage,
                        user.puntuacion_general,
                        user.puntuacion,
                        user.calificacion,
                        user.rating,
                    ]

                    for (const candidate of ratingCandidates) {
                        const value = parseRatingValue(candidate)
                        if (value !== null && value >= 0) return value
                    }
                    return 0
                }

                const myEstadoNormalized = normalizeLocationText(
                    (tallerData as Record<string, unknown> | undefined)?.estado,
                )
                const localWorkshops = usersData.filter((user) => {
                    const isWorkshop = String(user.typeUser || '').toLowerCase() === 'taller'
                    if (!isWorkshop) return false
                    if (!myEstadoNormalized) return true
                    const userEstadoNormalized = normalizeLocationText(user.estado)
                    return userEstadoNormalized === myEstadoNormalized
                })

                const localRatings = localWorkshops
                    .map((user) => ({
                        id: String(user.uid || user.id || ''),
                        rating: getUserRating(user),
                    }))
                    .filter((row) => row.id)
                    .sort((a, b) => b.rating - a.rating)

                const myLocalRating = localRatings.find((row) => row.id === loggedTallerUid)?.rating || 0
                const localAverageRating =
                    localRatings.length > 0
                        ? localRatings.reduce((acc, row) => acc + row.rating, 0) /
                          localRatings.length
                        : 0
                const localRankingIndex = localRatings.findIndex(
                    (row) => row.id === loggedTallerUid,
                )
                const localRanking = localRankingIndex >= 0 ? localRankingIndex + 1 : 0
                const localRankingTotal = localRatings.length

                const recentProposals: RecentProposalRow[] = myPropuestasForMetrics
                    .slice()
                    .sort((a, b) => {
                        const dateA =
                            toDate(a.fecha_actualizacion) ||
                            toDate(a.fecha_respuesta) ||
                            toDate(a.fecha_aceptada) ||
                            toDate(a.fecha_propuesta)
                        const dateB =
                            toDate(b.fecha_actualizacion) ||
                            toDate(b.fecha_respuesta) ||
                            toDate(b.fecha_aceptada) ||
                            toDate(b.fecha_propuesta)
                        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0)
                    })
                    .slice(0, 8)
                    .map((propuesta) => {
                        const budgetValue = parseCurrencyToNumber(propuesta.precio_estimado)
                        const status = propuesta.status || 'Sin estatus'
                        const dateValue =
                            toDate(propuesta.fecha_actualizacion) ||
                            toDate(propuesta.fecha_respuesta) ||
                            toDate(propuesta.fecha_aceptada) ||
                            toDate(propuesta.fecha_propuesta)
                        return {
                            status,
                            budgetText:
                                budgetValue !== null
                                    ? `$${Math.round(budgetValue).toLocaleString('es-VE')}`
                                    : 'Sin monto',
                            dateText: dateValue
                                ? dateValue.toLocaleDateString('es-VE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                  })
                                : 'Sin fecha',
                        }
                    })

                const categoryNameById = new Map<string, string>()
                categoriasSnap.forEach((docSnap) => {
                    const data = docSnap.data() as { nombre?: string }
                    categoryNameById.set(docSnap.id, data.nombre || docSnap.id)
                })

                const solicitudCategoryById = new Map<string, string>()
                solicitudesSnap.forEach((docSnap) => {
                    const data = docSnap.data() as Solicitud
                    const rawCategory = data.categoriaId || data.nombre_servicio || 'Sin categoria'
                    solicitudCategoryById.set(docSnap.id, rawCategory)
                })

                const now = new Date()
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                const anchorDate =
                    isDateFilterEnabled && appliedDateRange ? appliedDateRange.to : new Date()
                const firstWeekStart = getWeekStart(anchorDate)
                firstWeekStart.setDate(firstWeekStart.getDate() - 7 * 7)
                const weeklyResponses = new Array(8).fill(0)

                let accepted = 0
                let rejected = 0
                let pending = 0
                let expired = 0
                let sentThisMonth = 0
                let myPriceSum = 0
                let myPriceCount = 0
                let myResponseMinutesSum = 0
                let myResponseMinutesCount = 0
                let platformResponseMinutesSum = 0
                let platformResponseMinutesCount = 0

                const myPricesByCategory = new Map<string, { sum: number; count: number }>()
                const marketPricesByCategory = new Map<string, { sum: number; count: number }>()
                const servicesById = new Map<string, string>()

                serviciosSnap.forEach((docSnap) => {
                    const data = docSnap.data() as { nombre_servicio?: string }
                    servicesById.set(docSnap.id, data?.nombre_servicio || 'Servicio sin nombre')
                })

                const resolveCategory = (propuesta: Propuesta) => {
                    const fromPropuesta =
                        propuesta.uid_categoria ||
                        propuesta.nombre_categoria ||
                        solicitudCategoryById.get(propuesta.uid_solicitud || '')
                    if (!fromPropuesta) return 'Sin categoria'
                    return categoryNameById.get(fromPropuesta) || fromPropuesta
                }

                const collectResponseTiming = (
                    propuesta: Propuesta,
                    onDiff: (minutes: number) => void,
                ) => {
                    const sentDate = toDate(propuesta.fecha_propuesta)
                    const responseDate =
                        toDate(propuesta.fecha_respuesta) ||
                        toDate(propuesta.fecha_aceptada) ||
                        toDate(propuesta.fecha_actualizacion)
                    if (!sentDate || !responseDate) return
                    const diffMinutes = (responseDate.getTime() - sentDate.getTime()) / 60000
                    if (diffMinutes >= 0) onDiff(diffMinutes)
                }

                myPropuestasForMetrics.forEach((propuesta) => {
                    const statusBucket = getStatusBucket(propuesta.status)
                    if (statusBucket === 'accepted') accepted += 1
                    else if (statusBucket === 'rejected') rejected += 1
                    else if (statusBucket === 'expired') expired += 1
                    else pending += 1

                    const sentDate = toDate(propuesta.fecha_propuesta)
                    if (isDateFilterEnabled && appliedDateRange) {
                        sentThisMonth += 1
                    } else if (sentDate && sentDate >= monthStart) {
                        sentThisMonth += 1
                    }

                    const category = resolveCategory(propuesta)
                    const price = parseCurrencyToNumber(propuesta.precio_estimado)
                    if (price !== null) {
                        myPriceSum += price
                        myPriceCount += 1
                        const current = myPricesByCategory.get(category) || { sum: 0, count: 0 }
                        current.sum += price
                        current.count += 1
                        myPricesByCategory.set(category, current)
                    }

                    collectResponseTiming(propuesta, (minutes) => {
                        myResponseMinutesSum += minutes
                        myResponseMinutesCount += 1
                    })

                    const responseDate =
                        toDate(propuesta.fecha_respuesta) ||
                        toDate(propuesta.fecha_aceptada) ||
                        toDate(propuesta.fecha_actualizacion)

                    if (responseDate && responseDate >= firstWeekStart) {
                        const weekStart = getWeekStart(responseDate)
                        const weekIndex = Math.floor(
                            (weekStart.getTime() - firstWeekStart.getTime()) /
                                (7 * 24 * 60 * 60 * 1000),
                        )
                        if (weekIndex >= 0 && weekIndex < 8) {
                            weeklyResponses[weekIndex] += 1
                        }
                    }
                })

                allPropuestasForMetrics.forEach((propuesta) => {
                    const price = parseCurrencyToNumber(propuesta.precio_estimado)
                    if (price !== null) {
                        const category = resolveCategory(propuesta)
                        const current = marketPricesByCategory.get(category) || {
                            sum: 0,
                            count: 0,
                        }
                        current.sum += price
                        current.count += 1
                        marketPricesByCategory.set(category, current)
                    }

                    collectResponseTiming(propuesta, (minutes) => {
                        platformResponseMinutesSum += minutes
                        platformResponseMinutesCount += 1
                    })
                })

                const categoriesForComparison = Array.from(
                    new Set([
                        ...Array.from(myPricesByCategory.keys()),
                        ...Array.from(marketPricesByCategory.keys()),
                    ]),
                )
                    .slice(0, 6)

                const myCategoryPrices = categoriesForComparison.map((category) => {
                    const stat = myPricesByCategory.get(category)
                    return stat ? stat.sum / stat.count : 0
                })

                const marketCategoryPrices = categoriesForComparison.map((category) => {
                    const stat = marketPricesByCategory.get(category)
                    return stat ? stat.sum / stat.count : 0
                })

                const sentTotal = myPropuestasForMetrics.length
                const closureRate = sentTotal > 0 ? (accepted / sentTotal) * 100 : 0
                const myAveragePrice = myPriceCount > 0 ? myPriceSum / myPriceCount : 0
                const marketAveragePrice =
                    marketCategoryPrices.length > 0
                        ? marketCategoryPrices.reduce((acc, value) => acc + value, 0) /
                          marketCategoryPrices.filter((value) => value > 0).length || 0
                        : 0
                const myAverageResponseMinutes =
                    myResponseMinutesCount > 0
                        ? myResponseMinutesSum / myResponseMinutesCount
                        : 0
                const platformAverageResponseMinutes =
                    platformResponseMinutesCount > 0
                        ? platformResponseMinutesSum / platformResponseMinutesCount
                        : 0

                const profileViewEvents = perfilViewsSnap.docs
                    .map((docSnap) => {
                        const data = docSnap.data() as {
                            fecha_creacion?: unknown
                            createdAt?: unknown
                            fecha?: unknown
                        }
                        return (
                            toDateFromUnknownTimestamp(data.fecha_creacion) ||
                            toDateFromUnknownTimestamp(data.createdAt) ||
                            toDateFromUnknownTimestamp(data.fecha)
                        )
                    })
                    .filter((value): value is Date => Boolean(value))

                const profileViewsTotal = shouldApplyDateFilter
                    ? profileViewEvents.filter((eventDate) => isInAppliedRange(eventDate)).length
                    : profileViewEvents.length

                const serviceContactEvents = serviceContactSnap.docs.map((docSnap) => {
                    const data = docSnap.data() as {
                        uid_servicio?: string
                        nombre_servicio?: string
                        type?: unknown
                        fecha_creacion?: unknown
                        createdAt?: unknown
                        fecha?: unknown
                    }
                    return {
                        uid_servicio: String(data.uid_servicio || ''),
                        nombre_servicio: String(data.nombre_servicio || '').trim(),
                        type: data.type,
                        fecha:
                            toDateFromUnknownTimestamp(data.fecha_creacion) ||
                            toDateFromUnknownTimestamp(data.createdAt) ||
                            toDateFromUnknownTimestamp(data.fecha),
                    }
                })

                const serviceContactEventsInRange = shouldApplyDateFilter
                    ? serviceContactEvents.filter(
                          (event) => event.fecha && isInAppliedRange(event.fecha),
                      )
                    : serviceContactEvents

                const contactClicksTotal = serviceContactEventsInRange.filter(
                    (event) => isServiceContactInteractionType(event.type),
                ).length

                const serviceViewsCount = new Map<string, number>()
                const serviceNameById = new Map<string, string>()
                serviceContactEventsInRange
                    .filter((event) => Boolean(event.uid_servicio))
                    .forEach((event) => {
                        if (!event.uid_servicio) return
                        serviceViewsCount.set(
                            event.uid_servicio,
                            (serviceViewsCount.get(event.uid_servicio) || 0) + 1,
                        )
                        if (event.nombre_servicio && !serviceNameById.has(event.uid_servicio)) {
                            serviceNameById.set(event.uid_servicio, event.nombre_servicio)
                        }
                    })

                let mostViewedServiceName = 'Sin datos'
                let mostViewedServiceCount = 0
                serviceViewsCount.forEach((count, serviceId) => {
                    if (count > mostViewedServiceCount) {
                        mostViewedServiceCount = count
                        mostViewedServiceName =
                            serviceNameById.get(serviceId) ||
                            servicesById.get(serviceId) || 'Servicio sin nombre'
                    }
                })

                setMetrics({
                    sentThisMonth,
                    accepted,
                    rejected,
                    pending,
                    expired,
                    closureRate,
                    myAveragePrice,
                    marketAveragePrice,
                    weeklyResponses,
                    myAverageResponseMinutes,
                    platformAverageResponseMinutes,
                    categoryLabels: categoriesForComparison,
                    myCategoryPrices,
                    marketCategoryPrices,
                    myLocalRating,
                    localAverageRating,
                    localRanking,
                    localRankingTotal,
                    recentProposals,
                    profileViewsTotal,
                    contactClicksTotal,
                    mostViewedServiceName,
                })
            } catch (error) {
                console.error('Error al cargar mÃ©tricas del dashboard de negocio:', error)
                setMetrics(EMPTY_METRICS)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchMetrics()
    }, [loggedTallerUid, isDateFilterEnabled, appliedDateRange])

    const quoteStatusData = useMemo(
        () => ({
            labels: STATUS_LABELS,
            data: [metrics.accepted, metrics.rejected, metrics.pending, metrics.expired],
            colors: STATUS_COLORS,
        }),
        [metrics.accepted, metrics.rejected, metrics.pending, metrics.expired],
    )

    const responseGaugePercent = useMemo(() => {
        if (metrics.platformAverageResponseMinutes <= 0) return 0
        const ratio = (metrics.myAverageResponseMinutes / metrics.platformAverageResponseMinutes) * 100
        return Math.max(0, Math.min(100, Math.round(ratio)))
    }, [metrics.myAverageResponseMinutes, metrics.platformAverageResponseMinutes])

    const responseTrendText = useMemo(() => {
        const diff =
            metrics.platformAverageResponseMinutes - metrics.myAverageResponseMinutes
        if (metrics.platformAverageResponseMinutes <= 0) {
            return 'No hay datos suficientes de plataforma'
        }
        if (diff > 0) return `${diff.toFixed(1)} min mas rapido que la plataforma`
        if (diff < 0) return `${Math.abs(diff).toFixed(1)} min mas lento que la plataforma`
        return 'Mismo tiempo promedio que la plataforma'
    }, [metrics.myAverageResponseMinutes, metrics.platformAverageResponseMinutes])

    const kpiCards = [
        {
            title: isDateFilterEnabled
                ? 'Cotizaciones en el rango'
                : 'Cotizaciones enviadas este mes',
            value: metrics.sentThisMonth,
            hint: isDateFilterEnabled
                ? `${metrics.sentThisMonth} registradas en el periodo filtrado`
                : `${metrics.sentThisMonth} registradas en el mes actual`,
            bgColor: 'bg-[#000B7E]',
            icon: HiOutlineChartBar,
        },
        {
            title: 'Aceptadas / Rechazadas / Sin respuesta',
            value: `${metrics.accepted} / ${metrics.rejected} / ${metrics.pending + metrics.expired}`,
            hint: `${metrics.pending} pendientes y ${metrics.expired} expiradas`,
            bgColor: 'bg-blue-800',
            icon: HiOutlineChartPie,
        },
        {
            title: 'Tasa de cierre propia',
            value: `${metrics.closureRate.toFixed(1)}%`,
            hint: `${metrics.accepted} aceptadas del total enviado`,
            bgColor: 'bg-blue-600',
            icon: HiOutlineCheckCircle,
        },
        {
            title: 'Precio promedio vs mercado',
            value: `$${metrics.myAveragePrice.toFixed(0)} vs $${metrics.marketAveragePrice.toFixed(0)}`,
            hint:
                metrics.marketAveragePrice > 0
                    ? `${(((metrics.myAveragePrice - metrics.marketAveragePrice) / metrics.marketAveragePrice) * 100).toFixed(1)}% de diferencia`
                    : 'Sin referencia de mercado suficiente',
            bgColor: 'bg-indigo-600',
            icon: HiOutlineCurrencyDollar,
        },
    ]

    const statusSummaryItems = [
        {
            label: 'Aceptadas',
            value: metrics.accepted,
            colorClass: 'bg-emerald-100 text-emerald-700',
            icon: HiOutlineCheckCircle,
        },
        {
            label: 'Rechazadas',
            value: metrics.rejected,
            colorClass: 'bg-rose-100 text-rose-700',
            icon: HiOutlineXCircle,
        },
        {
            label: 'Pendientes + expiradas',
            value: metrics.pending + metrics.expired,
            colorClass: 'bg-amber-100 text-amber-700',
            icon: HiOutlineClock,
        },
    ]

    const weeklyResponseXAxis = useMemo(() => {
        const anchorDate =
            isDateFilterEnabled && appliedDateRange ? appliedDateRange.to : new Date()
        const labels: string[] = []
        const currentWeekStart = getWeekStart(anchorDate)
        for (let i = 7; i >= 0; i--) {
            const start = new Date(currentWeekStart)
            start.setDate(currentWeekStart.getDate() - i * 7)
            labels.push(
                `${start.toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                })}`,
            )
        }
        return labels
    }, [isDateFilterEnabled, appliedDateRange])

    const isPlanOro = currentPlanName === 'Plan Oro'
    const isPlanBronce = currentPlanName === 'Plan Bronce'
    const isPlanPlataOrOro = currentPlanName === 'Plan Plata' || isPlanOro
    const visibleKpiCards = isPlanOro
        ? kpiCards
        : kpiCards.filter((card) => card.title !== 'Precio promedio vs mercado')

    const quoteStatusDonutCard = (
        <article className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-[#000B7E] px-4 py-2">
                <h3 className="text-sm font-semibold text-white">Mis cotizaciones por estado</h3>
            </div>
            <div className="grid grid-cols-[58%_42%] items-center gap-2 p-3">
                <Chart
                    donutTitle={`${quoteStatusData.data.reduce((acc, value) => acc + value, 0)}`}
                    donutText="Cotizaciones"
                    series={quoteStatusData.data}
                    customOptions={{
                        labels: quoteStatusData.labels,
                        legend: { show: false },
                        colors: quoteStatusData.colors,
                    }}
                    type="donut"
                    height={220}
                />
                <div className="space-y-2">
                    {statusSummaryItems.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                    <item.icon className="text-sm" />
                                    {item.label}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.colorClass}`}
                                >
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    )

    const weeklyHistoryCard = (
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-[#000B7E] px-4 py-2">
                <h3 className="text-sm font-semibold text-white">
                    Historial de solicitudes respondidas (ultimas 8 semanas)
                </h3>
                <p className="mt-0.5 text-xs text-white/90">
                    Evolucion semanal de respuestas del negocio
                </p>
            </div>
            <div className="p-3">
                <Chart
                    type="line"
                    series={[
                        {
                            name: 'Solicitudes respondidas',
                            data: metrics.weeklyResponses,
                        },
                    ]}
                    xAxis={weeklyResponseXAxis}
                    height={250}
                    customOptions={{
                        colors: ['#000B7E'],
                        stroke: {
                            curve: 'smooth',
                            width: [3],
                        },
                        legend: {
                            position: 'top',
                            horizontalAlign: 'left',
                        },
                        markers: {
                            size: [4],
                        },
                        yaxis: {
                            labels: {
                                formatter: (value: number) => `${Math.round(value)} resp.`,
                            },
                        },
                    }}
                />
            </div>
        </article>
    )

    const responseTimeCard = (
        <article
            className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${
                isPlanOro ? '' : isPlanBronce ? '' : 'xl:col-span-3'
            }`}
        >
            <div className="bg-[#000B7E] px-4 py-2">
                <h3 className="text-sm font-semibold text-white">Tiempo promedio de respuesta</h3>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                <div className="flex flex-none justify-center">
                    <Progress
                        variant="circle"
                        percent={responseGaugePercent}
                        width={150}
                        gapDegree={120}
                        gapPosition="bottom"
                        strokeWidth={10}
                        customInfo={`${metrics.myAverageResponseMinutes.toFixed(1)} min`}
                    />
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                        Comparativa plataforma
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                        Promedio negocio:{' '}
                        <span className="font-semibold">
                            {metrics.myAverageResponseMinutes.toFixed(1)} min
                        </span>
                    </p>
                    <p className="text-sm text-gray-700">
                        Promedio plataforma:{' '}
                        <span className="font-semibold">
                            {metrics.platformAverageResponseMinutes.toFixed(1)} min
                        </span>
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                        {responseTrendText}
                    </p>
                </div>
            </div>
        </article>
    )
    return (
        <div
            className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 bg-gray-100 p-1"
            aria-label="Dashboard del negocio"
        >
            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-700">
                    {isLoading
                        ? 'Validando plan del taller...'
                        : currentPlanName
                          ? `Plan actual: ${currentPlanName}`
                          : 'No tienes un plan pago activo.'}
                </p>
                {!isLoading && !hasApprovedPlan && (
                    <p className="mt-1 text-xs font-medium text-amber-700">
                        Este dashboard premium solo esta disponible para talleres con suscripcion aprobada.
                    </p>
                )}
            </section>

            {hasApprovedPlan && (
                <div className="mt-4 space-y-4">
                    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Filtro de fechas
                                </p>
                                <p className="text-xs text-gray-600">
                                    Activa el filtro para consultar historico por dia, semana,
                                    mes, año o rango personalizado.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Activar filtro</span>
                                <Switcher
                                    checked={isDateFilterEnabled}
                                    onChange={() => {
                                        setIsDateFilterEnabled((prev) => {
                                            const next = !prev
                                            if (!next) {
                                                setDateRangeDraft([null, null])
                                                setAppliedDateRange(null)
                                            }
                                            return next
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {isDateFilterEnabled && (
                            <div className="mt-4 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        onClick={() => applyQuickRange(getTodayRange())}
                                    >
                                        Hoy
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        onClick={() => applyQuickRange(getCurrentWeekRange())}
                                    >
                                        Semana actual
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        onClick={() => applyQuickRange(getCurrentMonthRange())}
                                    >
                                        Mes actual
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        onClick={() => applyQuickRange(getCurrentYearRange())}
                                    >
                                        Año actual
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end xl:justify-end">
                                    <div className="w-full sm:w-[22rem]">
                                        <DatePicker.DatePickerRange
                                            clearable
                                            inputFormat="DD/MM/YYYY"
                                            placeholder="Desde — hasta"
                                            separator=" — "
                                            value={dateRangeDraft}
                                            onChange={(value) => setDateRangeDraft(value)}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        onClick={applySelectedRange}
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>

                    <section
                        className={`grid gap-3 md:grid-cols-2 ${
                            isPlanOro ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
                        }`}
                    >
                        {visibleKpiCards.map((card) => (
                            <article
                                key={card.title}
                                className={`${card.bgColor} group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-xl p-6 text-white shadow-sm transition-all hover:shadow-md`}
                            >
                                <div
                                    className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10"
                                    aria-hidden
                                />
                                <div className="relative flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                            <card.icon className="text-3xl" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-white/90">
                                                {card.title}
                                            </p>
                                            <p className="mt-1 text-3xl font-bold leading-none tabular-nums">
                                                {isLoading ? '...' : card.value}
                                            </p>
                                        </div>
                                    </div>
                                    <HiChevronRight className="text-xl text-white/70 transition-transform group-hover:translate-x-0.5" />
                                </div>
                                <p className="relative mt-2 text-sm leading-snug text-white/85">
                                    {isLoading ? 'Cargando datos...' : card.hint}
                                </p>
                            </article>
                        ))}
                    </section>

                    {isPlanBronce ? (
                        <section className="grid gap-3 md:grid-cols-2">
                            {quoteStatusDonutCard}
                            {responseTimeCard}
                        </section>
                    ) : (
                        <section className="grid gap-3 xl:grid-cols-3">
                            {quoteStatusDonutCard}
                            <div className="xl:col-span-2">{weeklyHistoryCard}</div>
                        </section>
                    )}

                    <section className="grid flex-1 gap-3 xl:grid-cols-3">
                        {isPlanOro && (
                            <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
                            <div className="bg-[#000B7E] px-4 py-2">
                                <h3 className="text-sm font-semibold text-white">
                                    Comparativa de precio propio vs mercado
                                </h3>
                                <p className="mt-0.5 text-xs text-white/90">
                                    Barras agrupadas por categoria de servicio
                                </p>
                            </div>
                            <div className="p-3">
                                <Chart
                                    type="bar"
                                    series={[
                                        {
                                            name: 'Mi precio promedio',
                                            data: metrics.myCategoryPrices,
                                        },
                                        {
                                            name: 'Mercado promedio',
                                            data: metrics.marketCategoryPrices,
                                        },
                                    ]}
                                    xAxis={metrics.categoryLabels}
                                    height={260}
                                    customOptions={{
                                        colors: ['#000B7E', '#60A5FA'],
                                        plotOptions: {
                                            bar: {
                                                horizontal: false,
                                                columnWidth: '44%',
                                                borderRadius: 4,
                                            },
                                        },
                                        legend: {
                                            position: 'top',
                                            horizontalAlign: 'left',
                                        },
                                        yaxis: {
                                            labels: {
                                                formatter: (value: number) =>
                                                    `$${Math.round(value)}`,
                                            },
                                        },
                                        tooltip: {
                                            y: {
                                                formatter: (value: number) => `$${value.toFixed(2)}`,
                                            },
                                        },
                                    }}
                                />
                            </div>
                            </article>
                        )}

                        {!isPlanBronce && responseTimeCard}
                    </section>
                    <section className="space-y-3">
                    {isPlanPlataOrOro && (
                        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                                    Vistas totales del perfil
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {metrics.profileViewsTotal}
                                </p>
                            </article>

                            <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                                    Clics en contactar / WhatsApp / llamadas
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {metrics.contactClicksTotal}
                                </p>
                            </article>

                            <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                                    Servicio mas visto
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    {metrics.mostViewedServiceName}
                                </p>
                            </article>

                            {isPlanOro && (
                                <>
                                    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                                            Comparativa local de reputacion
                                        </p>
                                        <p className="mt-2 text-sm text-gray-700">
                                            Mi promedio:{' '}
                                            <span className="font-semibold">
                                                {metrics.myLocalRating.toFixed(1)}⭐
                                            </span>{' '}
                                            | Zona:{' '}
                                            <span className="font-semibold">
                                                {metrics.localAverageRating.toFixed(1)}⭐
                                            </span>
                                        </p>
                                        <p
                                            className={`mt-2 text-xs font-semibold ${
                                                metrics.myLocalRating >= metrics.localAverageRating
                                                    ? 'text-emerald-700'
                                                    : 'text-rose-700'
                                            }`}
                                        >
                                            {metrics.myLocalRating >= metrics.localAverageRating
                                                ? 'Estas por encima del promedio de tu zona.'
                                                : 'Estas por debajo del promedio de tu zona.'}
                                        </p>
                                    </article>

                                    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                                            Ranking en la ciudad
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-gray-900">
                                            {metrics.localRanking > 0
                                                ? `#${metrics.localRanking} de ${metrics.localRankingTotal}`
                                                : 'Sin ranking'}
                                        </p>
                                    </article>

                                    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#000B7E]">
                                            Historico detallado por estatus y presupuesto
                                        </p>
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-gray-500">
                                                        <th className="pb-2 pr-4 font-medium">
                                                            Estatus
                                                        </th>
                                                        <th className="pb-2 pr-4 font-medium">
                                                            Presupuesto
                                                        </th>
                                                        <th className="pb-2 font-medium">
                                                            Fecha
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {metrics.recentProposals.length > 0 ? (
                                                        metrics.recentProposals.map((row, index) => (
                                                            <tr
                                                                key={`${row.status}-${row.dateText}-${index}`}
                                                                className="border-t border-gray-100 text-gray-700"
                                                            >
                                                                <td className="py-2 pr-4">
                                                                    {row.status}
                                                                </td>
                                                                <td className="py-2 pr-4">
                                                                    {row.budgetText}
                                                                </td>
                                                                <td className="py-2">
                                                                    {row.dateText}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                className="py-2 text-gray-500"
                                                                colSpan={3}
                                                            >
                                                                Sin historial disponible.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>
                                </>
                            )}
                        </section>
                    )}
                    </section>
                    {isPlanBronce && <section>{weeklyHistoryCard}</section>}
                </div>
            )}
        </div>
    )
}

export default TallerDashboard





