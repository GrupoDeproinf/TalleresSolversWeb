import{j as e}from"./index-KnboTQIq.js";import{D as o}from"./DemoComponentApi-FKo7tNGw.js";import{D as r}from"./DemoLayout-saHBnoLJ.js";import{S as t}from"./SyntaxHighlighter-4yMiT8a9.js";import"./index-niGJkX_Y.js";import"./index.esm-NopCh8fs.js";import"./index-YwApo4nb.js";import"./AdaptableCard-_Kvk4qA9.js";import"./Card-ef-SYp7l.js";import"./Views-mE5zdYnK.js";import"./Affix-SxoWuek2.js";import"./Button-vkNvl7iW.js";import"./context-4hyaSNf_.js";import"./Tooltip-ZGOI2uxh.js";import"./index.esm-uLdRodHA.js";import"./floating-ui.react-78UvVOwk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7lhc11-b.js";import"./motion-eUZmQr1h.js";import"./index.esm-qDEWbWzU.js";import"./index-GZObyBO6.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
