import{j as e}from"./index-sxY2vR_b.js";import{D as o}from"./DemoComponentApi-597voAgO.js";import{D as t}from"./DemoLayout-evFXGnBx.js";import{S as r}from"./SyntaxHighlighter-cbRe9zU-.js";import"./index-AN3niVhH.js";import"./index.esm-7rMJeW_p.js";import"./index-XOOicjk1.js";import"./AdaptableCard-oIjzq9rA.js";import"./Card-3z76uwgw.js";import"./Views-YxvfAhNX.js";import"./Affix-LcdOe-fz.js";import"./Button-gHfU8a9b.js";import"./context-ugtK0z0w.js";import"./Tooltip-tOnNgS6K.js";import"./index.esm-lAhGiBpp.js";import"./floating-ui.react-xh7t2hCc.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-beo0AS2x.js";import"./motion-h-3axnRn.js";import"./index.esm-cN1LGhJ4.js";import"./index-t_CREONj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
