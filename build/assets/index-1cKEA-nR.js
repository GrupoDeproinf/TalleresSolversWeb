import{j as o}from"./index-CvzYHHyi.js";import{D as e}from"./DemoComponentApi-mXxAPZ-3.js";import{D as t}from"./DemoLayout-bFBRKV5K.js";import{S as r}from"./SyntaxHighlighter-vYeqY1Gw.js";import"./index-_6lqCWyf.js";import"./index.esm-iZHJToXl.js";import"./index-GYIUrbdE.js";import"./AdaptableCard-ME7InvBI.js";import"./Card-8kOVJnWG.js";import"./Views-IGpbAJRJ.js";import"./Affix-q2qfuq8j.js";import"./Button-RfidP847.js";import"./context-cQxpCbi0.js";import"./Tooltip-1BfvAuqv.js";import"./index.esm-ziONltnY.js";import"./floating-ui.react-g07vzxpC.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-w_0co_RM.js";import"./motion-s0hQdqSS.js";import"./index.esm-M47S76Wd.js";import"./index-sLTrG-jb.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
