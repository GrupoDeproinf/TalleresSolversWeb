import{j as e}from"./index-9t5KOHno.js";import{D as t}from"./DemoComponentApi-N41dBEGc.js";import{D as i}from"./DemoLayout-iwCSgSdG.js";import{S as o}from"./SyntaxHighlighter-dGysNVJv.js";import"./index-n0YNfJf4.js";import"./index.esm-mNZVPVzQ.js";import"./index-81440SWT.js";import"./AdaptableCard-AQPFOlT9.js";import"./Card-12GHa1Eq.js";import"./Views-UsKkkDUh.js";import"./Affix-1YOWKSSd.js";import"./Button-dbQf2eah.js";import"./context-bikMt5Q-.js";import"./Tooltip-RAyjLDPF.js";import"./index.esm-wUG74Yhm.js";import"./floating-ui.react-px5GD9H_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-1m9E763O.js";import"./motion-tHAU1tWQ.js";import"./index.esm-NU0RhjYe.js";import"./index-Ph93yIGB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
