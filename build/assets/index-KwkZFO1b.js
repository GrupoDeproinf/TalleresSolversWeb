import{j as t}from"./index-9t5KOHno.js";import{D as e}from"./DemoComponentApi-N41dBEGc.js";import{D as o}from"./DemoLayout-iwCSgSdG.js";import{S as s}from"./SyntaxHighlighter-dGysNVJv.js";import"./index-n0YNfJf4.js";import"./index.esm-mNZVPVzQ.js";import"./index-81440SWT.js";import"./AdaptableCard-AQPFOlT9.js";import"./Card-12GHa1Eq.js";import"./Views-UsKkkDUh.js";import"./Affix-1YOWKSSd.js";import"./Button-dbQf2eah.js";import"./context-bikMt5Q-.js";import"./Tooltip-RAyjLDPF.js";import"./index.esm-wUG74Yhm.js";import"./floating-ui.react-px5GD9H_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-1m9E763O.js";import"./motion-tHAU1tWQ.js";import"./index.esm-NU0RhjYe.js";import"./index-Ph93yIGB.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
