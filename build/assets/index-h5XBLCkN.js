import{j as e}from"./index-14Zf3KpF.js";import{D as t}from"./DemoComponentApi-FLoZvF1h.js";import{D as o}from"./DemoLayout-HUSL1GCr.js";import{S as r}from"./SyntaxHighlighter-EGtpdf6p.js";import"./index-3BObJsDJ.js";import"./index.esm-tlmx5QOY.js";import"./index-M-3nUjXp.js";import"./AdaptableCard-bZc8g127.js";import"./Card-OFJMqrf6.js";import"./Views-rz_27Y7n.js";import"./Affix-SMQ9nWa8.js";import"./Button-lbg_hS91.js";import"./context-NuRkSskr.js";import"./Tooltip-PxOiAuea.js";import"./index.esm-cOK3YiHr.js";import"./floating-ui.react-rqxm2o5S.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xjj2bTFj.js";import"./motion-pKXwz-yX.js";import"./index.esm-2Nj3n_IK.js";import"./index-TgIVsgqN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
