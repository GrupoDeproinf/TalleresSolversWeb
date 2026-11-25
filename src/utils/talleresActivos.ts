import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { collectActiveTallerDocIdsFromUsersSnapshot } from '@/utils/activeTallerSubscriptionGuards'

/**
 * Negocios que se muestran en el panel: los talleres que existen en
 * `Usuarios` y no están dados de baja (status "Eliminado"). Tras la
 * depuración del 20 nov 2026 quedaron datos de negocios borrados o dados de
 * baja en otras colecciones; las pantallas los ocultan con esto, sin borrar
 * nada.
 */
export async function cargarTalleresActivos(): Promise<Set<string>> {
    // Se leen todos los Usuarios (como Inicio y Pagos) para normalizar
    // typeUser igual que ellos ("Taller", "taller", con espacios...).
    const snap = await getDocs(collection(db, 'Usuarios'))
    return collectActiveTallerDocIdsFromUsersSnapshot(snap)
}

export function tallerDeRegistro(registro: unknown): string {
    const r = (registro ?? {}) as Record<string, unknown>
    // El primero que no esté vacío (uid_taller puede venir como "").
    for (const v of [r.uid_taller, r.taller_uid]) {
        const uid = String(v ?? '').trim()
        if (uid) return uid
    }
    return ''
}

/** Sin negocio asociado (p. ej. una solicitud sin asignar) se muestra igual. */
export function esDeTallerActivo(
    registro: unknown,
    activos: Set<string>,
): boolean {
    const uid = tallerDeRegistro(registro)
    return uid === '' || activos.has(uid)
}
