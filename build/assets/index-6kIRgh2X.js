import{j as t}from"./index-49VJK46O.js";import{D as o}from"./DemoComponentApi-m-e4sl8x.js";import{D as e}from"./DemoLayout-TsVDUC5b.js";import{S as r}from"./SyntaxHighlighter-y5msM8_j.js";import"./index-NND_QyzC.js";import"./index.esm-nNjcsMgN.js";import"./index-_TgZyloI.js";import"./AdaptableCard-P0GI32P2.js";import"./Card-x8Afl9LD.js";import"./Views-RQmIN1FY.js";import"./Affix-94zZobw2.js";import"./Button-bqI3GDyv.js";import"./context-JrpcaBA5.js";import"./Tooltip-OYDlPLoW.js";import"./index.esm-16-OZXRr.js";import"./floating-ui.react-ZAMaDPJk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-QIpWpgz1.js";import"./motion-Vp-thHGU.js";import"./index.esm-1z9Mj4Wf.js";import"./index-2dwt-Q1e.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
