import{j as e}from"./index-15sR2hcI.js";import{D as r}from"./DemoComponentApi-eqPc_NgO.js";import{D as o}from"./DemoLayout-cXVmXjXk.js";import{S as t}from"./SyntaxHighlighter-zwDPWW1e.js";import"./index-_AoI4hSc.js";import"./index.esm-NmTktVeB.js";import"./index-1XJReBnJ.js";import"./AdaptableCard-mtbjqd0n.js";import"./Card-Zg6jSWKE.js";import"./Views-dlAO8rPI.js";import"./Affix-wDCEcnYH.js";import"./Button-8f3-31O1.js";import"./context-3jl7jrYD.js";import"./Tooltip-JETBhhx_.js";import"./index.esm-yJD-bGj6.js";import"./floating-ui.react-AHIwqOdP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-og_L5k7n.js";import"./motion-JCtWUOno.js";import"./index.esm-7YOjLpfE.js";import"./index-dpskanKY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
