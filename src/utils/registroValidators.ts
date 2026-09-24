// Validaciones del registro del taller en el panel. Mismas reglas y mensajes
// que la app (src/components/registro/validators.js) para que el taller vea lo
// mismo en ambos lados. Cada función devuelve '' si está bien o el mensaje.

export const onlyDigits = (v: unknown): string => String(v ?? '').replace(/\D/g, '')

export const validarNombre = (v: unknown, que = 'tu nombre'): string => {
    const t = String(v ?? '').trim()
    if (!t) return `Escribe ${que}.`
    if (t.length < 3) return 'Muy corto: escribe al menos 3 letras.'
    return ''
}

export const validarCorreo = (v: unknown): string => {
    const t = String(v ?? '').trim()
    if (!t) return 'Escribe tu correo.'
    if (/\s/.test(t)) return 'El correo no puede tener espacios.'
    if (!t.includes('@')) return 'Al correo le falta la @ (ej: nombre@gmail.com).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t))
        return 'Revisa el correo: debe verse como nombre@gmail.com.'
    return ''
}

// Teléfono venezolano sin el 0 inicial: 412 123 4567 (10 dígitos).
export const normalizarTelefono = (v: unknown): string => {
    let d = onlyDigits(v)
    if (d.startsWith('58') && d.length === 12) d = d.slice(2)
    if (d.startsWith('0') && d.length === 11) d = d.slice(1)
    return d
}

export const validarTelefono = (v: unknown): string => {
    const d = normalizarTelefono(v)
    if (!d) return 'Escribe tu número de teléfono.'
    if (d.length < 10) return `Faltan ${10 - d.length} dígito(s). Ej: 412 123 4567.`
    if (d.length > 10) return 'Sobran dígitos. Escríbelo sin el 0 inicial: 412 123 4567.'
    if (!/^(2|4)/.test(d)) return 'Debe empezar por 4 (celular) o 2 (fijo). Ej: 412 123 4567.'
    return ''
}

export const formatearTelefono = (v: unknown): string => {
    const d = normalizarTelefono(v).slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

export const validarPassword = (v: unknown): string => {
    const t = String(v ?? '')
    if (!t) return 'Crea una contraseña.'
    if (t.length < 6) return `Te faltan ${6 - t.length} caracter(es): mínimo 6.`
    return ''
}

// RIF: letra (J, G, V, E, P, C) + 8 dígitos + dígito verificador.
export const RIF_PREFIJOS = ['J', 'G', 'V', 'E', 'P', 'C'] as const
export type RifPrefijo = (typeof RIF_PREFIJOS)[number]

// Dígito verificador oficial del SENIAT.
export const digitoVerificadorRif = (prefijo: string, ocho: string): number => {
    const valores: Record<string, number> = { V: 1, E: 2, J: 3, P: 4, G: 5 }
    const pesos = [3, 2, 7, 6, 5, 4, 3, 2]
    let suma = (valores[prefijo] || 0) * 4
    for (let i = 0; i < 8; i++) suma += Number(ocho[i]) * pesos[i]
    const r = 11 - (suma % 11)
    return r >= 10 ? 0 : r
}

export const validarRif = (prefijo: string, numero: unknown): string => {
    const d = onlyDigits(numero)
    if (!prefijo) return 'Elige la letra del RIF (J, G, V...).'
    if (!d) return 'Escribe el número del RIF.'
    if (d.length < 9)
        return `Faltan ${9 - d.length} dígito(s). El RIF tiene 9 números: ${prefijo}-12345678-9.`
    if (d.length > 9) return 'Sobran dígitos. El RIF tiene 9 números.'
    if (prefijo === 'C') return '' // RIF comunal: sin verificador público confiable
    const esperado = digitoVerificadorRif(prefijo, d.slice(0, 8))
    if (Number(d[8]) !== esperado)
        return `El último dígito no cuadra (debería ser ${esperado}). Revisa el número en tu RIF.`
    return ''
}

export const formatearRif = (numero: unknown): string => {
    const d = onlyDigits(numero).slice(0, 9)
    return d.length > 8 ? `${d.slice(0, 8)}-${d.slice(8)}` : d
}

type ErrorHttp = {
    code?: string
    friendly?: string
    response?: { status?: number; data?: unknown }
}

// Traduce errores del servidor o de red a lenguaje claro.
export const mensajeDeError = (
    error: unknown,
    porDefecto = 'No pudimos completar el registro. Intenta de nuevo.',
): string => {
    const e = (error || {}) as ErrorHttp
    if (!error) return porDefecto
    if (e.friendly) return e.friendly
    if (e.code === 'ECONNABORTED')
        return 'El servidor tardó demasiado. Revisa tu conexión y toca Reintentar.'
    if (!e.response) return 'No hay conexión con el servidor. Revisa tu internet y toca Reintentar.'
    const { status = 0, data } = e.response
    const msg =
        typeof data === 'string'
            ? data
            : (data as { message?: unknown } | undefined)?.message
    if (status === 409)
        return typeof msg === 'string' && msg
            ? msg
            : 'Este correo o teléfono ya está registrado. Inicia sesión o recupera tu contraseña.'
    if (typeof msg === 'string' && msg.length < 160 && !/error:|exception|firebase/i.test(msg))
        return msg
    if (status >= 500) return 'El servidor tuvo un problema. Intenta de nuevo en un minuto.'
    return porDefecto
}
