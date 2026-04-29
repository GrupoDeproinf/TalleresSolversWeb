import{j as e}from"./index-RDDe908i.js";import{D as r}from"./DemoComponentApi-CC4vqr19.js";import{D as o}from"./DemoLayout-q-LCpUjW.js";import{S as t}from"./SyntaxHighlighter-T4RSsC4X.js";import"./index-Ivev60oI.js";import"./index.esm-YSr41lmP.js";import"./index-ZRJcUYgW.js";import"./AdaptableCard-_VktLZN6.js";import"./Card-Wjlc57eb.js";import"./Views-_S6tvCA_.js";import"./Affix-9zPjzUAa.js";import"./Button-oeuNGS_m.js";import"./context-rz-mNfuA.js";import"./Tooltip-rAL5X6_d.js";import"./index.esm-HfEv24iA.js";import"./floating-ui.react-kejQHkkD.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5S2u-SAR.js";import"./motion-0YBgrXpo.js";import"./index.esm-9AngbOLC.js";import"./index-YMfttKH7.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
