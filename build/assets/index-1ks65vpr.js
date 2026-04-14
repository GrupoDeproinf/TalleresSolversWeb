import{j as e}from"./index-_ApK-q7i.js";import{D as r}from"./DemoComponentApi-tUFP8iJb.js";import{D as o}from"./DemoLayout-bPRUQ1cH.js";import{S as t}from"./SyntaxHighlighter-lx8N5tTC.js";import"./index-RPzHcFNN.js";import"./index.esm-526PTSiR.js";import"./index-ahp1cX6b.js";import"./AdaptableCard-ZvtbZBXx.js";import"./Card-ajus7HF1.js";import"./Views-TMbN6l_1.js";import"./Affix-B300VCNH.js";import"./Button-7wssbTrW.js";import"./context-c9HS1Vrm.js";import"./Tooltip-Ltwlgd3h.js";import"./index.esm-rAmnvJSt.js";import"./floating-ui.react-jYRpeG6P.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-wOxl9PUs.js";import"./motion-fHOwczjb.js";import"./index.esm-QmnQh55S.js";import"./index-4Cbk6KGY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
