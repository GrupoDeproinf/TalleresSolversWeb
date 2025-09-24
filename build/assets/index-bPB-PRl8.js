import{j as e}from"./index-15sR2hcI.js";import{D as t}from"./DemoComponentApi-eqPc_NgO.js";import{D as o}from"./DemoLayout-cXVmXjXk.js";import{S as r}from"./SyntaxHighlighter-zwDPWW1e.js";import"./index-_AoI4hSc.js";import"./index.esm-NmTktVeB.js";import"./index-1XJReBnJ.js";import"./AdaptableCard-mtbjqd0n.js";import"./Card-Zg6jSWKE.js";import"./Views-dlAO8rPI.js";import"./Affix-wDCEcnYH.js";import"./Button-8f3-31O1.js";import"./context-3jl7jrYD.js";import"./Tooltip-JETBhhx_.js";import"./index.esm-yJD-bGj6.js";import"./floating-ui.react-AHIwqOdP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-og_L5k7n.js";import"./motion-JCtWUOno.js";import"./index.esm-7YOjLpfE.js";import"./index-dpskanKY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
