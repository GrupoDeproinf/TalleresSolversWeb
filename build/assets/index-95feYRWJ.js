import{j as e}from"./index-N-1RluuA.js";import{D as o}from"./DemoComponentApi-x775CCjJ.js";import{D as r}from"./DemoLayout-ct69zWf6.js";import{S as t}from"./SyntaxHighlighter-O8JgOWdM.js";import"./index-kHevX6Xf.js";import"./index.esm--IdS3ikX.js";import"./index-F7dqYLcC.js";import"./AdaptableCard--kwp3Zb5.js";import"./Card-kRdnf6fx.js";import"./Views-jTGFnbRp.js";import"./Affix-tz3FBMPM.js";import"./Button-DL-xRWcd.js";import"./context-khs8ZuWg.js";import"./Tooltip-sewaCRiQ.js";import"./index.esm-Og_Wyf2u.js";import"./floating-ui.react-8ub5PJIZ.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-tC48GSbs.js";import"./motion-YE_afSFk.js";import"./index.esm-suDg3zH5.js";import"./index-yxOeA48F.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
