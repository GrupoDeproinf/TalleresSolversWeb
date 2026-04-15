import{j as t}from"./index-ZuNEmVVx.js";import{D as e}from"./DemoComponentApi-sx-poHL7.js";import{D as o}from"./DemoLayout-ik6Z2SUb.js";import{S as r}from"./SyntaxHighlighter-KGCT-bYR.js";import"./index-uLtGwWpm.js";import"./index.esm-bBIQnT1a.js";import"./index-1EeQBmQG.js";import"./AdaptableCard-X95WZGfp.js";import"./Card-SNtW5iYw.js";import"./Views-NppcH7Yz.js";import"./Affix-Gsd9jZR2.js";import"./Button-q3uGp5Oh.js";import"./context-_rOU9DEt.js";import"./Tooltip-o4VLlIZb.js";import"./index.esm-eLbzTzcd.js";import"./floating-ui.react-sImFxmtW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5C2Pfpi6.js";import"./motion-G3vr1qIa.js";import"./index.esm-jRc9WQvP.js";import"./index-Jame8Dbd.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
