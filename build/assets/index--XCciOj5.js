import{j as e}from"./index-ZuNEmVVx.js";import{D as o}from"./DemoComponentApi-sx-poHL7.js";import{D as r}from"./DemoLayout-ik6Z2SUb.js";import{S as t}from"./SyntaxHighlighter-KGCT-bYR.js";import"./index-uLtGwWpm.js";import"./index.esm-bBIQnT1a.js";import"./index-1EeQBmQG.js";import"./AdaptableCard-X95WZGfp.js";import"./Card-SNtW5iYw.js";import"./Views-NppcH7Yz.js";import"./Affix-Gsd9jZR2.js";import"./Button-q3uGp5Oh.js";import"./context-_rOU9DEt.js";import"./Tooltip-o4VLlIZb.js";import"./index.esm-eLbzTzcd.js";import"./floating-ui.react-sImFxmtW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5C2Pfpi6.js";import"./motion-G3vr1qIa.js";import"./index.esm-jRc9WQvP.js";import"./index-Jame8Dbd.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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

const data = arr.sort(sortBy('name', false , (a) =>  a.toUpperCase()))

// output: [
// 	{
// 		name: 'Carolyn Perkins',
// 		email: 'eileen_h@hotmail.com',
// 	},
// 	{
// 		name: 'Luke Cook',
// 		email: 'cookie_lukie@hotmail.com',
// 	},
// 	{
// 		name: 'Ron Vargas',
// 		email: 'ronnie_vergas@infotech.io',
// 	},
//  {
// 		name: 'Terrance Moreno',
// 		email: 'terrance_moreno@infotech.io',
// 	},
// ]
`}),i="SortByDoc/",m={title:"sortBy",desc:"sortBy function able to sort array of object order with <code>array.sort</code> compare function by key."},n=[{mdName:"Example",mdPath:i,title:"Example",desc:"",component:e.jsx(a,{})}],c=[{component:"sortBy",api:[{propName:"field",type:"<code>string</code>",default:"-",desc:"key of the object that target to sort"},{propName:"reverse",type:"<code>boolean</code>",default:"-",desc:"Order of the result, <code>true</code> for descending, <code>false</code> for ascending"},{propName:"primer",type:"<code>(key: string) => (key) => void</code>",default:"-",desc:"Callback closure for key"}]}],s=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"result",type:"<code>(a, b) => boolean</code>",default:"-",desc:"Sort result callback"}]}]}),L=()=>e.jsx(r,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,api:c,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{L as default};
