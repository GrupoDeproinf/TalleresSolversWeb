import{j as e}from"./index-KnboTQIq.js";import{D as r}from"./DemoComponentApi-FKo7tNGw.js";import{D as o}from"./DemoLayout-saHBnoLJ.js";import{S as t}from"./SyntaxHighlighter-4yMiT8a9.js";import"./index-niGJkX_Y.js";import"./index.esm-NopCh8fs.js";import"./index-YwApo4nb.js";import"./AdaptableCard-_Kvk4qA9.js";import"./Card-ef-SYp7l.js";import"./Views-mE5zdYnK.js";import"./Affix-SxoWuek2.js";import"./Button-vkNvl7iW.js";import"./context-4hyaSNf_.js";import"./Tooltip-ZGOI2uxh.js";import"./index.esm-uLdRodHA.js";import"./floating-ui.react-78UvVOwk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7lhc11-b.js";import"./motion-eUZmQr1h.js";import"./index.esm-qDEWbWzU.js";import"./index-GZObyBO6.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
