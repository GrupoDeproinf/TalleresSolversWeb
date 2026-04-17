import{j as e}from"./index-49VJK46O.js";import{D as o}from"./DemoComponentApi-m-e4sl8x.js";import{D as r}from"./DemoLayout-TsVDUC5b.js";import{S as t}from"./SyntaxHighlighter-y5msM8_j.js";import"./index-NND_QyzC.js";import"./index.esm-nNjcsMgN.js";import"./index-_TgZyloI.js";import"./AdaptableCard-P0GI32P2.js";import"./Card-x8Afl9LD.js";import"./Views-RQmIN1FY.js";import"./Affix-94zZobw2.js";import"./Button-bqI3GDyv.js";import"./context-JrpcaBA5.js";import"./Tooltip-OYDlPLoW.js";import"./index.esm-16-OZXRr.js";import"./floating-ui.react-ZAMaDPJk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-QIpWpgz1.js";import"./motion-Vp-thHGU.js";import"./index.esm-1z9Mj4Wf.js";import"./index-2dwt-Q1e.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
