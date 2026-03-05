import{j as t}from"./index-sqlzVTU6.js";import{D as e}from"./DemoComponentApi-WXpsOjn1.js";import{D as o}from"./DemoLayout-8mWBD9jQ.js";import{S as r}from"./SyntaxHighlighter-6acm_iIo.js";import"./index-cxHa2H3b.js";import"./index.esm-xcFhNsFj.js";import"./index-qJSJzGnC.js";import"./AdaptableCard-V0uxNSVw.js";import"./Card-nwu__Oi2.js";import"./Views-Xk2ztg4z.js";import"./Affix-ajaj60ys.js";import"./Button-UK-D34UO.js";import"./context-uUBq0g4n.js";import"./Tooltip-JKptW_vN.js";import"./index.esm-OyomaAaz.js";import"./floating-ui.react-VoN_T7V2.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-lbxTp4dY.js";import"./motion-u71o8l8w.js";import"./index.esm-vkxxgfhU.js";import"./index-BGgBYGq3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
