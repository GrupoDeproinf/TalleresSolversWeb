import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { isTallerUsuarioEliminado } from '@/utils/activeTallerSubscriptionGuards'

/**
 * Negocios que se muestran en el panel: los talleres que existen en
 * `Usuarios` y no están dados de baja (status "Eliminado"). Tras la
 * depuración del 20 nov 2026 quedaron datos de negocios borrados o dados de
 * baja en otras colecciones; las pantallas los ocultan con esto, sin borrar
 * nada.
 */
export async function cargarTalleresActivos(): Promise<Set<string>> {
    const snap = await getDocs(
        query(collection(db, 'Usuarios'), where('typeUser', '==', 'Taller')),
    )
    const ids = new Set<string>()
    snap.forEach((d) => {
        if (!isTallerUsuarioEliminado(d.data().status)) ids.add(d.id)
    })
    return ids
}

export function tallerDeRegistro(registro: unknown): string {
    const r = (registro ?? {}) as Record<string, unknown>
    return String(r.uid_taller ?? r.taller_uid ?? '').trim()
}

/** Sin negocio asociado (p. ej. una solicitud sin asignar) se muestra igual. */
export function esDeTallerActivo(
    registro: unknown,
    activos: Set<string>,
): boolean {
    const uid = tallerDeRegistro(registro)
    return uid === '' || activos.has(uid)
}
