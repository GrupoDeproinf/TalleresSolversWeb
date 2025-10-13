import{j as t}from"./index-14Zf3KpF.js";import{D as e}from"./DemoComponentApi-FLoZvF1h.js";import{D as o}from"./DemoLayout-HUSL1GCr.js";import{S as r}from"./SyntaxHighlighter-EGtpdf6p.js";import"./index-3BObJsDJ.js";import"./index.esm-tlmx5QOY.js";import"./index-M-3nUjXp.js";import"./AdaptableCard-bZc8g127.js";import"./Card-OFJMqrf6.js";import"./Views-rz_27Y7n.js";import"./Affix-SMQ9nWa8.js";import"./Button-lbg_hS91.js";import"./context-NuRkSskr.js";import"./Tooltip-PxOiAuea.js";import"./index.esm-cOK3YiHr.js";import"./floating-ui.react-rqxm2o5S.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xjj2bTFj.js";import"./motion-pKXwz-yX.js";import"./index.esm-2Nj3n_IK.js";import"./index-TgIVsgqN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
