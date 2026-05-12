import{j as t}from"./index-ObPtJ5w-.js";import{D as o}from"./DemoComponentApi-LQeNVhyV.js";import{D as e}from"./DemoLayout-R64NsCKc.js";import{S as r}from"./SyntaxHighlighter-8CPog4j7.js";import"./index-qux3biZ9.js";import"./index.esm-XBjgx9Fs.js";import"./index-EMwAswi2.js";import"./AdaptableCard-40aX91j5.js";import"./Card-MCAhbk3s.js";import"./Views-SgYqjPyv.js";import"./Affix-B17nTta9.js";import"./Button-vm4fJ4W7.js";import"./context-lkTBNAwK.js";import"./Tooltip-uwez-WWL.js";import"./index.esm-7WEKSPY1.js";import"./floating-ui.react-RMGTWhlp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-SwJB8P6d.js";import"./motion-F2ImUn0a.js";import"./index.esm-AfzvVFOM.js";import"./index-zpjpykeE.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
