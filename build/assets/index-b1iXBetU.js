import{j as e}from"./index-NU55aeHu.js";import{D as r}from"./DemoComponentApi-ynNcguOj.js";import{D as o}from"./DemoLayout-SKCs7yKV.js";import{S as t}from"./SyntaxHighlighter-UtZjHk7N.js";import"./index-jHWBY7SI.js";import"./index.esm-mzOnvTgK.js";import"./index-XSYrKGIZ.js";import"./AdaptableCard-WL1-grzV.js";import"./Card-KU4tupdi.js";import"./Views-_qocjLuO.js";import"./Affix-qOx501Mh.js";import"./Button-X4YAxjf9.js";import"./context-mxvrTZY-.js";import"./Tooltip-nmCs6-RN.js";import"./index.esm-VZHp9jz5.js";import"./floating-ui.react-3j2FiDTw.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Sf2OyPxD.js";import"./motion-qvTSg2GE.js";import"./index.esm-SEqrhXUV.js";import"./index-9tkI9CBH.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
