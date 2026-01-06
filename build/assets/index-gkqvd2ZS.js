import{j as e}from"./index-H_SJxUeU.js";import{D as r}from"./DemoComponentApi-osBSW0m9.js";import{D as o}from"./DemoLayout-15j21vfX.js";import{S as t}from"./SyntaxHighlighter-wxILA_Ry.js";import"./index-6I3jupY8.js";import"./index.esm-btdTbd8Z.js";import"./index-4nxjES-T.js";import"./AdaptableCard-KWp_cZQb.js";import"./Card-f4k0xg6u.js";import"./Views-c4DnWJLZ.js";import"./Affix-y2GC7SVb.js";import"./Button-kEEMBmx5.js";import"./context-hQhleY2c.js";import"./Tooltip-H_zZqpZQ.js";import"./index.esm-h0-JemCa.js";import"./floating-ui.react-DVNBwuUg.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yCNZ8lcq.js";import"./motion-FHnWFy5I.js";import"./index.esm-8401eSNr.js";import"./index-zi7d0PRN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
