import{j as e}from"./index-ObPtJ5w-.js";import{D as t}from"./DemoComponentApi-LQeNVhyV.js";import{D as i}from"./DemoLayout-R64NsCKc.js";import{S as o}from"./SyntaxHighlighter-8CPog4j7.js";import"./index-qux3biZ9.js";import"./index.esm-XBjgx9Fs.js";import"./index-EMwAswi2.js";import"./AdaptableCard-40aX91j5.js";import"./Card-MCAhbk3s.js";import"./Views-SgYqjPyv.js";import"./Affix-B17nTta9.js";import"./Button-vm4fJ4W7.js";import"./context-lkTBNAwK.js";import"./Tooltip-uwez-WWL.js";import"./index.esm-7WEKSPY1.js";import"./floating-ui.react-RMGTWhlp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-SwJB8P6d.js";import"./motion-F2ImUn0a.js";import"./index.esm-AfzvVFOM.js";import"./index-zpjpykeE.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
