import { Navigate } from 'react-router-dom'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

/** Ruta antigua: redirige al tab de servicios solicitados. */
const ServiceContactRedirect = () => {
    return (
        <Navigate
            replace
            to={`${APP_PREFIX_PATH}/requestList?tab=services`}
        />
    )
}

export default ServiceContactRedirect
