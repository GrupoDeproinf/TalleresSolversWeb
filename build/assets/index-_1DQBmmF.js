import{j as e}from"./index-539wkWb6.js";import{D as o}from"./DemoComponentApi-zVNeRGbL.js";import{D as r}from"./DemoLayout-YuP4ggXL.js";import{S as t}from"./SyntaxHighlighter-QnkWZTle.js";import"./index-vfq4_N5K.js";import"./index.esm-SfcosvjZ.js";import"./index-vEkyP9jl.js";import"./AdaptableCard-bbKlZ80X.js";import"./Card-3d2Ny-JF.js";import"./Views-NOUPq-xv.js";import"./Affix-QbeMlExd.js";import"./Button-lbbOHDaq.js";import"./context-GzcGESCG.js";import"./Tooltip-fVR4Pvc0.js";import"./index.esm-0CsLKNQK.js";import"./floating-ui.react-n50WnHyP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Z9EcYsrp.js";import"./motion-Orz9ojqj.js";import"./index.esm-OL94PTg3.js";import"./index-1cVp-vaj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
