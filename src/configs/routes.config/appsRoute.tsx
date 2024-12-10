import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = [
    {
        key: 'appsProject.dashboard',
        path: `${APP_PREFIX_PATH}/project/dashboard`,
        component: lazy(() => import('@/views/project/ProjectDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsProject.projectList',
        path: `${APP_PREFIX_PATH}/project/project-list`,
        component: lazy(() => import('@/views/project/ProjectList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsUsers.users',
        path: `${APP_PREFIX_PATH}/users`,
        component: lazy(() => import('@/views/pages/Users')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsGarages.garages',
        path: `${APP_PREFIX_PATH}/garages`,
        component: lazy(() => import('@/views/pages/Garages')),
        authority: [ADMIN, USER],
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
        component: lazy(() => import('@/views/pages/Servicegarage')),
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
        key: 'appsProject.scrumBoard',
        path: `${APP_PREFIX_PATH}/project/scrum-board`,
        component: lazy(() => import('@/views/project/ScrumBoard')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
        },
    },
    {
        key: 'appsProject.issue',
        path: `${APP_PREFIX_PATH}/project/issue`,
        component: lazy(() => import('@/views/project/Issue')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrm.dashboard',
        path: `${APP_PREFIX_PATH}/crm/dashboard`,
        component: lazy(() => import('@/views/crm/CrmDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrm.calendar',
        path: `${APP_PREFIX_PATH}/crm/calendar`,
        component: lazy(() => import('@/views/crm/Calendar')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrm.customers',
        path: `${APP_PREFIX_PATH}/crm/customers`,
        component: lazy(() => import('@/views/crm/Customers')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Customers',
        },
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/customer-details`,
        component: lazy(() => import('@/views/crm/CustomerDetail')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Customer Details',
            headerContainer: true,
        },
    },
    {
        key: 'appsProfileGarage.profilegarage',
        path: `/profilegarage/:id`,
        component: lazy(
            () => import('@/views/pages/ProfileGarage/ProfileGarage'),
        ),
        authority: [ADMIN, USER],
        meta: {
            header: '',
            headerContainer: true,
        },
    },
    {
        key: 'appsCrm.mail',
        path: `${APP_PREFIX_PATH}/crm/mail`,
        component: lazy(() => import('@/views/crm/Mail')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'appsCrm.mail',
        path: `${APP_PREFIX_PATH}/crm/mail/:category`,
        component: lazy(() => import('@/views/crm/Mail')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'appsSales.dashboard',
        path: `${APP_PREFIX_PATH}/sales/dashboard`,
        component: lazy(() => import('@/views/sales/SalesDashboard')),
        authority: [ADMIN],
    },
    {
        key: 'appsSales.productList',
        path: `${APP_PREFIX_PATH}/sales/product-list`,
        component: lazy(() => import('@/views/sales/ProductList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsSales.productEdit',
        path: `${APP_PREFIX_PATH}/sales/product-edit/:productId`,
        component: lazy(() => import('@/views/sales/ProductEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Edit Product',
        },
    },
    {
        key: 'appsSales.productNew',
        path: `${APP_PREFIX_PATH}/sales/product-new`,
        component: lazy(() => import('@/views/sales/ProductNew')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Add New Product',
        },
    },
    {
        key: 'appsSales.orderList',
        path: `${APP_PREFIX_PATH}/sales/order-list`,
        component: lazy(() => import('@/views/sales/OrderList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsSales.orderDetails',
        path: `${APP_PREFIX_PATH}/sales/order-details/:orderId`,
        component: lazy(() => import('@/views/sales/OrderDetails')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrypto.dashboard',
        path: `${APP_PREFIX_PATH}/crypto/dashboard`,
        component: lazy(() => import('@/views/crypto/CryptoDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrypto.portfolio',
        path: `${APP_PREFIX_PATH}/crypto/portfolio`,
        component: lazy(() => import('@/views/crypto/Portfolio')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Portfolio',
        },
    },
    {
        key: 'appsCrypto.market',
        path: `${APP_PREFIX_PATH}/crypto/market`,
        component: lazy(() => import('@/views/crypto/Market')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Market',
        },
    },
    {
        key: 'appsCrypto.wallets',
        path: `${APP_PREFIX_PATH}/crypto/wallets`,
        component: lazy(() => import('@/views/crypto/Wallets')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Wallets',
        },
    },
    {
        key: 'appsknowledgeBase.helpCenter',
        path: `${APP_PREFIX_PATH}/knowledge-base/help-center`,
        component: lazy(() => import('@/views/knowledge-base/HelpCenter')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
        },
    },
    {
        key: 'appsknowledgeBase.article',
        path: `${APP_PREFIX_PATH}/knowledge-base/article`,
        component: lazy(() => import('@/views/knowledge-base/Article')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsknowledgeBase.manageArticles',
        path: `${APP_PREFIX_PATH}/knowledge-base/manage-articles`,
        component: lazy(() => import('@/views/knowledge-base/ManageArticles')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Manage Articles',
            extraHeader: lazy(
                () =>
                    import(
                        '@/views/knowledge-base/ManageArticles/components/PanelHeader'
                    ),
            ),
            headerContainer: true,
        },
    },
    {
        key: 'appsknowledgeBase.editArticle',
        path: `${APP_PREFIX_PATH}/knowledge-base/edit-article`,
        component: lazy(() => import('@/views/knowledge-base/EditArticle')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsAccount.settings',
        path: `${APP_PREFIX_PATH}/account/settings/:tab`,
        component: lazy(() => import('@/views/account/Settings')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },
    {
        key: 'appsAccount.invoice',
        path: `${APP_PREFIX_PATH}/account/invoice/:id`,
        component: lazy(() => import('@/views/account/Invoice')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsAccount.activityLog',
        path: `${APP_PREFIX_PATH}/account/activity-log`,
        component: lazy(() => import('@/views/account/ActivityLog')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsAccount.kycForm',
        path: `${APP_PREFIX_PATH}/account/kyc-form`,
        component: lazy(() => import('@/views/account/KycForm')),
        authority: [ADMIN, USER],
    },
]

export default appsRoute
