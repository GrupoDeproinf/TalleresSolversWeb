import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { TALLER_DASHBOARD_PATH } from '@/constants/route.constant'
import { USER } from '@/constants/roles.constant'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const { userAuthority = [], authority = [], children } = props

    const roleMatched = useAuthority(userAuthority, authority)

    const routeAllowsTaller = authority.includes(USER)
    const tallerNeedsDashboardInstead =
        !roleMatched &&
        userAuthority.includes(USER) &&
        !routeAllowsTaller &&
        authority.length > 0

    if (tallerNeedsDashboardInstead) {
        return <Navigate to={TALLER_DASHBOARD_PATH} replace />
    }

    return <>{roleMatched ? children : <Navigate to="/access-denied" />}</>
}

export default AuthorityGuard
