import{j as t}from"./index-nE3qTmWJ.js";import{D as o}from"./DemoComponentApi-r_buyWw0.js";import{D as e}from"./DemoLayout-48Zmaz0q.js";import{S as r}from"./SyntaxHighlighter-WRXrPh9V.js";import"./index-qkYNi1s2.js";import"./index.esm-rJIJC5Wo.js";import"./index-D9LAS3yO.js";import"./AdaptableCard-IXAk-fG1.js";import"./Card-ofYhqojB.js";import"./Views-Wr9UmLiy.js";import"./Affix-Ng5hiQvt.js";import"./Button-mNwEcSfR.js";import"./context-aC9vqP51.js";import"./Tooltip-f_oot8L9.js";import"./index.esm-sCMYjrHG.js";import"./floating-ui.react-Yyq8XGry.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-FIhXA5AV.js";import"./motion-DI-APurt.js";import"./index.esm-JhChuggt.js";import"./index-RII3KDWx.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useAuthority from '@/utils/hooks/useAuthority'

const Component = () => {

	const { userAuthority = [], authority = [], children } = props

	const userAuthority = ['USER']

	const authority = ['ADMIN', 'USER']

	const roleMatched = useAuthority(userAuthority, authority)

	return (...)
}
`}),s="UseAuthorityDoc",p={title:"useAuthority",desc:"useAuthority hook help to check whether the current user has permmision to access."},m=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:t.jsx(i,{})}],a=[{component:"useAuthority",api:[{propName:"userAuthority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of the user roles"},{propName:"authority",type:"<code>Array</code>",default:"<code>[]</code>",desc:"List of roles that allow to access"}]}],u=t.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"roleMatched",type:"<code>boolean</code>",default:"-",desc:"Result of authority match"}]}]}),C=()=>t.jsx(e,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:p,demos:m,api:a,mdPrefixPath:"utils",extra:u,keyText:"param"});export{C as default};
