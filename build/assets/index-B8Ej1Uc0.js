import{j as e}from"./index-3IkpMvhw.js";import{D as o}from"./DemoComponentApi-cmJBvF2N.js";import{D as r}from"./DemoLayout-2qTRSusM.js";import{S as t}from"./SyntaxHighlighter-p_uAj12i.js";import"./index-lcKbu1WV.js";import"./index.esm-_rP08CZJ.js";import"./index-LzwFMNRR.js";import"./AdaptableCard-LoSVFvKm.js";import"./Card-Kmp1JZ8K.js";import"./Views-vkZwXWEA.js";import"./Affix-gjUM4zB5.js";import"./Button-uUgD1Isd.js";import"./context-_KlN2uti.js";import"./Tooltip-pBZGkNEN.js";import"./index.esm-HcdvCICo.js";import"./floating-ui.react-rtxm9hsq.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Qx-8tb_L.js";import"./motion-Ho6XhLxy.js";import"./index.esm-O3ADo3W0.js";import"./index-s_O6YLS3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
