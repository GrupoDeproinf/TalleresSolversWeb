import{j as e}from"./index-iPBGd0jP.js";import{D as r}from"./DemoComponentApi-IWLNt3xg.js";import{D as o}from"./DemoLayout-7c9VNwm2.js";import{S as t}from"./SyntaxHighlighter-yU0WGUDl.js";import"./index-lupvUEqj.js";import"./index.esm-pDzRu5rN.js";import"./index-cwzhKvQG.js";import"./AdaptableCard-SuNPJiLp.js";import"./Card-any3pDMk.js";import"./Views-JmN_26On.js";import"./Affix-G-abYIfr.js";import"./Button-qbGHUbjU.js";import"./context-suePrQf5.js";import"./Tooltip-FcjdLHRu.js";import"./index.esm-WaLwlOAM.js";import"./floating-ui.react-gCkXl95_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7qxwMuxk.js";import"./motion-9yTXZEhO.js";import"./index.esm-xsyTc8bt.js";import"./index-Do6YuCsD.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
