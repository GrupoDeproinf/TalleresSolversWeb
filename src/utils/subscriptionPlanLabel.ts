/**
 * Misma lógica que el dashboard de ventas: nombre canónico del plan de un doc de suscripción.
 */
export function getSubscriptionPlanName(data: Record<string, unknown>): string {
    const planFields = [
        data.nombre,
        data.plan,
        data.plan_name,
        data.plan_nombre,
        data.nombre_plan,
        data.tipo_plan,
        data.subscripcion_actual &&
            typeof data.subscripcion_actual === 'object' &&
            'plan' in data.subscripcion_actual
            ? (data.subscripcion_actual as Record<string, unknown>).plan
            : undefined,
    ]

    const validPlan = planFields.find(
        (value) => typeof value === 'string' && value.trim().length > 0,
    ) as string | undefined

    return validPlan?.trim() || 'Sin plan'
}
