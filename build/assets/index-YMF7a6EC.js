import{j as e}from"./index-9t5KOHno.js";import{D as o}from"./DemoComponentApi-N41dBEGc.js";import{D as t}from"./DemoLayout-iwCSgSdG.js";import{S as r}from"./SyntaxHighlighter-dGysNVJv.js";import"./index-n0YNfJf4.js";import"./index.esm-mNZVPVzQ.js";import"./index-81440SWT.js";import"./AdaptableCard-AQPFOlT9.js";import"./Card-12GHa1Eq.js";import"./Views-UsKkkDUh.js";import"./Affix-1YOWKSSd.js";import"./Button-dbQf2eah.js";import"./context-bikMt5Q-.js";import"./Tooltip-RAyjLDPF.js";import"./index.esm-wUG74Yhm.js";import"./floating-ui.react-px5GD9H_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-1m9E763O.js";import"./motion-tHAU1tWQ.js";import"./index.esm-NU0RhjYe.js";import"./index-Ph93yIGB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
