import{j as e}from"./index-NsbKStwV.js";import{D as t}from"./DemoComponentApi-ZTJgIuu-.js";import{D as i}from"./DemoLayout-loRHvrar.js";import{S as o}from"./SyntaxHighlighter-RVyAO-kN.js";import"./index-WaLOIBvG.js";import"./index.esm-orl39wdU.js";import"./index-9W1V2LMW.js";import"./AdaptableCard-YPt_Dofb.js";import"./Card-VqsFwQIo.js";import"./Views-I29_hvdt.js";import"./Affix-It3l-FrH.js";import"./Button-XnwKhdvE.js";import"./context-oRCGbGnv.js";import"./Tooltip-i9ud1ENZ.js";import"./index.esm-2Q-50ffC.js";import"./floating-ui.react-VCMzFDFm.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7Af8_Ef6.js";import"./motion-6wXtmffM.js";import"./index.esm-DPuKpfEd.js";import"./index-yS24mju4.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
