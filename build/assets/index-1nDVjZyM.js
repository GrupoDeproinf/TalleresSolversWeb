import{j as e}from"./index-KQFNJtc4.js";import{D as r}from"./DemoComponentApi--IKrKf-H.js";import{D as o}from"./DemoLayout-5i8Fn9l7.js";import{S as t}from"./SyntaxHighlighter-8DMt-r7j.js";import"./index-HK5HFBCm.js";import"./index.esm-ern5TROG.js";import"./index-VXFiPzRQ.js";import"./AdaptableCard-KBCkay_F.js";import"./Card-xLnaagij.js";import"./Views-aA243lDZ.js";import"./Affix-pYALYg0Y.js";import"./Button--D0tRVmb.js";import"./context-U4uJiOlk.js";import"./Tooltip-rFfMZWAg.js";import"./index.esm-ODZ_1Gk0.js";import"./floating-ui.react-gVU2UEvr.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xIA8Eb8D.js";import"./motion-4MnqOKZu.js";import"./index.esm-jb16UrWF.js";import"./index-lFfMMwZ5.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
