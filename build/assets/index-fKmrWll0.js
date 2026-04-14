import{j as e}from"./index-_ApK-q7i.js";import{D as o}from"./DemoComponentApi-tUFP8iJb.js";import{D as t}from"./DemoLayout-bPRUQ1cH.js";import{S as r}from"./SyntaxHighlighter-lx8N5tTC.js";import"./index-RPzHcFNN.js";import"./index.esm-526PTSiR.js";import"./index-ahp1cX6b.js";import"./AdaptableCard-ZvtbZBXx.js";import"./Card-ajus7HF1.js";import"./Views-TMbN6l_1.js";import"./Affix-B300VCNH.js";import"./Button-7wssbTrW.js";import"./context-c9HS1Vrm.js";import"./Tooltip-Ltwlgd3h.js";import"./index.esm-rAmnvJSt.js";import"./floating-ui.react-jYRpeG6P.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-wOxl9PUs.js";import"./motion-fHOwczjb.js";import"./index.esm-QmnQh55S.js";import"./index-4Cbk6KGY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
