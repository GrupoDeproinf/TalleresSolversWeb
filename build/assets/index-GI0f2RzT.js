import{j as o}from"./index-JmHojjZF.js";import{D as e}from"./DemoComponentApi-GreJxXga.js";import{D as t}from"./DemoLayout-IAr37rdY.js";import{S as r}from"./SyntaxHighlighter-KEuVydnx.js";import"./index-ToqI7_Kp.js";import"./index.esm-kXaIV95b.js";import"./index-rEOp-HW-.js";import"./AdaptableCard-JGgv_ev8.js";import"./Card-IB018HxE.js";import"./Views-B7Axq-_H.js";import"./Affix-YceNC3yo.js";import"./Button-_U4vs34L.js";import"./context-sAlwGZHP.js";import"./Tooltip-2fc0Xghq.js";import"./index.esm-_q6RAcWH.js";import"./floating-ui.react-dnDtoXGa.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-BVb65nFb.js";import"./motion-d-XTyztW.js";import"./index.esm-fDGSM_mt.js";import"./index-phIxZ0Yy.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
