import appConfig from '@/configs/app.config'
import { USER } from '@/constants/roles.constant'

/**
 * Ruta por defecto tras autenticación: el taller va a su perfil; admin/certificador al dashboard.
 * `sessionUid` evita caer en el dashboard si `user.key` aún no hidrató en Redux.
 */
export function getAuthenticatedHomePath(
    authority: string[] | undefined,
    userKey: string | undefined,
    sessionUid?: string | null,
): string {
    const garageId = (userKey?.trim() || sessionUid || '').trim()
    if (authority?.includes(USER) && garageId) {
        return `/profilegarage/${garageId}`
    }
    return appConfig.authenticatedEntryPath
}

/**
 * Tras el login, no seguir un redirectUrl que apunta a rutas solo Admin (p. ej. dashboard de ventas)
 * ni a access-denied, para que el taller no quede en bucle de "sin permisos".
 */
export function resolvePostSignInPath(
    redirectUrl: string | null | undefined,
    authority: string[],
    userKey: string,
): string {
    const homePath = getAuthenticatedHomePath(authority, userKey)
    const raw = redirectUrl?.trim()
    if (!raw) {
        return homePath
    }

    let path = raw
    try {
        if (raw.includes('%')) {
            path = decodeURIComponent(raw)
        }
    } catch {
        path = raw
    }

    if (path === '/' || path === '') {
        return homePath
    }

    if (authority.includes(USER)) {
        const lower = path.toLowerCase()
        if (lower.includes('access-denied')) {
            return homePath
        }
        if (path === appConfig.authenticatedEntryPath) {
            return homePath
        }
        if (path.endsWith('/sales/dashboard')) {
            return homePath
        }
    }

    return path
}
