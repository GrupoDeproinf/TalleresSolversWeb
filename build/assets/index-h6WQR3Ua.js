import{j as t}from"./index-c3tk-28l.js";import{D as o}from"./DemoComponentApi-I_losSoG.js";import{D as e}from"./DemoLayout-QyWGjLRg.js";import{S as r}from"./SyntaxHighlighter-2yd3lg-W.js";import"./index-uzExSQ8q.js";import"./index.esm-_F1MhDNx.js";import"./index-W2I2t87C.js";import"./AdaptableCard-oq4UoEMI.js";import"./Card-vDJQQwcv.js";import"./Views-CcnADSHN.js";import"./Affix-e-D77SLE.js";import"./Button-0ZytU0Lu.js";import"./context-aOzumP2l.js";import"./Tooltip-rw9f_jKc.js";import"./index.esm-U4ZUTPeh.js";import"./floating-ui.react-YZHDoCKW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OlbfkzwG.js";import"./motion-l21dNlMq.js";import"./index.esm-AbsWJ_Oy.js";import"./index-pUDB1hfI.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
