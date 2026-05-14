import{j as e}from"./index-S9gWAOhe.js";import{D as t}from"./DemoComponentApi-HhwW7XC_.js";import{D as i}from"./DemoLayout-CDxRlQgy.js";import{S as o}from"./SyntaxHighlighter-r0tNmJqa.js";import"./index-bbG1C4HF.js";import"./index.esm-llRLA_rx.js";import"./index-Gjm4fmPx.js";import"./AdaptableCard-yK5a-emR.js";import"./Card-g98i0nur.js";import"./Views-CFuOK5sp.js";import"./Affix-8RXZCQ1i.js";import"./Button-xPGJGWxb.js";import"./context-mAM1TfDV.js";import"./Tooltip-fN76mi7p.js";import"./index.esm-4lUq-luv.js";import"./floating-ui.react-lz-2OKBz.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-f1K2561U.js";import"./motion-fv6P95QN.js";import"./index.esm-Cv3nUxWT.js";import"./index-LLoxKMRq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
