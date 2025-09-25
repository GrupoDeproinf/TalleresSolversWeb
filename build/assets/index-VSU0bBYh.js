import{j as e}from"./index-yOh4elUK.js";import{D as t}from"./DemoComponentApi-pKlVztF1.js";import{D as o}from"./DemoLayout-WZlUGBpO.js";import{S as r}from"./SyntaxHighlighter-oOlKxWcZ.js";import"./index-VaZYrBm8.js";import"./index.esm-EH5xtEO9.js";import"./index-02RnuBvO.js";import"./AdaptableCard-J542gM39.js";import"./Card-WaxYct8O.js";import"./Views-4xLEiuVY.js";import"./Affix-SGFB5J4m.js";import"./Button-ESr_rbs6.js";import"./context-zGpVC6c9.js";import"./Tooltip-V34zaYLt.js";import"./index.esm-POYYGs7h.js";import"./floating-ui.react-8CQFUeYv.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-jTss0mFi.js";import"./motion-GwjGJPSL.js";import"./index.esm-sS6Bh1cn.js";import"./index-E4eNJ87t.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
