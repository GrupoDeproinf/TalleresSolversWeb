import{j as o}from"./index-KuHpp12A.js";import{D as e}from"./DemoComponentApi-7noEPM_d.js";import{D as t}from"./DemoLayout-LNAzJo7H.js";import{S as r}from"./SyntaxHighlighter-x3Mxhuot.js";import"./index-boacLOhc.js";import"./index.esm-rGXFteFT.js";import"./index-ZJP3Cke8.js";import"./AdaptableCard-rw4ZbIDd.js";import"./Card-vm7RtGp9.js";import"./Views-na6mpSjV.js";import"./Affix-awK88hfJ.js";import"./Button-eyFfbJth.js";import"./context-7oHEF7cI.js";import"./Tooltip-dkuVUjr7.js";import"./index.esm-EUjj_JVu.js";import"./floating-ui.react-u3CjLYej.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-WMG8M0Yi.js";import"./motion-N0SAmF_z.js";import"./index.esm-kBL7sQe6.js";import"./index-v0Cy3ZU9.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
