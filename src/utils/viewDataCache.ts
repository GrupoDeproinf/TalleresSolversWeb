/**
 * Caché en memoria muy simple para datos de vistas (patrón
 * "stale-while-revalidate").
 *
 * Motivo: varias vistas (Negocios, Lista de Servicios) volvían a descargar
 * TODOS sus datos de Firestore cada vez que el usuario entraba a ellas, aunque
 * acabara de salir. Con esta caché la vista se pinta de inmediato con lo último
 * que se descargó y los datos se refrescan en segundo plano.
 *
 * Es solo memoria del navegador: se limpia al recargar la página, así que nunca
 * deja datos viejos persistidos.
 */

type CacheEntry = { data: unknown; ts: number }

const store = new Map<string, CacheEntry>()

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutos

export function readViewCache<T>(
    key: string,
    ttlMs: number = DEFAULT_TTL_MS,
): T | null {
    const hit = store.get(key)
    if (!hit) {
        return null
    }
    if (Date.now() - hit.ts > ttlMs) {
        store.delete(key)
        return null
    }
    return hit.data as T
}

export function writeViewCache(key: string, data: unknown): void {
    store.set(key, { data, ts: Date.now() })
}

export function clearViewCache(prefix?: string): void {
    if (!prefix) {
        store.clear()
        return
    }
    for (const key of [...store.keys()]) {
        if (key.startsWith(prefix)) {
            store.delete(key)
        }
    }
}
