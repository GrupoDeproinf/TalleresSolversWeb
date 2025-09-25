import{j as e}from"./index-yOh4elUK.js";import{D as r}from"./DemoComponentApi-pKlVztF1.js";import{D as o}from"./DemoLayout-WZlUGBpO.js";import{S as t}from"./SyntaxHighlighter-oOlKxWcZ.js";import"./index-VaZYrBm8.js";import"./index.esm-EH5xtEO9.js";import"./index-02RnuBvO.js";import"./AdaptableCard-J542gM39.js";import"./Card-WaxYct8O.js";import"./Views-4xLEiuVY.js";import"./Affix-SGFB5J4m.js";import"./Button-ESr_rbs6.js";import"./context-zGpVC6c9.js";import"./Tooltip-V34zaYLt.js";import"./index.esm-POYYGs7h.js";import"./floating-ui.react-8CQFUeYv.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-jTss0mFi.js";import"./motion-GwjGJPSL.js";import"./index.esm-sS6Bh1cn.js";import"./index-E4eNJ87t.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
