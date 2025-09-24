import{j as t}from"./index-iPBGd0jP.js";import{D as o}from"./DemoComponentApi-IWLNt3xg.js";import{D as e}from"./DemoLayout-7c9VNwm2.js";import{S as r}from"./SyntaxHighlighter-yU0WGUDl.js";import"./index-lupvUEqj.js";import"./index.esm-pDzRu5rN.js";import"./index-cwzhKvQG.js";import"./AdaptableCard-SuNPJiLp.js";import"./Card-any3pDMk.js";import"./Views-JmN_26On.js";import"./Affix-G-abYIfr.js";import"./Button-qbGHUbjU.js";import"./context-suePrQf5.js";import"./Tooltip-FcjdLHRu.js";import"./index.esm-WaLwlOAM.js";import"./floating-ui.react-gCkXl95_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7qxwMuxk.js";import"./motion-9yTXZEhO.js";import"./index.esm-xsyTc8bt.js";import"./index-Do6YuCsD.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
