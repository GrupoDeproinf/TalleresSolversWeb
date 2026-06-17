import {
    collection,
    doc,
    getDocs,
    query,
    Timestamp,
    where,
    writeBatch,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

export const isFreePlanAmount = (value: unknown) => {
    const amount = Number(value)
    return Number.isFinite(amount) && Math.abs(amount) < 0.01
}

export function parseCantidadServicios(raw: unknown): number {
    if (raw === undefined || raw === null) return 0
    if (typeof raw === 'number') {
        return Number.isFinite(raw) ? raw : 0
    }
    if (typeof raw === 'string') {
        const n = Number(String(raw).trim())
        return Number.isFinite(n) ? n : 0
    }
    return 0
}

export type PreviousApprovedSubscription = {
    cantidad: number
    monto: unknown
}

/**
 * Última suscripción Aprobada del mismo taller (excluye el doc actual).
 * En Firestore el estado sigue siendo Aprobado aunque la UI muestre Vencido.
 */
export async function getPreviousApprovedSubscription(
    tallerUid: string,
    currentSubscriptionDocId: string,
): Promise<PreviousApprovedSubscription | null> {
    const snap = await getDocs(
        query(
            collection(db, 'Subscripciones'),
            where('taller_uid', '==', tallerUid),
        ),
    )
    type Cand = { fechaFinMs: number; cantidad: number; monto: unknown }
    const candidates: Cand[] = []
    snap.docs.forEach((d) => {
        if (d.id === currentSubscriptionDocId) return
        const data = d.data() as {
            status?: string
            cantidad_servicios?: unknown
            fecha_fin?: unknown
            monto?: unknown
        }
        if (data.status !== 'Aprobado') return
        const f = data.fecha_fin
        const fechaFinMs = f instanceof Timestamp ? f.toMillis() : 0
        candidates.push({
            fechaFinMs,
            cantidad: parseCantidadServicios(data.cantidad_servicios),
            monto: data.monto,
        })
    })
    if (candidates.length === 0) return null
    candidates.sort((a, b) => b.fechaFinMs - a.fechaFinMs)
    const best = candidates[0]
    return { cantidad: best.cantidad, monto: best.monto }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

function wasServiceOff(data: { estatus?: unknown }): boolean {
    return data.estatus !== true
}

/**
 * Plan gratis → plan gratis: reactiva los servicios que tenía en el gratis
 * (`lastActive`). Si no hay historial, enciende los primeros n del plan.
 */
async function maybeActivateFreeToFreeServices(params: {
    tallerUid: string
    newLimit: number
}): Promise<{ usuarioCantidadServicios: string }> {
    const { tallerUid, newLimit } = params

    const serviciosSnap = await getDocs(
        query(
            collection(db, 'Servicios'),
            where('uid_taller', '==', tallerUid),
        ),
    )
    if (serviciosSnap.empty || newLimit <= 0) {
        return { usuarioCantidadServicios: String(Math.max(0, newLimit)) }
    }

    const sortedDocs = serviciosSnap.docs
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))

    const lastActiveDocs = sortedDocs.filter(
        (d) =>
            (d.data() as { lastActive?: unknown }).lastActive === true,
    )

    const docsToActivate =
        lastActiveDocs.length > 0
            ? lastActiveDocs.slice(0, newLimit)
            : sortedDocs.slice(0, newLimit)

    const activateIds = new Set(docsToActivate.map((d) => d.id))

    for (const chunk of chunkArray(sortedDocs, 500)) {
        const batch = writeBatch(db)
        for (const d of chunk) {
            if (!activateIds.has(d.id)) continue
            batch.update(doc(db, 'Servicios', d.id), {
                estatus: true,
                lastActive: true,
            })
        }
        await batch.commit()
    }

    return {
        usuarioCantidadServicios: String(
            Math.max(0, newLimit - docsToActivate.length),
        ),
    }
}

/**
 * Compara cantidad_servicios del plan anterior vs el nuevo.
 * - Igual o nuevo mayor: enciende todos los servicios del taller (estatus true,
 *   lastActive true) y calcula `subscripcion_actual.cantidad_servicios`:
 *   - Si las cantidades del plan son iguales: debe quedar en 0.
 *   - Si el plan nuevo trae más cupos: cupo del plan nuevo menos cuántos
 *     servicios pasaron de estatus false a true.
 * - Nuevo menor: no modifica servicios.
 */
async function maybeActivateAllTallerServicesAfterApproval(params: {
    tallerUid: string
    newPlanCantidadServiciosRaw: unknown
    previousLimit: number
}): Promise<{ usuarioCantidadServicios?: string }> {
    const { tallerUid, newPlanCantidadServiciosRaw, previousLimit } = params
    const oldLimit = previousLimit
    const newLimit = parseCantidadServicios(newPlanCantidadServiciosRaw)
    if (newLimit < oldLimit) {
        return {}
    }

    const serviciosSnap = await getDocs(
        query(
            collection(db, 'Servicios'),
            where('uid_taller', '==', tallerUid),
        ),
    )
    if (serviciosSnap.empty) {
        return {}
    }

    const flippedFalseToTrue = serviciosSnap.docs.filter((d) =>
        wasServiceOff(d.data() as { estatus?: unknown }),
    ).length

    for (const chunk of chunkArray(serviciosSnap.docs, 500)) {
        const batch = writeBatch(db)
        for (const d of chunk) {
            batch.update(doc(db, 'Servicios', d.id), {
                estatus: true,
                lastActive: true,
            })
        }
        await batch.commit()
    }

    let usuarioCantidadServicios: string
    if (newLimit === oldLimit) {
        usuarioCantidadServicios = '0'
    } else {
        usuarioCantidadServicios = String(
            Math.max(0, newLimit - flippedFalseToTrue),
        )
    }
    return { usuarioCantidadServicios }
}

/**
 * Activa servicios al aprobar o suscribir un plan.
 * - Gratis → gratis: restaura los servicios del plan gratuito anterior.
 * - Otros cambios de plan: aplica la validación por cupo del plan anterior.
 */
export async function maybeActivateServicesOnSubscription(params: {
    tallerUid: string
    subscriptionDocId: string
    newPlanCantidadServiciosRaw: unknown
    newPlanMontoRaw: unknown
}): Promise<{ usuarioCantidadServicios?: string }> {
    const {
        tallerUid,
        subscriptionDocId,
        newPlanCantidadServiciosRaw,
        newPlanMontoRaw,
    } = params

    const previous = await getPreviousApprovedSubscription(
        tallerUid,
        subscriptionDocId,
    )
    const newLimit = parseCantidadServicios(newPlanCantidadServiciosRaw)

    const isFreeToFree =
        isFreePlanAmount(newPlanMontoRaw) &&
        previous !== null &&
        isFreePlanAmount(previous.monto)

    if (isFreeToFree) {
        return maybeActivateFreeToFreeServices({ tallerUid, newLimit })
    }

    return maybeActivateAllTallerServicesAfterApproval({
        tallerUid,
        newPlanCantidadServiciosRaw,
        previousLimit: previous?.cantidad ?? 0,
    })
}
