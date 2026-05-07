import{j as e}from"./index-Qnh9Jyr7.js";import{D as t}from"./DemoComponentApi-MEDru7Kp.js";import{D as o}from"./DemoLayout-zsVWZ04_.js";import{S as r}from"./SyntaxHighlighter-5sPCiOH4.js";import"./index-LoMjNpbz.js";import"./index.esm-Je2zi_5L.js";import"./index-W_gRNgN6.js";import"./AdaptableCard-7Sd9Vpgd.js";import"./Card-w5dzWSUl.js";import"./Views-cwPCb2sQ.js";import"./Affix-RaisI0DK.js";import"./Button-fDHJYPn0.js";import"./context-5dhaVJa2.js";import"./Tooltip-R6t5aivA.js";import"./index.esm-GjjzXZUo.js";import"./floating-ui.react-qUL_HLkt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OtTUSv2B.js";import"./motion-oFB1E3pj.js";import"./index.esm-oVnV7Kme.js";import"./index-nrjwcTxi.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
