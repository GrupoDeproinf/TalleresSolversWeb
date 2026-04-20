const summaryCards = [
    { title: 'Servicios pendientes', value: '08', hint: '3 para hoy' },
    { title: 'Servicios en proceso', value: '05', hint: '2 con prioridad alta' },
    { title: 'Servicios completados', value: '14', hint: 'Ultimos 7 dias' },
    { title: 'Clientes nuevos', value: '06', hint: 'Esta semana' },
]

const quickActions = [
    'Registrar ingreso de vehiculo',
    'Asignar tecnico a un servicio',
    'Actualizar estado de orden',
    'Contactar cliente',
]

const recentItems = [
    {
        plate: 'ABC-123',
        customer: 'Carlos Martinez',
        status: 'En revision',
        time: 'Hace 10 min',
    },
    {
        plate: 'JKL-740',
        customer: 'Andrea Torres',
        status: 'Esperando repuesto',
        time: 'Hace 35 min',
    },
    {
        plate: 'QWE-552',
        customer: 'Luis Gomez',
        status: 'Listo para entrega',
        time: 'Hace 1 h',
    },
]

const TallerDashboard = () => {
    return (
        <div className="min-h-[60vh] space-y-6" aria-label="Dashboard del taller">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Dashboard del taller
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Resumen operativo
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Vista rapida del estado de trabajo y acciones frecuentes.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {card.title}
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                            {card.value}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {card.hint}
                        </p>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 xl:col-span-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Accesos rapidos
                    </h3>
                    <div className="mt-4 space-y-2">
                        {quickActions.map((action) => (
                            <button
                                key={action}
                                type="button"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </article>

                <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 xl:col-span-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Actividad reciente
                    </h3>
                    <div className="mt-4 space-y-3">
                        {recentItems.map((item) => (
                            <div
                                key={item.plate}
                                className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-600 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {item.plate} - {item.customer}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.time}
                                    </p>
                                </div>
                                <span className="inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    )
}

export default TallerDashboard
