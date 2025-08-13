import{j as e}from"./index-iN9gC56E.js";import{D as r}from"./DemoComponentApi-YNNE7SSu.js";import{D as o}from"./DemoLayout-pGXJk8d_.js";import{S as t}from"./SyntaxHighlighter-pjHzf9-c.js";import"./index-r5HDIMlV.js";import"./index.esm-PsQ9NYiK.js";import"./index-299YhDr4.js";import"./AdaptableCard-juPQJRD8.js";import"./Card-UeUwmQGm.js";import"./Views-fqLBZTLn.js";import"./Affix-B8QzwV1Y.js";import"./Button-GMmR06Qd.js";import"./context-sXqbsmVT.js";import"./Tooltip-LTk8tIBU.js";import"./index.esm-qnYcV-k-.js";import"./floating-ui.react-238fQh4A.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-snVep3pU.js";import"./motion-VuSiHn-Z.js";import"./index.esm-G_R2Qahq.js";import"./index-q_0ZF6Cq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
