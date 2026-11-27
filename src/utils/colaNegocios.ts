// Cola de negocios para recorrer los perfiles con «Anterior» / «Siguiente».
// La lista de Negocios guarda aquí, al abrir un perfil, los ids que se ven
// en la tabla (con sus filtros y su orden). Vive solo en esta pestaña.

export const COLA_NEGOCIOS_KEY = 'negocios:cola'

export const guardarColaNegocios = (ids: string[]) => {
    try {
        sessionStorage.setItem(
            COLA_NEGOCIOS_KEY,
            JSON.stringify([...new Set(ids.filter(Boolean))]),
        )
    } catch {
        // Sin sessionStorage (modo privado, bloqueado): no hay cola.
    }
}

export const leerColaNegocios = (): string[] => {
    try {
        const raw = sessionStorage.getItem(COLA_NEGOCIOS_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed)
            ? parsed.filter((id): id is string => typeof id === 'string')
            : []
    } catch {
        return []
    }
}

export type PosicionEnCola = {
    anterior: string | null
    siguiente: string | null
    posicion: number
    total: number
}

/** Devuelve null si el negocio no está en la cola. */
export const posicionEnCola = (id: string): PosicionEnCola | null => {
    const cola = leerColaNegocios()
    const i = cola.indexOf(id)
    if (!id || i === -1) return null
    return {
        anterior: i > 0 ? cola[i - 1] : null,
        siguiente: i < cola.length - 1 ? cola[i + 1] : null,
        posicion: i + 1,
        total: cola.length,
    }
}
