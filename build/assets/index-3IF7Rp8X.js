import{j as e}from"./index-EISNSMds.js";import{D as o}from"./DemoComponentApi-OKMA84Tk.js";import{D as t}from"./DemoLayout-Rf6s_2zp.js";import{S as r}from"./SyntaxHighlighter-4JlvOwBQ.js";import"./index-iNCwCYd5.js";import"./index.esm-EL2hHlmT.js";import"./index-YX6prj96.js";import"./AdaptableCard-qHFClxH0.js";import"./Card-wEpj0U8y.js";import"./Views-cYTCqjtj.js";import"./Affix-KE2mXACa.js";import"./Button-lkK6fZcD.js";import"./context-Ogq3jpii.js";import"./Tooltip-qNULHPcL.js";import"./index.esm-V-D0jquW.js";import"./floating-ui.react-oIN8kvGt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-mrgGKg7t.js";import"./motion-uEy6ONEe.js";import"./index.esm-YYnUCUNr.js";import"./index-NH-tiSqR.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
