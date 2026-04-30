import{j as e}from"./index-KnboTQIq.js";import{D as t}from"./DemoComponentApi-FKo7tNGw.js";import{D as o}from"./DemoLayout-saHBnoLJ.js";import{S as r}from"./SyntaxHighlighter-4yMiT8a9.js";import"./index-niGJkX_Y.js";import"./index.esm-NopCh8fs.js";import"./index-YwApo4nb.js";import"./AdaptableCard-_Kvk4qA9.js";import"./Card-ef-SYp7l.js";import"./Views-mE5zdYnK.js";import"./Affix-SxoWuek2.js";import"./Button-vkNvl7iW.js";import"./context-4hyaSNf_.js";import"./Tooltip-ZGOI2uxh.js";import"./index.esm-uLdRodHA.js";import"./floating-ui.react-78UvVOwk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7lhc11-b.js";import"./motion-eUZmQr1h.js";import"./index.esm-qDEWbWzU.js";import"./index-GZObyBO6.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
