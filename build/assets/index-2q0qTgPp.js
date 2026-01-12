import{j as e}from"./index-NU55aeHu.js";import{D as t}from"./DemoComponentApi-ynNcguOj.js";import{D as i}from"./DemoLayout-SKCs7yKV.js";import{S as o}from"./SyntaxHighlighter-UtZjHk7N.js";import"./index-jHWBY7SI.js";import"./index.esm-mzOnvTgK.js";import"./index-XSYrKGIZ.js";import"./AdaptableCard-WL1-grzV.js";import"./Card-KU4tupdi.js";import"./Views-_qocjLuO.js";import"./Affix-qOx501Mh.js";import"./Button-X4YAxjf9.js";import"./context-mxvrTZY-.js";import"./Tooltip-nmCs6-RN.js";import"./index.esm-VZHp9jz5.js";import"./floating-ui.react-3j2FiDTw.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Sf2OyPxD.js";import"./motion-qvTSg2GE.js";import"./index.esm-SEqrhXUV.js";import"./index-9tkI9CBH.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
