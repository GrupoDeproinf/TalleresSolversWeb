import{j as e}from"./index-zDy8CJSv.js";import{D as r}from"./DemoComponentApi-PmAWVP9q.js";import{D as o}from"./DemoLayout-aTHta60v.js";import{S as t}from"./SyntaxHighlighter-J-vljlkn.js";import"./index-EhFY3FXZ.js";import"./index.esm-8oGGOvbw.js";import"./index-8GGQ_gkq.js";import"./AdaptableCard-9_XgOvg6.js";import"./Card-FPn1uwOm.js";import"./Views-flW81mru.js";import"./Affix-hArJOjjz.js";import"./Button-HfVDL6bK.js";import"./context-MajEoJBJ.js";import"./Tooltip-0_qZMJKE.js";import"./index.esm-PlBLKxwD.js";import"./floating-ui.react-fNLbRMMj.js";import"./floating-ui.dom-0rLBacrf.js";import"./index--31oHpxx.js";import"./motion-nXdFA5hx.js";import"./index.esm-CX28sAbI.js";import"./index-how8eNw-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
