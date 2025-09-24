import{j as e}from"./index-iPBGd0jP.js";import{D as r}from"./DemoComponentApi-IWLNt3xg.js";import{D as o}from"./DemoLayout-7c9VNwm2.js";import{S as t}from"./SyntaxHighlighter-yU0WGUDl.js";import"./index-lupvUEqj.js";import"./index.esm-pDzRu5rN.js";import"./index-cwzhKvQG.js";import"./AdaptableCard-SuNPJiLp.js";import"./Card-any3pDMk.js";import"./Views-JmN_26On.js";import"./Affix-G-abYIfr.js";import"./Button-qbGHUbjU.js";import"./context-suePrQf5.js";import"./Tooltip-FcjdLHRu.js";import"./index.esm-WaLwlOAM.js";import"./floating-ui.react-gCkXl95_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7qxwMuxk.js";import"./motion-9yTXZEhO.js";import"./index.esm-xsyTc8bt.js";import"./index-Do6YuCsD.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
