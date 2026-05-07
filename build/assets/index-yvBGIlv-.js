import{j as o}from"./index-Qnh9Jyr7.js";import{D as e}from"./DemoComponentApi-MEDru7Kp.js";import{D as t}from"./DemoLayout-zsVWZ04_.js";import{S as r}from"./SyntaxHighlighter-5sPCiOH4.js";import"./index-LoMjNpbz.js";import"./index.esm-Je2zi_5L.js";import"./index-W_gRNgN6.js";import"./AdaptableCard-7Sd9Vpgd.js";import"./Card-w5dzWSUl.js";import"./Views-cwPCb2sQ.js";import"./Affix-RaisI0DK.js";import"./Button-fDHJYPn0.js";import"./context-5dhaVJa2.js";import"./Tooltip-R6t5aivA.js";import"./index.esm-GjjzXZUo.js";import"./floating-ui.react-qUL_HLkt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OtTUSv2B.js";import"./motion-oFB1E3pj.js";import"./index.esm-oVnV7Kme.js";import"./index-nrjwcTxi.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
