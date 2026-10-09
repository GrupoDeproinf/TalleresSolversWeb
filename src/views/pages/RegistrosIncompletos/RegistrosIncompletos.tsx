import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { HiOutlineRefresh } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { db } from '@/configs/firebaseAssets.config'

// Req. 005: talleres que empezaron el registro en la app y no lo terminaron.
// La app informa el avance al servidor (colección RegistrosIncompletos); aquí
// se ve a quién escribirle y qué le falta, sin depender del webhook externo.

type Registro = {
    id: string
    responsable?: string
    nombre?: string
    email?: string
    phone?: string
    whatsapp?: string
    paso?: number
    faltantes?: string[]
    avisado?: boolean
    creadoEn?: unknown
    actualizadoEn?: unknown
}

const TOTAL_PASOS = 3

const aFecha = (v: unknown): Date | null => {
    if (!v) return null
    const x = v as { toDate?: () => Date; seconds?: number }
    if (typeof x.toDate === 'function') return x.toDate()
    if (typeof x.seconds === 'number') return new Date(x.seconds * 1000)
    const d = new Date(v as string)
    return isNaN(d.getTime()) ? null : d
}

const haceCuanto = (d: Date | null): string => {
    if (!d) return '—'
    const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000))
    if (min < 60) return `hace ${min} min`
    const h = Math.round(min / 60)
    if (h < 48) return `hace ${h} h`
    return `hace ${Math.round(h / 24)} días`
}

/** Enlace de WhatsApp con un mensaje que dice exactamente qué falta. */
const enlaceWhatsApp = (r: Registro): string => {
    const numero = String(r.whatsapp || r.phone || '').replace(/\D/g, '')
    const nombre = String(r.responsable || '').trim().split(' ')[0]
    const faltan = (r.faltantes || []).slice(0, 6)
    const texto =
        `Hola${nombre ? ` ${nombre}` : ''}, te escribimos de Solvers. ` +
        `Vimos que empezaste a registrar ${r.nombre ? `"${r.nombre}"` : 'tu taller'} y no lo terminaste. ` +
        (faltan.length
            ? `Solo te falta: ${faltan.join(', ')}. `
            : 'Te falta muy poco para terminar. ') +
        '¿Te ayudamos a completarlo?'
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

const RegistrosIncompletos = () => {
    const [registros, setRegistros] = useState<Registro[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [recarga, setRecarga] = useState(0)

    useEffect(() => {
        setCargando(true)
        setError('')
        const cancelar = onSnapshot(
            collection(db, 'RegistrosIncompletos'),
            (snap) => {
                setRegistros(
                    snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })),
                )
                setCargando(false)
            },
            () => {
                setError('No se pudieron cargar los registros incompletos.')
                setCargando(false)
            },
        )
        return cancelar
    }, [recarga])

    const ordenados = useMemo(
        () =>
            [...registros].sort(
                (a, b) =>
                    (aFecha(b.actualizadoEn)?.getTime() || 0) -
                    (aFecha(a.actualizadoEn)?.getTime() || 0),
            ),
        [registros],
    )

    return (
        <div>
            <div className="mb-2 flex items-center gap-3">
                <h1 className="text-4xl font-bold text-[#000B7E]">
                    Registros incompletos
                </h1>
                <button
                    type="button"
                    title="Actualizar"
                    aria-label="Actualizar"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#000B7E] shadow-sm transition hover:border-[#000B7E]/35 hover:bg-[#000B7E]/5"
                    onClick={() => setRecarga((n) => n + 1)}
                >
                    <HiOutlineRefresh className="h-5 w-5" />
                </button>
            </div>
            <p className="mb-6 max-w-3xl text-sm text-gray-600">
                Talleres que empezaron el registro en la app y no lo
                terminaron. Escríbeles por WhatsApp con el detalle de lo que
                les falta. Cada registro desaparece de esta lista cuando el
                taller completa su registro, o a los 30 días.
            </p>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            ) : cargando ? (
                <p className="text-sm text-gray-500">Cargando…</p>
            ) : !ordenados.length ? (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-600">
                    No hay registros incompletos en este momento.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            <tr>
                                <th className="px-4 py-3">Responsable</th>
                                <th className="px-4 py-3">Negocio</th>
                                <th className="px-4 py-3">Avance</th>
                                <th className="px-4 py-3">Qué le falta</th>
                                <th className="px-4 py-3">Última actividad</th>
                                <th className="px-4 py-3">Contacto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ordenados.map((r) => {
                                const numero = String(
                                    r.whatsapp || r.phone || '',
                                )
                                return (
                                    <tr key={r.id} className="align-top">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">
                                                {r.responsable || '—'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {r.email || ''}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                            {r.nombre || '—'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-800">
                                            Paso {r.paso || 1} de {TOTAL_PASOS}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {(r.faltantes || []).length
                                                ? (r.faltantes || []).join(', ')
                                                : '—'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {haceCuanto(
                                                aFecha(r.actualizadoEn),
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="mb-1 text-gray-800">
                                                {numero || '—'}
                                            </div>
                                            {numero ? (
                                                <a
                                                    href={enlaceWhatsApp(r)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#128C4B] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                                                >
                                                    <FaWhatsapp className="h-4 w-4" />
                                                    Escribir
                                                </a>
                                            ) : null}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default RegistrosIncompletos
