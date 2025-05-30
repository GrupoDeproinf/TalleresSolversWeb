import{j as e}from"./index-_feUBWkF.js";import{D as o}from"./DemoComponentApi-QXiYjNvd.js";import{D as r}from"./DemoLayout-19EPW6T8.js";import{S as t}from"./SyntaxHighlighter-RGzVEGmi.js";import"./index--K6mHtPM.js";import"./index.esm-c6ShvaQW.js";import"./index-lvdI60UC.js";import"./AdaptableCard-CKf0cL3z.js";import"./Card-fXn1hgP9.js";import"./Views-NoPs0swz.js";import"./Affix-3HLokM4n.js";import"./Button-jcq0xEfh.js";import"./context-w88CtZWU.js";import"./Tooltip-tqY3hXOR.js";import"./index.esm-bIknb-8m.js";import"./floating-ui.react-AOig1bqs.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-C1ft9MxP.js";import"./motion-2zhnpuIh.js";import"./index.esm-CyL_iEBq.js";import"./index-Xr0iHSGr.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
