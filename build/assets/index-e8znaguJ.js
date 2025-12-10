import{j as e}from"./index-N-1RluuA.js";import{D as t}from"./DemoComponentApi-x775CCjJ.js";import{D as o}from"./DemoLayout-ct69zWf6.js";import{S as r}from"./SyntaxHighlighter-O8JgOWdM.js";import"./index-kHevX6Xf.js";import"./index.esm--IdS3ikX.js";import"./index-F7dqYLcC.js";import"./AdaptableCard--kwp3Zb5.js";import"./Card-kRdnf6fx.js";import"./Views-jTGFnbRp.js";import"./Affix-tz3FBMPM.js";import"./Button-DL-xRWcd.js";import"./context-khs8ZuWg.js";import"./Tooltip-sewaCRiQ.js";import"./index.esm-Og_Wyf2u.js";import"./floating-ui.react-8ub5PJIZ.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-tC48GSbs.js";import"./motion-YE_afSFk.js";import"./index.esm-suDg3zH5.js";import"./index-yxOeA48F.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
