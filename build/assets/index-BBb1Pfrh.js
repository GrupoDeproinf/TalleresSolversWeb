import{j as t}from"./index-52EgRySw.js";import{D as e}from"./DemoComponentApi-sIr3aP9t.js";import{D as o}from"./DemoLayout-49kyRumc.js";import{S as r}from"./SyntaxHighlighter-5yyrKh23.js";import"./index-iCLfkUHm.js";import"./index.esm-joVjrdv4.js";import"./index-tKVWlxOi.js";import"./AdaptableCard-8H-flceS.js";import"./Card-YX4I-iPW.js";import"./Views-Ea6uyAyT.js";import"./Affix-muUDTULJ.js";import"./Button-k9SRSx0b.js";import"./context-GNh3KNAT.js";import"./Tooltip-jn3cme1x.js";import"./index.esm-XI3tC7yo.js";import"./floating-ui.react-DnKrBTw-.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VOrF6s14.js";import"./motion-4fqlWLTJ.js";import"./index.esm-l-LADNwI.js";import"./index-tM7rwq25.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
