import{j as e}from"./index-Qnh9Jyr7.js";import{D as r}from"./DemoComponentApi-MEDru7Kp.js";import{D as o}from"./DemoLayout-zsVWZ04_.js";import{S as t}from"./SyntaxHighlighter-5sPCiOH4.js";import"./index-LoMjNpbz.js";import"./index.esm-Je2zi_5L.js";import"./index-W_gRNgN6.js";import"./AdaptableCard-7Sd9Vpgd.js";import"./Card-w5dzWSUl.js";import"./Views-cwPCb2sQ.js";import"./Affix-RaisI0DK.js";import"./Button-fDHJYPn0.js";import"./context-5dhaVJa2.js";import"./Tooltip-R6t5aivA.js";import"./index.esm-GjjzXZUo.js";import"./floating-ui.react-qUL_HLkt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OtTUSv2B.js";import"./motion-oFB1E3pj.js";import"./index.esm-oVnV7Kme.js";import"./index-nrjwcTxi.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
