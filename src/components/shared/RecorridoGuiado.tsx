// Recorrido guiado del panel nuevo. Se muestra solo la primera vez que el
// administrador entra en «Inicio» (se recuerda por usuario en este navegador)
// y se puede repetir desde el menú del usuario → «Ver recorrido».
import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { driver, type DriveStep, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import './recorridoGuiado.css'
import { useAppSelector } from '@/store'
import { ADMIN } from '@/constants/roles.constant'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

/** Subir la versión vuelve a mostrar el recorrido a todos (cuando cambie el panel). */
const VERSION = 'v1'
const RUTA_INICIO = `${APP_PREFIX_PATH}/hoy`
export const EVENTO_VER_RECORRIDO = 'solvers:ver-recorrido'

const clave = (uid: string) => `solvers:recorrido:admin:${VERSION}:${uid || 'anon'}`

const yaLoVio = (uid: string) => {
    try {
        return localStorage.getItem(clave(uid)) === '1'
    } catch {
        return true // sin almacenamiento no insistimos en cada visita
    }
}

const marcarVisto = (uid: string) => {
    try {
        localStorage.setItem(clave(uid), '1')
    } catch {
        /* sin almacenamiento: no pasa nada */
    }
}

const PASOS: DriveStep[] = [
    {
        popover: {
            title: 'Bienvenido al panel nuevo',
            description:
                'Ordenamos el panel para que hagas lo de todos los días con menos clics. ' +
                'Te mostramos los cambios en menos de un minuto.',
        },
    },
    {
        element: '[data-tour="nav-appsHoy.hoy"]',
        popover: {
            title: 'Inicio: tu día en una pantalla',
            description:
                'Al entrar llegas aquí. Ves lo que está pendiente y llegas a cada tarea con un clic.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="hoy-pendientes"]',
        popover: {
            title: 'Pendientes de hoy',
            description:
                'Negocios por aprobar, pagos por validar, planes que vencen y registros a medias. ' +
                'Toca uno y abre la lista ya filtrada.',
            side: 'left',
        },
    },
    {
        element: '[data-tour="nav-appsGarages.garages"]',
        popover: {
            title: 'El menú cuenta por ti',
            description:
                'El número amarillo dice cuántos negocios esperan tu aprobación. ' +
                'En la lista, haz clic en cualquier parte de la fila para abrir el negocio; ' +
                'dentro, usa «Siguiente» para pasar al próximo sin volver atrás.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-appsSubscriptions.subscriptions"]',
        popover: {
            title: 'Validar pagos más rápido',
            description:
                'Se abre directamente en los pendientes. Marca varios y valídalos de una vez con ' +
                '«Validar seleccionados».',
            side: 'right',
        },
    },
    {
        element: '[data-tour="hoy-vencimientos"]',
        popover: {
            title: 'Planes que vencen esta semana',
            description:
                'Escríbele por WhatsApp al negocio con un mensaje ya preparado, antes de que se le apague el plan.',
            side: 'left',
        },
    },
    {
        element: '[data-tour="nav-appsRequestList.requestList"]',
        popover: {
            title: 'Actividad de la app',
            description:
                'Solicitudes, contactos a talleres y puntuación ahora tienen su propio lugar, ' +
                'y el nombre de cada negocio te lleva a su perfil.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="nav-appsPlans.plans"]',
        popover: {
            title: 'Configuración',
            description:
                'Planes, categorías y servicios publicados: lo que se ajusta de vez en cuando.',
            side: 'right',
        },
    },
    {
        element: '[data-tour="menu-usuario"]',
        popover: {
            title: '¿Lo quieres ver otra vez?',
            description: 'Abre tu menú de usuario y elige «Ver recorrido».',
            side: 'bottom',
            align: 'end',
        },
    },
]

/** Solo pasos cuyo elemento está en pantalla (en el teléfono el menú lateral está oculto). */
const pasosVisibles = () =>
    PASOS.filter((paso) => {
        if (!paso.element) return true
        const el = document.querySelector(paso.element as string) as HTMLElement | null
        return !!el && el.offsetParent !== null
    })

const RecorridoGuiado = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const authority = useAppSelector((state) => state.auth.user.authority) || []
    const uid = useAppSelector((state) => state.auth.user.key) || ''
    const esAdmin = authority.includes(ADMIN)
    const pendienteManual = useRef(false)
    const actual = useRef<Driver | null>(null)

    const iniciar = useCallback(() => {
        actual.current?.destroy()
        const pasos = pasosVisibles()
        const d = driver({
            steps: pasos,
            showProgress: true,
            progressText: '{{current}} de {{total}}',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            doneBtnText: 'Listo',
            allowClose: true,
            popoverClass: 'sv-recorrido',
            stagePadding: 6,
            stageRadius: 12,
            // Cerrarlo también cuenta como visto: no lo volvemos a imponer;
            // se puede repetir desde «Ver recorrido».
            onDestroyed: () => {
                marcarVisto(uid)
                actual.current = null
            },
        })
        actual.current = d
        d.drive()
    }, [uid])

    // Primera vez en «Inicio»: esperar a que la página pinte antes de empezar.
    useEffect(() => {
        if (!esAdmin || pathname !== RUTA_INICIO) return
        if (!pendienteManual.current && yaLoVio(uid)) return
        pendienteManual.current = false
        const t = window.setTimeout(iniciar, 900)
        return () => window.clearTimeout(t)
    }, [esAdmin, pathname, uid, iniciar])

    // «Ver recorrido» desde el menú del usuario: ir a Inicio y empezar.
    useEffect(() => {
        if (!esAdmin) return
        const ver = () => {
            if (pathname === RUTA_INICIO) {
                iniciar()
            } else {
                pendienteManual.current = true
                navigate(RUTA_INICIO)
            }
        }
        window.addEventListener(EVENTO_VER_RECORRIDO, ver)
        return () => window.removeEventListener(EVENTO_VER_RECORRIDO, ver)
    }, [esAdmin, pathname, iniciar, navigate])

    useEffect(() => () => actual.current?.destroy(), [])

    return null
}

export default RecorridoGuiado
