import{j as e}from"./index-xKsZ8l35.js";import{D as o}from"./DemoComponentApi-o8o4WmSh.js";import{D as t}from"./DemoLayout-njDmAs9i.js";import{S as r}from"./SyntaxHighlighter-_vqI2C9f.js";import"./index-ghUfQZjr.js";import"./index.esm-quO7oBH8.js";import"./index-FhQ8XXVG.js";import"./AdaptableCard-wYzy3Bvj.js";import"./Card-RMw-H-zQ.js";import"./Views-wIC69dCb.js";import"./Affix-uE8COQxo.js";import"./Button-YxCM68tE.js";import"./context-6_7T_3zC.js";import"./Tooltip-NDwm1HBW.js";import"./index.esm-ACeyYci_.js";import"./floating-ui.react-tuQVGGNH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-btnPQ0wi.js";import"./motion-jlOC7Xzp.js";import"./index.esm-HJEJ8FEu.js";import"./index-SZK8lSYa.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
