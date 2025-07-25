import{j as e}from"./index-CvzYHHyi.js";import{D as o}from"./DemoComponentApi-mXxAPZ-3.js";import{D as t}from"./DemoLayout-bFBRKV5K.js";import{S as r}from"./SyntaxHighlighter-vYeqY1Gw.js";import"./index-_6lqCWyf.js";import"./index.esm-iZHJToXl.js";import"./index-GYIUrbdE.js";import"./AdaptableCard-ME7InvBI.js";import"./Card-8kOVJnWG.js";import"./Views-IGpbAJRJ.js";import"./Affix-q2qfuq8j.js";import"./Button-RfidP847.js";import"./context-cQxpCbi0.js";import"./Tooltip-1BfvAuqv.js";import"./index.esm-ziONltnY.js";import"./floating-ui.react-g07vzxpC.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-w_0co_RM.js";import"./motion-s0hQdqSS.js";import"./index.esm-M47S76Wd.js";import"./index-sLTrG-jb.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
