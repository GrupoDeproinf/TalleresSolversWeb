import{j as e}from"./index-CvzYHHyi.js";import{D as t}from"./DemoComponentApi-mXxAPZ-3.js";import{D as i}from"./DemoLayout-bFBRKV5K.js";import{S as o}from"./SyntaxHighlighter-vYeqY1Gw.js";import"./index-_6lqCWyf.js";import"./index.esm-iZHJToXl.js";import"./index-GYIUrbdE.js";import"./AdaptableCard-ME7InvBI.js";import"./Card-8kOVJnWG.js";import"./Views-IGpbAJRJ.js";import"./Affix-q2qfuq8j.js";import"./Button-RfidP847.js";import"./context-cQxpCbi0.js";import"./Tooltip-1BfvAuqv.js";import"./index.esm-ziONltnY.js";import"./floating-ui.react-g07vzxpC.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-w_0co_RM.js";import"./motion-s0hQdqSS.js";import"./index.esm-M47S76Wd.js";import"./index-sLTrG-jb.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
