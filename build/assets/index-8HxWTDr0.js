import{j as e}from"./index-14Zf3KpF.js";import{D as r}from"./DemoComponentApi-FLoZvF1h.js";import{D as o}from"./DemoLayout-HUSL1GCr.js";import{S as t}from"./SyntaxHighlighter-EGtpdf6p.js";import"./index-3BObJsDJ.js";import"./index.esm-tlmx5QOY.js";import"./index-M-3nUjXp.js";import"./AdaptableCard-bZc8g127.js";import"./Card-OFJMqrf6.js";import"./Views-rz_27Y7n.js";import"./Affix-SMQ9nWa8.js";import"./Button-lbg_hS91.js";import"./context-NuRkSskr.js";import"./Tooltip-PxOiAuea.js";import"./index.esm-cOK3YiHr.js";import"./floating-ui.react-rqxm2o5S.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xjj2bTFj.js";import"./motion-pKXwz-yX.js";import"./index.esm-2Nj3n_IK.js";import"./index-TgIVsgqN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
