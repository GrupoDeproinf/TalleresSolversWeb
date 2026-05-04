import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db, auth } from '@/configs/firebaseAssets.config'
import Chart from '@/components/shared/Chart'

type Usuario = {
    uid: string
    nombres?: string
    apellidos?: string
    nombre?: string
    nombre_taller?: string
    typeUser?: string
    status?: string
    certificador_nombre?: string
}

type DecisionRow = {
    uid: string
    taller: string
    status: 'Aprobado' | 'Rechazado'
}

type DashboardData = {
    approved: number
    rejected: number
    total: number
    recentDecisions: DecisionRow[]
    reviewerName: string
}

const EMPTY_DATA: DashboardData = {
    approved: 0,
    rejected: 0,
    total: 0,
    recentDecisions: [],
    reviewerName: '',
}

const normalizeText = (value: string | undefined) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

const getWorkshopName = (user: Usuario) =>
    user.nombre_taller ||
    user.nombre ||
    `${user.nombres || ''} ${user.apellidos || ''}`.trim() ||
    `Taller ${user.uid.slice(0, 6)}`

const getStatusDecision = (status: string | undefined): 'Aprobado' | 'Rechazado' | null => {
    const normalized = normalizeText(status)
    if (normalized.includes('aprob')) return 'Aprobado'
    if (normalized.includes('rechaz')) return 'Rechazado'
    return null
}

const CertificadorDashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DATA)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true)
            try {
                const currentUser = auth.currentUser
                const userTokens = new Set<string>()
                const displayName = String(currentUser?.displayName || '').trim()
                const email = String(currentUser?.email || '').trim()
                const uid = String(currentUser?.uid || '').trim()

                if (displayName) userTokens.add(normalizeText(displayName))
                if (email) userTokens.add(normalizeText(email))
                if (uid) userTokens.add(normalizeText(uid))

                const usersSnap = await getDocs(collection(db, 'Usuarios'))
                const users = usersSnap.docs.map(
                    (docSnap) =>
                        ({
                            uid: docSnap.id,
                            ...(docSnap.data() as Omit<Usuario, 'uid'>),
                        }) as Usuario,
                )

                const currentUserDoc = users.find((user) => user.uid === uid)
                const fullName =
                    currentUserDoc?.nombre ||
                    `${currentUserDoc?.nombres || ''} ${currentUserDoc?.apellidos || ''}`.trim()
                if (fullName) userTokens.add(normalizeText(fullName))

                const talleres = users.filter(
                    (user) => normalizeText(user.typeUser) === 'taller',
                )

                const myDecisions = talleres
                    .map((taller) => {
                        const decision = getStatusDecision(taller.status)
                        if (!decision) return null

                        const reviewer = normalizeText(taller.certificador_nombre)
                        const isMyDecision = reviewer && userTokens.has(reviewer)
                        if (!isMyDecision) return null

                        return {
                            uid: taller.uid,
                            taller: getWorkshopName(taller),
                            status: decision,
                        } as DecisionRow
                    })
                    .filter(Boolean) as DecisionRow[]

                const approved = myDecisions.filter((row) => row.status === 'Aprobado').length
                const rejected = myDecisions.filter((row) => row.status === 'Rechazado').length
                const reviewerName = fullName || displayName || email || 'Certificador'

                setDashboardData({
                    approved,
                    rejected,
                    total: approved + rejected,
                    recentDecisions: myDecisions.slice(0, 8),
                    reviewerName,
                })
            } catch (error) {
                console.error('Error al cargar dashboard del certificador:', error)
                setDashboardData(EMPTY_DATA)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchDashboardData()
    }, [])

    const decisionSeries = useMemo(
        () => [dashboardData.approved, dashboardData.rejected],
        [dashboardData.approved, dashboardData.rejected],
    )

    const approvalRate = useMemo(() => {
        if (dashboardData.total <= 0) return 0
        return (dashboardData.approved / dashboardData.total) * 100
    }, [dashboardData.approved, dashboardData.total])

    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 bg-gray-100 p-1">
            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <h1 className="text-lg font-semibold text-gray-900">Dashboard del certificador</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Vista simple de tus decisiones sobre talleres: aprobados y rechazados.
                </p>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Certificador
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                        {dashboardData.reviewerName}
                    </p>
                </article>
                <article className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Talleres aprobados
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">
                        {dashboardData.approved}
                    </p>
                </article>
                <article className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                        Talleres rechazados
                    </p>
                    <p className="mt-1 text-2xl font-bold text-red-800">{dashboardData.rejected}</p>
                </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">Distribucion de decisiones</h3>
                    </div>
                    <div className="p-3">
                        <Chart
                            donutTitle={`${dashboardData.total}`}
                            donutText="Decisiones"
                            series={decisionSeries}
                            customOptions={{
                                labels: ['Aprobados', 'Rechazados'],
                                legend: { show: true, position: 'bottom' },
                                colors: ['#16A34A', '#EF4444'],
                            }}
                            type="donut"
                            height={260}
                        />
                    </div>
                </article>

                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
                    <div className="bg-[#000B7E] px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">Resumen rapido</h3>
                    </div>
                    <div className="grid gap-3 p-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Total de decisiones</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {dashboardData.total}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Tasa de aprobacion</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {approvalRate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Tasa de rechazo</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {(100 - approvalRate).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </article>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="bg-[#000B7E] px-4 py-2">
                    <h3 className="text-sm font-semibold text-white">Ultimas decisiones registradas</h3>
                </div>
                <div className="p-3">
                    {dashboardData.recentDecisions.length > 0 ? (
                        <div className="space-y-2">
                            {dashboardData.recentDecisions.map((decision) => (
                                <article
                                    key={decision.uid}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                                >
                                    <p className="text-sm font-medium text-gray-900">{decision.taller}</p>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            decision.status === 'Aprobado'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {decision.status}
                                    </span>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            No hay decisiones (aprobado/rechazado) asociadas a este certificador.
                        </div>
                    )}
                </div>
            </section>

            {isLoading && (
                <section className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Cargando datos del certificador...
                </section>
            )}
        </div>
    )
}

export default CertificadorDashboard




