import type { EntityHistoricoHit } from '@/utils/entityDeleteHistoryCheck'

type DeleteHistoricoWarningProps = {
    loading: boolean
    items: EntityHistoricoHit[]
    entitySingular: string
    entityPlural: string
}

export function DeleteHistoricoWarning({
    loading,
    items,
    entitySingular,
    entityPlural,
}: DeleteHistoricoWarningProps) {
    if (loading) {
        return (
            <p className="mb-4 text-sm text-gray-500">
                Verificando si hay histórico asociado…
            </p>
        )
    }

    if (items.length === 0) return null

    const count = items.length
    const entityWord = count === 1 ? entitySingular : entityPlural

    return (
        <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-950"
        >
            <p className="font-semibold text-amber-900">
                Advertencia: eliminación irreversible
            </p>
            <p className="mt-2 text-sm leading-relaxed">
                Vas a eliminar <strong>{count}</strong> {entityWord} con
                histórico registrado (solicitudes, contactos, suscripciones,
                propuestas, vehículos u otros registros vinculados). Este cambio
                es <strong>irreversible</strong> y no podrás recuperar esa
                información asociada.
            </p>
            {count <= 6 ? (
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                    {items.map((item) => (
                        <li key={item.id}>{item.label}</li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-sm">
                    Incluye, entre otros:{' '}
                    {items
                        .slice(0, 4)
                        .map((item) => item.label)
                        .join(', ')}{' '}
                    y {count - 4} más.
                </p>
            )}
        </div>
    )
}
