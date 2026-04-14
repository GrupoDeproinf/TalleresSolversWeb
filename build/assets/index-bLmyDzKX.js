import{j as e}from"./index-_ApK-q7i.js";import{D as t}from"./DemoComponentApi-tUFP8iJb.js";import{D as o}from"./DemoLayout-bPRUQ1cH.js";import{S as r}from"./SyntaxHighlighter-lx8N5tTC.js";import"./index-RPzHcFNN.js";import"./index.esm-526PTSiR.js";import"./index-ahp1cX6b.js";import"./AdaptableCard-ZvtbZBXx.js";import"./Card-ajus7HF1.js";import"./Views-TMbN6l_1.js";import"./Affix-B300VCNH.js";import"./Button-7wssbTrW.js";import"./context-c9HS1Vrm.js";import"./Tooltip-Ltwlgd3h.js";import"./index.esm-rAmnvJSt.js";import"./floating-ui.react-jYRpeG6P.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-wOxl9PUs.js";import"./motion-fHOwczjb.js";import"./index.esm-QmnQh55S.js";import"./index-4Cbk6KGY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
