import{j as t}from"./index-ObPtJ5w-.js";import{D as e}from"./DemoComponentApi-LQeNVhyV.js";import{D as o}from"./DemoLayout-R64NsCKc.js";import{S as r}from"./SyntaxHighlighter-8CPog4j7.js";import"./index-qux3biZ9.js";import"./index.esm-XBjgx9Fs.js";import"./index-EMwAswi2.js";import"./AdaptableCard-40aX91j5.js";import"./Card-MCAhbk3s.js";import"./Views-SgYqjPyv.js";import"./Affix-B17nTta9.js";import"./Button-vm4fJ4W7.js";import"./context-lkTBNAwK.js";import"./Tooltip-uwez-WWL.js";import"./index.esm-7WEKSPY1.js";import"./floating-ui.react-RMGTWhlp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-SwJB8P6d.js";import"./motion-F2ImUn0a.js";import"./index.esm-AfzvVFOM.js";import"./index-zpjpykeE.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
