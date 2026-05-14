import{j as t}from"./index-S9gWAOhe.js";import{D as e}from"./DemoComponentApi-HhwW7XC_.js";import{D as o}from"./DemoLayout-CDxRlQgy.js";import{S as s}from"./SyntaxHighlighter-r0tNmJqa.js";import"./index-bbG1C4HF.js";import"./index.esm-llRLA_rx.js";import"./index-Gjm4fmPx.js";import"./AdaptableCard-yK5a-emR.js";import"./Card-g98i0nur.js";import"./Views-CFuOK5sp.js";import"./Affix-8RXZCQ1i.js";import"./Button-xPGJGWxb.js";import"./context-mAM1TfDV.js";import"./Tooltip-fN76mi7p.js";import"./index.esm-4lUq-luv.js";import"./floating-ui.react-lz-2OKBz.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-f1K2561U.js";import"./motion-fv6P95QN.js";import"./index.esm-Cv3nUxWT.js";import"./index-LLoxKMRq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
