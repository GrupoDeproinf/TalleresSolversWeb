import{j as e}from"./index-50rgKX9S.js";import{D as o}from"./DemoComponentApi-9CHMera2.js";import{D as t}from"./DemoLayout-SY0wuGyv.js";import{S as r}from"./SyntaxHighlighter-oOJMta1t.js";import"./index-X3G8Yg8B.js";import"./index.esm-BzTP7NzC.js";import"./index-5fWUxSe9.js";import"./AdaptableCard-LFMvjwtD.js";import"./Card-vqKpG-UA.js";import"./Views-A7x8nqpb.js";import"./Affix-LE9nnfuO.js";import"./Button-xRLYDkxn.js";import"./context-S2-woICp.js";import"./Tooltip-GIYbDsiP.js";import"./index.esm-opZQsgq7.js";import"./floating-ui.react-bRmrURkd.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-oREErx12.js";import"./motion-QExVqk61.js";import"./index.esm-CTp4r0U4.js";import"./index-q4uYtSHq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
