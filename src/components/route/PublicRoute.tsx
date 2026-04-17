import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/utils/hooks/useAuth'
import { useAppSelector } from '@/store'
import { getAuthenticatedHomePath } from '@/utils/getAuthenticatedHomePath'

const PublicRoute = () => {
    const { authenticated } = useAuth()
    const userAuthority = useAppSelector((state) => state.auth.user.authority)
    const userKey = useAppSelector((state) => state.auth.user.key)
    const sessionUid = useAppSelector((state) => state.auth.session.token)
    const homePath = getAuthenticatedHomePath(
        userAuthority,
        userKey,
        sessionUid,
    )

    return authenticated ? <Navigate to={homePath} /> : <Outlet />
}

export default PublicRoute
