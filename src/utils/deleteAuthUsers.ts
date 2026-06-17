import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/configs/firebaseAssets.config'

const deleteAuthUsersCallable = httpsCallable(
    getFunctions(app, 'us-central1'),
    'deleteAuthUsers',
)

/** Elimina cuentas de Firebase Auth por uid (requiere Cloud Function desplegada). */
export async function deleteAuthUsers(uids: string[]): Promise<{
    deletedCount: number
    failedCount: number
}> {
    if (uids.length === 0) {
        return { deletedCount: 0, failedCount: 0 }
    }

    const response = await deleteAuthUsersCallable({ uids })
    const data = response.data as {
        deletedCount?: number
        failedCount?: number
    }

    return {
        deletedCount: data.deletedCount ?? 0,
        failedCount: data.failedCount ?? 0,
    }
}
