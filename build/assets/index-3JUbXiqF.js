import{j as e}from"./index-iN9gC56E.js";import{D as t}from"./DemoComponentApi-YNNE7SSu.js";import{D as o}from"./DemoLayout-pGXJk8d_.js";import{S as r}from"./SyntaxHighlighter-pjHzf9-c.js";import"./index-r5HDIMlV.js";import"./index.esm-PsQ9NYiK.js";import"./index-299YhDr4.js";import"./AdaptableCard-juPQJRD8.js";import"./Card-UeUwmQGm.js";import"./Views-fqLBZTLn.js";import"./Affix-B8QzwV1Y.js";import"./Button-GMmR06Qd.js";import"./context-sXqbsmVT.js";import"./Tooltip-LTk8tIBU.js";import"./index.esm-qnYcV-k-.js";import"./floating-ui.react-238fQh4A.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-snVep3pU.js";import"./motion-VuSiHn-Z.js";import"./index.esm-G_R2Qahq.js";import"./index-q_0ZF6Cq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

const parsed = deepParseJson('{"a":"{b:b, c:c},"d":"{e:{f:f}",'
)

// output: {
    a: {
        b: 'b',
        c: 'c'
    },
    d: {
        e: {
            f: 'f'
        }
    }
}
`}),s="DeepParseJsonDoc/",i={title:"deepParseJson",desc:"deepParseJson able to parse JSON string into javascript object, even nested or escaped."},a=[{mdName:"Example",mdPath:s,title:"Example",desc:"",component:e.jsx(p,{})}],m=[{component:"deepParseJson",api:[{propName:"jsonString",type:"<code>string</code>",default:"-",desc:"JSON string"}]}],n=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"parsedJsonString",type:"<code>object</code>",default:"-",desc:"Parsed JSON string"}]}]}),H=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:a,api:m,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
