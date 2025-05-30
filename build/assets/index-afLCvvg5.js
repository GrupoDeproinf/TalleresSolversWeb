import{j as e}from"./index-_feUBWkF.js";import{D as t}from"./DemoComponentApi-QXiYjNvd.js";import{D as o}from"./DemoLayout-19EPW6T8.js";import{S as r}from"./SyntaxHighlighter-RGzVEGmi.js";import"./index--K6mHtPM.js";import"./index.esm-c6ShvaQW.js";import"./index-lvdI60UC.js";import"./AdaptableCard-CKf0cL3z.js";import"./Card-fXn1hgP9.js";import"./Views-NoPs0swz.js";import"./Affix-3HLokM4n.js";import"./Button-jcq0xEfh.js";import"./context-w88CtZWU.js";import"./Tooltip-tqY3hXOR.js";import"./index.esm-bIknb-8m.js";import"./floating-ui.react-AOig1bqs.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-C1ft9MxP.js";import"./motion-2zhnpuIh.js";import"./index.esm-CyL_iEBq.js";import"./index-Xr0iHSGr.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
