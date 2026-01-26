import{j as e}from"./index-h29nTG28.js";import{D as r}from"./DemoComponentApi-JzgMicK7.js";import{D as o}from"./DemoLayout-0Ok-VggY.js";import{S as t}from"./SyntaxHighlighter-C9Z-bFi9.js";import"./index-Qb2Rt7uY.js";import"./index.esm-x7L3bfOO.js";import"./index-51qiMPj3.js";import"./AdaptableCard-dq8zB7JO.js";import"./Card-72Kz4ZZm.js";import"./Views-tqoNXJJS.js";import"./Affix-wKRAzpUv.js";import"./Button-HN7QplVb.js";import"./context-lu_ZoR82.js";import"./Tooltip-keULPPQ7.js";import"./index.esm-WckmvPV8.js";import"./floating-ui.react-QHdoWf14.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Xq95uh32.js";import"./motion-2BfmWMAc.js";import"./index.esm-AU-9eZ_S.js";import"./index-hHSJtmdP.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
