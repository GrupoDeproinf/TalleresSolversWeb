import{j as e}from"./index-O97KD1XJ.js";import{D as t}from"./DemoComponentApi-70Rn5dlJ.js";import{D as i}from"./DemoLayout-FTvUNpgu.js";import{S as o}from"./SyntaxHighlighter-sgYpcjyk.js";import"./index-rlKC0YRg.js";import"./index.esm-fVIXAgam.js";import"./index--8hiBZyK.js";import"./AdaptableCard-4InEVC4Z.js";import"./Card-pE1gTaeJ.js";import"./Views-iRCRASdY.js";import"./Affix-WCLmmWv0.js";import"./Button-n3c8cB2K.js";import"./context-BS4LvZM6.js";import"./Tooltip-XgU6s3I9.js";import"./index.esm-wnwH_6NS.js";import"./floating-ui.react-BJZwznw0.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-ZAnTfVAf.js";import"./motion-vruOJL_Y.js";import"./index.esm-MD-IZzhi.js";import"./index-kAodoiZN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
