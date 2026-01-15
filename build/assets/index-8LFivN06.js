import{j as o}from"./index-9t5KOHno.js";import{D as e}from"./DemoComponentApi-N41dBEGc.js";import{D as t}from"./DemoLayout-iwCSgSdG.js";import{S as r}from"./SyntaxHighlighter-dGysNVJv.js";import"./index-n0YNfJf4.js";import"./index.esm-mNZVPVzQ.js";import"./index-81440SWT.js";import"./AdaptableCard-AQPFOlT9.js";import"./Card-12GHa1Eq.js";import"./Views-UsKkkDUh.js";import"./Affix-1YOWKSSd.js";import"./Button-dbQf2eah.js";import"./context-bikMt5Q-.js";import"./Tooltip-RAyjLDPF.js";import"./index.esm-wUG74Yhm.js";import"./floating-ui.react-px5GD9H_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-1m9E763O.js";import"./motion-tHAU1tWQ.js";import"./index.esm-NU0RhjYe.js";import"./index-Ph93yIGB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
