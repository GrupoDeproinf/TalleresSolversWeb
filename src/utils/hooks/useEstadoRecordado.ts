import { useEffect, useState } from 'react'

// Igual que useState, pero el valor se recuerda mientras la pestaña del
// navegador esté abierta (sessionStorage). Lo usan las listas del panel para
// no volver a la página 1 cuando se aprueba algo en otra pantalla y se regresa.
const PREFIJO = 'panel:lista:'

const leer = <T,>(clave: string): T | undefined => {
    try {
        const v = window.sessionStorage.getItem(PREFIJO + clave)
        return v === null ? undefined : (JSON.parse(v) as T)
    } catch {
        return undefined
    }
}

function useEstadoRecordado<T>(clave: string, inicial: T | (() => T)) {
    const [valor, setValor] = useState<T>(() => {
        const guardado = leer<T>(clave)
        if (guardado !== undefined) return guardado
        return typeof inicial === 'function' ? (inicial as () => T)() : inicial
    })

    useEffect(() => {
        try {
            window.sessionStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
        } catch {
            // Sin almacenamiento disponible: funciona como un useState normal.
        }
    }, [clave, valor])

    return [valor, setValor] as const
}

export default useEstadoRecordado
