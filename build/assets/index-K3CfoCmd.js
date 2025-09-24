import{j as e}from"./index-15sR2hcI.js";import{D as t}from"./DemoComponentApi-eqPc_NgO.js";import{D as i}from"./DemoLayout-cXVmXjXk.js";import{S as o}from"./SyntaxHighlighter-zwDPWW1e.js";import"./index-_AoI4hSc.js";import"./index.esm-NmTktVeB.js";import"./index-1XJReBnJ.js";import"./AdaptableCard-mtbjqd0n.js";import"./Card-Zg6jSWKE.js";import"./Views-dlAO8rPI.js";import"./Affix-wDCEcnYH.js";import"./Button-8f3-31O1.js";import"./context-3jl7jrYD.js";import"./Tooltip-JETBhhx_.js";import"./index.esm-yJD-bGj6.js";import"./floating-ui.react-AHIwqOdP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-og_L5k7n.js";import"./motion-JCtWUOno.js";import"./index.esm-7YOjLpfE.js";import"./index-dpskanKY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
