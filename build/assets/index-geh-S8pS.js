import{j as e}from"./index-Nr7DOcs5.js";import{D as r}from"./DemoComponentApi-6zRb4_DW.js";import{D as o}from"./DemoLayout-TYFeUBFg.js";import{S as t}from"./SyntaxHighlighter-Lppmx1nC.js";import"./index-NkYS5vPG.js";import"./index.esm-7QtrnPrk.js";import"./index-nftdwZx5.js";import"./AdaptableCard-9_BPIhlC.js";import"./Card-GtPtNWmu.js";import"./Views-SzAC9t3D.js";import"./Affix-V3V6XeQW.js";import"./Button-RpRRBLhx.js";import"./context-gbG70jxa.js";import"./Tooltip-gLhVAyTO.js";import"./index.esm-ZAJo3edJ.js";import"./floating-ui.react-Siy9LDCN.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-c5JwgfFM.js";import"./motion-GODN01Pl.js";import"./index.esm-hDm5I03d.js";import"./index-YzJdvSvg.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
