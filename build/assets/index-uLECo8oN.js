import{j as t}from"./index-_feUBWkF.js";import{D as o}from"./DemoComponentApi-QXiYjNvd.js";import{D as e}from"./DemoLayout-19EPW6T8.js";import{S as r}from"./SyntaxHighlighter-RGzVEGmi.js";import"./index--K6mHtPM.js";import"./index.esm-c6ShvaQW.js";import"./index-lvdI60UC.js";import"./AdaptableCard-CKf0cL3z.js";import"./Card-fXn1hgP9.js";import"./Views-NoPs0swz.js";import"./Affix-3HLokM4n.js";import"./Button-jcq0xEfh.js";import"./context-w88CtZWU.js";import"./Tooltip-tqY3hXOR.js";import"./index.esm-bIknb-8m.js";import"./floating-ui.react-AOig1bqs.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-C1ft9MxP.js";import"./motion-2zhnpuIh.js";import"./index.esm-CyL_iEBq.js";import"./index-Xr0iHSGr.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
