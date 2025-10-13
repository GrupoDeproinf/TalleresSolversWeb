import{j as e}from"./index-ABjXZzKD.js";import{D as r}from"./DemoComponentApi-C2YupdIe.js";import{D as o}from"./DemoLayout-zIqale2t.js";import{S as t}from"./SyntaxHighlighter-KAsxxSPo.js";import"./index-hoI5MYke.js";import"./index.esm-G4kMKpK9.js";import"./index-Laf2x-F-.js";import"./AdaptableCard-Guhgo30g.js";import"./Card-2Fe-_J3l.js";import"./Views-8W_pghrR.js";import"./Affix--cJn1oF2.js";import"./Button-PrF4gPDj.js";import"./context-q1VEwzUH.js";import"./Tooltip-ZcEA5Guw.js";import"./index.esm-X-60aNOT.js";import"./floating-ui.react-kp5fCW25.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-bFNXb1qC.js";import"./motion-LTaSieXW.js";import"./index.esm-eoTp6Zo3.js";import"./index-g0vaglUp.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
