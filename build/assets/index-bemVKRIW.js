import{j as t}from"./index-RDDe908i.js";import{D as e}from"./DemoComponentApi-CC4vqr19.js";import{D as o}from"./DemoLayout-q-LCpUjW.js";import{S as r}from"./SyntaxHighlighter-T4RSsC4X.js";import"./index-Ivev60oI.js";import"./index.esm-YSr41lmP.js";import"./index-ZRJcUYgW.js";import"./AdaptableCard-_VktLZN6.js";import"./Card-Wjlc57eb.js";import"./Views-_S6tvCA_.js";import"./Affix-9zPjzUAa.js";import"./Button-oeuNGS_m.js";import"./context-rz-mNfuA.js";import"./Tooltip-rAL5X6_d.js";import"./index.esm-HfEv24iA.js";import"./floating-ui.react-kejQHkkD.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5S2u-SAR.js";import"./motion-0YBgrXpo.js";import"./index.esm-9AngbOLC.js";import"./index-YMfttKH7.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
