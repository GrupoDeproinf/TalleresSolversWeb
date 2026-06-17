import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

export type EntityHistoricoHit = {
    id: string
    label: string
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

async function collectGarageUidsWithHistorico(
    uids: string[],
): Promise<Set<string>> {
    const withHistory = new Set<string>()
    const unique = [...new Set(uids.map((uid) => uid.trim()).filter(Boolean))]
    if (unique.length === 0) return withHistory

    for (const chunk of chunkArray(unique, 10)) {
        const [solicitudesSnap, servicesContactSnap, subscripcionesSnap] =
            await Promise.all([
                getDocs(
                    query(
                        collection(db, 'Solicitudes'),
                        where('uid_taller', 'in', chunk),
                    ),
                ),
                getDocs(
                    query(
                        collection(db, 'servicesContact'),
                        where('uid_taller', 'in', chunk),
                    ),
                ),
                getDocs(
                    query(
                        collection(db, 'Subscripciones'),
                        where('taller_uid', 'in', chunk),
                    ),
                ),
            ])

        const mark = (uid: unknown) => {
            const id = String(uid ?? '').trim()
            if (id) withHistory.add(id)
        }

        solicitudesSnap.docs.forEach((docSnap) =>
            mark(docSnap.data().uid_taller),
        )
        servicesContactSnap.docs.forEach((docSnap) =>
            mark(docSnap.data().uid_taller),
        )
        subscripcionesSnap.docs.forEach((docSnap) =>
            mark(docSnap.data().taller_uid),
        )
    }

    return withHistory
}

async function collectUserIdsWithHistorico(
    users: { id: string; vehiculosCount?: number }[],
): Promise<Set<string>> {
    const withHistory = new Set<string>()
    const uniqueIds = [
        ...new Set(users.map((user) => user.id.trim()).filter(Boolean)),
    ]
    if (uniqueIds.length === 0) return withHistory

    users.forEach((user) => {
        if ((user.vehiculosCount ?? 0) > 0) {
            withHistory.add(user.id)
        }
    })

    const pendingIds = new Set(
        uniqueIds.filter((id) => !withHistory.has(id)),
    )

    for (const chunk of chunkArray(uniqueIds, 10)) {
        const [solicitudesSnap, propuestasSnap] = await Promise.all([
            getDocs(
                query(
                    collection(db, 'Solicitudes'),
                    where('uid_usuario', 'in', chunk),
                ),
            ),
            getDocs(
                query(
                    collection(db, 'Propuestas'),
                    where('uid_usuario', 'in', chunk),
                ),
            ),
        ])

        solicitudesSnap.docs.forEach((docSnap) => {
            const id = String(docSnap.data().uid_usuario ?? '').trim()
            if (id) withHistory.add(id)
        })
        propuestasSnap.docs.forEach((docSnap) => {
            const id = String(docSnap.data().uid_usuario ?? '').trim()
            if (id) withHistory.add(id)
        })
    }

    if (pendingIds.size > 0) {
        const servicesContactSnap = await getDocs(
            collection(db, 'servicesContact'),
        )
        servicesContactSnap.docs.forEach((docSnap) => {
            const data = docSnap.data() as {
                usuario?: { id?: string }
            }
            const userId = String(data.usuario?.id ?? '').trim()
            if (userId && pendingIds.has(userId)) {
                withHistory.add(userId)
            }
        })
    }

    return withHistory
}

export async function findGaragesWithHistorico(
    garages: { uid: string; nombre?: string }[],
): Promise<EntityHistoricoHit[]> {
    if (garages.length === 0) return []

    const uidSet = await collectGarageUidsWithHistorico(
        garages.map((garage) => garage.uid),
    )

    return garages
        .filter((garage) => uidSet.has(garage.uid))
        .map((garage) => ({
            id: garage.uid,
            label: garage.nombre?.trim() || garage.uid,
        }))
}

export async function findUsersWithHistorico(
    users: {
        id: string
        nombre?: string
        email?: string
        vehiculosCount?: number
    }[],
): Promise<EntityHistoricoHit[]> {
    if (users.length === 0) return []

    const idSet = await collectUserIdsWithHistorico(users)

    return users
        .filter((user) => idSet.has(user.id))
        .map((user) => ({
            id: user.id,
            label: user.nombre?.trim() || user.email?.trim() || user.id,
        }))
}
