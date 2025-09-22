import{j as e}from"./index-3IkpMvhw.js";import{D as t}from"./DemoComponentApi-cmJBvF2N.js";import{D as o}from"./DemoLayout-2qTRSusM.js";import{S as r}from"./SyntaxHighlighter-p_uAj12i.js";import"./index-lcKbu1WV.js";import"./index.esm-_rP08CZJ.js";import"./index-LzwFMNRR.js";import"./AdaptableCard-LoSVFvKm.js";import"./Card-Kmp1JZ8K.js";import"./Views-vkZwXWEA.js";import"./Affix-gjUM4zB5.js";import"./Button-uUgD1Isd.js";import"./context-_KlN2uti.js";import"./Tooltip-pBZGkNEN.js";import"./index.esm-HcdvCICo.js";import"./floating-ui.react-rtxm9hsq.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Qx-8tb_L.js";import"./motion-Ho6XhLxy.js";import"./index.esm-O3ADo3W0.js";import"./index-s_O6YLS3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
