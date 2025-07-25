import{j as t}from"./index-CvzYHHyi.js";import{D as o}from"./DemoComponentApi-mXxAPZ-3.js";import{D as e}from"./DemoLayout-bFBRKV5K.js";import{S as r}from"./SyntaxHighlighter-vYeqY1Gw.js";import"./index-_6lqCWyf.js";import"./index.esm-iZHJToXl.js";import"./index-GYIUrbdE.js";import"./AdaptableCard-ME7InvBI.js";import"./Card-8kOVJnWG.js";import"./Views-IGpbAJRJ.js";import"./Affix-q2qfuq8j.js";import"./Button-RfidP847.js";import"./context-cQxpCbi0.js";import"./Tooltip-1BfvAuqv.js";import"./index.esm-ziONltnY.js";import"./floating-ui.react-g07vzxpC.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-w_0co_RM.js";import"./motion-s0hQdqSS.js";import"./index.esm-M47S76Wd.js";import"./index-sLTrG-jb.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
