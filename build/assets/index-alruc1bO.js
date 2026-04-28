import{j as e}from"./index-i5tZ9w0B.js";import{D as t}from"./DemoComponentApi-rFBrqraD.js";import{D as i}from"./DemoLayout--Uafjtvq.js";import{S as o}from"./SyntaxHighlighter-iisvH-O-.js";import"./index-In-3-usT.js";import"./index.esm-guJzrdD4.js";import"./index-JhteycRy.js";import"./AdaptableCard-qt538AVw.js";import"./Card-CwDS1Zw_.js";import"./Views-z8YYLW5b.js";import"./Affix-hwB1EW7o.js";import"./Button-k0QukaHj.js";import"./context-pREfq64o.js";import"./Tooltip-WqVpHr9d.js";import"./index.esm-qLdEDK2o.js";import"./floating-ui.react--XNwJF6E.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-XXrxu93K.js";import"./motion-UFI8jCfv.js";import"./index.esm-mCRUBiHB.js";import"./index-A1rv4gFB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
