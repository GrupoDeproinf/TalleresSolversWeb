import{j as t}from"./index-JmHojjZF.js";import{D as e}from"./DemoComponentApi-GreJxXga.js";import{D as o}from"./DemoLayout-IAr37rdY.js";import{S as r}from"./SyntaxHighlighter-KEuVydnx.js";import"./index-ToqI7_Kp.js";import"./index.esm-kXaIV95b.js";import"./index-rEOp-HW-.js";import"./AdaptableCard-JGgv_ev8.js";import"./Card-IB018HxE.js";import"./Views-B7Axq-_H.js";import"./Affix-YceNC3yo.js";import"./Button-_U4vs34L.js";import"./context-sAlwGZHP.js";import"./Tooltip-2fc0Xghq.js";import"./index.esm-_q6RAcWH.js";import"./floating-ui.react-dnDtoXGa.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-BVb65nFb.js";import"./motion-d-XTyztW.js";import"./index.esm-fDGSM_mt.js";import"./index-phIxZ0Yy.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
