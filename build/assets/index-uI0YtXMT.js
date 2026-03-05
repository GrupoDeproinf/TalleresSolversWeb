import{j as t}from"./index-sqlzVTU6.js";import{D as e}from"./DemoComponentApi-WXpsOjn1.js";import{D as o}from"./DemoLayout-8mWBD9jQ.js";import{S as s}from"./SyntaxHighlighter-6acm_iIo.js";import"./index-cxHa2H3b.js";import"./index.esm-xcFhNsFj.js";import"./index-qJSJzGnC.js";import"./AdaptableCard-V0uxNSVw.js";import"./Card-nwu__Oi2.js";import"./Views-Xk2ztg4z.js";import"./Affix-ajaj60ys.js";import"./Button-UK-D34UO.js";import"./context-uUBq0g4n.js";import"./Tooltip-JKptW_vN.js";import"./index.esm-OyomaAaz.js";import"./floating-ui.react-VoN_T7V2.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-lbxTp4dY.js";import"./motion-u71o8l8w.js";import"./index.esm-vkxxgfhU.js";import"./index-BGgBYGq3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
