import{j as e}from"./index-D1MrS5xY.js";import{S as o}from"./SyntaxHighlighter-4OjnlPcL.js";import{D as t}from"./DemoComponentApi-LOh212rE.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";import"./index-MbLzU_Cs.js";import"./index.esm-T7MKHyVP.js";import"./index-sva1Rkyn.js";const u=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["Solvers use"," ",e.jsx("a",{href:"https://reactrouter.com/",target:"_blank",rel:"noopener noreferrer",children:"react-router"})," ","as base routing system. On this guide, you will find out how to create a new routes and how existing routes working."]}),e.jsxs("div",{className:"mt-6",id:"overview",children:[e.jsx("h5",{children:"Overview"}),e.jsxs("p",{className:"my-1",children:["You can find the template's router configuration in"," ",e.jsx("code",{children:"src/configs/routes.config/index.ts"}),", there's 2 type of route group as following."]}),e.jsx(o,{language:"js",children:`export const publicRoutes = [
    ...
]

export const protectedRoutes = [
    ...
]`}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"publicRoutes"}),e.jsx("p",{className:"mt-1",children:"this routes group included all routes that open to all users."})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"protectedRoutes"}),e.jsx("p",{className:"mt-1",children:"This routes group included all routes that required authentication."})]})]})]}),e.jsxs("div",{className:"mt-10",id:"addingNewRoute",children:[e.jsx("h5",{children:"Adding a new route"}),e.jsx("p",{className:"mt-1",children:"You can add the following code to any of the routing groups, depending on the authority you wish to."}),e.jsx(o,{language:"js",children:`export const protectedRoutes = [
	{
        key: 'a-unique-id-for-this-view'
        path: 'my-new-view-path',
        component: lazy(() => import('@/views/MyNewComponent')),
        authority: [],
        meta: {
            pageContainerType: 'gutter'
        }
    },			
]`})]}),e.jsxs("div",{className:"mt-10",id:"authority",children:[e.jsx("h5",{children:"Authority"}),e.jsxs("p",{className:"mt-1",children:["Solvers routes comes with a simple role based access control, you can set accessible roles as Array to"," ",e.jsx("code",{children:"authority"})," field. Taking following code as example, the route only available for user who have either"," ",e.jsx("code",{children:"'admin'"})," or ",e.jsx("code",{children:"'user'"})," in their profile.",e.jsx("br",{}),"If your leave ",e.jsx("code",{children:"authority"})," field as empty array, the route will open to any roles to access."]}),e.jsx(o,{language:"js",children:`export const protectedRoutes = [
    {
        ...
        authority: ['admin', 'user'],
    },			
]`}),e.jsxs("p",{children:["In our default ",e.jsx("code",{children:"AuthorityGuard"}),", it will check the current user role from redux state (",e.jsx("code",{children:"auth.user.authority"}),"). You can use this as base to extend or customize your access control."]})]}),e.jsxs("div",{className:"mt-10",id:"authority",children:[e.jsx("h5",{children:"Meta"}),e.jsxs("p",{className:"mt-1",children:[e.jsx("code",{children:"meta"})," field allow us to carry addtional information to the ",e.jsx("code",{children:"PageContainer"})," or the view component under this route."]}),e.jsx(o,{language:"js",children:`export const protectedRoutes = [
    {
        ...
        meta: {
            pageContainerType: 'gutter',
            header: 'Page Title',
            headerContainer: false,
            extraHeader: lazy(() => import('SomeComponent')),
            footer: false,
            layout: 'blank',
        }
    },			
]`}),e.jsxs("p",{children:["The view component under this route will be able to receive all the ",e.jsx("code",{children:"meta"})," data above."]}),e.jsx(t,{hideApiTitle:!0,keyText:"properties",api:[{api:[{propName:"pageContainerType",type:"<code>'default'</code>  | <code>'gutterless'</code> | <code>'contained'</code>",default:"<code>'default'</code>",desc:"Type of the view container"},{propName:"header",type:"<code>string</code>  | <code>object</code>",default:"-",desc:"View page title or custom element"},{propName:"headerContainer",type:"<code>boolean</code>",default:"-",desc:"Whether to enable header container"},{propName:"extraHeader",type:"<code>string</code>  | <code>object</code>",default:"-",desc:"Apply a custom element on the opposite of header"},{propName:"footer",type:"<code>boolean</code>",default:"<code>true</code>",desc:"Whether to display footer"},{propName:"layout",type:"<code>'blank'</code>  | <code>'classic'</code> | <code>'modern'</code> | <code>'simple'</code> | <code>'decked'</code> | <code>'stackedSide'</code>",default:"-",desc:"Overiding current layout for this page"}]}]})]})]});export{u as default};
