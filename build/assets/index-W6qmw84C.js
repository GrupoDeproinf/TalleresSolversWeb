import{j as e}from"./index-KQFNJtc4.js";import{D as t}from"./DemoComponentApi--IKrKf-H.js";import{D as i}from"./DemoLayout-5i8Fn9l7.js";import{S as o}from"./SyntaxHighlighter-8DMt-r7j.js";import"./index-HK5HFBCm.js";import"./index.esm-ern5TROG.js";import"./index-VXFiPzRQ.js";import"./AdaptableCard-KBCkay_F.js";import"./Card-xLnaagij.js";import"./Views-aA243lDZ.js";import"./Affix-pYALYg0Y.js";import"./Button--D0tRVmb.js";import"./context-U4uJiOlk.js";import"./Tooltip-rFfMZWAg.js";import"./index.esm-ODZ_1Gk0.js";import"./floating-ui.react-gVU2UEvr.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xIA8Eb8D.js";import"./motion-4MnqOKZu.js";import"./index.esm-jb16UrWF.js";import"./index-lFfMMwZ5.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
