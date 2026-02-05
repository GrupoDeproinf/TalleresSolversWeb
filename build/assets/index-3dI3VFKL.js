import{j as e}from"./index-539wkWb6.js";import{D as t}from"./DemoComponentApi-zVNeRGbL.js";import{D as i}from"./DemoLayout-YuP4ggXL.js";import{S as o}from"./SyntaxHighlighter-QnkWZTle.js";import"./index-vfq4_N5K.js";import"./index.esm-SfcosvjZ.js";import"./index-vEkyP9jl.js";import"./AdaptableCard-bbKlZ80X.js";import"./Card-3d2Ny-JF.js";import"./Views-NOUPq-xv.js";import"./Affix-QbeMlExd.js";import"./Button-lbbOHDaq.js";import"./context-GzcGESCG.js";import"./Tooltip-fVR4Pvc0.js";import"./index.esm-0CsLKNQK.js";import"./floating-ui.react-n50WnHyP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Z9EcYsrp.js";import"./motion-Orz9ojqj.js";import"./index.esm-OL94PTg3.js";import"./index-1cVp-vaj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
