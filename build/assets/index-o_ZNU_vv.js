import{j as e}from"./index-MXeuXt6D.js";import{D as t}from"./DemoComponentApi-Irwn1uIB.js";import{D as o}from"./DemoLayout-XoEn_4k-.js";import{S as r}from"./SyntaxHighlighter-YXTMy4M4.js";import"./index-hfXV9fO5.js";import"./index.esm-Nne6VUru.js";import"./index-KjETz4nL.js";import"./AdaptableCard-pBoZ8GaV.js";import"./Card-K535tOj0.js";import"./Views-YIa05gYP.js";import"./Affix-aX1zVhtC.js";import"./Button-vr5nYjWh.js";import"./context-CyHO4l0y.js";import"./Tooltip-tunHCYEK.js";import"./index.esm-tXvc1PCn.js";import"./floating-ui.react-diTN8vIO.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-TkOf27ZX.js";import"./motion-WWGuudfi.js";import"./index.esm-QY0V8pz3.js";import"./index-hI2o6F97.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
