import{j as e}from"./index-1D3tZeRU.js";import{D as o}from"./DemoComponentApi-IiIr2ov9.js";import{D as t}from"./DemoLayout-9pcZBe_s.js";import{S as r}from"./SyntaxHighlighter-7ip3ydM7.js";import"./index-f0TC0RtX.js";import"./index.esm-1cw5D7XZ.js";import"./index-knWPyce5.js";import"./AdaptableCard-dp133X_9.js";import"./Card-m-8KTUb6.js";import"./Views-x404Dbvu.js";import"./Affix-y9PDXxYB.js";import"./Button-zoy55Mik.js";import"./context-pBL3AZft.js";import"./Tooltip-1iIiS6ws.js";import"./index.esm-wjn4G6Uw.js";import"./floating-ui.react-ppsVtD3w.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yjap_eDU.js";import"./motion-gAf0GThQ.js";import"./index.esm-a23T_XkR.js";import"./index-lwFb3tge.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
