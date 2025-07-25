import{j as e}from"./index-BDN-NirA.js";import{D as o}from"./DemoComponentApi-6mNcbgK2.js";import{D as t}from"./DemoLayout-mltW-eVK.js";import{S as r}from"./SyntaxHighlighter-WnFaBBqv.js";import"./index-QBN3JdOA.js";import"./index.esm-WGOkTBh9.js";import"./index-M60gcwBn.js";import"./AdaptableCard-GQtji-vL.js";import"./Card-ru8SSgle.js";import"./Views-D5n2Trj8.js";import"./Affix-amj0xHVW.js";import"./Button-6-9C-O8H.js";import"./context--qCY6-De.js";import"./Tooltip-poJdwxB8.js";import"./index.esm-GiNzBMsC.js";import"./floating-ui.react-REDD7Bey.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-nkwvr9YC.js";import"./motion-XTxZ_YMB.js";import"./index.esm-JVWMqiQz.js";import"./index-DuFQRDnk.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
