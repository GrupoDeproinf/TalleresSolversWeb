import{j as e}from"./index-KnboTQIq.js";import{D as t}from"./DemoComponentApi-FKo7tNGw.js";import{D as i}from"./DemoLayout-saHBnoLJ.js";import{S as o}from"./SyntaxHighlighter-4yMiT8a9.js";import"./index-niGJkX_Y.js";import"./index.esm-NopCh8fs.js";import"./index-YwApo4nb.js";import"./AdaptableCard-_Kvk4qA9.js";import"./Card-ef-SYp7l.js";import"./Views-mE5zdYnK.js";import"./Affix-SxoWuek2.js";import"./Button-vkNvl7iW.js";import"./context-4hyaSNf_.js";import"./Tooltip-ZGOI2uxh.js";import"./index.esm-uLdRodHA.js";import"./floating-ui.react-78UvVOwk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7lhc11-b.js";import"./motion-eUZmQr1h.js";import"./index.esm-qDEWbWzU.js";import"./index-GZObyBO6.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
