import{j as e}from"./index-EISNSMds.js";import{D as o}from"./DemoComponentApi-OKMA84Tk.js";import{D as r}from"./DemoLayout-Rf6s_2zp.js";import{S as t}from"./SyntaxHighlighter-4JlvOwBQ.js";import"./index-iNCwCYd5.js";import"./index.esm-EL2hHlmT.js";import"./index-YX6prj96.js";import"./AdaptableCard-qHFClxH0.js";import"./Card-wEpj0U8y.js";import"./Views-cYTCqjtj.js";import"./Affix-KE2mXACa.js";import"./Button-lkK6fZcD.js";import"./context-Ogq3jpii.js";import"./Tooltip-qNULHPcL.js";import"./index.esm-V-D0jquW.js";import"./floating-ui.react-oIN8kvGt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-mrgGKg7t.js";import"./motion-uEy6ONEe.js";import"./index.esm-YYnUCUNr.js";import"./index-NH-tiSqR.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
