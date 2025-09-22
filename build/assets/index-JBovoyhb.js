import{j as t}from"./index-zN_cMCXj.js";import{D as e}from"./DemoComponentApi-3rUe8QU-.js";import{D as o}from"./DemoLayout-zgtRGiUG.js";import{S as r}from"./SyntaxHighlighter-wq9tsgxf.js";import"./index-8X2bHxJW.js";import"./index.esm-bWNlESX5.js";import"./index-JLBgVWbO.js";import"./AdaptableCard-Z9nht5s7.js";import"./Card-q0IeE3mQ.js";import"./Views-zD_Q7SBY.js";import"./Affix-eBh0j_EU.js";import"./Button-3FDHFgBt.js";import"./context-4K_It7vM.js";import"./Tooltip-TmV83Zem.js";import"./index.esm-qF4ozkmo.js";import"./floating-ui.react-NPg6DBrp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-e95nRWq5.js";import"./motion-TPlYCOYk.js";import"./index.esm-Wztopsom.js";import"./index-Aw7A1Eb2.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
