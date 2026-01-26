import{j as e}from"./index-h29nTG28.js";import{D as o}from"./DemoComponentApi-JzgMicK7.js";import{D as r}from"./DemoLayout-0Ok-VggY.js";import{S as t}from"./SyntaxHighlighter-C9Z-bFi9.js";import"./index-Qb2Rt7uY.js";import"./index.esm-x7L3bfOO.js";import"./index-51qiMPj3.js";import"./AdaptableCard-dq8zB7JO.js";import"./Card-72Kz4ZZm.js";import"./Views-tqoNXJJS.js";import"./Affix-wKRAzpUv.js";import"./Button-HN7QplVb.js";import"./context-lu_ZoR82.js";import"./Tooltip-keULPPQ7.js";import"./index.esm-WckmvPV8.js";import"./floating-ui.react-QHdoWf14.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Xq95uh32.js";import"./motion-2BfmWMAc.js";import"./index.esm-AU-9eZ_S.js";import"./index-hHSJtmdP.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
