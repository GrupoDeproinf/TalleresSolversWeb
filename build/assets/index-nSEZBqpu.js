import{j as e}from"./index-i5tZ9w0B.js";import{D as t}from"./DemoComponentApi-rFBrqraD.js";import{D as o}from"./DemoLayout--Uafjtvq.js";import{S as r}from"./SyntaxHighlighter-iisvH-O-.js";import"./index-In-3-usT.js";import"./index.esm-guJzrdD4.js";import"./index-JhteycRy.js";import"./AdaptableCard-qt538AVw.js";import"./Card-CwDS1Zw_.js";import"./Views-z8YYLW5b.js";import"./Affix-hwB1EW7o.js";import"./Button-k0QukaHj.js";import"./context-pREfq64o.js";import"./Tooltip-WqVpHr9d.js";import"./index.esm-qLdEDK2o.js";import"./floating-ui.react--XNwJF6E.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-XXrxu93K.js";import"./motion-UFI8jCfv.js";import"./index.esm-mCRUBiHB.js";import"./index-A1rv4gFB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
