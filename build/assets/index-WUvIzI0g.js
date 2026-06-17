import{j as e}from"./index-NE0lhnJe.js";import{D as t}from"./DemoComponentApi-yNFU_31E.js";import{D as o}from"./DemoLayout-8xVZIx3B.js";import{S as r}from"./SyntaxHighlighter-QjvwOn1d.js";import"./index-cCzbUbyn.js";import"./index.esm-XcQjK8we.js";import"./index-PfKOga0z.js";import"./AdaptableCard-Wg3oWL2m.js";import"./Card-4Itq99fL.js";import"./Views-RbBz5vWv.js";import"./Affix-wEe_pn0Y.js";import"./Button-8kVeD03n.js";import"./context-FskeaiM2.js";import"./Tooltip-FW8ZrPIo.js";import"./index.esm-OUfSdYNt.js";import"./floating-ui.react-dGl_1mDX.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-sZcIPUmP.js";import"./motion-Ruv7UFTr.js";import"./index.esm-LTy801Y9.js";import"./index-q1FPoc0-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
