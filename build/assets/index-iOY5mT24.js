import{j as t}from"./index-xKsZ8l35.js";import{D as e}from"./DemoComponentApi-o8o4WmSh.js";import{D as o}from"./DemoLayout-njDmAs9i.js";import{S as r}from"./SyntaxHighlighter-_vqI2C9f.js";import"./index-ghUfQZjr.js";import"./index.esm-quO7oBH8.js";import"./index-FhQ8XXVG.js";import"./AdaptableCard-wYzy3Bvj.js";import"./Card-RMw-H-zQ.js";import"./Views-wIC69dCb.js";import"./Affix-uE8COQxo.js";import"./Button-YxCM68tE.js";import"./context-6_7T_3zC.js";import"./Tooltip-NDwm1HBW.js";import"./index.esm-ACeyYci_.js";import"./floating-ui.react-tuQVGGNH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-btnPQ0wi.js";import"./motion-jlOC7Xzp.js";import"./index.esm-HJEJ8FEu.js";import"./index-SZK8lSYa.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
