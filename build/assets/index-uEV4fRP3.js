import{j as e}from"./index-ZuNEmVVx.js";import{D as r}from"./DemoComponentApi-sx-poHL7.js";import{D as o}from"./DemoLayout-ik6Z2SUb.js";import{S as t}from"./SyntaxHighlighter-KGCT-bYR.js";import"./index-uLtGwWpm.js";import"./index.esm-bBIQnT1a.js";import"./index-1EeQBmQG.js";import"./AdaptableCard-X95WZGfp.js";import"./Card-SNtW5iYw.js";import"./Views-NppcH7Yz.js";import"./Affix-Gsd9jZR2.js";import"./Button-q3uGp5Oh.js";import"./context-_rOU9DEt.js";import"./Tooltip-o4VLlIZb.js";import"./index.esm-eLbzTzcd.js";import"./floating-ui.react-sImFxmtW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5C2Pfpi6.js";import"./motion-G3vr1qIa.js";import"./index.esm-jRc9WQvP.js";import"./index-Jame8Dbd.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
