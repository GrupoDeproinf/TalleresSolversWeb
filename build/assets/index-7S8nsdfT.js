import{j as t}from"./index-iN9gC56E.js";import{D as o}from"./DemoComponentApi-YNNE7SSu.js";import{D as e}from"./DemoLayout-pGXJk8d_.js";import{S as r}from"./SyntaxHighlighter-pjHzf9-c.js";import"./index-r5HDIMlV.js";import"./index.esm-PsQ9NYiK.js";import"./index-299YhDr4.js";import"./AdaptableCard-juPQJRD8.js";import"./Card-UeUwmQGm.js";import"./Views-fqLBZTLn.js";import"./Affix-B8QzwV1Y.js";import"./Button-GMmR06Qd.js";import"./context-sXqbsmVT.js";import"./Tooltip-LTk8tIBU.js";import"./index.esm-qnYcV-k-.js";import"./floating-ui.react-238fQh4A.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-snVep3pU.js";import"./motion-VuSiHn-Z.js";import"./index.esm-G_R2Qahq.js";import"./index-q_0ZF6Cq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
