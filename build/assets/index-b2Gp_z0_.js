import{j as e}from"./index-H_SJxUeU.js";import{D as r}from"./DemoComponentApi-osBSW0m9.js";import{D as o}from"./DemoLayout-15j21vfX.js";import{S as t}from"./SyntaxHighlighter-wxILA_Ry.js";import"./index-6I3jupY8.js";import"./index.esm-btdTbd8Z.js";import"./index-4nxjES-T.js";import"./AdaptableCard-KWp_cZQb.js";import"./Card-f4k0xg6u.js";import"./Views-c4DnWJLZ.js";import"./Affix-y2GC7SVb.js";import"./Button-kEEMBmx5.js";import"./context-hQhleY2c.js";import"./Tooltip-H_zZqpZQ.js";import"./index.esm-h0-JemCa.js";import"./floating-ui.react-DVNBwuUg.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yCNZ8lcq.js";import"./motion-FHnWFy5I.js";import"./index.esm-8401eSNr.js";import"./index-zi7d0PRN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
