import{j as e}from"./index-14Zf3KpF.js";import{D as r}from"./DemoComponentApi-FLoZvF1h.js";import{D as o}from"./DemoLayout-HUSL1GCr.js";import{S as t}from"./SyntaxHighlighter-EGtpdf6p.js";import"./index-3BObJsDJ.js";import"./index.esm-tlmx5QOY.js";import"./index-M-3nUjXp.js";import"./AdaptableCard-bZc8g127.js";import"./Card-OFJMqrf6.js";import"./Views-rz_27Y7n.js";import"./Affix-SMQ9nWa8.js";import"./Button-lbg_hS91.js";import"./context-NuRkSskr.js";import"./Tooltip-PxOiAuea.js";import"./index.esm-cOK3YiHr.js";import"./floating-ui.react-rqxm2o5S.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xjj2bTFj.js";import"./motion-pKXwz-yX.js";import"./index.esm-2Nj3n_IK.js";import"./index-TgIVsgqN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
