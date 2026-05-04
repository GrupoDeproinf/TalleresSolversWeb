import{j as e}from"./index-xKsZ8l35.js";import{D as o}from"./DemoComponentApi-o8o4WmSh.js";import{D as r}from"./DemoLayout-njDmAs9i.js";import{S as t}from"./SyntaxHighlighter-_vqI2C9f.js";import"./index-ghUfQZjr.js";import"./index.esm-quO7oBH8.js";import"./index-FhQ8XXVG.js";import"./AdaptableCard-wYzy3Bvj.js";import"./Card-RMw-H-zQ.js";import"./Views-wIC69dCb.js";import"./Affix-uE8COQxo.js";import"./Button-YxCM68tE.js";import"./context-6_7T_3zC.js";import"./Tooltip-NDwm1HBW.js";import"./index.esm-ACeyYci_.js";import"./floating-ui.react-tuQVGGNH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-btnPQ0wi.js";import"./motion-jlOC7Xzp.js";import"./index.esm-HJEJ8FEu.js";import"./index-SZK8lSYa.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
