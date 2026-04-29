import{j as e}from"./index-RDDe908i.js";import{D as o}from"./DemoComponentApi-CC4vqr19.js";import{D as t}from"./DemoLayout-q-LCpUjW.js";import{S as r}from"./SyntaxHighlighter-T4RSsC4X.js";import"./index-Ivev60oI.js";import"./index.esm-YSr41lmP.js";import"./index-ZRJcUYgW.js";import"./AdaptableCard-_VktLZN6.js";import"./Card-Wjlc57eb.js";import"./Views-_S6tvCA_.js";import"./Affix-9zPjzUAa.js";import"./Button-oeuNGS_m.js";import"./context-rz-mNfuA.js";import"./Tooltip-rAL5X6_d.js";import"./index.esm-HfEv24iA.js";import"./floating-ui.react-kejQHkkD.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5S2u-SAR.js";import"./motion-0YBgrXpo.js";import"./index.esm-9AngbOLC.js";import"./index-YMfttKH7.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
