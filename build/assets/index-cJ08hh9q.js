import{j as e}from"./index-D1MrS5xY.js";import{D as o}from"./DemoComponentApi-LOh212rE.js";import{D as t}from"./DemoLayout-H9Sqp6iu.js";import{S as r}from"./SyntaxHighlighter-4OjnlPcL.js";import"./index-MbLzU_Cs.js";import"./index.esm-T7MKHyVP.js";import"./index-sva1Rkyn.js";import"./AdaptableCard-PMlzgRML.js";import"./Card-8EgQUYhF.js";import"./Views-7KIxFcen.js";import"./Affix-ego_VAt5.js";import"./Button-a7ssyZMC.js";import"./context-tQTS5G38.js";import"./Tooltip-o3UBWBxC.js";import"./index.esm-9IgJ_EbT.js";import"./floating-ui.react-0MFFUaCH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-DglP9m2U.js";import"./motion-l3eyuBh1.js";import"./index.esm-p6Elkq3m.js";import"./index-5bgjMnor.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useDarkMode from '@/utils/hooks/useDarkMode'

const Component = () => {

	const [isDark, setIsDark] = useDarkMode()

	const handleSetDarkMode = (bool) => {
		setIsDark(bool ? 'dark' : 'light')
	}
	return (...)
}
`}),m="UseDarkModeDoc",a={title:"useDarkMode",desc:"This hook helps to handles dark or light mode on the app."},s=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:e.jsx(i,{})}],p=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"isDark",type:"<code>boolean</code>",default:"-",desc:"Whether the current mode is dark mode"},{propName:"setIsDark",type:"<code>(mode: 'dark' | 'light') => void</code>",default:"-",desc:"Mode setter"}]}]}),F=()=>e.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:s,mdPrefixPath:"utils",extra:p,keyText:"param"});export{F as default};
