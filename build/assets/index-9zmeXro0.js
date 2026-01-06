import{j as e}from"./index-H_SJxUeU.js";import{D as t}from"./DemoComponentApi-osBSW0m9.js";import{D as o}from"./DemoLayout-15j21vfX.js";import{S as r}from"./SyntaxHighlighter-wxILA_Ry.js";import"./index-6I3jupY8.js";import"./index.esm-btdTbd8Z.js";import"./index-4nxjES-T.js";import"./AdaptableCard-KWp_cZQb.js";import"./Card-f4k0xg6u.js";import"./Views-c4DnWJLZ.js";import"./Affix-y2GC7SVb.js";import"./Button-kEEMBmx5.js";import"./context-hQhleY2c.js";import"./Tooltip-H_zZqpZQ.js";import"./index.esm-h0-JemCa.js";import"./floating-ui.react-DVNBwuUg.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yCNZ8lcq.js";import"./motion-FHnWFy5I.js";import"./index.esm-8401eSNr.js";import"./index-zi7d0PRN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
