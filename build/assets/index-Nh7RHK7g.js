import{j as e}from"./index-ATNefdVG.js";import{D as t}from"./DemoComponentApi-FyrH3ksG.js";import{D as i}from"./DemoLayout-6SVNet_Y.js";import{S as o}from"./SyntaxHighlighter-kInNipeJ.js";import"./index-1QBWWPtH.js";import"./index.esm-SLyUBwzt.js";import"./index-kSWsxBAA.js";import"./AdaptableCard-T7K6WEWc.js";import"./Card-OSPH2pm3.js";import"./Views-oxXEUsSY.js";import"./Affix-AZxOkwtW.js";import"./Button-m8cr7QK0.js";import"./context-GUUKwgTl.js";import"./Tooltip-RPBixJuV.js";import"./index.esm-6sKRXwnY.js";import"./floating-ui.react-6woUHVe8.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-LDVYzlxf.js";import"./motion-qY3QHwHT.js";import"./index.esm-RzyebFAI.js";import"./index-D5lh9mO-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
import requiredFieldValidation from '@/utils/requiredFieldValidation'

const Component = () => {

    const [ inputValue, setInputValue ] = useState('')
    const [ displayMessage, setDisplayMessage ] = useState(false)

    return (
        <>
            <input value={inputValue} onChange={e => {
                setInputValue(e.target.value)
                setDisplayMessage(true)
            }} />
            {displayMessage && requiredFieldValidation(inputValue, 'Required field!')}
        </>
    )
}
`}),r="RequiredFieldValidationDoc/",s={title:"requiredFieldValidation",desc:"This function can be use to displaying some message if the input value is falsy."},p=[{mdName:"Example",mdPath:r,title:"Example",desc:"",component:e.jsx(a,{})}],d=[{component:"requiredFieldValidation",api:[{propName:"value",type:"<code>string</code>",default:"-",desc:"Field value"},{propName:"message",type:"<code>string</code>",default:"-",desc:"Feedback message"}]}],m=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"validationMessage",type:"<code>string</code>",default:"<code>'Required'</code>",desc:"Feedback message"}]}]}),N=()=>e.jsx(i,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:s,demos:p,api:d,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:m,keyText:"param"});export{N as default};
