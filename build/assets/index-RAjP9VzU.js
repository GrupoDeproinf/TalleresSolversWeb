import{j as t}from"./index-9t5KOHno.js";import{D as o}from"./DemoComponentApi-N41dBEGc.js";import{D as e}from"./DemoLayout-iwCSgSdG.js";import{S as r}from"./SyntaxHighlighter-dGysNVJv.js";import"./index-n0YNfJf4.js";import"./index.esm-mNZVPVzQ.js";import"./index-81440SWT.js";import"./AdaptableCard-AQPFOlT9.js";import"./Card-12GHa1Eq.js";import"./Views-UsKkkDUh.js";import"./Affix-1YOWKSSd.js";import"./Button-dbQf2eah.js";import"./context-bikMt5Q-.js";import"./Tooltip-RAyjLDPF.js";import"./index.esm-wUG74Yhm.js";import"./floating-ui.react-px5GD9H_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-1m9E763O.js";import"./motion-tHAU1tWQ.js";import"./index.esm-NU0RhjYe.js";import"./index-Ph93yIGB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
