import{j as e}from"./index-N-1RluuA.js";import{D as t}from"./DemoComponentApi-x775CCjJ.js";import{D as i}from"./DemoLayout-ct69zWf6.js";import{S as o}from"./SyntaxHighlighter-O8JgOWdM.js";import"./index-kHevX6Xf.js";import"./index.esm--IdS3ikX.js";import"./index-F7dqYLcC.js";import"./AdaptableCard--kwp3Zb5.js";import"./Card-kRdnf6fx.js";import"./Views-jTGFnbRp.js";import"./Affix-tz3FBMPM.js";import"./Button-DL-xRWcd.js";import"./context-khs8ZuWg.js";import"./Tooltip-sewaCRiQ.js";import"./index.esm-Og_Wyf2u.js";import"./floating-ui.react-8ub5PJIZ.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-tC48GSbs.js";import"./motion-YE_afSFk.js";import"./index.esm-suDg3zH5.js";import"./index-yxOeA48F.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(o,{language:"js",children:`import { useState } from 'react'       
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
