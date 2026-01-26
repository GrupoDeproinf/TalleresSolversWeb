import{j as t}from"./index-h29nTG28.js";import{D as o}from"./DemoComponentApi-JzgMicK7.js";import{D as e}from"./DemoLayout-0Ok-VggY.js";import{S as r}from"./SyntaxHighlighter-C9Z-bFi9.js";import"./index-Qb2Rt7uY.js";import"./index.esm-x7L3bfOO.js";import"./index-51qiMPj3.js";import"./AdaptableCard-dq8zB7JO.js";import"./Card-72Kz4ZZm.js";import"./Views-tqoNXJJS.js";import"./Affix-wKRAzpUv.js";import"./Button-HN7QplVb.js";import"./context-lu_ZoR82.js";import"./Tooltip-keULPPQ7.js";import"./index.esm-WckmvPV8.js";import"./floating-ui.react-QHdoWf14.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Xq95uh32.js";import"./motion-2BfmWMAc.js";import"./index.esm-AU-9eZ_S.js";import"./index-hHSJtmdP.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
