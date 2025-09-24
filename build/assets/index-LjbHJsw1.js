import{j as t}from"./index-D1MrS5xY.js";import{D as e}from"./DemoComponentApi-LOh212rE.js";import{D as o}from"./DemoLayout-H9Sqp6iu.js";import{S as r}from"./SyntaxHighlighter-4OjnlPcL.js";import"./index-MbLzU_Cs.js";import"./index.esm-T7MKHyVP.js";import"./index-sva1Rkyn.js";import"./AdaptableCard-PMlzgRML.js";import"./Card-8EgQUYhF.js";import"./Views-7KIxFcen.js";import"./Affix-ego_VAt5.js";import"./Button-a7ssyZMC.js";import"./context-tQTS5G38.js";import"./Tooltip-o3UBWBxC.js";import"./index.esm-9IgJ_EbT.js";import"./floating-ui.react-0MFFUaCH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-DglP9m2U.js";import"./motion-l3eyuBh1.js";import"./index.esm-p6Elkq3m.js";import"./index-5bgjMnor.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
