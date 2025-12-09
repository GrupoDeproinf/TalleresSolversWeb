import{j as t}from"./index-MXeuXt6D.js";import{D as o}from"./DemoComponentApi-Irwn1uIB.js";import{D as e}from"./DemoLayout-XoEn_4k-.js";import{S as r}from"./SyntaxHighlighter-YXTMy4M4.js";import"./index-hfXV9fO5.js";import"./index.esm-Nne6VUru.js";import"./index-KjETz4nL.js";import"./AdaptableCard-pBoZ8GaV.js";import"./Card-K535tOj0.js";import"./Views-YIa05gYP.js";import"./Affix-aX1zVhtC.js";import"./Button-vr5nYjWh.js";import"./context-CyHO4l0y.js";import"./Tooltip-tunHCYEK.js";import"./index.esm-tXvc1PCn.js";import"./floating-ui.react-diTN8vIO.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-TkOf27ZX.js";import"./motion-WWGuudfi.js";import"./index.esm-QY0V8pz3.js";import"./index-hI2o6F97.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
