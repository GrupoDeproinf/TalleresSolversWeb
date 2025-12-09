import{j as e}from"./index-nE3qTmWJ.js";import{D as o}from"./DemoComponentApi-r_buyWw0.js";import{D as t}from"./DemoLayout-48Zmaz0q.js";import{S as r}from"./SyntaxHighlighter-WRXrPh9V.js";import"./index-qkYNi1s2.js";import"./index.esm-rJIJC5Wo.js";import"./index-D9LAS3yO.js";import"./AdaptableCard-IXAk-fG1.js";import"./Card-ofYhqojB.js";import"./Views-Wr9UmLiy.js";import"./Affix-Ng5hiQvt.js";import"./Button-mNwEcSfR.js";import"./context-aC9vqP51.js";import"./Tooltip-f_oot8L9.js";import"./index.esm-sCMYjrHG.js";import"./floating-ui.react-Yyq8XGry.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-FIhXA5AV.js";import"./motion-DI-APurt.js";import"./index.esm-JhChuggt.js";import"./index-RII3KDWx.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
