import{j as e}from"./index-ATNefdVG.js";import{D as r}from"./DemoComponentApi-FyrH3ksG.js";import{D as o}from"./DemoLayout-6SVNet_Y.js";import{S as t}from"./SyntaxHighlighter-kInNipeJ.js";import"./index-1QBWWPtH.js";import"./index.esm-SLyUBwzt.js";import"./index-kSWsxBAA.js";import"./AdaptableCard-T7K6WEWc.js";import"./Card-OSPH2pm3.js";import"./Views-oxXEUsSY.js";import"./Affix-AZxOkwtW.js";import"./Button-m8cr7QK0.js";import"./context-GUUKwgTl.js";import"./Tooltip-RPBixJuV.js";import"./index.esm-6sKRXwnY.js";import"./floating-ui.react-6woUHVe8.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-LDVYzlxf.js";import"./motion-qY3QHwHT.js";import"./index.esm-RzyebFAI.js";import"./index-D5lh9mO-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
