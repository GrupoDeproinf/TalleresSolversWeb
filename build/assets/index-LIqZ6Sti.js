import{j as e}from"./index-nE3qTmWJ.js";import{D as r}from"./DemoComponentApi-r_buyWw0.js";import{D as o}from"./DemoLayout-48Zmaz0q.js";import{S as t}from"./SyntaxHighlighter-WRXrPh9V.js";import"./index-qkYNi1s2.js";import"./index.esm-rJIJC5Wo.js";import"./index-D9LAS3yO.js";import"./AdaptableCard-IXAk-fG1.js";import"./Card-ofYhqojB.js";import"./Views-Wr9UmLiy.js";import"./Affix-Ng5hiQvt.js";import"./Button-mNwEcSfR.js";import"./context-aC9vqP51.js";import"./Tooltip-f_oot8L9.js";import"./index.esm-sCMYjrHG.js";import"./floating-ui.react-Yyq8XGry.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-FIhXA5AV.js";import"./motion-DI-APurt.js";import"./index.esm-JhChuggt.js";import"./index-RII3KDWx.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
