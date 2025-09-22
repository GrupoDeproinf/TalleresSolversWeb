import{j as o}from"./index-zN_cMCXj.js";import{D as e}from"./DemoComponentApi-3rUe8QU-.js";import{D as t}from"./DemoLayout-zgtRGiUG.js";import{S as r}from"./SyntaxHighlighter-wq9tsgxf.js";import"./index-8X2bHxJW.js";import"./index.esm-bWNlESX5.js";import"./index-JLBgVWbO.js";import"./AdaptableCard-Z9nht5s7.js";import"./Card-q0IeE3mQ.js";import"./Views-zD_Q7SBY.js";import"./Affix-eBh0j_EU.js";import"./Button-3FDHFgBt.js";import"./context-4K_It7vM.js";import"./Tooltip-TmV83Zem.js";import"./index.esm-qF4ozkmo.js";import"./floating-ui.react-NPg6DBrp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-e95nRWq5.js";import"./motion-TPlYCOYk.js";import"./index.esm-Wztopsom.js";import"./index-Aw7A1Eb2.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
