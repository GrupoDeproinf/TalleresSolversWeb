import{j as o}from"./index-_feUBWkF.js";import{D as e}from"./DemoComponentApi-QXiYjNvd.js";import{D as t}from"./DemoLayout-19EPW6T8.js";import{S as r}from"./SyntaxHighlighter-RGzVEGmi.js";import"./index--K6mHtPM.js";import"./index.esm-c6ShvaQW.js";import"./index-lvdI60UC.js";import"./AdaptableCard-CKf0cL3z.js";import"./Card-fXn1hgP9.js";import"./Views-NoPs0swz.js";import"./Affix-3HLokM4n.js";import"./Button-jcq0xEfh.js";import"./context-w88CtZWU.js";import"./Tooltip-tqY3hXOR.js";import"./index.esm-bIknb-8m.js";import"./floating-ui.react-AOig1bqs.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-C1ft9MxP.js";import"./motion-2zhnpuIh.js";import"./index.esm-CyL_iEBq.js";import"./index-Xr0iHSGr.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
