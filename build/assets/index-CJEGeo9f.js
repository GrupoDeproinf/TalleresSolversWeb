import{j as t}from"./index-ATNefdVG.js";import{D as e}from"./DemoComponentApi-FyrH3ksG.js";import{D as o}from"./DemoLayout-6SVNet_Y.js";import{S as r}from"./SyntaxHighlighter-kInNipeJ.js";import"./index-1QBWWPtH.js";import"./index.esm-SLyUBwzt.js";import"./index-kSWsxBAA.js";import"./AdaptableCard-T7K6WEWc.js";import"./Card-OSPH2pm3.js";import"./Views-oxXEUsSY.js";import"./Affix-AZxOkwtW.js";import"./Button-m8cr7QK0.js";import"./context-GUUKwgTl.js";import"./Tooltip-RPBixJuV.js";import"./index.esm-6sKRXwnY.js";import"./floating-ui.react-6woUHVe8.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-LDVYzlxf.js";import"./motion-qY3QHwHT.js";import"./index.esm-RzyebFAI.js";import"./index-D5lh9mO-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
