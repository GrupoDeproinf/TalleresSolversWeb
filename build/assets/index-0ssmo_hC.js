import{j as o}from"./index-sxY2vR_b.js";import{D as e}from"./DemoComponentApi-597voAgO.js";import{D as t}from"./DemoLayout-evFXGnBx.js";import{S as r}from"./SyntaxHighlighter-cbRe9zU-.js";import"./index-AN3niVhH.js";import"./index.esm-7rMJeW_p.js";import"./index-XOOicjk1.js";import"./AdaptableCard-oIjzq9rA.js";import"./Card-3z76uwgw.js";import"./Views-YxvfAhNX.js";import"./Affix-LcdOe-fz.js";import"./Button-gHfU8a9b.js";import"./context-ugtK0z0w.js";import"./Tooltip-tOnNgS6K.js";import"./index.esm-lAhGiBpp.js";import"./floating-ui.react-xh7t2hCc.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-beo0AS2x.js";import"./motion-h-3axnRn.js";import"./index.esm-cN1LGhJ4.js";import"./index-t_CREONj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
