import{j as o}from"./index-c3tk-28l.js";import{D as e}from"./DemoComponentApi-I_losSoG.js";import{D as t}from"./DemoLayout-QyWGjLRg.js";import{S as r}from"./SyntaxHighlighter-2yd3lg-W.js";import"./index-uzExSQ8q.js";import"./index.esm-_F1MhDNx.js";import"./index-W2I2t87C.js";import"./AdaptableCard-oq4UoEMI.js";import"./Card-vDJQQwcv.js";import"./Views-CcnADSHN.js";import"./Affix-e-D77SLE.js";import"./Button-0ZytU0Lu.js";import"./context-aOzumP2l.js";import"./Tooltip-rw9f_jKc.js";import"./index.esm-U4ZUTPeh.js";import"./floating-ui.react-YZHDoCKW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OlbfkzwG.js";import"./motion-l21dNlMq.js";import"./index.esm-AbsWJ_Oy.js";import"./index-pUDB1hfI.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
