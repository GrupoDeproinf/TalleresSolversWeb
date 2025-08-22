import{j as o}from"./index-Nr7DOcs5.js";import{D as e}from"./DemoComponentApi-6zRb4_DW.js";import{D as t}from"./DemoLayout-TYFeUBFg.js";import{S as r}from"./SyntaxHighlighter-Lppmx1nC.js";import"./index-NkYS5vPG.js";import"./index.esm-7QtrnPrk.js";import"./index-nftdwZx5.js";import"./AdaptableCard-9_BPIhlC.js";import"./Card-GtPtNWmu.js";import"./Views-SzAC9t3D.js";import"./Affix-V3V6XeQW.js";import"./Button-RpRRBLhx.js";import"./context-gbG70jxa.js";import"./Tooltip-gLhVAyTO.js";import"./index.esm-ZAJo3edJ.js";import"./floating-ui.react-Siy9LDCN.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-c5JwgfFM.js";import"./motion-GODN01Pl.js";import"./index.esm-hDm5I03d.js";import"./index-YzJdvSvg.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
