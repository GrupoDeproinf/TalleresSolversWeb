import{j as e}from"./index-S9gWAOhe.js";import{D as o}from"./DemoComponentApi-HhwW7XC_.js";import{D as t}from"./DemoLayout-CDxRlQgy.js";import{S as r}from"./SyntaxHighlighter-r0tNmJqa.js";import"./index-bbG1C4HF.js";import"./index.esm-llRLA_rx.js";import"./index-Gjm4fmPx.js";import"./AdaptableCard-yK5a-emR.js";import"./Card-g98i0nur.js";import"./Views-CFuOK5sp.js";import"./Affix-8RXZCQ1i.js";import"./Button-xPGJGWxb.js";import"./context-mAM1TfDV.js";import"./Tooltip-fN76mi7p.js";import"./index.esm-4lUq-luv.js";import"./floating-ui.react-lz-2OKBz.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-f1K2561U.js";import"./motion-fv6P95QN.js";import"./index.esm-Cv3nUxWT.js";import"./index-LLoxKMRq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
