import{j as e}from"./index-539wkWb6.js";import{D as o}from"./DemoComponentApi-zVNeRGbL.js";import{D as t}from"./DemoLayout-YuP4ggXL.js";import{S as r}from"./SyntaxHighlighter-QnkWZTle.js";import"./index-vfq4_N5K.js";import"./index.esm-SfcosvjZ.js";import"./index-vEkyP9jl.js";import"./AdaptableCard-bbKlZ80X.js";import"./Card-3d2Ny-JF.js";import"./Views-NOUPq-xv.js";import"./Affix-QbeMlExd.js";import"./Button-lbbOHDaq.js";import"./context-GzcGESCG.js";import"./Tooltip-fVR4Pvc0.js";import"./index.esm-0CsLKNQK.js";import"./floating-ui.react-n50WnHyP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Z9EcYsrp.js";import"./motion-Orz9ojqj.js";import"./index.esm-OL94PTg3.js";import"./index-1cVp-vaj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
