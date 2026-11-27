// Portada del administrador: lo que hay que atender hoy y accesos directos a
// cada tarea. Las gráficas siguen en «Estadísticas»; aquí solo cuenta lo que
// pide una acción.
import { useNavigate, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import {
    HiOutlineCreditCard,
    HiOutlineOfficeBuilding,
    HiOutlineClipboardList,
    HiOutlinePhone,
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineCalendar,
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import SolversHero from '@/views/sales/SalesDashboard/components/SolversHero'
import '@/views/sales/SalesDashboard/solversDashboard.css'
import usePendientesAdmin from '@/utils/hooks/usePendientesAdmin'
import { useAppSelector } from '@/store'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { whatsappUrl } from '@/utils/whatsapp'

export const RUTAS_PENDIENTES = {
    enEspera: `${APP_PREFIX_PATH}/garages?estado=${encodeURIComponent('En espera por aprobación')}`,
    pagos: `${APP_PREFIX_PATH}/subscriptions?estado=pendiente`,
    vencen: `${APP_PREFIX_PATH}/garages?estado=Vencidos`,
    registros: `${APP_PREFIX_PATH}/registros-incompletos`,
}

type Acceso = {
    titulo: string
    detalle: string
    ruta: string
    Icono: ComponentType<{ className?: string }>
}

const ACCESOS: Acceso[] = [
    {
        titulo: 'Negocios',
        detalle: 'Aprobar, editar y ver su plan',
        ruta: `${APP_PREFIX_PATH}/garages`,
        Icono: HiOutlineOfficeBuilding,
    },
    {
        titulo: 'Validación de pagos',
        detalle: 'Comprobantes por revisar',
        ruta: RUTAS_PENDIENTES.pagos,
        Icono: HiOutlineCreditCard,
    },
    {
        titulo: 'Solicitudes',
        detalle: 'Lo que piden los conductores',
        ruta: `${APP_PREFIX_PATH}/requestList`,
        Icono: HiOutlineClipboardList,
    },
    {
        titulo: 'Contactos a talleres',
        detalle: 'Quién llamó a qué negocio',
        ruta: `${APP_PREFIX_PATH}/ServiceContact`,
        Icono: HiOutlinePhone,
    },
    {
        titulo: 'Usuarios',
        detalle: 'Conductores y personal',
        ruta: `${APP_PREFIX_PATH}/users`,
        Icono: HiOutlineUsers,
    },
    {
        titulo: 'Estadísticas',
        detalle: 'Gráficas y cifras del negocio',
        ruta: `${APP_PREFIX_PATH}/sales/dashboard`,
        Icono: HiOutlineChartBar,
    },
]

const textoVencimiento = (fecha: Date) => {
    const hoy = new Date()
    const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()
    const b = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime()
    const dias = Math.round((b - a) / 86400000)
    if (dias <= 0) return 'Vence hoy'
    if (dias === 1) return 'Vence mañana'
    return `Vence el ${fecha.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric' })}`
}

const Hoy = () => {
    const navigate = useNavigate()
    const nombre = useAppSelector((state) => state.auth.user.userName)
    const p = usePendientesAdmin()

    return (
        <div className="sv-dash flex flex-col gap-4">
            <SolversHero
                nombre={nombre}
                enEspera={p.enEspera}
                pagosPorValidar={p.pagosPorValidar}
                vencenHoy={p.vencenHoy}
                registrosIncompletos={p.registrosIncompletos}
                irA={(ruta) => navigate(ruta)}
                rutas={RUTAS_PENDIENTES}
            />
            {!p.listo && (
                <p className="text-sm text-gray-500">Contando pendientes…</p>
            )}
            {p.error && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    No pudimos leer todos los datos. Las cifras pueden no estar
                    completas; recarga la página en un momento.
                </p>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <section
                    data-tour="hoy-accesos"
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                    <h2 className="sv-sin-raya mb-1 text-lg font-bold text-[#151D61]">
                        Ir directo a
                    </h2>
                    <p className="mb-4 text-sm text-gray-500">
                        Las tareas de todos los días, a un clic.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {ACCESOS.map(({ titulo, detalle, ruta, Icono }) => (
                            <Link
                                key={titulo}
                                to={ruta}
                                className="group flex items-center gap-3 rounded-xl p-3 ring-1 ring-gray-100 transition hover:bg-[#151D61]/[0.04] hover:ring-[#151D61]/20"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#151D61]/[0.06] text-[#151D61]">
                                    <Icono className="h-5 w-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block font-semibold text-[#151D61]">
                                        {titulo}
                                    </span>
                                    <span className="block truncate text-xs text-gray-500">
                                        {detalle}
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section
                    data-tour="hoy-vencimientos"
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                    <div className="mb-1 flex items-center gap-2">
                        <HiOutlineCalendar className="h-5 w-5 text-[#151D61]" />
                        <h2 className="sv-sin-raya text-lg font-bold text-[#151D61]">
                            Vencen esta semana
                        </h2>
                    </div>
                    <p className="mb-4 text-sm text-gray-500">
                        Escríbeles antes de que se les apague el plan.
                    </p>
                    {p.listo && p.proximosVencimientos.length === 0 ? (
                        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                            Ningún plan vence en los próximos 7 días.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {p.proximosVencimientos.slice(0, 8).map((v) => {
                                const enlace = whatsappUrl(
                                    v.telefono,
                                    `Hola, te escribimos de Solvers. Tu plan de ${v.nombre} ${textoVencimiento(v.fechaFin).toLowerCase()}. ¿Te ayudamos a renovarlo?`,
                                )
                                return (
                                    <li
                                        key={v.uid}
                                        className="flex items-center gap-3 py-2.5"
                                    >
                                        <Link
                                            to={`/profilegarage/${v.uid}?tab=planes`}
                                            className="min-w-0 flex-1"
                                        >
                                            <span className="block truncate font-semibold text-[#151D61] hover:underline">
                                                {v.nombre}
                                            </span>
                                            <span className="block text-xs text-gray-500">
                                                {textoVencimiento(v.fechaFin)}
                                            </span>
                                        </Link>
                                        {enlace ? (
                                            <a
                                                href={enlace}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Escribir por WhatsApp"
                                                aria-label={`Escribir a ${v.nombre} por WhatsApp`}
                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20"
                                            >
                                                <FaWhatsapp className="h-5 w-5" />
                                            </a>
                                        ) : null}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                    {p.proximosVencimientos.length > 8 ? (
                        <p className="mt-2 text-xs text-gray-500">
                            Y {p.proximosVencimientos.length - 8} más esta semana.
                        </p>
                    ) : null}
                </section>
            </div>
        </div>
    )
}

export default Hoy
