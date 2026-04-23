import{j as o}from"./index-EISNSMds.js";import{D as e}from"./DemoComponentApi-OKMA84Tk.js";import{D as t}from"./DemoLayout-Rf6s_2zp.js";import{S as r}from"./SyntaxHighlighter-4JlvOwBQ.js";import"./index-iNCwCYd5.js";import"./index.esm-EL2hHlmT.js";import"./index-YX6prj96.js";import"./AdaptableCard-qHFClxH0.js";import"./Card-wEpj0U8y.js";import"./Views-cYTCqjtj.js";import"./Affix-KE2mXACa.js";import"./Button-lkK6fZcD.js";import"./context-Ogq3jpii.js";import"./Tooltip-qNULHPcL.js";import"./index.esm-V-D0jquW.js";import"./floating-ui.react-oIN8kvGt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-mrgGKg7t.js";import"./motion-uEy6ONEe.js";import"./index.esm-YYnUCUNr.js";import"./index-NH-tiSqR.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
