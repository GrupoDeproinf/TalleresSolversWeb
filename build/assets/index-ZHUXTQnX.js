import{j as e}from"./index-0JW14Cl4.js";import{D as r}from"./DemoComponentApi-LpKabwDF.js";import{D as o}from"./DemoLayout-HouaRUoM.js";import{S as t}from"./SyntaxHighlighter-5ovYX9h5.js";import"./index-a8YK1BSZ.js";import"./index.esm-WNi23VL7.js";import"./index-QMiMCL-O.js";import"./AdaptableCard-zj0A6V2V.js";import"./Card-TuPZ2v2_.js";import"./Views-ArJd3jpj.js";import"./Affix-OBrB1uSN.js";import"./Button-D58LGLsw.js";import"./context-AxDKAhEU.js";import"./Tooltip-7ixFulgX.js";import"./index.esm-kYnGXkxy.js";import"./floating-ui.react-wwZWrrrF.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VwLHg0MV.js";import"./motion-AtCGOUgk.js";import"./index.esm-YV82YYEg.js";import"./index-Jck-JtMN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
