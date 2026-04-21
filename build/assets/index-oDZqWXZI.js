import{j as e}from"./index-zDy8CJSv.js";import{D as r}from"./DemoComponentApi-PmAWVP9q.js";import{D as o}from"./DemoLayout-aTHta60v.js";import{S as t}from"./SyntaxHighlighter-J-vljlkn.js";import"./index-EhFY3FXZ.js";import"./index.esm-8oGGOvbw.js";import"./index-8GGQ_gkq.js";import"./AdaptableCard-9_XgOvg6.js";import"./Card-FPn1uwOm.js";import"./Views-flW81mru.js";import"./Affix-hArJOjjz.js";import"./Button-HfVDL6bK.js";import"./context-MajEoJBJ.js";import"./Tooltip-0_qZMJKE.js";import"./index.esm-PlBLKxwD.js";import"./floating-ui.react-fNLbRMMj.js";import"./floating-ui.dom-0rLBacrf.js";import"./index--31oHpxx.js";import"./motion-nXdFA5hx.js";import"./index.esm-CX28sAbI.js";import"./index-how8eNw-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsx(t,{language:"js",children:`import wildCardSearch from '@/utils/wildCardSearch'

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
