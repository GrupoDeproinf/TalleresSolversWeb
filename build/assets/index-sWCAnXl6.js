import{j as e}from"./index-0JW14Cl4.js";import{D as r}from"./DemoComponentApi-LpKabwDF.js";import{D as o}from"./DemoLayout-HouaRUoM.js";import{S as t}from"./SyntaxHighlighter-5ovYX9h5.js";import"./index-a8YK1BSZ.js";import"./index.esm-WNi23VL7.js";import"./index-QMiMCL-O.js";import"./AdaptableCard-zj0A6V2V.js";import"./Card-TuPZ2v2_.js";import"./Views-ArJd3jpj.js";import"./Affix-OBrB1uSN.js";import"./Button-D58LGLsw.js";import"./context-AxDKAhEU.js";import"./Tooltip-7ixFulgX.js";import"./index.esm-kYnGXkxy.js";import"./floating-ui.react-wwZWrrrF.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VwLHg0MV.js";import"./motion-AtCGOUgk.js";import"./index.esm-YV82YYEg.js";import"./index-Jck-JtMN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
