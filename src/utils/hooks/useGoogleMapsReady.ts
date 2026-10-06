import { useEffect, useState } from 'react'

/**
 * Devuelve `true` cuando la API de Google Maps (window.google.maps) está lista.
 *
 * El script de Google Maps se carga de forma `async` desde index.html para no
 * bloquear el primer render de la app. Como consecuencia, un componente de mapa
 * podría llegar a montarse antes de que la API termine de descargarse. Este hook
 * espera (sondeando brevemente) a que `window.google.maps` exista, para montar
 * el <GoogleMap> solo cuando es seguro y evitar el error "google is not defined".
 */
export default function useGoogleMapsReady(): boolean {
    const [ready, setReady] = useState<boolean>(
        typeof window !== 'undefined' &&
            Boolean((window as unknown as { google?: { maps?: unknown } }).google?.maps),
    )

    useEffect(() => {
        if (ready || typeof window === 'undefined') {
            return
        }

        let cancelled = false
        let timerId: number | undefined

        const check = () => {
            if (cancelled) {
                return
            }
            const hasMaps = Boolean(
                (window as unknown as { google?: { maps?: unknown } }).google
                    ?.maps,
            )
            if (hasMaps) {
                setReady(true)
                return
            }
            timerId = window.setTimeout(check, 150)
        }

        check()

        return () => {
            cancelled = true
            if (timerId) {
                window.clearTimeout(timerId)
            }
        }
    }, [ready])

    return ready
}
