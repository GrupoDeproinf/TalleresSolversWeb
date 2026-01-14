import{j as t}from"./index-0JW14Cl4.js";import{D as o}from"./DemoComponentApi-LpKabwDF.js";import{D as e}from"./DemoLayout-HouaRUoM.js";import{S as r}from"./SyntaxHighlighter-5ovYX9h5.js";import"./index-a8YK1BSZ.js";import"./index.esm-WNi23VL7.js";import"./index-QMiMCL-O.js";import"./AdaptableCard-zj0A6V2V.js";import"./Card-TuPZ2v2_.js";import"./Views-ArJd3jpj.js";import"./Affix-OBrB1uSN.js";import"./Button-D58LGLsw.js";import"./context-AxDKAhEU.js";import"./Tooltip-7ixFulgX.js";import"./index.esm-kYnGXkxy.js";import"./floating-ui.react-wwZWrrrF.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VwLHg0MV.js";import"./motion-AtCGOUgk.js";import"./index.esm-YV82YYEg.js";import"./index-Jck-JtMN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
