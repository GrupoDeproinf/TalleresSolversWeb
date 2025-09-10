import{j as t}from"./index-KuHpp12A.js";import{D as o}from"./DemoComponentApi-7noEPM_d.js";import{D as e}from"./DemoLayout-LNAzJo7H.js";import{S as r}from"./SyntaxHighlighter-x3Mxhuot.js";import"./index-boacLOhc.js";import"./index.esm-rGXFteFT.js";import"./index-ZJP3Cke8.js";import"./AdaptableCard-rw4ZbIDd.js";import"./Card-vm7RtGp9.js";import"./Views-na6mpSjV.js";import"./Affix-awK88hfJ.js";import"./Button-eyFfbJth.js";import"./context-7oHEF7cI.js";import"./Tooltip-dkuVUjr7.js";import"./index.esm-EUjj_JVu.js";import"./floating-ui.react-u3CjLYej.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-WMG8M0Yi.js";import"./motion-N0SAmF_z.js";import"./index.esm-kBL7sQe6.js";import"./index-v0Cy3ZU9.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
