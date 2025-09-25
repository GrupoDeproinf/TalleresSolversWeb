import{j as e}from"./index-yOh4elUK.js";import{D as t}from"./DemoComponentApi-pKlVztF1.js";import{D as i}from"./DemoLayout-WZlUGBpO.js";import{S as o}from"./SyntaxHighlighter-oOlKxWcZ.js";import"./index-VaZYrBm8.js";import"./index.esm-EH5xtEO9.js";import"./index-02RnuBvO.js";import"./AdaptableCard-J542gM39.js";import"./Card-WaxYct8O.js";import"./Views-4xLEiuVY.js";import"./Affix-SGFB5J4m.js";import"./Button-ESr_rbs6.js";import"./context-zGpVC6c9.js";import"./Tooltip-V34zaYLt.js";import"./index.esm-POYYGs7h.js";import"./floating-ui.react-8CQFUeYv.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-jTss0mFi.js";import"./motion-GwjGJPSL.js";import"./index.esm-sS6Bh1cn.js";import"./index-E4eNJ87t.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
