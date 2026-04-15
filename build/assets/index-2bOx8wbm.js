import{j as e}from"./index-ZuNEmVVx.js";import{D as t}from"./DemoComponentApi-sx-poHL7.js";import{D as i}from"./DemoLayout-ik6Z2SUb.js";import{S as o}from"./SyntaxHighlighter-KGCT-bYR.js";import"./index-uLtGwWpm.js";import"./index.esm-bBIQnT1a.js";import"./index-1EeQBmQG.js";import"./AdaptableCard-X95WZGfp.js";import"./Card-SNtW5iYw.js";import"./Views-NppcH7Yz.js";import"./Affix-Gsd9jZR2.js";import"./Button-q3uGp5Oh.js";import"./context-_rOU9DEt.js";import"./Tooltip-o4VLlIZb.js";import"./index.esm-eLbzTzcd.js";import"./floating-ui.react-sImFxmtW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5C2Pfpi6.js";import"./motion-G3vr1qIa.js";import"./index.esm-jRc9WQvP.js";import"./index-Jame8Dbd.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
