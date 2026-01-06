import{j as e}from"./index-52EgRySw.js";import{D as r}from"./DemoComponentApi-sIr3aP9t.js";import{D as o}from"./DemoLayout-49kyRumc.js";import{S as t}from"./SyntaxHighlighter-5yyrKh23.js";import"./index-iCLfkUHm.js";import"./index.esm-joVjrdv4.js";import"./index-tKVWlxOi.js";import"./AdaptableCard-8H-flceS.js";import"./Card-YX4I-iPW.js";import"./Views-Ea6uyAyT.js";import"./Affix-muUDTULJ.js";import"./Button-k9SRSx0b.js";import"./context-GNh3KNAT.js";import"./Tooltip-jn3cme1x.js";import"./index.esm-XI3tC7yo.js";import"./floating-ui.react-DnKrBTw-.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VOrF6s14.js";import"./motion-4fqlWLTJ.js";import"./index.esm-l-LADNwI.js";import"./index-tM7rwq25.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const m=()=>e.jsx(t,{language:"js",children:`import useThemeClass from '@/utils/hooks/useThemeClass'

const Component = () => {

    const { textTheme, bgTheme, borderTheme, ringTheme } = useThemeClass()

	return (
        <div className={bgTheme}>...
    )
}
`}),s="UseThemeClassDoc",i={title:"useThemeClass",desc:"useThemeClass helps to generate color related tailwind classes with current theme color."},l=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(m,{})}],a=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"textTheme",type:"<code>'text-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"text color class"},{propName:"bgTheme",type:"<code>'bg-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"background color class"},{propName:"borderTheme",type:"<code>'border-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"border color class"},{propName:"ringTheme",type:"<code>'ring-{currentThemeColor}-{currentColorLevel}'</code>",default:"-",desc:"ring color class"}]}]}),F=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:l,mdPrefixPath:"utils",extra:a,keyText:"param"});export{F as default};
