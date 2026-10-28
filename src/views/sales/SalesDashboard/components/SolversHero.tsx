// Encabezado del dashboard con la línea de la campaña "Encuentra a los buenos
// aquí": azul marino, amarillo Solvers, titular en cursiva y huella de
// neumático. A la derecha, los pendientes del día como accesos directos.
import type { ComponentType } from 'react'
import {
    HiOutlineClock,
    HiOutlineCreditCard,
    HiOutlineExclamation,
    HiChevronRight,
} from 'react-icons/hi'

type Pendiente = {
    etiqueta: string
    detalle: string
    valor: number
    Icono: ComponentType<{ className?: string }>
    onClick: () => void
}

/** Huella de neumático (decorativa). */
export const HuellaNeumatico = ({ className = '' }: { className?: string }) => (
    <svg
        aria-hidden
        className={className}
        viewBox="0 0 640 110"
        preserveAspectRatio="none"
    >
        <defs>
            <pattern
                id="sv-huella"
                width="30"
                height="110"
                patternUnits="userSpaceOnUse"
            >
                <path d="M3 6h13l7 40H10z" fill="currentColor" />
                <path d="M10 64h13l-7 40H3z" fill="currentColor" />
                <rect x="24" y="50" width="4" height="10" fill="currentColor" />
            </pattern>
        </defs>
        <rect width="640" height="110" fill="url(#sv-huella)" />
    </svg>
)

const Mosaico = ({ etiqueta, detalle, valor, Icono, onClick }: Pendiente) => (
    <button
        type="button"
        onClick={onClick}
        title={detalle}
        className="group flex w-full items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FCC800]"
    >
        <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                valor > 0
                    ? 'bg-[#FCC800] text-[#151D61]'
                    : 'bg-white/10 text-white/70'
            }`}
        >
            <Icono className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white leading-tight">
                {etiqueta}
            </span>
            <span className="block truncate text-xs text-white/60">
                {detalle}
            </span>
        </span>
        <span className="text-2xl font-extrabold tabular-nums text-white">
            {valor}
        </span>
        <HiChevronRight className="h-5 w-5 text-white/50 transition-transform group-hover:translate-x-0.5" />
    </button>
)

type Props = {
    nombre?: string
    enEspera: number
    pagosPorValidar: number
    vencenHoy: number
    irA: (ruta: string) => void
    rutas: { enEspera: string; pagos: string; vencen: string }
}

const SolversHero = ({
    nombre,
    enEspera,
    pagosPorValidar,
    vencenHoy,
    irA,
    rutas,
}: Props) => {
    const hoy = new Date().toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
    const hora = new Date().getHours()
    const saludo =
        hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
    const primerNombre = String(nombre || '').trim().split(/\s+/)[0]
    const totalPendientes = enEspera + pagosPorValidar + vencenHoy

    return (
        <section className="relative mb-4 overflow-hidden rounded-[28px] bg-[#151D61] p-6 text-white shadow-[0_18px_40px_-20px_rgba(21,29,97,0.6)] lg:p-8">
            <HuellaNeumatico className="pointer-events-none absolute -right-24 -top-6 h-24 w-[640px] rotate-[-14deg] text-[#FCC800] opacity-[0.16]" />
            <HuellaNeumatico className="pointer-events-none absolute -bottom-10 -left-32 h-20 w-[560px] rotate-[-14deg] text-[#FCC800] opacity-[0.10]" />
            <div className="pointer-events-none absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-[#FCC800] opacity-[0.07]" />

            <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#FCC800]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FCC800] ring-1 ring-[#FCC800]/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FCC800]" />
                        Panel Solvers · {hoy}
                    </span>
                    <h1 className="sv-sin-raya mt-4 text-[28px] font-extrabold leading-tight text-white lg:text-[34px]">
                        {saludo}
                        {primerNombre ? `, ${primerNombre}` : ''}
                    </h1>
                    <p className="mt-1 text-sm text-white/70 lg:text-base">
                        {totalPendientes > 0
                            ? `Tienes ${totalPendientes} ${totalPendientes === 1 ? 'pendiente' : 'pendientes'} por atender hoy.`
                            : 'Todo al día. No hay pendientes por atender.'}
                    </p>
                    <p className="mt-6 select-none text-2xl font-black uppercase italic leading-[0.95] tracking-tight text-white/95 lg:text-[32px]">
                        Encuentra a los{' '}
                        <span className="text-[#FCC800]">buenos</span>
                        <br />
                        aquí.
                    </p>
                    <div className="mt-2 h-[3px] w-40 rounded-full bg-[#FCC800]" />
                    <p className="mt-2 text-xs italic text-white/60">
                        Soluciones automotrices de confianza
                    </p>
                </div>

                <div className="rounded-[22px] bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Pendientes de hoy
                            </p>
                            <p className="text-xs text-white/60">
                                Toca uno para atenderlo
                            </p>
                        </div>
                        <HiOutlineClock className="h-5 w-5 text-[#FCC800]" />
                    </div>
                    <div className="grid gap-2">
                        <Mosaico
                            etiqueta="Negocios en revisión"
                            detalle="Registros nuevos por aprobar"
                            valor={enEspera}
                            Icono={HiOutlineClock}
                            onClick={() => irA(rutas.enEspera)}
                        />
                        <Mosaico
                            etiqueta="Pagos por validar"
                            detalle="Comprobantes reportados"
                            valor={pagosPorValidar}
                            Icono={HiOutlineCreditCard}
                            onClick={() => irA(rutas.pagos)}
                        />
                        <Mosaico
                            etiqueta="Vencen hoy"
                            detalle="Planes que terminan hoy"
                            valor={vencenHoy}
                            Icono={HiOutlineExclamation}
                            onClick={() => irA(rutas.vencen)}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SolversHero
