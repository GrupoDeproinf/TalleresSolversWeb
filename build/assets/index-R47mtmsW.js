import{j as e}from"./index-_feUBWkF.js";import{D as r}from"./DemoComponentApi-QXiYjNvd.js";import{D as o}from"./DemoLayout-19EPW6T8.js";import{S as t}from"./SyntaxHighlighter-RGzVEGmi.js";import"./index--K6mHtPM.js";import"./index.esm-c6ShvaQW.js";import"./index-lvdI60UC.js";import"./AdaptableCard-CKf0cL3z.js";import"./Card-fXn1hgP9.js";import"./Views-NoPs0swz.js";import"./Affix-3HLokM4n.js";import"./Button-jcq0xEfh.js";import"./context-w88CtZWU.js";import"./Tooltip-tqY3hXOR.js";import"./index.esm-bIknb-8m.js";import"./floating-ui.react-AOig1bqs.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-C1ft9MxP.js";import"./motion-2zhnpuIh.js";import"./index.esm-CyL_iEBq.js";import"./index-Xr0iHSGr.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
