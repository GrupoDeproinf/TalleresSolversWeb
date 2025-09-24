import{j as e}from"./index-iPBGd0jP.js";import{D as o}from"./DemoComponentApi-IWLNt3xg.js";import{D as t}from"./DemoLayout-7c9VNwm2.js";import{S as r}from"./SyntaxHighlighter-yU0WGUDl.js";import"./index-lupvUEqj.js";import"./index.esm-pDzRu5rN.js";import"./index-cwzhKvQG.js";import"./AdaptableCard-SuNPJiLp.js";import"./Card-any3pDMk.js";import"./Views-JmN_26On.js";import"./Affix-G-abYIfr.js";import"./Button-qbGHUbjU.js";import"./context-suePrQf5.js";import"./Tooltip-FcjdLHRu.js";import"./index.esm-WaLwlOAM.js";import"./floating-ui.react-gCkXl95_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7qxwMuxk.js";import"./motion-9yTXZEhO.js";import"./index.esm-xsyTc8bt.js";import"./index-Do6YuCsD.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
