import{j as t}from"./index-NU55aeHu.js";import{D as e}from"./DemoComponentApi-ynNcguOj.js";import{D as o}from"./DemoLayout-SKCs7yKV.js";import{S as s}from"./SyntaxHighlighter-UtZjHk7N.js";import"./index-jHWBY7SI.js";import"./index.esm-mzOnvTgK.js";import"./index-XSYrKGIZ.js";import"./AdaptableCard-WL1-grzV.js";import"./Card-KU4tupdi.js";import"./Views-_qocjLuO.js";import"./Affix-qOx501Mh.js";import"./Button-X4YAxjf9.js";import"./context-mxvrTZY-.js";import"./Tooltip-nmCs6-RN.js";import"./index.esm-VZHp9jz5.js";import"./floating-ui.react-3j2FiDTw.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Sf2OyPxD.js";import"./motion-qvTSg2GE.js";import"./index.esm-SEqrhXUV.js";import"./index-9tkI9CBH.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

const Component = () => {

	const { authenticated, signIn, signOut } = useAuth()

	const handleSignIn = async ({ userName, password }) => {
	
		const result = await signIn({ userName, password })

		if (result.status === 'failed') {
			setMessage(result.message)
		}
	}

	const handleSignout = () => {
		signOut()
	}

	return (...)
}
`}),a="UseAuthDoc/",i={title:"useAuth",desc:"A hook that enables any component to get the current auth state."},n=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:t.jsx(r,{})}],m=t.jsx(e,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"authenticated",type:"<code>boolean</code>",default:"-",desc:"State of current authencation"},{propName:"signIn",type:"<code>({userName: string, password: string}) => ({status: 'success' | 'failed', message: string})</code>",default:"-",desc:"Sign in handler, return status & message as result"},{propName:"signOut",type:"<code>() => void</code>",default:"-",desc:"Sign out handler"}]}]}),C=()=>t.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:i,demos:n,mdPrefixPath:"utils",extra:m,keyText:"param"});export{C as default};
