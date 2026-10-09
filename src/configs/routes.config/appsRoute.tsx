import { lazy } from 'react'
import {
    APP_PREFIX_PATH,
    CERTIFIER_DASHBOARD_PATH,
    TALLER_DASHBOARD_PATH,
} from '@/constants/route.constant'
import { ADMIN, CERTIFIER, SUPPORT, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = [
    {
        key: 'appsTaller.dashboard',
        path: TALLER_DASHBOARD_PATH,
        component: lazy(() => import('@/views/pages/TallerDashboard')),
        authority: [USER],
    },
    {
        key: 'appsCertifier.dashboard',
        path: CERTIFIER_DASHBOARD_PATH,
        component: lazy(() => import('@/views/pages/CertificadorDashboard')),
        authority: [CERTIFIER],
    },
    // Inicio del administrador (appConfig.authenticatedEntryPath) y destino de
    // "Estadisticas". Se habia quitado junto con las rutas demo (5865e6d2) y
    // el panel quedaba en blanco, en bucle de redirecciones, tras el login.
    {
        key: 'appsSales.dashboard',
        path: `${APP_PREFIX_PATH}/sales/dashboard`,
        component: lazy(() => import('@/views/sales/SalesDashboard')),
        authority: [ADMIN],
    },
    {
        key: 'appsProject.dashboard',
        path: `${APP_PREFIX_PATH}/project/dashboard`,
        component: lazy(() => import('@/views/project/ProjectDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsUsers.users',
        path: `${APP_PREFIX_PATH}/users`,
        component: lazy(() => import('@/views/pages/Users')),
        authority: [ADMIN, SUPPORT, USER],
    },
    {
        key: 'appsGarages.garages',
        path: `${APP_PREFIX_PATH}/garages`,
        component: lazy(() => import('@/views/pages/Garages')),
        authority: [ADMIN, USER, CERTIFIER, SUPPORT],
    },
    {
        key: 'appsServices.services',
        path: `${APP_PREFIX_PATH}/services`,
        component: lazy(() => import('@/views/pages/Services')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCategory.category',
        path: `${APP_PREFIX_PATH}/category`,
        component: lazy(() => import('@/views/pages/Category')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsServicegarage.servicegarage',
        path: `${APP_PREFIX_PATH}/servicegarage`,
        component: lazy(() => import('@/views/pages/ServiceGarage')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsPlans.plans',
        path: `${APP_PREFIX_PATH}/plans`,
        component: lazy(() => import('@/views/pages/Plans')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsgarages_ubication.garages_ubication',
        path: `${APP_PREFIX_PATH}/garages_ubication`,
        component: lazy(() => import('@/views/pages/Garages_Ubication')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsSubscriptions.subscriptions',
        path: `${APP_PREFIX_PATH}/subscriptions`,
        component: lazy(() => import('@/views/pages/Subscriptions')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsContact.ServiceContact',
        path: `${APP_PREFIX_PATH}/ServiceContact`,
        component: lazy(() => import('@/views/pages/ServiceContact')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsContact.Puntuacion',
        path: `${APP_PREFIX_PATH}/Puntuacion`,
        component: lazy(() => import('@/views/pages/Puntuacion')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsServicesList.servicesList',
        path: `${APP_PREFIX_PATH}/services-list`,
        component: lazy(() => import('@/views/pages/ServicesList/servicesList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsProfileGarage.profilegarage',
        path: `/profilegarage/:id`,
        component: lazy(
            () => import('@/views/pages/ProfileGarage/ProfileGarage'),
        ),
        authority: [ADMIN, USER, CERTIFIER, SUPPORT],
        meta: {
            header: '',
            headerContainer: true,
        },
    },
    {
        key: 'appsPaymentValidation.paymentValidation',
        path: `${APP_PREFIX_PATH}/paymentValidation`,
        component: lazy(
            () => import('@/views/pages/PaymentValidation/PaymentValidation'),
        ),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsRequestList.requestList',
        path: `${APP_PREFIX_PATH}/requestList`,
        component: lazy(
            () => import('@/views/pages/RequestList/RequestAndServices'),
        ),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsGruas.gruas',
        path: `${APP_PREFIX_PATH}/gruas`,
        component: lazy(() => import('@/views/pages/TruckList/truckList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsVehicleTypes.vehicleTypes',
        path: `${APP_PREFIX_PATH}/vehicle-types`,
        component: lazy(() => import('@/views/pages/VehicleTypes')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsRegistrosIncompletos.registrosIncompletos',
        path: `${APP_PREFIX_PATH}/registros-incompletos`,
        component: lazy(() => import('@/views/pages/RegistrosIncompletos')),
        authority: [ADMIN, SUPPORT],
    },
]

export default appsRoute
