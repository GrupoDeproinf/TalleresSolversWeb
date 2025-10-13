import{j as t}from"./index-ABjXZzKD.js";import{D as e}from"./DemoComponentApi-C2YupdIe.js";import{D as o}from"./DemoLayout-zIqale2t.js";import{S as s}from"./SyntaxHighlighter-KAsxxSPo.js";import"./index-hoI5MYke.js";import"./index.esm-G4kMKpK9.js";import"./index-Laf2x-F-.js";import"./AdaptableCard-Guhgo30g.js";import"./Card-2Fe-_J3l.js";import"./Views-8W_pghrR.js";import"./Affix--cJn1oF2.js";import"./Button-PrF4gPDj.js";import"./context-q1VEwzUH.js";import"./Tooltip-ZcEA5Guw.js";import"./index.esm-X-60aNOT.js";import"./floating-ui.react-kp5fCW25.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-bFNXb1qC.js";import"./motion-LTaSieXW.js";import"./index.esm-eoTp6Zo3.js";import"./index-g0vaglUp.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
