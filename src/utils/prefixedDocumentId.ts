/**
 * Helpers para cédula/RIF con prefijo (V-, J-, etc.).
 * El formato SENIAT a veces trae el dígito verificador con un segundo guion
 * (`J-12345678-9`). Usar `split('-')[1]` pierde ese último dígito.
 */

const PREFIX_RE = /^[VECGJP]$/i

export function parsePrefixedDocumentId(
    value: unknown,
    defaultPrefix = 'V',
): { prefix: string; number: string } {
    const raw = String(value ?? '').trim()
    if (!raw) {
        return { prefix: defaultPrefix, number: '' }
    }

    const dashIndex = raw.indexOf('-')
    if (dashIndex === -1) {
        const glued = raw.match(/^([VECGJP])(\d.*)$/i)
        if (glued) {
            return {
                prefix: glued[1].toUpperCase(),
                number: glued[2].replace(/\D/g, ''),
            }
        }
        return {
            prefix: defaultPrefix,
            number: raw.replace(/\D/g, ''),
        }
    }

    const prefixRaw = raw.slice(0, dashIndex).toUpperCase()
    const prefix = PREFIX_RE.test(prefixRaw) ? prefixRaw : defaultPrefix
    const number = raw.slice(dashIndex + 1).replace(/\D/g, '')
    return { prefix, number }
}

export function formatPrefixedDocumentId(
    prefix: string,
    numberPart: string,
): string {
    const safePrefix = PREFIX_RE.test(prefix) ? prefix.toUpperCase() : 'V'
    return `${safePrefix}-${String(numberPart ?? '').replace(/\D/g, '')}`
}

export function getPrefixedDocumentNumber(
    value: unknown,
    defaultPrefix = 'V',
): string {
    return parsePrefixedDocumentId(value, defaultPrefix).number
}

export function getPrefixedDocumentPrefix(
    value: unknown,
    defaultPrefix = 'V',
): string {
    return parsePrefixedDocumentId(value, defaultPrefix).prefix
}
