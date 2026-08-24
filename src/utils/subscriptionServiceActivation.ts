import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

/**
 * Dias por defecto del plan gratis cuando el documento del plan no trae
 * vigencia. Requerimiento 001 punto 6: bajo de 30 a 5.
 * El valor real vive en Firestore (Planes/<plan gratis>.vigencia).
 */
export const FREE_PLAN_DIAS_POR_DEFECTO = 5

const MS_POR_DIA = 24 * 60 * 60 * 1000

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

export type FreePlanAssignmentResult =
    | { ok: true; planNombre: string; subscriptionId: string }
    | { ok: false; reason: 'plan_not_found' | 'error'; message?: string }

/**
 * Asigna automáticamente el plan gratuito (monto ≈ 0) a un taller recién creado:
 * crea el doc en Subscripciones y actualiza Usuarios.subscripcion_actual (Aprobado).
 */
export async function assignFreePlanToNewTaller(
    tallerUid: string,
): Promise<FreePlanAssignmentResult> {
    try {
        const planesSnap = await getDocs(collection(db, 'Planes'))
        const freePlanDoc = planesSnap.docs.find((planDoc) =>
            isFreePlanAmount(planDoc.data().monto),
        )

        if (!freePlanDoc) {
            return { ok: false, reason: 'plan_not_found' }
        }

        const plan = freePlanDoc.data()
        const planNombre = String(plan.nombre || 'GRATIS')
        const planMonto = plan.monto ?? 0
        const planVigencia = String(plan.vigencia ?? FREE_PLAN_DIAS_POR_DEFECTO)
        const planCantidadServicios = plan.cantidad_servicios ?? 0

        const newSubscriptionRef = doc(collection(db, 'Subscripciones'))

        // Requerimiento 001 punto 6: los dias del plan gratis NO arrancan al
        // registrarse. Quedan pendientes hasta que el certificador apruebe el
        // comercio (ver startPendingSubscriptionOnApproval).
        await setDoc(newSubscriptionRef, {
            uid: newSubscriptionRef.id,
            nombre: planNombre,
            monto: planMonto,
            vigencia: planVigencia,
            cantidad_servicios: planCantidadServicios,
            status: 'Aprobado',
            taller_uid: tallerUid,
            fechaCreacion: Timestamp.fromDate(new Date()),
            fecha_inicio: null,
            fecha_fin: null,
            pendiente_inicio: true,
        })

        const usuarioDocRef = doc(db, 'Usuarios', tallerUid)
        await updateDoc(usuarioDocRef, {
            subscripcion_actual: {
                uid: newSubscriptionRef.id,
                nombre: planNombre,
                monto: planMonto,
                vigencia: planVigencia,
                cantidad_servicios: planCantidadServicios,
                status: 'Aprobado',
                fecha_inicio: null,
                fecha_fin: null,
                pendiente_inicio: true,
            },
        })

        const activation = await maybeActivateServicesOnSubscription({
            tallerUid,
            subscriptionDocId: newSubscriptionRef.id,
            newPlanCantidadServiciosRaw: planCantidadServicios,
            newPlanMontoRaw: planMonto,
        })

        if (activation.usuarioCantidadServicios !== undefined) {
            await updateDoc(usuarioDocRef, {
                'subscripcion_actual.cantidad_servicios':
                    activation.usuarioCantidadServicios,
            })
        }

        return {
            ok: true,
            planNombre,
            subscriptionId: newSubscriptionRef.id,
        }
    } catch (error) {
        console.error('Error asignando plan gratis al taller:', error)
        return {
            ok: false,
            reason: 'error',
            message: error instanceof Error ? error.message : String(error),
        }
    }
}


/**
 * Requerimiento 001 punto 6: arranca la vigencia del plan cuando el
 * certificador aprueba el comercio. Si la suscripcion ya tenia fechas y no
 * quedo marcada como pendiente, no se toca.
 */
export async function startPendingSubscriptionOnApproval(
    tallerUid: string,
): Promise<{ started: boolean; reason?: string }> {
    const usuarioDocRef = doc(db, 'Usuarios', tallerUid)
    const usuarioSnap = await getDoc(usuarioDocRef)
    if (!usuarioSnap.exists()) return { started: false, reason: 'sin_usuario' }

    const sub = (usuarioSnap.data() || {}).subscripcion_actual as
        | {
              vigencia?: unknown
              fecha_inicio?: unknown
              pendiente_inicio?: unknown
          }
        | undefined
    if (!sub) return { started: false, reason: 'sin_suscripcion' }
    if (sub.fecha_inicio && sub.pendiente_inicio !== true) {
        return { started: false, reason: 'ya_iniciada' }
    }

    const dias =
        parseInt(String(sub.vigencia ?? ''), 10) || FREE_PLAN_DIAS_POR_DEFECTO
    const inicio = Timestamp.now()
    const fin = Timestamp.fromMillis(inicio.toMillis() + dias * MS_POR_DIA)

    await updateDoc(usuarioDocRef, {
        'subscripcion_actual.fecha_inicio': inicio,
        'subscripcion_actual.fecha_fin': fin,
        'subscripcion_actual.pendiente_inicio': false,
    })

    const pendientes = await getDocs(
        query(
            collection(db, 'Subscripciones'),
            where('taller_uid', '==', tallerUid),
            where('pendiente_inicio', '==', true),
        ),
    )
    for (const chunk of chunkArray(pendientes.docs, 500)) {
        const batch = writeBatch(db)
        for (const d of chunk) {
            batch.update(doc(db, 'Subscripciones', d.id), {
                fecha_inicio: inicio,
                fecha_fin: fin,
                pendiente_inicio: false,
            })
        }
        await batch.commit()
    }

    return { started: true }
}

/**
 * Requerimiento 001 puntos 6 y 7: al aprobar formalmente el comercio, todos
 * sus servicios pasan a Activo y arranca la vigencia del plan.
 * Nunca lanza: la aprobacion del taller no debe fallar por esto.
 */
export async function activateOnWorkshopApproval(tallerUid: string): Promise<{
    serviciosEncendidos: number
    planIniciado: boolean
}> {
    let serviciosEncendidos = 0
    let planIniciado = false

    try {
        const serviciosSnap = await getDocs(
            query(
                collection(db, 'Servicios'),
                where('uid_taller', '==', tallerUid),
            ),
        )
        const apagados = serviciosSnap.docs.filter((d) =>
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
        serviciosEncendidos = apagados
    } catch (error) {
        console.error('activateOnWorkshopApproval (servicios):', error)
    }

    try {
        const r = await startPendingSubscriptionOnApproval(tallerUid)
        planIniciado = r.started
    } catch (error) {
        console.error('activateOnWorkshopApproval (plan):', error)
    }

    return { serviciosEncendidos, planIniciado }
}
