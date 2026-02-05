import{j as o}from"./index-539wkWb6.js";import{D as e}from"./DemoComponentApi-zVNeRGbL.js";import{D as t}from"./DemoLayout-YuP4ggXL.js";import{S as r}from"./SyntaxHighlighter-QnkWZTle.js";import"./index-vfq4_N5K.js";import"./index.esm-SfcosvjZ.js";import"./index-vEkyP9jl.js";import"./AdaptableCard-bbKlZ80X.js";import"./Card-3d2Ny-JF.js";import"./Views-NOUPq-xv.js";import"./Affix-QbeMlExd.js";import"./Button-lbbOHDaq.js";import"./context-GzcGESCG.js";import"./Tooltip-fVR4Pvc0.js";import"./index.esm-0CsLKNQK.js";import"./floating-ui.react-n50WnHyP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Z9EcYsrp.js";import"./motion-Orz9ojqj.js";import"./index.esm-OL94PTg3.js";import"./index-1cVp-vaj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
