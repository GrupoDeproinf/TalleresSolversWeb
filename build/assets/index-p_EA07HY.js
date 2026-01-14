import{j as e}from"./index-0JW14Cl4.js";import{D as o}from"./DemoComponentApi-LpKabwDF.js";import{D as t}from"./DemoLayout-HouaRUoM.js";import{S as r}from"./SyntaxHighlighter-5ovYX9h5.js";import"./index-a8YK1BSZ.js";import"./index.esm-WNi23VL7.js";import"./index-QMiMCL-O.js";import"./AdaptableCard-zj0A6V2V.js";import"./Card-TuPZ2v2_.js";import"./Views-ArJd3jpj.js";import"./Affix-OBrB1uSN.js";import"./Button-D58LGLsw.js";import"./context-AxDKAhEU.js";import"./Tooltip-7ixFulgX.js";import"./index.esm-kYnGXkxy.js";import"./floating-ui.react-wwZWrrrF.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VwLHg0MV.js";import"./motion-AtCGOUgk.js";import"./index.esm-YV82YYEg.js";import"./index-Jck-JtMN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
