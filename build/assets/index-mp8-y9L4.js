import{j as e}from"./index-49VJK46O.js";import{D as t}from"./DemoComponentApi-m-e4sl8x.js";import{D as o}from"./DemoLayout-TsVDUC5b.js";import{S as r}from"./SyntaxHighlighter-y5msM8_j.js";import"./index-NND_QyzC.js";import"./index.esm-nNjcsMgN.js";import"./index-_TgZyloI.js";import"./AdaptableCard-P0GI32P2.js";import"./Card-x8Afl9LD.js";import"./Views-RQmIN1FY.js";import"./Affix-94zZobw2.js";import"./Button-bqI3GDyv.js";import"./context-JrpcaBA5.js";import"./Tooltip-OYDlPLoW.js";import"./index.esm-16-OZXRr.js";import"./floating-ui.react-ZAMaDPJk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-QIpWpgz1.js";import"./motion-Vp-thHGU.js";import"./index.esm-1z9Mj4Wf.js";import"./index-2dwt-Q1e.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
