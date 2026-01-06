import{j as e}from"./index-52EgRySw.js";import{D as o}from"./DemoComponentApi-sIr3aP9t.js";import{D as t}from"./DemoLayout-49kyRumc.js";import{S as r}from"./SyntaxHighlighter-5yyrKh23.js";import"./index-iCLfkUHm.js";import"./index.esm-joVjrdv4.js";import"./index-tKVWlxOi.js";import"./AdaptableCard-8H-flceS.js";import"./Card-YX4I-iPW.js";import"./Views-Ea6uyAyT.js";import"./Affix-muUDTULJ.js";import"./Button-k9SRSx0b.js";import"./context-GNh3KNAT.js";import"./Tooltip-jn3cme1x.js";import"./index.esm-XI3tC7yo.js";import"./floating-ui.react-DnKrBTw-.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VOrF6s14.js";import"./motion-4fqlWLTJ.js";import"./index.esm-l-LADNwI.js";import"./index-tM7rwq25.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
