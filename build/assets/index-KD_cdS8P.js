import{j as t}from"./index-RDDe908i.js";import{D as o}from"./DemoComponentApi-CC4vqr19.js";import{D as e}from"./DemoLayout-q-LCpUjW.js";import{S as r}from"./SyntaxHighlighter-T4RSsC4X.js";import"./index-Ivev60oI.js";import"./index.esm-YSr41lmP.js";import"./index-ZRJcUYgW.js";import"./AdaptableCard-_VktLZN6.js";import"./Card-Wjlc57eb.js";import"./Views-_S6tvCA_.js";import"./Affix-9zPjzUAa.js";import"./Button-oeuNGS_m.js";import"./context-rz-mNfuA.js";import"./Tooltip-rAL5X6_d.js";import"./index.esm-HfEv24iA.js";import"./floating-ui.react-kejQHkkD.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5S2u-SAR.js";import"./motion-0YBgrXpo.js";import"./index.esm-9AngbOLC.js";import"./index-YMfttKH7.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
