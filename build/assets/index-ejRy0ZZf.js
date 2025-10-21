import{j as e}from"./index-50rgKX9S.js";import{D as t}from"./DemoComponentApi-9CHMera2.js";import{D as i}from"./DemoLayout-SY0wuGyv.js";import{S as o}from"./SyntaxHighlighter-oOJMta1t.js";import"./index-X3G8Yg8B.js";import"./index.esm-BzTP7NzC.js";import"./index-5fWUxSe9.js";import"./AdaptableCard-LFMvjwtD.js";import"./Card-vqKpG-UA.js";import"./Views-A7x8nqpb.js";import"./Affix-LE9nnfuO.js";import"./Button-xRLYDkxn.js";import"./context-S2-woICp.js";import"./Tooltip-GIYbDsiP.js";import"./index.esm-opZQsgq7.js";import"./floating-ui.react-bRmrURkd.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-oREErx12.js";import"./motion-QExVqk61.js";import"./index.esm-CTp4r0U4.js";import"./index-q4uYtSHq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
