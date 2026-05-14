import{j as e}from"./index-S9gWAOhe.js";import{D as r}from"./DemoComponentApi-HhwW7XC_.js";import{D as o}from"./DemoLayout-CDxRlQgy.js";import{S as t}from"./SyntaxHighlighter-r0tNmJqa.js";import"./index-bbG1C4HF.js";import"./index.esm-llRLA_rx.js";import"./index-Gjm4fmPx.js";import"./AdaptableCard-yK5a-emR.js";import"./Card-g98i0nur.js";import"./Views-CFuOK5sp.js";import"./Affix-8RXZCQ1i.js";import"./Button-xPGJGWxb.js";import"./context-mAM1TfDV.js";import"./Tooltip-fN76mi7p.js";import"./index.esm-4lUq-luv.js";import"./floating-ui.react-lz-2OKBz.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-f1K2561U.js";import"./motion-fv6P95QN.js";import"./index.esm-Cv3nUxWT.js";import"./index-LLoxKMRq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

const arr = [
	{
		name: 'Carolyn Perkins',
		email: 'eileen_h@hotmail.com',
	},
	{
		name: 'Terrance Moreno',
		email: 'terrance_moreno@infotech.io',
	},
	{
		name: 'Ron Vargas',
		email: 'ronnie_vergas@infotech.io',
	},
	{
		name: 'Luke Cook',
		email: 'cookie_lukie@hotmail.com',
	},
]

const data = wildCardSearch(arr, 'Terran')

// output: [
//  {
// 		name: 'Terrance Moreno',
// 		email: 'terrance_moreno@infotech.io',
// 	},
// ]
`}),i="WildCardSearchDoc",m={title:"wildCardSearch",desc:"Wildcard search for array of object."},p=[{mdName:"Example",mdPath:i,title:"Example",desc:"",component:e.jsx(a,{})}],n=[{component:"wildCardSearch",api:[{propName:"list",type:"<code>Array&lt;T&gt;</code>",default:"-",desc:"Array of object"},{propName:"input",type:"<code>string</code>",default:"-",desc:"Keyword"}]}],c=e.jsx(r,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"result",type:"<code>Array&lt;T&gt;</code>",default:"-",desc:"Result array"}]}]}),b=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:p,api:n,mdPrefixPath:"utils",extra:c,keyText:"param"});export{b as default};
