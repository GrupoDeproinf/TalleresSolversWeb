import{j as t}from"./index-sqlzVTU6.js";import{D as o}from"./DemoComponentApi-WXpsOjn1.js";import{D as e}from"./DemoLayout-8mWBD9jQ.js";import{S as r}from"./SyntaxHighlighter-6acm_iIo.js";import"./index-cxHa2H3b.js";import"./index.esm-xcFhNsFj.js";import"./index-qJSJzGnC.js";import"./AdaptableCard-V0uxNSVw.js";import"./Card-nwu__Oi2.js";import"./Views-Xk2ztg4z.js";import"./Affix-ajaj60ys.js";import"./Button-UK-D34UO.js";import"./context-uUBq0g4n.js";import"./Tooltip-JKptW_vN.js";import"./index.esm-OyomaAaz.js";import"./floating-ui.react-VoN_T7V2.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-lbxTp4dY.js";import"./motion-u71o8l8w.js";import"./index.esm-vkxxgfhU.js";import"./index-BGgBYGq3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
