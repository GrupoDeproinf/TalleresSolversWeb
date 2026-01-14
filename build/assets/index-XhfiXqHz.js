import{j as e}from"./index-0JW14Cl4.js";import{D as o}from"./DemoComponentApi-LpKabwDF.js";import{D as r}from"./DemoLayout-HouaRUoM.js";import{S as t}from"./SyntaxHighlighter-5ovYX9h5.js";import"./index-a8YK1BSZ.js";import"./index.esm-WNi23VL7.js";import"./index-QMiMCL-O.js";import"./AdaptableCard-zj0A6V2V.js";import"./Card-TuPZ2v2_.js";import"./Views-ArJd3jpj.js";import"./Affix-OBrB1uSN.js";import"./Button-D58LGLsw.js";import"./context-AxDKAhEU.js";import"./Tooltip-7ixFulgX.js";import"./index.esm-kYnGXkxy.js";import"./floating-ui.react-wwZWrrrF.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VwLHg0MV.js";import"./motion-AtCGOUgk.js";import"./index.esm-YV82YYEg.js";import"./index-Jck-JtMN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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

const data = arr.sort(sortBy('name', false , (a) =>  a.toUpperCase()))

// output: [
// 	{
// 		name: 'Carolyn Perkins',
// 		email: 'eileen_h@hotmail.com',
// 	},
// 	{
// 		name: 'Luke Cook',
// 		email: 'cookie_lukie@hotmail.com',
// 	},
// 	{
// 		name: 'Ron Vargas',
// 		email: 'ronnie_vergas@infotech.io',
// 	},
//  {
// 		name: 'Terrance Moreno',
// 		email: 'terrance_moreno@infotech.io',
// 	},
// ]
`}),i="SortByDoc/",m={title:"sortBy",desc:"sortBy function able to sort array of object order with <code>array.sort</code> compare function by key."},n=[{mdName:"Example",mdPath:i,title:"Example",desc:"",component:e.jsx(a,{})}],c=[{component:"sortBy",api:[{propName:"field",type:"<code>string</code>",default:"-",desc:"key of the object that target to sort"},{propName:"reverse",type:"<code>boolean</code>",default:"-",desc:"Order of the result, <code>true</code> for descending, <code>false</code> for ascending"},{propName:"primer",type:"<code>(key: string) => (key) => void</code>",default:"-",desc:"Callback closure for key"}]}],s=e.jsx(o,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"result",type:"<code>(a, b) => boolean</code>",default:"-",desc:"Sort result callback"}]}]}),L=()=>e.jsx(r,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:m,demos:n,api:c,mdPrefixPath:"docs/SharedComponentsDoc/components",extra:s,keyText:"param"});export{L as default};
