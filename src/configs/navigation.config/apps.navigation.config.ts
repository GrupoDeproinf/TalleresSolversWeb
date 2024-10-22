import { APP_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const appsNavigationConfig: NavigationTree[] = [
    {
        key: 'apps',
        path: '',
        title: 'APPS',
        translateKey: 'nav.apps',
        icon: 'apps',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'apps.project',
                path: '',
                title: 'Project',
                translateKey: 'nav.appsProject.project',
                icon: 'project',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [
                    {
                        key: 'appsProject.dashboard',
                        path: `${APP_PREFIX_PATH}/project/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsProject.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                ],
            },
            {
                key: 'apps.users',
                path: `${APP_PREFIX_PATH}/users`,
                title: 'Clientes',
                translateKey: 'Clientes',
                icon: 'user',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'apps.garages',
                path: `${APP_PREFIX_PATH}/garages`,
                title: 'Talleres',
                translateKey: 'Talleres',
                icon: 'cars',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'apps.services',
                path: `${APP_PREFIX_PATH}/services`,
                title: 'Servicios',
                translateKey: 'Servicios',
                icon: 'tools',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [],
            },
        ],
    },
]

export default appsNavigationConfig
