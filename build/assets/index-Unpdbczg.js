import{j as e}from"./index-O97KD1XJ.js";import{D as r}from"./DemoComponentApi-70Rn5dlJ.js";import{D as o}from"./DemoLayout-FTvUNpgu.js";import{S as t}from"./SyntaxHighlighter-sgYpcjyk.js";import"./index-rlKC0YRg.js";import"./index.esm-fVIXAgam.js";import"./index--8hiBZyK.js";import"./AdaptableCard-4InEVC4Z.js";import"./Card-pE1gTaeJ.js";import"./Views-iRCRASdY.js";import"./Affix-WCLmmWv0.js";import"./Button-n3c8cB2K.js";import"./context-BS4LvZM6.js";import"./Tooltip-XgU6s3I9.js";import"./index.esm-wnwH_6NS.js";import"./floating-ui.react-BJZwznw0.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-ZAnTfVAf.js";import"./motion-vruOJL_Y.js";import"./index.esm-MD-IZzhi.js";import"./index-kAodoiZN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
