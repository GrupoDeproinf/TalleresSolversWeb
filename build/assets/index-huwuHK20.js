import{j as e}from"./index-1D3tZeRU.js";import{D as o}from"./DemoComponentApi-IiIr2ov9.js";import{D as r}from"./DemoLayout-9pcZBe_s.js";import{S as t}from"./SyntaxHighlighter-7ip3ydM7.js";import"./index-f0TC0RtX.js";import"./index.esm-1cw5D7XZ.js";import"./index-knWPyce5.js";import"./AdaptableCard-dp133X_9.js";import"./Card-m-8KTUb6.js";import"./Views-x404Dbvu.js";import"./Affix-y9PDXxYB.js";import"./Button-zoy55Mik.js";import"./context-pBL3AZft.js";import"./Tooltip-1iIiS6ws.js";import"./index.esm-wjn4G6Uw.js";import"./floating-ui.react-ppsVtD3w.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yjap_eDU.js";import"./motion-gAf0GThQ.js";import"./index.esm-a23T_XkR.js";import"./index-lwFb3tge.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
