import{j as e}from"./index-NU55aeHu.js";import{D as r}from"./DemoComponentApi-ynNcguOj.js";import{D as o}from"./DemoLayout-SKCs7yKV.js";import{S as t}from"./SyntaxHighlighter-UtZjHk7N.js";import"./index-jHWBY7SI.js";import"./index.esm-mzOnvTgK.js";import"./index-XSYrKGIZ.js";import"./AdaptableCard-WL1-grzV.js";import"./Card-KU4tupdi.js";import"./Views-_qocjLuO.js";import"./Affix-qOx501Mh.js";import"./Button-X4YAxjf9.js";import"./context-mxvrTZY-.js";import"./Tooltip-nmCs6-RN.js";import"./index.esm-VZHp9jz5.js";import"./floating-ui.react-3j2FiDTw.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Sf2OyPxD.js";import"./motion-qvTSg2GE.js";import"./index.esm-SEqrhXUV.js";import"./index-9tkI9CBH.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
