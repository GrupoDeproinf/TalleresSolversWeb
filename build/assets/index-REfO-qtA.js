import{j as e}from"./index-KQFNJtc4.js";import{D as r}from"./DemoComponentApi--IKrKf-H.js";import{D as o}from"./DemoLayout-5i8Fn9l7.js";import{S as t}from"./SyntaxHighlighter-8DMt-r7j.js";import"./index-HK5HFBCm.js";import"./index.esm-ern5TROG.js";import"./index-VXFiPzRQ.js";import"./AdaptableCard-KBCkay_F.js";import"./Card-xLnaagij.js";import"./Views-aA243lDZ.js";import"./Affix-pYALYg0Y.js";import"./Button--D0tRVmb.js";import"./context-U4uJiOlk.js";import"./Tooltip-rFfMZWAg.js";import"./index.esm-ODZ_1Gk0.js";import"./floating-ui.react-gVU2UEvr.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xIA8Eb8D.js";import"./motion-4MnqOKZu.js";import"./index.esm-jb16UrWF.js";import"./index-lFfMMwZ5.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
