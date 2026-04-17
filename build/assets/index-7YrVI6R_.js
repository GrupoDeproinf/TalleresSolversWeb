import{j as o}from"./index-49VJK46O.js";import{D as e}from"./DemoComponentApi-m-e4sl8x.js";import{D as t}from"./DemoLayout-TsVDUC5b.js";import{S as r}from"./SyntaxHighlighter-y5msM8_j.js";import"./index-NND_QyzC.js";import"./index.esm-nNjcsMgN.js";import"./index-_TgZyloI.js";import"./AdaptableCard-P0GI32P2.js";import"./Card-x8Afl9LD.js";import"./Views-RQmIN1FY.js";import"./Affix-94zZobw2.js";import"./Button-bqI3GDyv.js";import"./context-JrpcaBA5.js";import"./Tooltip-OYDlPLoW.js";import"./index.esm-16-OZXRr.js";import"./floating-ui.react-ZAMaDPJk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-QIpWpgz1.js";import"./motion-Vp-thHGU.js";import"./index.esm-1z9Mj4Wf.js";import"./index-2dwt-Q1e.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
