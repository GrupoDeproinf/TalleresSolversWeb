import{j as e}from"./index-BDN-NirA.js";import{D as r}from"./DemoComponentApi-6mNcbgK2.js";import{D as o}from"./DemoLayout-mltW-eVK.js";import{S as t}from"./SyntaxHighlighter-WnFaBBqv.js";import"./index-QBN3JdOA.js";import"./index.esm-WGOkTBh9.js";import"./index-M60gcwBn.js";import"./AdaptableCard-GQtji-vL.js";import"./Card-ru8SSgle.js";import"./Views-D5n2Trj8.js";import"./Affix-amj0xHVW.js";import"./Button-6-9C-O8H.js";import"./context--qCY6-De.js";import"./Tooltip-poJdwxB8.js";import"./index.esm-GiNzBMsC.js";import"./floating-ui.react-REDD7Bey.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-nkwvr9YC.js";import"./motion-XTxZ_YMB.js";import"./index.esm-JVWMqiQz.js";import"./index-DuFQRDnk.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
