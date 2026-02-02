import{j as e}from"./index-JmHojjZF.js";import{D as o}from"./DemoComponentApi-GreJxXga.js";import{D as t}from"./DemoLayout-IAr37rdY.js";import{S as r}from"./SyntaxHighlighter-KEuVydnx.js";import"./index-ToqI7_Kp.js";import"./index.esm-kXaIV95b.js";import"./index-rEOp-HW-.js";import"./AdaptableCard-JGgv_ev8.js";import"./Card-IB018HxE.js";import"./Views-B7Axq-_H.js";import"./Affix-YceNC3yo.js";import"./Button-_U4vs34L.js";import"./context-sAlwGZHP.js";import"./Tooltip-2fc0Xghq.js";import"./index.esm-_q6RAcWH.js";import"./floating-ui.react-dnDtoXGa.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-BVb65nFb.js";import"./motion-d-XTyztW.js";import"./index.esm-fDGSM_mt.js";import"./index-phIxZ0Yy.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
