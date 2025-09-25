import{j as e}from"./index-KQFNJtc4.js";import{D as o}from"./DemoComponentApi--IKrKf-H.js";import{D as t}from"./DemoLayout-5i8Fn9l7.js";import{S as r}from"./SyntaxHighlighter-8DMt-r7j.js";import"./index-HK5HFBCm.js";import"./index.esm-ern5TROG.js";import"./index-VXFiPzRQ.js";import"./AdaptableCard-KBCkay_F.js";import"./Card-xLnaagij.js";import"./Views-aA243lDZ.js";import"./Affix-pYALYg0Y.js";import"./Button--D0tRVmb.js";import"./context-U4uJiOlk.js";import"./Tooltip-rFfMZWAg.js";import"./index.esm-ODZ_1Gk0.js";import"./floating-ui.react-gVU2UEvr.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xIA8Eb8D.js";import"./motion-4MnqOKZu.js";import"./index.esm-jb16UrWF.js";import"./index-lFfMMwZ5.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
