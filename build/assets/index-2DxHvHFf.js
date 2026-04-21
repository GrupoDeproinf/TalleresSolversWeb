import{j as o}from"./index-zDy8CJSv.js";import{D as e}from"./DemoComponentApi-PmAWVP9q.js";import{D as t}from"./DemoLayout-aTHta60v.js";import{S as r}from"./SyntaxHighlighter-J-vljlkn.js";import"./index-EhFY3FXZ.js";import"./index.esm-8oGGOvbw.js";import"./index-8GGQ_gkq.js";import"./AdaptableCard-9_XgOvg6.js";import"./Card-FPn1uwOm.js";import"./Views-flW81mru.js";import"./Affix-hArJOjjz.js";import"./Button-HfVDL6bK.js";import"./context-MajEoJBJ.js";import"./Tooltip-0_qZMJKE.js";import"./index.esm-PlBLKxwD.js";import"./floating-ui.react-fNLbRMMj.js";import"./floating-ui.dom-0rLBacrf.js";import"./index--31oHpxx.js";import"./motion-nXdFA5hx.js";import"./index.esm-CX28sAbI.js";import"./index-how8eNw-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
