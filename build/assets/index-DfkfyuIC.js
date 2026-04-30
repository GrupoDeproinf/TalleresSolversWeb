import{j as t}from"./index-KnboTQIq.js";import{D as e}from"./DemoComponentApi-FKo7tNGw.js";import{D as o}from"./DemoLayout-saHBnoLJ.js";import{S as r}from"./SyntaxHighlighter-4yMiT8a9.js";import"./index-niGJkX_Y.js";import"./index.esm-NopCh8fs.js";import"./index-YwApo4nb.js";import"./AdaptableCard-_Kvk4qA9.js";import"./Card-ef-SYp7l.js";import"./Views-mE5zdYnK.js";import"./Affix-SxoWuek2.js";import"./Button-vkNvl7iW.js";import"./context-4hyaSNf_.js";import"./Tooltip-ZGOI2uxh.js";import"./index.esm-uLdRodHA.js";import"./floating-ui.react-78UvVOwk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7lhc11-b.js";import"./motion-eUZmQr1h.js";import"./index.esm-qDEWbWzU.js";import"./index-GZObyBO6.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
