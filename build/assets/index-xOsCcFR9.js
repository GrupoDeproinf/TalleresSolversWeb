import{j as o}from"./index-ABjXZzKD.js";import{D as e}from"./DemoComponentApi-C2YupdIe.js";import{D as t}from"./DemoLayout-zIqale2t.js";import{S as r}from"./SyntaxHighlighter-KAsxxSPo.js";import"./index-hoI5MYke.js";import"./index.esm-G4kMKpK9.js";import"./index-Laf2x-F-.js";import"./AdaptableCard-Guhgo30g.js";import"./Card-2Fe-_J3l.js";import"./Views-8W_pghrR.js";import"./Affix--cJn1oF2.js";import"./Button-PrF4gPDj.js";import"./context-q1VEwzUH.js";import"./Tooltip-ZcEA5Guw.js";import"./index.esm-X-60aNOT.js";import"./floating-ui.react-kp5fCW25.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-bFNXb1qC.js";import"./motion-LTaSieXW.js";import"./index.esm-eoTp6Zo3.js";import"./index-g0vaglUp.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
