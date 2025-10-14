import{j as t}from"./index-sxY2vR_b.js";import{D as o}from"./DemoComponentApi-597voAgO.js";import{D as e}from"./DemoLayout-evFXGnBx.js";import{S as r}from"./SyntaxHighlighter-cbRe9zU-.js";import"./index-AN3niVhH.js";import"./index.esm-7rMJeW_p.js";import"./index-XOOicjk1.js";import"./AdaptableCard-oIjzq9rA.js";import"./Card-3z76uwgw.js";import"./Views-YxvfAhNX.js";import"./Affix-LcdOe-fz.js";import"./Button-gHfU8a9b.js";import"./context-ugtK0z0w.js";import"./Tooltip-tOnNgS6K.js";import"./index.esm-lAhGiBpp.js";import"./floating-ui.react-xh7t2hCc.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-beo0AS2x.js";import"./motion-h-3axnRn.js";import"./index.esm-cN1LGhJ4.js";import"./index-t_CREONj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
