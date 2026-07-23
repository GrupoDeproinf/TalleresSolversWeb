import{j as t}from"./index-1D3tZeRU.js";import{D as o}from"./DemoComponentApi-IiIr2ov9.js";import{D as e}from"./DemoLayout-9pcZBe_s.js";import{S as r}from"./SyntaxHighlighter-7ip3ydM7.js";import"./index-f0TC0RtX.js";import"./index.esm-1cw5D7XZ.js";import"./index-knWPyce5.js";import"./AdaptableCard-dp133X_9.js";import"./Card-m-8KTUb6.js";import"./Views-x404Dbvu.js";import"./Affix-y9PDXxYB.js";import"./Button-zoy55Mik.js";import"./context-pBL3AZft.js";import"./Tooltip-1iIiS6ws.js";import"./index.esm-wjn4G6Uw.js";import"./floating-ui.react-ppsVtD3w.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yjap_eDU.js";import"./motion-gAf0GThQ.js";import"./index.esm-a23T_XkR.js";import"./index-lwFb3tge.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
