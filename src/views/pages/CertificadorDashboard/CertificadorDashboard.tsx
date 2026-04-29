import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, Timestamp } from 'firebase/firestore'
import {
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineCurrencyDollar,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import Chart from '@/components/shared/Chart'
import Progress from '@/components/ui/Progress'
import { db } from '@/configs/firebaseAssets.config'

type Propuesta = {
    uid_taller?: string
    status?: string
    precio_estimado?: string | number
    fecha_propuesta?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
    fecha_aceptada?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
    fecha_respuesta?: Timestamp | Date | { seconds?: number; _seconds?: number } | null
}

type Usuario = {
    uid?: string
    nombres?: string
    apellidos?: string
    nombre_taller?: string
    typeUser?: string
    estado_cuenta?: string
    estado?: string
    subscripcion_actual?: {
        nombre?: string
        status?: string
    }
}

type DashboardMetrics = {
    totalWorkshops: number
    activeWorkshops: number
    proposalsThisMonth: number
    accepted: number
    rejected: number
    pending: number
    expired: number
    closureRate: number
    averagePrice: number
    averageResponseMinutes: number
    weeklyResponses: number[]
    planLabels: string[]
    planCounts: number[]
    topWorkshops: Array<{
        uid: string
        name: string
        sent: number
        accepted: number
        acceptanceRate: number
    }>
}

const EMPTY_METRICS: DashboardMetrics = {
    totalWorkshops: 0,
    activeWorkshops: 0,
    proposalsThisMonth: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
    expired: 0,
    closureRate: 0,
    averagePrice: 0,
    averageResponseMinutes: 0,
    weeklyResponses: [0, 0, 0, 0, 0, 0, 0, 0],
    planLabels: [],
    planCounts: [],
    topWorkshops: [],
}

const STATUS_LABELS = ['Aceptadas', 'Rechazadas', 'Pendientes', 'Expiradas']
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

const getStatusBucket = (status: string | undefined) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized.includes('acept')) return 'accepted'
    if (normalized.includes('rechaz')) return 'rejected'
    if (normalized.includes('expir')) return 'expired'
    return 'pending'
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

const CertificadorDashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true)
            try {
                const [propuestasSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'Propuestas')),
                    getDocs(collection(db, 'Usuarios')),
                ])

                const propuestas = propuestasSnap.docs.map((docSnap) => docSnap.data() as Propuesta)
                const users = usersSnap.docs.map(
                    (docSnap) =>
                        ({
                            uid: docSnap.id,
                            ...(docSnap.data() as Omit<Usuario, 'uid'>),
                        }) as Usuario,
                )

                const talleres = users.filter(
                    (user) => String(user.typeUser || '').toLowerCase() === 'taller',
                )
                const now = new Date()
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                const firstTrackedWeek = getWeekStart(new Date())
                firstTrackedWeek.setDate(firstTrackedWeek.getDate() - 7 * 7)
                const weeklyResponses = Array.from({ length: 8 }, () => 0)

                let accepted = 0
                let rejected = 0
                let pending = 0
                let expired = 0
                let proposalsThisMonth = 0
                let totalPrice = 0
                let pricedCount = 0
                let totalResponseMinutes = 0
                let responseCount = 0

                const workshopSummary = new Map<
                    string,
                    { sent: number; accepted: number; name: string }
                >()

                for (const proposal of propuestas) {
                    const statusBucket = getStatusBucket(proposal.status)
                    if (statusBucket === 'accepted') accepted += 1
                    else if (statusBucket === 'rejected') rejected += 1
                    else if (statusBucket === 'expired') expired += 1
                    else pending += 1

                    const proposalDate = toDate(proposal.fecha_propuesta)
                    if (proposalDate && proposalDate >= monthStart) proposalsThisMonth += 1

                    const price = parseCurrencyToNumber(proposal.precio_estimado)
                    if (price !== null && price >= 0) {
                        totalPrice += price
                        pricedCount += 1
                    }

                    const responseDate = toDate(proposal.fecha_respuesta) || toDate(proposal.fecha_aceptada)
                    if (proposalDate && responseDate && responseDate >= proposalDate) {
                        const diffMinutes =
                            (responseDate.getTime() - proposalDate.getTime()) / (1000 * 60)
                        totalResponseMinutes += diffMinutes
                        responseCount += 1

                        const responseWeekStart = getWeekStart(responseDate)
                        if (responseWeekStart >= firstTrackedWeek) {
                            const weekIndex = Math.floor(
                                (responseWeekStart.getTime() - firstTrackedWeek.getTime()) /
                                    (1000 * 60 * 60 * 24 * 7),
                            )
                            if (weekIndex >= 0 && weekIndex < weeklyResponses.length) {
                                weeklyResponses[weekIndex] += 1
                            }
                        }
                    }

                    const workshopUid = String(proposal.uid_taller || '')
                    if (!workshopUid) continue
                    const existing = workshopSummary.get(workshopUid)
                    if (existing) {
                        existing.sent += 1
                        if (statusBucket === 'accepted') existing.accepted += 1
                    } else {
                        const workshopUser = talleres.find((user) => user.uid === workshopUid)
                        const workshopName =
                            workshopUser?.nombre_taller ||
                            `${workshopUser?.nombres || ''} ${workshopUser?.apellidos || ''}`.trim() ||
                            `Negocio ${workshopUid.slice(0, 6)}`
                        workshopSummary.set(workshopUid, {
                            sent: 1,
                            accepted: statusBucket === 'accepted' ? 1 : 0,
                            name: workshopName,
                        })
                    }
                }

                const normalizedState = (value: string | undefined) =>
                    String(value || '').trim().toLowerCase()
                const activeWorkshops = talleres.filter((workshop) => {
                    const accountState = normalizedState(workshop.estado_cuenta)
                    const state = normalizedState(workshop.estado)
                    return (
                        accountState.includes('activo') ||
                        accountState.includes('aprob') ||
                        state.includes('activo')
                    )
                }).length

                const approvedPlans = new Map<string, number>()
                for (const workshop of talleres) {
                    const plan = workshop.subscripcion_actual
                    const planName = String(plan?.nombre || '').trim()
                    const planStatus = String(plan?.status || '').toLowerCase()
                    if (!planName || !planStatus.includes('aprob')) continue
                    approvedPlans.set(planName, (approvedPlans.get(planName) || 0) + 1)
                }

                const planLabels = Array.from(approvedPlans.keys())
                const planCounts = planLabels.map((label) => approvedPlans.get(label) || 0)

                const topWorkshops = Array.from(workshopSummary.entries())
                    .map(([uid, row]) => ({
                        uid,
                        name: row.name,
                        sent: row.sent,
                        accepted: row.accepted,
                        acceptanceRate: row.sent > 0 ? (row.accepted / row.sent) * 100 : 0,
                    }))
                    .sort((a, b) => b.acceptanceRate - a.acceptanceRate || b.sent - a.sent)
                    .slice(0, 5)

                const totalProposals = propuestas.length
                setMetrics({
                    totalWorkshops: talleres.length,
                    activeWorkshops,
                    proposalsThisMonth,
                    accepted,
                    rejected,
                    pending,
                    expired,
                    closureRate: totalProposals > 0 ? (accepted / totalProposals) * 100 : 0,
                    averagePrice: pricedCount > 0 ? totalPrice / pricedCount : 0,
                    averageResponseMinutes:
                        responseCount > 0 ? totalResponseMinutes / responseCount : 0,
                    weeklyResponses,
                    planLabels,
                    planCounts,
                    topWorkshops,
                })
            } catch (error) {
                console.error('Error al cargar metricas del dashboard del certificador:', error)
                setMetrics(EMPTY_METRICS)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchMetrics()
    }, [])

    const weekXAxis = useMemo(() => buildLast8WeeksLabels(), [])

    const quoteStatusData = useMemo(
        () => [metrics.accepted, metrics.rejected, metrics.pending, metrics.expired],
        [metrics.accepted, metrics.rejected, metrics.pending, metrics.expired],
    )

    const responseGaugePercent = useMemo(() => {
        const targetMinutes = 180
        if (metrics.averageResponseMinutes <= 0) return 100
        const ratio = (targetMinutes / metrics.averageResponseMinutes) * 100
        return Math.max(0, Math.min(100, Math.round(ratio)))
    }, [metrics.averageResponseMinutes])

    const kpiCards = [
        {
            title: 'Negocios registrados',
            value: metrics.totalWorkshops,
            hint: `${metrics.activeWorkshops} activos actualmente`,
            bgColor: 'bg-[#000B7E]',
            icon: HiOutlineOfficeBuilding,
        },
        {
            title: 'Cotizaciones del mes',
            value: metrics.proposalsThisMonth,
            hint: 'Propuestas emitidas en el mes actual',
            bgColor: 'bg-blue-800',
            icon: HiOutlineChartBar,
        },
        {
            title: 'Tasa de cierre global',
            value: `${metrics.closureRate.toFixed(1)}%`,
            hint: `${metrics.accepted} aceptadas de ${
                metrics.accepted + metrics.rejected + metrics.pending + metrics.expired
            }`,
            bgColor: 'bg-blue-600',
            icon: HiOutlineCheckCircle,
        },
        {
            title: 'Precio promedio cotizado',
            value: `$${metrics.averagePrice.toFixed(0)}`,
            hint: 'Promedio de precios estimados en propuestas',
            bgColor: 'bg-indigo-600',
            icon: HiOutlineCurrencyDollar,
        },
    ]

    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 bg-gray-100 p-1">
            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <h1 className="text-lg font-semibold text-gray-900">
                    Dashboard de certificacion de negocios
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    Vista de control para evaluar rendimiento y estado de negocios en la
                    plataforma.
                </p>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((card) => (
                    <article
                        key={card.title}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                        <div className={`${card.bgColor} flex items-center justify-between px-4 py-3`}>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                                {card.title}
                            </h3>
                            <card.icon className="text-lg text-white/90" />
                        </div>
                        <div className="px-4 py-4">
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            <p className="mt-1 text-xs text-gray-600">{card.hint}</p>
                        </div>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">
                            Estado global de cotizaciones
                        </h3>
                    </div>
                    <div className="p-3">
                        <Chart
                            donutTitle={`${quoteStatusData.reduce((acc, value) => acc + value, 0)}`}
                            donutText="Cotizaciones"
                            series={quoteStatusData}
                            customOptions={{
                                labels: STATUS_LABELS,
                                legend: { show: true, position: 'bottom' },
                                colors: STATUS_COLORS,
                            }}
                            type="donut"
                            height={260}
                        />
                    </div>
                </article>

                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">
                            Historial de respuestas (ultimas 8 semanas)
                        </h3>
                    </div>
                    <div className="p-3">
                        <Chart
                            type="line"
                            series={[
                                {
                                    name: 'Respuestas registradas',
                                    data: metrics.weeklyResponses,
                                },
                            ]}
                            xAxis={weekXAxis}
                            height={260}
                            customOptions={{
                                colors: ['#000B7E'],
                                stroke: { curve: 'smooth', width: [3] },
                                legend: { position: 'top', horizontalAlign: 'left' },
                            }}
                        />
                    </div>
                </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">Tiempo promedio de respuesta</h3>
                    </div>
                    <div className="flex items-center justify-center p-6">
                        <div className="flex items-center justify-center">
                            <Progress
                                className="mx-auto"
                                variant="circle"
                                percent={responseGaugePercent}
                                width={170}
                                gapDegree={110}
                                gapPosition="bottom"
                                strokeWidth={10}
                                customInfo={
                                    <div className="text-center leading-tight">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {metrics.averageResponseMinutes.toFixed(1)} min
                                        </p>
                                        <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                            promedio global
                                        </span>
                                    </div>
                                }
                            />
                        </div>

                    </div>
                </article>

                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">Distribucion de planes aprobados</h3>
                    </div>
                    <div className="p-3">
                        {metrics.planLabels.length > 0 ? (
                            <Chart
                                type="bar"
                                series={[{ name: 'Negocios', data: metrics.planCounts }]}
                                xAxis={metrics.planLabels}
                                height={250}
                                customOptions={{
                                    colors: ['#2563EB'],
                                    plotOptions: {
                                        bar: { borderRadius: 4, columnWidth: '45%' },
                                    },
                                    legend: { show: false },
                                }}
                            />
                        ) : (
                            <div className="flex min-h-[250px] items-center justify-center text-sm text-gray-500">
                                Sin planes aprobados para mostrar.
                            </div>
                        )}
                    </div>
                </article>

                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">
                            Top negocios por efectividad
                        </h3>
                    </div>
                    <div className="p-3">
                        {metrics.topWorkshops.length > 0 ? (
                            <div className="space-y-2">
                                {metrics.topWorkshops.map((workshop) => (
                                    <div
                                        key={workshop.uid}
                                        className="rounded-lg border border-gray-200 bg-white p-2.5"
                                    >
                                        <p className="text-sm font-semibold text-gray-900">
                                            {workshop.name}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {workshop.accepted} aceptadas de {workshop.sent} propuestas
                                        </p>
                                        <p className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                            {workshop.acceptanceRate.toFixed(1)}% efectividad
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[250px] items-center justify-center text-sm text-gray-500">
                                Sin datos de negocios aun.
                            </div>
                        )}
                    </div>
                </article>
            </section>

            {isLoading && (
                <section className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Cargando indicadores del certificador...
                </section>
            )}
        </div>
    )
}

export default CertificadorDashboard




