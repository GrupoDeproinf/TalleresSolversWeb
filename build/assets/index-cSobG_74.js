import{j as e}from"./index-Qnh9Jyr7.js";import{D as t}from"./DemoComponentApi-MEDru7Kp.js";import{D as i}from"./DemoLayout-zsVWZ04_.js";import{S as o}from"./SyntaxHighlighter-5sPCiOH4.js";import"./index-LoMjNpbz.js";import"./index.esm-Je2zi_5L.js";import"./index-W_gRNgN6.js";import"./AdaptableCard-7Sd9Vpgd.js";import"./Card-w5dzWSUl.js";import"./Views-cwPCb2sQ.js";import"./Affix-RaisI0DK.js";import"./Button-fDHJYPn0.js";import"./context-5dhaVJa2.js";import"./Tooltip-R6t5aivA.js";import"./index.esm-GjjzXZUo.js";import"./floating-ui.react-qUL_HLkt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OtTUSv2B.js";import"./motion-oFB1E3pj.js";import"./index.esm-oVnV7Kme.js";import"./index-nrjwcTxi.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
