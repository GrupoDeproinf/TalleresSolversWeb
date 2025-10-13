import{j as t}from"./index-ABjXZzKD.js";import{D as o}from"./DemoComponentApi-C2YupdIe.js";import{D as e}from"./DemoLayout-zIqale2t.js";import{S as r}from"./SyntaxHighlighter-KAsxxSPo.js";import"./index-hoI5MYke.js";import"./index.esm-G4kMKpK9.js";import"./index-Laf2x-F-.js";import"./AdaptableCard-Guhgo30g.js";import"./Card-2Fe-_J3l.js";import"./Views-8W_pghrR.js";import"./Affix--cJn1oF2.js";import"./Button-PrF4gPDj.js";import"./context-q1VEwzUH.js";import"./Tooltip-ZcEA5Guw.js";import"./index.esm-X-60aNOT.js";import"./floating-ui.react-kp5fCW25.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-bFNXb1qC.js";import"./motion-LTaSieXW.js";import"./index.esm-eoTp6Zo3.js";import"./index-g0vaglUp.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
