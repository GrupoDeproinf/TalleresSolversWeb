import{j as t}from"./index-Nr7DOcs5.js";import{D as o}from"./DemoComponentApi-6zRb4_DW.js";import{D as e}from"./DemoLayout-TYFeUBFg.js";import{S as r}from"./SyntaxHighlighter-Lppmx1nC.js";import"./index-NkYS5vPG.js";import"./index.esm-7QtrnPrk.js";import"./index-nftdwZx5.js";import"./AdaptableCard-9_BPIhlC.js";import"./Card-GtPtNWmu.js";import"./Views-SzAC9t3D.js";import"./Affix-V3V6XeQW.js";import"./Button-RpRRBLhx.js";import"./context-gbG70jxa.js";import"./Tooltip-gLhVAyTO.js";import"./index.esm-ZAJo3edJ.js";import"./floating-ui.react-Siy9LDCN.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-c5JwgfFM.js";import"./motion-GODN01Pl.js";import"./index.esm-hDm5I03d.js";import"./index-YzJdvSvg.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
