import{j as e}from"./index-S9gWAOhe.js";import{D as t}from"./DemoComponentApi-HhwW7XC_.js";import{D as o}from"./DemoLayout-CDxRlQgy.js";import{S as r}from"./SyntaxHighlighter-r0tNmJqa.js";import"./index-bbG1C4HF.js";import"./index.esm-llRLA_rx.js";import"./index-Gjm4fmPx.js";import"./AdaptableCard-yK5a-emR.js";import"./Card-g98i0nur.js";import"./Views-CFuOK5sp.js";import"./Affix-8RXZCQ1i.js";import"./Button-xPGJGWxb.js";import"./context-mAM1TfDV.js";import"./Tooltip-fN76mi7p.js";import"./index.esm-4lUq-luv.js";import"./floating-ui.react-lz-2OKBz.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-f1K2561U.js";import"./motion-fv6P95QN.js";import"./index.esm-Cv3nUxWT.js";import"./index-LLoxKMRq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
