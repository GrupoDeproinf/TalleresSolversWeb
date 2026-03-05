import{j as e}from"./index-sqlzVTU6.js";import{D as r}from"./DemoComponentApi-WXpsOjn1.js";import{D as o}from"./DemoLayout-8mWBD9jQ.js";import{S as t}from"./SyntaxHighlighter-6acm_iIo.js";import"./index-cxHa2H3b.js";import"./index.esm-xcFhNsFj.js";import"./index-qJSJzGnC.js";import"./AdaptableCard-V0uxNSVw.js";import"./Card-nwu__Oi2.js";import"./Views-Xk2ztg4z.js";import"./Affix-ajaj60ys.js";import"./Button-UK-D34UO.js";import"./context-uUBq0g4n.js";import"./Tooltip-JKptW_vN.js";import"./index.esm-OyomaAaz.js";import"./floating-ui.react-VoN_T7V2.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-lbxTp4dY.js";import"./motion-u71o8l8w.js";import"./index.esm-vkxxgfhU.js";import"./index-BGgBYGq3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
