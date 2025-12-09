import{j as e}from"./index-MXeuXt6D.js";import{D as r}from"./DemoComponentApi-Irwn1uIB.js";import{D as o}from"./DemoLayout-XoEn_4k-.js";import{S as t}from"./SyntaxHighlighter-YXTMy4M4.js";import"./index-hfXV9fO5.js";import"./index.esm-Nne6VUru.js";import"./index-KjETz4nL.js";import"./AdaptableCard-pBoZ8GaV.js";import"./Card-K535tOj0.js";import"./Views-YIa05gYP.js";import"./Affix-aX1zVhtC.js";import"./Button-vr5nYjWh.js";import"./context-CyHO4l0y.js";import"./Tooltip-tunHCYEK.js";import"./index.esm-tXvc1PCn.js";import"./floating-ui.react-diTN8vIO.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-TkOf27ZX.js";import"./motion-WWGuudfi.js";import"./index.esm-QY0V8pz3.js";import"./index-hI2o6F97.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
