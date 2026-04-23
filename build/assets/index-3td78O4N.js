import{j as t}from"./index-EISNSMds.js";import{D as o}from"./DemoComponentApi-OKMA84Tk.js";import{D as e}from"./DemoLayout-Rf6s_2zp.js";import{S as r}from"./SyntaxHighlighter-4JlvOwBQ.js";import"./index-iNCwCYd5.js";import"./index.esm-EL2hHlmT.js";import"./index-YX6prj96.js";import"./AdaptableCard-qHFClxH0.js";import"./Card-wEpj0U8y.js";import"./Views-cYTCqjtj.js";import"./Affix-KE2mXACa.js";import"./Button-lkK6fZcD.js";import"./context-Ogq3jpii.js";import"./Tooltip-qNULHPcL.js";import"./index.esm-V-D0jquW.js";import"./floating-ui.react-oIN8kvGt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-mrgGKg7t.js";import"./motion-uEy6ONEe.js";import"./index.esm-YYnUCUNr.js";import"./index-NH-tiSqR.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
