import{j as e}from"./index-NE0lhnJe.js";import{D as r}from"./DemoComponentApi-yNFU_31E.js";import{D as o}from"./DemoLayout-8xVZIx3B.js";import{S as t}from"./SyntaxHighlighter-QjvwOn1d.js";import"./index-cCzbUbyn.js";import"./index.esm-XcQjK8we.js";import"./index-PfKOga0z.js";import"./AdaptableCard-Wg3oWL2m.js";import"./Card-4Itq99fL.js";import"./Views-RbBz5vWv.js";import"./Affix-wEe_pn0Y.js";import"./Button-8kVeD03n.js";import"./context-FskeaiM2.js";import"./Tooltip-FW8ZrPIo.js";import"./index.esm-OUfSdYNt.js";import"./floating-ui.react-dGl_1mDX.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-sZcIPUmP.js";import"./motion-Ruv7UFTr.js";import"./index.esm-LTy801Y9.js";import"./index-q1FPoc0-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
