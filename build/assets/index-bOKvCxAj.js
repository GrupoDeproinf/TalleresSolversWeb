import{j as e}from"./index-zN_cMCXj.js";import{D as t}from"./DemoComponentApi-3rUe8QU-.js";import{D as i}from"./DemoLayout-zgtRGiUG.js";import{S as o}from"./SyntaxHighlighter-wq9tsgxf.js";import"./index-8X2bHxJW.js";import"./index.esm-bWNlESX5.js";import"./index-JLBgVWbO.js";import"./AdaptableCard-Z9nht5s7.js";import"./Card-q0IeE3mQ.js";import"./Views-zD_Q7SBY.js";import"./Affix-eBh0j_EU.js";import"./Button-3FDHFgBt.js";import"./context-4K_It7vM.js";import"./Tooltip-TmV83Zem.js";import"./index.esm-qF4ozkmo.js";import"./floating-ui.react-NPg6DBrp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-e95nRWq5.js";import"./motion-TPlYCOYk.js";import"./index.esm-Wztopsom.js";import"./index-Aw7A1Eb2.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
