// Cálculos de la pantalla de validación de pagos.
// El precio del plan es sin IVA; el taller paga el total con IVA, en bolívares
// a la tasa oficial del BCV del día del pago.

export const IVA_RATE = 0.16

export type TasaBcv = { fecha: string; tasa: number; manual?: boolean; fuente?: string }

export const redondear = (n: number, dec = 2): number =>
    Math.round((n + Number.EPSILON) * 10 ** dec) / 10 ** dec

export const aNumero = (v: unknown): number | null => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    if (typeof v !== 'string' || !v.trim()) return null
    const n = Number(v.trim().replace(',', '.'))
    return Number.isFinite(n) ? n : null
}

/** Convierte lo que venga (Timestamp, ISO, dd/mm/aaaa) en fecha, o null. */
export const aFecha = (v: unknown): Date | null => {
    if (!v) return null
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v
    const o = v as { toDate?: () => Date; seconds?: number; _seconds?: number }
    if (typeof o.toDate === 'function') return o.toDate()
    if (typeof o.seconds === 'number') return new Date(o.seconds * 1000)
    if (typeof o._seconds === 'number') return new Date(o._seconds * 1000)
    if (typeof v === 'string') {
        const t = v.trim()
        const m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
        if (m) {
            const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12)
            return isNaN(d.getTime()) ? null : d
        }
        const soloDia = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        const d = soloDia
            ? new Date(Number(soloDia[1]), Number(soloDia[2]) - 1, Number(soloDia[3]), 12)
            : new Date(t)
        return isNaN(d.getTime()) ? null : d
    }
    return null
}

/** Día de Venezuela (UTC-4) como 'AAAA-MM-DD'. */
export const diaVE = (d: Date = new Date()): string =>
    new Date(d.getTime() - 4 * 3600000).toISOString().slice(0, 10)

export const fechaCorta = (d: Date | null): string =>
    d
        ? d.toLocaleDateString('es-VE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'America/Caracas',
          })
        : '—'

/** Tasa vigente un día: la más reciente con fecha valor igual o anterior. `tasas` ordenadas ascendente. */
export const tasaDelDia = (tasas: TasaBcv[], dia: string): TasaBcv | null => {
    let lo = 0
    let hi = tasas.length - 1
    let res: TasaBcv | null = null
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (tasas[mid].fecha <= dia) {
            res = tasas[mid]
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return res
}

export type MontosPago = {
    subtotal: number
    iva: number
    total: number
    tasa: number | null
    montoBs: number | null
}

export const calcularMontos = (precioPlan: number, tasa: number | null): MontosPago => {
    const subtotal = redondear(precioPlan)
    const iva = redondear(subtotal * IVA_RATE)
    const total = redondear(subtotal + iva)
    return {
        subtotal,
        iva,
        total,
        tasa,
        montoBs: tasa && tasa > 0 ? redondear(total * tasa) : null,
    }
}

export type EstatusPago = 'Pagado' | 'Pendiente' | 'Vencido'

const normalizar = (v: unknown) =>
    String(v ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '')

export const estatusPago = (status: unknown, fechaFin: Date | null, ahora = new Date()): EstatusPago => {
    const s = normalizar(status)
    if (s === 'poraprobar') return 'Pendiente'
    if (s === 'vencido') return 'Vencido'
    if (fechaFin && fechaFin.getTime() < ahora.getTime()) return 'Vencido'
    return 'Pagado'
}

export const usd = (n: number | null): string =>
    n === null ? '—' : `$${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const bs = (n: number | null): string =>
    n === null ? '—' : `Bs ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const tasaTexto = (n: number | null): string =>
    n === null ? '—' : n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
