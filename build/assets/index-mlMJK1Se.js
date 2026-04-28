import{j as o}from"./index-i5tZ9w0B.js";import{D as e}from"./DemoComponentApi-rFBrqraD.js";import{D as t}from"./DemoLayout--Uafjtvq.js";import{S as r}from"./SyntaxHighlighter-iisvH-O-.js";import"./index-In-3-usT.js";import"./index.esm-guJzrdD4.js";import"./index-JhteycRy.js";import"./AdaptableCard-qt538AVw.js";import"./Card-CwDS1Zw_.js";import"./Views-z8YYLW5b.js";import"./Affix-hwB1EW7o.js";import"./Button-k0QukaHj.js";import"./context-pREfq64o.js";import"./Tooltip-WqVpHr9d.js";import"./index.esm-qLdEDK2o.js";import"./floating-ui.react--XNwJF6E.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-XXrxu93K.js";import"./motion-UFI8jCfv.js";import"./index.esm-mCRUBiHB.js";import"./index-A1rv4gFB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
