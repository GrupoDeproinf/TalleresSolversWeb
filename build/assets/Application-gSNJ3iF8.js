import{j as e}from"./index-JmHojjZF.js";import{S as c}from"./SyntaxHighlighter-KEuVydnx.js";import{H as o}from"./index-rEOp-HW-.js";import{T as i}from"./index-ToqI7_Kp.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";import"./index.esm-kXaIV95b.js";const{Tr:d,Th:a,Td:r,THead:n,TBody:s}=i,l={api:[{propName:"apiPrefix",type:"<code>string</code>",defaultDemo:"<code>'/api'</code>",defaultStarter:"<code>'/api'</code>",desc:"Prefix path for api url"},{propName:"authenticatedEntryPath",type:"<code>string</code>",defaultDemo:"<code>'/app/sales/dashboard'</code>",defaultStarter:"<code>'/home'</code>",desc:"URL that will redirect after authenticated"},{propName:"unAuthenticatedEntryPath",type:"<code>string</code>",defaultDemo:"<code>'/sign-in'</code>",defaultStarter:"<code>'/sign-in'</code>",desc:"URL that will redirect if authentication invalid"},{propName:"tourPath",type:"<code>string</code>",defaultDemo:"<code>'/app/account/kyc-form'</code>",defaultStarter:"<code>'/'</code>",desc:"URL that will redirect after signup,"},{propName:"locale",type:"<code>string</code>",defaultDemo:"<code>'en'</code>",defaultStarter:"<code>'en'</code>",desc:"App locale value"},{propName:"enableMock",type:"<code>boolean</code>",defaultDemo:"<code>true</code>",defaultStarter:"<code>true</code>",desc:"Whether to point api linkage to mock server"}]},g=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["You can configure some static app related values"," ",e.jsx("code",{children:"src/configs/app.config.ts"}),", here are some default configurations."]}),e.jsx("span",{children:e.jsx("i",{children:"demo"})}),e.jsx(c,{language:"ts",children:`const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/app/sales/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/app/account/kyc-form',
    locale: 'en',
    enableMock: true
}`}),e.jsx("span",{children:e.jsx("i",{children:"starter"})}),e.jsx(c,{language:"ts",children:`const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: true
}`}),e.jsx("h5",{className:"-mb-2 mt-6",children:"Metadata"}),e.jsxs(i,{className:"demo-api-table",children:[e.jsx(n,{children:e.jsxs(d,{children:[e.jsx(a,{children:"Properties"}),e.jsx(a,{children:"Description"}),e.jsx(a,{children:"Type"}),e.jsx(a,{children:"Default(Demo)"}),e.jsx(a,{children:"Default(Stater)"})]})}),e.jsx(s,{children:l.api.map(t=>e.jsxs(d,{children:[e.jsx(r,{className:"font-semibold",children:t.propName}),e.jsx(r,{children:o(t.desc||"")}),e.jsx(r,{children:o(t.type||"")}),e.jsx(r,{children:o(t.defaultDemo||"")}),e.jsx(r,{children:o(t.defaultStarter||"")})]},`row-${t.propName}`))})]})]});export{g as default};
