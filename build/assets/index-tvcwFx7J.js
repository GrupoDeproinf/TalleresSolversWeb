import{j as e}from"./index-NsbKStwV.js";import{D as t}from"./DemoComponentApi-ZTJgIuu-.js";import{D as o}from"./DemoLayout-loRHvrar.js";import{S as r}from"./SyntaxHighlighter-RVyAO-kN.js";import"./index-WaLOIBvG.js";import"./index.esm-orl39wdU.js";import"./index-9W1V2LMW.js";import"./AdaptableCard-YPt_Dofb.js";import"./Card-VqsFwQIo.js";import"./Views-I29_hvdt.js";import"./Affix-It3l-FrH.js";import"./Button-XnwKhdvE.js";import"./context-oRCGbGnv.js";import"./Tooltip-i9ud1ENZ.js";import"./index.esm-2Q-50ffC.js";import"./floating-ui.react-VCMzFDFm.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7Af8_Ef6.js";import"./motion-6wXtmffM.js";import"./index.esm-DPuKpfEd.js";import"./index-yS24mju4.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const p=()=>e.jsx(r,{language:"js",children:`import deepParseJson from '@/utils/deepParseJson'

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
