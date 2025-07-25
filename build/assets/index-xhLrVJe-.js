import{j as e}from"./index-CvzYHHyi.js";import{D as t}from"./DemoComponentApi-mXxAPZ-3.js";import{D as o}from"./DemoLayout-bFBRKV5K.js";import{S as r}from"./SyntaxHighlighter-vYeqY1Gw.js";import"./index-_6lqCWyf.js";import"./index.esm-iZHJToXl.js";import"./index-GYIUrbdE.js";import"./AdaptableCard-ME7InvBI.js";import"./Card-8kOVJnWG.js";import"./Views-IGpbAJRJ.js";import"./Affix-q2qfuq8j.js";import"./Button-RfidP847.js";import"./context-cQxpCbi0.js";import"./Tooltip-1BfvAuqv.js";import"./index.esm-ziONltnY.js";import"./floating-ui.react-g07vzxpC.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-w_0co_RM.js";import"./motion-s0hQdqSS.js";import"./index.esm-M47S76Wd.js";import"./index-sLTrG-jb.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
