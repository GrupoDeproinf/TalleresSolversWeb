import{j as e}from"./index-iN9gC56E.js";import{D as o}from"./DemoComponentApi-YNNE7SSu.js";import{D as t}from"./DemoLayout-pGXJk8d_.js";import{S as r}from"./SyntaxHighlighter-pjHzf9-c.js";import"./index-r5HDIMlV.js";import"./index.esm-PsQ9NYiK.js";import"./index-299YhDr4.js";import"./AdaptableCard-juPQJRD8.js";import"./Card-UeUwmQGm.js";import"./Views-fqLBZTLn.js";import"./Affix-B8QzwV1Y.js";import"./Button-GMmR06Qd.js";import"./context-sXqbsmVT.js";import"./Tooltip-LTk8tIBU.js";import"./index.esm-qnYcV-k-.js";import"./floating-ui.react-238fQh4A.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-snVep3pU.js";import"./motion-VuSiHn-Z.js";import"./index.esm-G_R2Qahq.js";import"./index-q_0ZF6Cq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
