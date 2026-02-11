import{j as e}from"./index-ATNefdVG.js";import{D as t}from"./DemoComponentApi-FyrH3ksG.js";import{D as o}from"./DemoLayout-6SVNet_Y.js";import{S as r}from"./SyntaxHighlighter-kInNipeJ.js";import"./index-1QBWWPtH.js";import"./index.esm-SLyUBwzt.js";import"./index-kSWsxBAA.js";import"./AdaptableCard-T7K6WEWc.js";import"./Card-OSPH2pm3.js";import"./Views-oxXEUsSY.js";import"./Affix-AZxOkwtW.js";import"./Button-m8cr7QK0.js";import"./context-GUUKwgTl.js";import"./Tooltip-RPBixJuV.js";import"./index.esm-6sKRXwnY.js";import"./floating-ui.react-6woUHVe8.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-LDVYzlxf.js";import"./motion-qY3QHwHT.js";import"./index.esm-RzyebFAI.js";import"./index-D5lh9mO-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
