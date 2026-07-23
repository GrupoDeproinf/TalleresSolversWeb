import{j as t}from"./index-1D3tZeRU.js";import{D as e}from"./DemoComponentApi-IiIr2ov9.js";import{D as o}from"./DemoLayout-9pcZBe_s.js";import{S as s}from"./SyntaxHighlighter-7ip3ydM7.js";import"./index-f0TC0RtX.js";import"./index.esm-1cw5D7XZ.js";import"./index-knWPyce5.js";import"./AdaptableCard-dp133X_9.js";import"./Card-m-8KTUb6.js";import"./Views-x404Dbvu.js";import"./Affix-y9PDXxYB.js";import"./Button-zoy55Mik.js";import"./context-pBL3AZft.js";import"./Tooltip-1iIiS6ws.js";import"./index.esm-wjn4G6Uw.js";import"./floating-ui.react-ppsVtD3w.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yjap_eDU.js";import"./motion-gAf0GThQ.js";import"./index.esm-a23T_XkR.js";import"./index-lwFb3tge.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
