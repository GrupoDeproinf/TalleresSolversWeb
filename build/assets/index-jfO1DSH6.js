import{j as e}from"./index-NE0lhnJe.js";import{D as r}from"./DemoComponentApi-yNFU_31E.js";import{D as o}from"./DemoLayout-8xVZIx3B.js";import{S as t}from"./SyntaxHighlighter-QjvwOn1d.js";import"./index-cCzbUbyn.js";import"./index.esm-XcQjK8we.js";import"./index-PfKOga0z.js";import"./AdaptableCard-Wg3oWL2m.js";import"./Card-4Itq99fL.js";import"./Views-RbBz5vWv.js";import"./Affix-wEe_pn0Y.js";import"./Button-8kVeD03n.js";import"./context-FskeaiM2.js";import"./Tooltip-FW8ZrPIo.js";import"./index.esm-OUfSdYNt.js";import"./floating-ui.react-dGl_1mDX.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-sZcIPUmP.js";import"./motion-Ruv7UFTr.js";import"./index.esm-LTy801Y9.js";import"./index-q1FPoc0-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
