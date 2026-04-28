import{j as e}from"./index-i5tZ9w0B.js";import{D as r}from"./DemoComponentApi-rFBrqraD.js";import{D as o}from"./DemoLayout--Uafjtvq.js";import{S as t}from"./SyntaxHighlighter-iisvH-O-.js";import"./index-In-3-usT.js";import"./index.esm-guJzrdD4.js";import"./index-JhteycRy.js";import"./AdaptableCard-qt538AVw.js";import"./Card-CwDS1Zw_.js";import"./Views-z8YYLW5b.js";import"./Affix-hwB1EW7o.js";import"./Button-k0QukaHj.js";import"./context-pREfq64o.js";import"./Tooltip-WqVpHr9d.js";import"./index.esm-qLdEDK2o.js";import"./floating-ui.react--XNwJF6E.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-XXrxu93K.js";import"./motion-UFI8jCfv.js";import"./index.esm-mCRUBiHB.js";import"./index-A1rv4gFB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
