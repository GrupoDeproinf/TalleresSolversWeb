import appConfig from '@/configs/app.config'
import { CERTIFIER_DASHBOARD_PATH, TALLER_DASHBOARD_PATH } from '@/constants/route.constant'
import { CERTIFIER, USER } from '@/constants/roles.constant'

/**
 * Ruta por defecto tras autenticación: el taller a su dashboard; admin/certificador al dashboard de ventas.
 */
export function getAuthenticatedHomePath(
    authority: string[] | undefined,
    _userKey?: string | undefined,
    _sessionUid?: string | null,
): string {
    if (authority?.includes(USER)) {
        return TALLER_DASHBOARD_PATH
    }
    if (authority?.includes(CERTIFIER)) {
        return CERTIFIER_DASHBOARD_PATH
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
