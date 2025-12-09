import{j as o}from"./index-nE3qTmWJ.js";import{D as e}from"./DemoComponentApi-r_buyWw0.js";import{D as t}from"./DemoLayout-48Zmaz0q.js";import{S as r}from"./SyntaxHighlighter-WRXrPh9V.js";import"./index-qkYNi1s2.js";import"./index.esm-rJIJC5Wo.js";import"./index-D9LAS3yO.js";import"./AdaptableCard-IXAk-fG1.js";import"./Card-ofYhqojB.js";import"./Views-Wr9UmLiy.js";import"./Affix-Ng5hiQvt.js";import"./Button-mNwEcSfR.js";import"./context-aC9vqP51.js";import"./Tooltip-f_oot8L9.js";import"./index.esm-sCMYjrHG.js";import"./floating-ui.react-Yyq8XGry.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-FIhXA5AV.js";import"./motion-DI-APurt.js";import"./index.esm-JhChuggt.js";import"./index-RII3KDWx.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
