import{j as t}from"./index-h29nTG28.js";import{D as e}from"./DemoComponentApi-JzgMicK7.js";import{D as o}from"./DemoLayout-0Ok-VggY.js";import{S as r}from"./SyntaxHighlighter-C9Z-bFi9.js";import"./index-Qb2Rt7uY.js";import"./index.esm-x7L3bfOO.js";import"./index-51qiMPj3.js";import"./AdaptableCard-dq8zB7JO.js";import"./Card-72Kz4ZZm.js";import"./Views-tqoNXJJS.js";import"./Affix-wKRAzpUv.js";import"./Button-HN7QplVb.js";import"./context-lu_ZoR82.js";import"./Tooltip-keULPPQ7.js";import"./index.esm-WckmvPV8.js";import"./floating-ui.react-QHdoWf14.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Xq95uh32.js";import"./motion-2BfmWMAc.js";import"./index.esm-AU-9eZ_S.js";import"./index-hHSJtmdP.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
