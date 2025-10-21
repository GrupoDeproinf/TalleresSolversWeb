import{j as t}from"./index-50rgKX9S.js";import{D as o}from"./DemoComponentApi-9CHMera2.js";import{D as e}from"./DemoLayout-SY0wuGyv.js";import{S as r}from"./SyntaxHighlighter-oOJMta1t.js";import"./index-X3G8Yg8B.js";import"./index.esm-BzTP7NzC.js";import"./index-5fWUxSe9.js";import"./AdaptableCard-LFMvjwtD.js";import"./Card-vqKpG-UA.js";import"./Views-A7x8nqpb.js";import"./Affix-LE9nnfuO.js";import"./Button-xRLYDkxn.js";import"./context-S2-woICp.js";import"./Tooltip-GIYbDsiP.js";import"./index.esm-opZQsgq7.js";import"./floating-ui.react-bRmrURkd.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-oREErx12.js";import"./motion-QExVqk61.js";import"./index.esm-CTp4r0U4.js";import"./index-q4uYtSHq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
