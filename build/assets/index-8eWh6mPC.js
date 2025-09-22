import{j as e}from"./index-zN_cMCXj.js";import{D as t}from"./DemoComponentApi-3rUe8QU-.js";import{D as o}from"./DemoLayout-zgtRGiUG.js";import{S as r}from"./SyntaxHighlighter-wq9tsgxf.js";import"./index-8X2bHxJW.js";import"./index.esm-bWNlESX5.js";import"./index-JLBgVWbO.js";import"./AdaptableCard-Z9nht5s7.js";import"./Card-q0IeE3mQ.js";import"./Views-zD_Q7SBY.js";import"./Affix-eBh0j_EU.js";import"./Button-3FDHFgBt.js";import"./context-4K_It7vM.js";import"./Tooltip-TmV83Zem.js";import"./index.esm-qF4ozkmo.js";import"./floating-ui.react-NPg6DBrp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-e95nRWq5.js";import"./motion-TPlYCOYk.js";import"./index.esm-Wztopsom.js";import"./index-Aw7A1Eb2.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
