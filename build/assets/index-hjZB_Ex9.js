import{j as o}from"./index-iN9gC56E.js";import{D as e}from"./DemoComponentApi-YNNE7SSu.js";import{D as t}from"./DemoLayout-pGXJk8d_.js";import{S as r}from"./SyntaxHighlighter-pjHzf9-c.js";import"./index-r5HDIMlV.js";import"./index.esm-PsQ9NYiK.js";import"./index-299YhDr4.js";import"./AdaptableCard-juPQJRD8.js";import"./Card-UeUwmQGm.js";import"./Views-fqLBZTLn.js";import"./Affix-B8QzwV1Y.js";import"./Button-GMmR06Qd.js";import"./context-sXqbsmVT.js";import"./Tooltip-LTk8tIBU.js";import"./index.esm-qnYcV-k-.js";import"./floating-ui.react-238fQh4A.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-snVep3pU.js";import"./motion-VuSiHn-Z.js";import"./index.esm-G_R2Qahq.js";import"./index-q_0ZF6Cq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
