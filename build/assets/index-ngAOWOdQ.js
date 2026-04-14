import{j as o}from"./index-_ApK-q7i.js";import{D as e}from"./DemoComponentApi-tUFP8iJb.js";import{D as t}from"./DemoLayout-bPRUQ1cH.js";import{S as r}from"./SyntaxHighlighter-lx8N5tTC.js";import"./index-RPzHcFNN.js";import"./index.esm-526PTSiR.js";import"./index-ahp1cX6b.js";import"./AdaptableCard-ZvtbZBXx.js";import"./Card-ajus7HF1.js";import"./Views-TMbN6l_1.js";import"./Affix-B300VCNH.js";import"./Button-7wssbTrW.js";import"./context-c9HS1Vrm.js";import"./Tooltip-Ltwlgd3h.js";import"./index.esm-rAmnvJSt.js";import"./floating-ui.react-jYRpeG6P.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-wOxl9PUs.js";import"./motion-fHOwczjb.js";import"./index.esm-QmnQh55S.js";import"./index-4Cbk6KGY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
