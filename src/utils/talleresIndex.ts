import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/configs/firebaseAssets.config'

/** Colección con la copia reducida de cada negocio. */
export const TALLERES_INDEX_COLLECTION = 'TalleresIndex'

const backfillTalleresIndexCallable = httpsCallable(
    getFunctions(app, 'us-central1'),
    'backfillTalleresIndex',
)

/**
 * Reconstruye el índice ligero de negocios a partir de la colección
 * `Usuarios`.
 *
 * Se ejecuta una sola vez para rellenar los negocios que ya existían. A
 * partir de ahí, una Cloud Function mantiene el índice actualizado cada
 * vez que se crea, edita o elimina un negocio.
 */
export async function backfillTalleresIndex(): Promise<{
    updated: number
    failed: number
}> {
    const response = await backfillTalleresIndexCallable({})
    const data = response.data as { updated?: number; failed?: number }

    return {
        updated: data.updated ?? 0,
        failed: data.failed ?? 0,
    }
}
