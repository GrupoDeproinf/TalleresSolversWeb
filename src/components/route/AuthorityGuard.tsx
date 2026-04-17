import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { useAppSelector } from '@/store'
import { USER } from '@/constants/roles.constant'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const { userAuthority = [], authority = [], children } = props

    const roleMatched = useAuthority(userAuthority, authority)

    const userKey = useAppSelector((state) => state.auth.user.key)
    const sessionUid = useAppSelector((state) => state.auth.session.token)
    const garageId = (userKey?.trim() || sessionUid || '').trim()

    const routeAllowsTaller = authority.includes(USER)
    const tallerNeedsProfileInstead =
        !roleMatched &&
        userAuthority.includes(USER) &&
        !routeAllowsTaller &&
        authority.length > 0 &&
        garageId

    if (tallerNeedsProfileInstead) {
        return <Navigate to={`/profilegarage/${garageId}`} replace />
    }

    return <>{roleMatched ? children : <Navigate to="/access-denied" />}</>
}

export default AuthorityGuard
