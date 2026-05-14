/**
 * Criterio único para "pago pendiente por validar" (dashboard + pantalla de validación).
 */

export function subscriptionMontoNumerico(data: Record<string, unknown>): number {
    const monto = data.monto
    if (typeof monto === 'string') {
        const n = parseFloat(monto)
        return Number.isFinite(n) ? n : 0
    }
    if (typeof monto === 'number' && Number.isFinite(monto)) {
        return monto
    }
    return 0
}

export function subscriptionEsPagoConMonto(data: Record<string, unknown>): boolean {
    return subscriptionMontoNumerico(data) >= 0.0001
}

export function subscriptionStatusEsPorAprobar(
    data: Record<string, unknown>,
): boolean {
    const key = String(data.status ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
    return key === 'poraprobar'
}

export function isPendingPaymentValidationSubscription(
    data: Record<string, unknown>,
): boolean {
    return (
        subscriptionStatusEsPorAprobar(data) &&
        subscriptionEsPagoConMonto(data)
    )
}
