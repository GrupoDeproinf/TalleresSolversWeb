import{j as t}from"./index-1D3tZeRU.js";import{D as e}from"./DemoComponentApi-IiIr2ov9.js";import{D as o}from"./DemoLayout-9pcZBe_s.js";import{S as r}from"./SyntaxHighlighter-7ip3ydM7.js";import"./index-f0TC0RtX.js";import"./index.esm-1cw5D7XZ.js";import"./index-knWPyce5.js";import"./AdaptableCard-dp133X_9.js";import"./Card-m-8KTUb6.js";import"./Views-x404Dbvu.js";import"./Affix-y9PDXxYB.js";import"./Button-zoy55Mik.js";import"./context-pBL3AZft.js";import"./Tooltip-1iIiS6ws.js";import"./index.esm-wjn4G6Uw.js";import"./floating-ui.react-ppsVtD3w.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yjap_eDU.js";import"./motion-gAf0GThQ.js";import"./index.esm-a23T_XkR.js";import"./index-lwFb3tge.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
