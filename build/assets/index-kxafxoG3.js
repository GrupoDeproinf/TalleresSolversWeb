import{j as e}from"./index-3IkpMvhw.js";import{D as r}from"./DemoComponentApi-cmJBvF2N.js";import{D as o}from"./DemoLayout-2qTRSusM.js";import{S as t}from"./SyntaxHighlighter-p_uAj12i.js";import"./index-lcKbu1WV.js";import"./index.esm-_rP08CZJ.js";import"./index-LzwFMNRR.js";import"./AdaptableCard-LoSVFvKm.js";import"./Card-Kmp1JZ8K.js";import"./Views-vkZwXWEA.js";import"./Affix-gjUM4zB5.js";import"./Button-uUgD1Isd.js";import"./context-_KlN2uti.js";import"./Tooltip-pBZGkNEN.js";import"./index.esm-HcdvCICo.js";import"./floating-ui.react-rtxm9hsq.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Qx-8tb_L.js";import"./motion-Ho6XhLxy.js";import"./index.esm-O3ADo3W0.js";import"./index-s_O6YLS3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
