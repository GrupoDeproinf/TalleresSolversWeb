import{j as e}from"./index-zDy8CJSv.js";import{D as t}from"./DemoComponentApi-PmAWVP9q.js";import{D as i}from"./DemoLayout-aTHta60v.js";import{S as o}from"./SyntaxHighlighter-J-vljlkn.js";import"./index-EhFY3FXZ.js";import"./index.esm-8oGGOvbw.js";import"./index-8GGQ_gkq.js";import"./AdaptableCard-9_XgOvg6.js";import"./Card-FPn1uwOm.js";import"./Views-flW81mru.js";import"./Affix-hArJOjjz.js";import"./Button-HfVDL6bK.js";import"./context-MajEoJBJ.js";import"./Tooltip-0_qZMJKE.js";import"./index.esm-PlBLKxwD.js";import"./floating-ui.react-fNLbRMMj.js";import"./floating-ui.dom-0rLBacrf.js";import"./index--31oHpxx.js";import"./motion-nXdFA5hx.js";import"./index.esm-CX28sAbI.js";import"./index-how8eNw-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
