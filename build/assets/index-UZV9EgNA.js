import{j as e}from"./index-3IkpMvhw.js";import{D as t}from"./DemoComponentApi-cmJBvF2N.js";import{D as i}from"./DemoLayout-2qTRSusM.js";import{S as o}from"./SyntaxHighlighter-p_uAj12i.js";import"./index-lcKbu1WV.js";import"./index.esm-_rP08CZJ.js";import"./index-LzwFMNRR.js";import"./AdaptableCard-LoSVFvKm.js";import"./Card-Kmp1JZ8K.js";import"./Views-vkZwXWEA.js";import"./Affix-gjUM4zB5.js";import"./Button-uUgD1Isd.js";import"./context-_KlN2uti.js";import"./Tooltip-pBZGkNEN.js";import"./index.esm-HcdvCICo.js";import"./floating-ui.react-rtxm9hsq.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Qx-8tb_L.js";import"./motion-Ho6XhLxy.js";import"./index.esm-O3ADo3W0.js";import"./index-s_O6YLS3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
