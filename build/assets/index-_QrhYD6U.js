import{j as e}from"./index-NU55aeHu.js";import{D as t}from"./DemoComponentApi-ynNcguOj.js";import{D as o}from"./DemoLayout-SKCs7yKV.js";import{S as r}from"./SyntaxHighlighter-UtZjHk7N.js";import"./index-jHWBY7SI.js";import"./index.esm-mzOnvTgK.js";import"./index-XSYrKGIZ.js";import"./AdaptableCard-WL1-grzV.js";import"./Card-KU4tupdi.js";import"./Views-_qocjLuO.js";import"./Affix-qOx501Mh.js";import"./Button-X4YAxjf9.js";import"./context-mxvrTZY-.js";import"./Tooltip-nmCs6-RN.js";import"./index.esm-VZHp9jz5.js";import"./floating-ui.react-3j2FiDTw.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Sf2OyPxD.js";import"./motion-qvTSg2GE.js";import"./index.esm-SEqrhXUV.js";import"./index-9tkI9CBH.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
