import type { DocumentData, QuerySnapshot } from 'firebase/firestore'

/** `Usuarios` typeUser taller con `status` "Eliminado" no entra en métricas ni listados de suscripciones. */
export function isTallerUsuarioEliminado(status: unknown): boolean {
    const key = String(status ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    return key === 'eliminado'
}

export function getSubscriptionTallerUid(data: Record<string, unknown>): string {
    return String(data.taller_uid ?? data.uid_taller ?? '').trim()
}

/**
 * IDs de documentos en `Usuarios` que son taller y no están eliminados.
 */
export function collectActiveTallerDocIdsFromUsersSnapshot(
    usersSnapshot: QuerySnapshot<DocumentData>,
): Set<string> {
    const ids = new Set<string>()
    usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        const typeUser = String(data.typeUser || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
        if (typeUser !== 'taller') {
            return
        }
        const record = data as Record<string, unknown>
        if (isTallerUsuarioEliminado(record.status ?? data.status)) {
            return
        }
        ids.add(docSnap.id)
    })
    return ids
}

/** Suscripción atribuible a taller activo (o sin taller_uid en datos legacy). */
export function subscriptionIsFromActiveTaller(
    sub: Record<string, unknown>,
    activeTallerIds: Set<string>,
): boolean {
    const uid = getSubscriptionTallerUid(sub)
    if (!uid) {
        return true
    }
    return activeTallerIds.has(uid)
}
