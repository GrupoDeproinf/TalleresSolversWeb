import{j as t}from"./index-xKsZ8l35.js";import{D as o}from"./DemoComponentApi-o8o4WmSh.js";import{D as e}from"./DemoLayout-njDmAs9i.js";import{S as r}from"./SyntaxHighlighter-_vqI2C9f.js";import"./index-ghUfQZjr.js";import"./index.esm-quO7oBH8.js";import"./index-FhQ8XXVG.js";import"./AdaptableCard-wYzy3Bvj.js";import"./Card-RMw-H-zQ.js";import"./Views-wIC69dCb.js";import"./Affix-uE8COQxo.js";import"./Button-YxCM68tE.js";import"./context-6_7T_3zC.js";import"./Tooltip-NDwm1HBW.js";import"./index.esm-ACeyYci_.js";import"./floating-ui.react-tuQVGGNH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-btnPQ0wi.js";import"./motion-jlOC7Xzp.js";import"./index.esm-HJEJ8FEu.js";import"./index-SZK8lSYa.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
