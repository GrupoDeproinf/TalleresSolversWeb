import { useEffect, useState } from 'react'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/utils/hooks/useAuth'
import Loading from '@/components/shared/Loading'
import { auth } from '@/configs/firebaseAssets.config'
import { useAppSelector } from '@/store'
import { USER } from '@/constants/roles.constant'

const { unAuthenticatedEntryPath } = appConfig

type FirebaseSession = 'pending' | 'ready' | 'missing'

const ProtectedRoute = () => {
    const { authenticated, signOut } = useAuth()

    const location = useLocation()

    // Las reglas de Firestore exigen sesion. Firebase Auth restaura la sesion
    // de forma asincrona al recargar: si una pagina consulta antes de que
    // termine, la lectura se rechaza y la pantalla queda vacia o en cero.
    // Por eso no se muestra ninguna pagina protegida hasta que este lista.
    const [firebaseSession, setFirebaseSession] = useState<FirebaseSession>(
        auth.currentUser ? 'ready' : 'pending',
    )

    useEffect(() => {
        if (!authenticated) return
        let cancelled = false
        auth.authStateReady()
            .then(() => {
                if (cancelled) return
                setFirebaseSession(auth.currentUser ? 'ready' : 'missing')
            })
            .catch(() => {
                if (!cancelled) setFirebaseSession('missing')
            })
        return () => {
            cancelled = true
        }
    }, [authenticated])

    // Sesiones de talleres abiertas antes de que el panel fuera solo para el
    // personal: se cierran (el taller usa la app).
    const authority = useAppSelector((state) => state.auth.user.authority)
    const esTaller = Array.isArray(authority) && authority.includes(USER)
    useEffect(() => {
        if (authenticated && esTaller) {
            signOut()
        }
    }, [authenticated, esTaller])

    // El panel cree que hay sesion pero Firebase no la tiene (sesion vieja o
    // vencida): ninguna consulta funcionaria, asi que se pide iniciar sesion.
    useEffect(() => {
        if (authenticated && firebaseSession === 'missing') {
            signOut()
        }
    }, [authenticated, firebaseSession])

    if (!authenticated) {
        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${location.pathname}`}
            />
        )
    }

    if (firebaseSession !== 'ready' || esTaller) {
        return <Loading loading={true} />
    }

    return <Outlet />
}

export default ProtectedRoute
