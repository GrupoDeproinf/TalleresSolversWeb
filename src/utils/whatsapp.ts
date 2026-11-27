// Enlace de WhatsApp (wa.me) a partir de un número guardado en el perfil.
// Admite números internacionales (584121234567) y locales venezolanos
// (04121234567), que se pasan a +58.

export const normalizarNumeroWhatsapp = (numero?: string | null) => {
    let digitos = String(numero ?? '').replace(/\D/g, '')
    if (!digitos) return ''
    if (digitos.startsWith('00')) digitos = digitos.slice(2)
    if (digitos.length === 11 && digitos.startsWith('0')) {
        digitos = `58${digitos.slice(1)}`
    } else if (digitos.length === 10 && /^[24]/.test(digitos)) {
        // Venezolano guardado sin 0 ni 58 (4121234567 o 2121234567).
        digitos = `58${digitos}`
    }
    return digitos.length >= 10 ? digitos : ''
}

/** Primer número válido de la lista (whatsapp, luego teléfono…). */
export const whatsappUrlDe = (numeros: Array<string | null | undefined>, texto?: string) => {
    for (const n of numeros) {
        const url = whatsappUrl(n, texto)
        if (url) return url
    }
    return ''
}

export const whatsappUrl = (numero?: string | null, texto?: string) => {
    const digitos = normalizarNumeroWhatsapp(numero)
    if (!digitos) return ''
    const query = texto ? `?text=${encodeURIComponent(texto)}` : ''
    return `https://wa.me/${digitos}${query}`
}
