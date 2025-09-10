import{j as e}from"./index-KuHpp12A.js";import{D as o}from"./DemoComponentApi-7noEPM_d.js";import{D as r}from"./DemoLayout-LNAzJo7H.js";import{S as t}from"./SyntaxHighlighter-x3Mxhuot.js";import"./index-boacLOhc.js";import"./index.esm-rGXFteFT.js";import"./index-ZJP3Cke8.js";import"./AdaptableCard-rw4ZbIDd.js";import"./Card-vm7RtGp9.js";import"./Views-na6mpSjV.js";import"./Affix-awK88hfJ.js";import"./Button-eyFfbJth.js";import"./context-7oHEF7cI.js";import"./Tooltip-dkuVUjr7.js";import"./index.esm-EUjj_JVu.js";import"./floating-ui.react-u3CjLYej.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-WMG8M0Yi.js";import"./motion-N0SAmF_z.js";import"./index.esm-kBL7sQe6.js";import"./index-v0Cy3ZU9.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import sortBy from '@/utils/sortBy'

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
