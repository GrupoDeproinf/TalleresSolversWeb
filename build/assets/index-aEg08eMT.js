import{j as e}from"./index-sqlzVTU6.js";import{D as t}from"./DemoComponentApi-WXpsOjn1.js";import{D as o}from"./DemoLayout-8mWBD9jQ.js";import{S as r}from"./SyntaxHighlighter-6acm_iIo.js";import"./index-cxHa2H3b.js";import"./index.esm-xcFhNsFj.js";import"./index-qJSJzGnC.js";import"./AdaptableCard-V0uxNSVw.js";import"./Card-nwu__Oi2.js";import"./Views-Xk2ztg4z.js";import"./Affix-ajaj60ys.js";import"./Button-UK-D34UO.js";import"./context-uUBq0g4n.js";import"./Tooltip-JKptW_vN.js";import"./index.esm-OyomaAaz.js";import"./floating-ui.react-VoN_T7V2.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-lbxTp4dY.js";import"./motion-u71o8l8w.js";import"./index.esm-vkxxgfhU.js";import"./index-BGgBYGq3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
