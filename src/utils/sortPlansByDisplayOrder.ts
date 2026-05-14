/**
 * Orden de presentación: Gratis, Bronce, Plata, Oro.
 * "plata" se evalúa antes que "oro" porque "plata" contiene la subcadena "oro".
 */
export function sortPlansByDisplayOrder<
    T extends { nombre?: string; monto?: number | string },
>(planes: T[]): T[] {
    const normalizedNombre = (nombre: string) =>
        nombre
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()

    const tierIndex = (plan: T): number => {
        const amount = Number(plan.monto)
        if (Number.isFinite(amount) && Math.abs(amount) < 0.01) {
            return 0
        }
        const n = normalizedNombre(String(plan.nombre || ''))
        if (n.includes('gratis')) return 0
        if (n.includes('bronce')) return 1
        if (n.includes('plata')) return 2
        if (n.includes('oro')) return 3
        return 100
    }

    return [...planes].sort((a, b) => {
        const d = tierIndex(a) - tierIndex(b)
        if (d !== 0) return d
        return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
    })
}
