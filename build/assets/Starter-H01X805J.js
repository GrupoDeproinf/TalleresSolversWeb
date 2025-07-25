import{j as e,bh as o}from"./index-CvzYHHyi.js";import{S as t}from"./SyntaxHighlighter-vYeqY1Gw.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["As we mentioned in"," ",e.jsx(o,{to:"/docs/documentation/installation",children:"Installation"}),", we have provided a starter version with minimum core components and functionality setup, we strongly recommend developer use this version to build the app on top."]}),e.jsxs("p",{children:["When you have opened the starter pack in your local environment, you will be redirected to the login page, where you can use"," ",e.jsx("i",{children:"user: admin | password: 123Qwe"})," this credential to sign in."]}),e.jsxs("i",{children:["Note: the starter version enabled mock api by default, every api calls will point to the mock server, if you wish to disable or know more about the mock api, visit"," ",e.jsx(o,{to:"/docs/documentation/mock-api",children:"Mock API"})," ","doc."]}),e.jsxs("div",{className:"mt-10",id:"defaultConfig",children:[e.jsx("h5",{children:"Default configs"}),e.jsx("p",{children:"Here are some default configurations for the starter version, you can change the config according to your needs."}),e.jsxs("p",{className:"mb-2",children:["AppConfig -"," ",e.jsx(o,{to:"/docs/documentation/app",children:"Doc"})]}),e.jsx(t,{language:"js",children:`const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/app/sales/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/app/account/kyc-form',
    locale: 'en',
    enableMock: true,
}
`}),e.jsxs("p",{className:"mb-2",children:["ThemeConfig -"," ",e.jsx(o,{to:"/docs/documentation/overall-theme-config",children:"Doc"})]}),e.jsx(t,{language:"js",children:`export const themeConfig: ThemeConfig = {
    themeColor: 'indigo',
    direction: THEME_ENUM.DIR_LTR,
    mode: THEME_ENUM.MODE_LIGHT,
    primaryColorLevel: 600,
    cardBordered: true,
    panelExpand: false,
    controlSize: 'md',
    navMode: THEME_ENUM.NAV_MODE_LIGHT,
    layout: {
        type: THEME_ENUM.LAYOUT_TYPE_MODERN,
        sideNavCollapse: false,
    },
}
`}),e.jsxs("p",{className:"mb-2",children:["RoutesConfig -"," ",e.jsx(o,{to:"/docs/documentation/routing",children:"Doc"})]}),e.jsx(t,{language:"js",children:`const publicRoutes = [
    {
        key: 'signIn',
        path: '/sign-in',
        component: lazy(() => import('@/views/auth/SignIn')),
        authority: [],
    },
    {
        key: 'signUp',
        path: '/sign-up',
        component: lazy(() => import('@/views/auth/SignUp')),
        authority: [],
    },
    {
        key: 'forgotPassword',
        path: '/forgot-password',
        component: lazy(() => import('@/views/auth/ForgotPassword')),
        authority: [],
    },
    {
        key: 'resetPassword',
        path: '/reset-password',
        component: lazy(() => import('@/views/auth/ResetPassword')),
        authority: [],
    },
]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
]
`}),e.jsxs("p",{className:"mb-2",children:["NavConfig -"," ",e.jsx(o,{to:"/docs/documentation/routing",children:"Doc"})]}),e.jsx(t,{language:"js",children:`const navigationConfig = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: []
    },
]
`})]})]});export{r as default};
