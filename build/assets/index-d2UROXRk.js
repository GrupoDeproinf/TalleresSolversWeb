import{j as e}from"./index-c3tk-28l.js";import{D as t}from"./DemoComponentApi-I_losSoG.js";import{D as o}from"./DemoLayout-QyWGjLRg.js";import{S as r}from"./SyntaxHighlighter-2yd3lg-W.js";import"./index-uzExSQ8q.js";import"./index.esm-_F1MhDNx.js";import"./index-W2I2t87C.js";import"./AdaptableCard-oq4UoEMI.js";import"./Card-vDJQQwcv.js";import"./Views-CcnADSHN.js";import"./Affix-e-D77SLE.js";import"./Button-0ZytU0Lu.js";import"./context-aOzumP2l.js";import"./Tooltip-rw9f_jKc.js";import"./index.esm-U4ZUTPeh.js";import"./floating-ui.react-YZHDoCKW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OlbfkzwG.js";import"./motion-l21dNlMq.js";import"./index.esm-AbsWJ_Oy.js";import"./index-pUDB1hfI.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
