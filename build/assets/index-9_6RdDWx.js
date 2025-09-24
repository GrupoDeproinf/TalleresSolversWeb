import{j as e}from"./index-15sR2hcI.js";import{D as o}from"./DemoComponentApi-eqPc_NgO.js";import{D as t}from"./DemoLayout-cXVmXjXk.js";import{S as r}from"./SyntaxHighlighter-zwDPWW1e.js";import"./index-_AoI4hSc.js";import"./index.esm-NmTktVeB.js";import"./index-1XJReBnJ.js";import"./AdaptableCard-mtbjqd0n.js";import"./Card-Zg6jSWKE.js";import"./Views-dlAO8rPI.js";import"./Affix-wDCEcnYH.js";import"./Button-8f3-31O1.js";import"./context-3jl7jrYD.js";import"./Tooltip-JETBhhx_.js";import"./index.esm-yJD-bGj6.js";import"./floating-ui.react-AHIwqOdP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-og_L5k7n.js";import"./motion-JCtWUOno.js";import"./index.esm-7YOjLpfE.js";import"./index-dpskanKY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
