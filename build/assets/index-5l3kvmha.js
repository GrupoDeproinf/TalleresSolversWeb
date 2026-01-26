import{j as e}from"./index-h29nTG28.js";import{D as o}from"./DemoComponentApi-JzgMicK7.js";import{D as t}from"./DemoLayout-0Ok-VggY.js";import{S as r}from"./SyntaxHighlighter-C9Z-bFi9.js";import"./index-Qb2Rt7uY.js";import"./index.esm-x7L3bfOO.js";import"./index-51qiMPj3.js";import"./AdaptableCard-dq8zB7JO.js";import"./Card-72Kz4ZZm.js";import"./Views-tqoNXJJS.js";import"./Affix-wKRAzpUv.js";import"./Button-HN7QplVb.js";import"./context-lu_ZoR82.js";import"./Tooltip-keULPPQ7.js";import"./index.esm-WckmvPV8.js";import"./floating-ui.react-QHdoWf14.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Xq95uh32.js";import"./motion-2BfmWMAc.js";import"./index.esm-AU-9eZ_S.js";import"./index-hHSJtmdP.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
