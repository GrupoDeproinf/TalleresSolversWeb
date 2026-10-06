import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/configs/firebaseAssets.config'

const backfillServiceRatingsCallable = httpsCallable(
    getFunctions(app, 'us-central1'),
    'backfillServiceRatings',
)

/**
 * Recalcula el promedio y el conteo de calificaciones de TODOS los servicios
 * y los guarda dentro de cada documento (`puntuacion_promedio` y
 * `reviews_count`).
 *
 * Se ejecuta una sola vez para rellenar los servicios que ya existían. A
 * partir de ahí, una Cloud Function mantiene los valores actualizados
 * automáticamente cada vez que se crea o elimina una calificación.
 */
export async function backfillServiceRatings(): Promise<{
    updated: number
    failed: number
}> {
    const response = await backfillServiceRatingsCallable({})
    const data = response.data as { updated?: number; failed?: number }

    return {
        updated: data.updated ?? 0,
        failed: data.failed ?? 0,
    }
}
