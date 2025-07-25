import{j as o}from"./index-BDN-NirA.js";import{D as e}from"./DemoComponentApi-6mNcbgK2.js";import{D as t}from"./DemoLayout-mltW-eVK.js";import{S as r}from"./SyntaxHighlighter-WnFaBBqv.js";import"./index-QBN3JdOA.js";import"./index.esm-WGOkTBh9.js";import"./index-M60gcwBn.js";import"./AdaptableCard-GQtji-vL.js";import"./Card-ru8SSgle.js";import"./Views-D5n2Trj8.js";import"./Affix-amj0xHVW.js";import"./Button-6-9C-O8H.js";import"./context--qCY6-De.js";import"./Tooltip-poJdwxB8.js";import"./index.esm-GiNzBMsC.js";import"./floating-ui.react-REDD7Bey.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-nkwvr9YC.js";import"./motion-XTxZ_YMB.js";import"./index.esm-JVWMqiQz.js";import"./index-DuFQRDnk.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
