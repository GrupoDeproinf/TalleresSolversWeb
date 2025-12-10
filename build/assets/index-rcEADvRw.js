import{j as e}from"./index-N-1RluuA.js";import{D as o}from"./DemoComponentApi-x775CCjJ.js";import{D as t}from"./DemoLayout-ct69zWf6.js";import{S as r}from"./SyntaxHighlighter-O8JgOWdM.js";import"./index-kHevX6Xf.js";import"./index.esm--IdS3ikX.js";import"./index-F7dqYLcC.js";import"./AdaptableCard--kwp3Zb5.js";import"./Card-kRdnf6fx.js";import"./Views-jTGFnbRp.js";import"./Affix-tz3FBMPM.js";import"./Button-DL-xRWcd.js";import"./context-khs8ZuWg.js";import"./Tooltip-sewaCRiQ.js";import"./index.esm-Og_Wyf2u.js";import"./floating-ui.react-8ub5PJIZ.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-tC48GSbs.js";import"./motion-YE_afSFk.js";import"./index.esm-suDg3zH5.js";import"./index-yxOeA48F.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
