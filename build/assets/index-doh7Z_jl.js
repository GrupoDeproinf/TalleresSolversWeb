import{j as e}from"./index-nE3qTmWJ.js";import{D as o}from"./DemoComponentApi-r_buyWw0.js";import{D as r}from"./DemoLayout-48Zmaz0q.js";import{S as t}from"./SyntaxHighlighter-WRXrPh9V.js";import"./index-qkYNi1s2.js";import"./index.esm-rJIJC5Wo.js";import"./index-D9LAS3yO.js";import"./AdaptableCard-IXAk-fG1.js";import"./Card-ofYhqojB.js";import"./Views-Wr9UmLiy.js";import"./Affix-Ng5hiQvt.js";import"./Button-mNwEcSfR.js";import"./context-aC9vqP51.js";import"./Tooltip-f_oot8L9.js";import"./index.esm-sCMYjrHG.js";import"./floating-ui.react-Yyq8XGry.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-FIhXA5AV.js";import"./motion-DI-APurt.js";import"./index.esm-JhChuggt.js";import"./index-RII3KDWx.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
