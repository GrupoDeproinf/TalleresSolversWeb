import{j as t}from"./index-sxY2vR_b.js";import{D as e}from"./DemoComponentApi-597voAgO.js";import{D as o}from"./DemoLayout-evFXGnBx.js";import{S as r}from"./SyntaxHighlighter-cbRe9zU-.js";import"./index-AN3niVhH.js";import"./index.esm-7rMJeW_p.js";import"./index-XOOicjk1.js";import"./AdaptableCard-oIjzq9rA.js";import"./Card-3z76uwgw.js";import"./Views-YxvfAhNX.js";import"./Affix-LcdOe-fz.js";import"./Button-gHfU8a9b.js";import"./context-ugtK0z0w.js";import"./Tooltip-tOnNgS6K.js";import"./index.esm-lAhGiBpp.js";import"./floating-ui.react-xh7t2hCc.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-beo0AS2x.js";import"./motion-h-3axnRn.js";import"./index.esm-cN1LGhJ4.js";import"./index-t_CREONj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>t.jsx(r,{language:"js",children:`import useDirection from '@/utils/hooks/useDirection'

const Component = () => {

	const [direction, updateDirection] = useDirection()

	const handleDirChange = () => {
		updateDirection('rtl')
	}

	return (...)
}
`}),p="UseDirectionDoc/",m={title:"useDirection",desc:"This hook helps to handles direction state of the app."},n=[{mdName:"Example",mdPath:p,title:"Example",desc:"",component:t.jsx(i,{})}],s=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"direction",type:"<code>'ltr'</code> | <code>'rtl'</code>",default:"-",desc:"Current direction state"},{propName:"updateDirection",type:"<code>(direction: 'ltr' | 'rtl') => void</code>",default:"-",desc:"Direction setter"}]}]}),v=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{v as default};
