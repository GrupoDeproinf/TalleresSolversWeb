import{j as o}from"./index-NsbKStwV.js";import{D as e}from"./DemoComponentApi-ZTJgIuu-.js";import{D as t}from"./DemoLayout-loRHvrar.js";import{S as r}from"./SyntaxHighlighter-RVyAO-kN.js";import"./index-WaLOIBvG.js";import"./index.esm-orl39wdU.js";import"./index-9W1V2LMW.js";import"./AdaptableCard-YPt_Dofb.js";import"./Card-VqsFwQIo.js";import"./Views-I29_hvdt.js";import"./Affix-It3l-FrH.js";import"./Button-XnwKhdvE.js";import"./context-oRCGbGnv.js";import"./Tooltip-i9ud1ENZ.js";import"./index.esm-2Q-50ffC.js";import"./floating-ui.react-VCMzFDFm.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7Af8_Ef6.js";import"./motion-6wXtmffM.js";import"./index.esm-DPuKpfEd.js";import"./index-yS24mju4.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
