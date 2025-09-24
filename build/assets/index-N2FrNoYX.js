import{j as e}from"./index-D1MrS5xY.js";import{D as r}from"./DemoComponentApi-LOh212rE.js";import{D as o}from"./DemoLayout-H9Sqp6iu.js";import{S as t}from"./SyntaxHighlighter-4OjnlPcL.js";import"./index-MbLzU_Cs.js";import"./index.esm-T7MKHyVP.js";import"./index-sva1Rkyn.js";import"./AdaptableCard-PMlzgRML.js";import"./Card-8EgQUYhF.js";import"./Views-7KIxFcen.js";import"./Affix-ego_VAt5.js";import"./Button-a7ssyZMC.js";import"./context-tQTS5G38.js";import"./Tooltip-o3UBWBxC.js";import"./index.esm-9IgJ_EbT.js";import"./floating-ui.react-0MFFUaCH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-DglP9m2U.js";import"./motion-l3eyuBh1.js";import"./index.esm-p6Elkq3m.js";import"./index-5bgjMnor.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
