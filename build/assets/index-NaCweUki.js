import{j as e}from"./index-O97KD1XJ.js";import{D as r}from"./DemoComponentApi-70Rn5dlJ.js";import{D as o}from"./DemoLayout-FTvUNpgu.js";import{S as t}from"./SyntaxHighlighter-sgYpcjyk.js";import"./index-rlKC0YRg.js";import"./index.esm-fVIXAgam.js";import"./index--8hiBZyK.js";import"./AdaptableCard-4InEVC4Z.js";import"./Card-pE1gTaeJ.js";import"./Views-iRCRASdY.js";import"./Affix-WCLmmWv0.js";import"./Button-n3c8cB2K.js";import"./context-BS4LvZM6.js";import"./Tooltip-XgU6s3I9.js";import"./index.esm-wnwH_6NS.js";import"./floating-ui.react-BJZwznw0.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-ZAnTfVAf.js";import"./motion-vruOJL_Y.js";import"./index.esm-MD-IZzhi.js";import"./index-kAodoiZN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
