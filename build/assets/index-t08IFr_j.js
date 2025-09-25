import{j as e}from"./index-yOh4elUK.js";import{D as r}from"./DemoComponentApi-pKlVztF1.js";import{D as o}from"./DemoLayout-WZlUGBpO.js";import{S as t}from"./SyntaxHighlighter-oOlKxWcZ.js";import"./index-VaZYrBm8.js";import"./index.esm-EH5xtEO9.js";import"./index-02RnuBvO.js";import"./AdaptableCard-J542gM39.js";import"./Card-WaxYct8O.js";import"./Views-4xLEiuVY.js";import"./Affix-SGFB5J4m.js";import"./Button-ESr_rbs6.js";import"./context-zGpVC6c9.js";import"./Tooltip-V34zaYLt.js";import"./index.esm-POYYGs7h.js";import"./floating-ui.react-8CQFUeYv.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-jTss0mFi.js";import"./motion-GwjGJPSL.js";import"./index.esm-sS6Bh1cn.js";import"./index-E4eNJ87t.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
