import{j as e}from"./index-c3tk-28l.js";import{D as o}from"./DemoComponentApi-I_losSoG.js";import{D as r}from"./DemoLayout-QyWGjLRg.js";import{S as t}from"./SyntaxHighlighter-2yd3lg-W.js";import"./index-uzExSQ8q.js";import"./index.esm-_F1MhDNx.js";import"./index-W2I2t87C.js";import"./AdaptableCard-oq4UoEMI.js";import"./Card-vDJQQwcv.js";import"./Views-CcnADSHN.js";import"./Affix-e-D77SLE.js";import"./Button-0ZytU0Lu.js";import"./context-aOzumP2l.js";import"./Tooltip-rw9f_jKc.js";import"./index.esm-U4ZUTPeh.js";import"./floating-ui.react-YZHDoCKW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OlbfkzwG.js";import"./motion-l21dNlMq.js";import"./index.esm-AbsWJ_Oy.js";import"./index-pUDB1hfI.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
