import{j as e}from"./index-ABjXZzKD.js";import{D as o}from"./DemoComponentApi-C2YupdIe.js";import{D as t}from"./DemoLayout-zIqale2t.js";import{S as r}from"./SyntaxHighlighter-KAsxxSPo.js";import"./index-hoI5MYke.js";import"./index.esm-G4kMKpK9.js";import"./index-Laf2x-F-.js";import"./AdaptableCard-Guhgo30g.js";import"./Card-2Fe-_J3l.js";import"./Views-8W_pghrR.js";import"./Affix--cJn1oF2.js";import"./Button-PrF4gPDj.js";import"./context-q1VEwzUH.js";import"./Tooltip-ZcEA5Guw.js";import"./index.esm-X-60aNOT.js";import"./floating-ui.react-kp5fCW25.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-bFNXb1qC.js";import"./motion-LTaSieXW.js";import"./index.esm-eoTp6Zo3.js";import"./index-g0vaglUp.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
