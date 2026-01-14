import{j as o}from"./index-O97KD1XJ.js";import{D as e}from"./DemoComponentApi-70Rn5dlJ.js";import{D as t}from"./DemoLayout-FTvUNpgu.js";import{S as r}from"./SyntaxHighlighter-sgYpcjyk.js";import"./index-rlKC0YRg.js";import"./index.esm-fVIXAgam.js";import"./index--8hiBZyK.js";import"./AdaptableCard-4InEVC4Z.js";import"./Card-pE1gTaeJ.js";import"./Views-iRCRASdY.js";import"./Affix-WCLmmWv0.js";import"./Button-n3c8cB2K.js";import"./context-BS4LvZM6.js";import"./Tooltip-XgU6s3I9.js";import"./index.esm-wnwH_6NS.js";import"./floating-ui.react-BJZwznw0.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-ZAnTfVAf.js";import"./motion-vruOJL_Y.js";import"./index.esm-MD-IZzhi.js";import"./index-kAodoiZN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>o.jsx(r,{language:"js",children:`import useTwColorByName from '@/utils/hooks/useTwColorByName'

const Component = () => {

    const generateTwColor = useTwColorByName('bg')

	return (
        <div className={generateTwColor('John')}>...
    )
}
`}),m="UseTwColorByNameDoc",a={title:"useTwColorByName",desc:"useTwColorByName hook provide a random tailwind utilities color class generator according to the input string."},p=[{mdName:"Example",mdPath:m,title:"Example",desc:"",component:o.jsx(i,{})}],s=[{component:"useTwColorByName",api:[{propName:"prefix",type:"<code>string</code>",default:"<code>'bg'</code>",desc:"Prefix for tailwind color classes"}]}],n=o.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"generateTwColor",type:"<code>(name: string) => string</code>",default:"-",desc:"Generated a tailwind color class based on inputted param on hook & generateTwColor"}]}]}),H=()=>o.jsx(t,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:a,demos:p,api:s,mdPrefixPath:"utils",extra:n,keyText:"param"});export{H as default};
