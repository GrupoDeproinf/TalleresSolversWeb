import { Navigate } from 'react-router-dom'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

/** Ruta antigua: redirige a la vista unificada de suscripciones. */
const PaymentValidationRedirect = () => (
    <Navigate replace to={`${APP_PREFIX_PATH}/subscriptions`} />
)

export default PaymentValidationRedirect
