import{j as t}from"./index-14Zf3KpF.js";import{D as e}from"./DemoComponentApi-FLoZvF1h.js";import{D as o}from"./DemoLayout-HUSL1GCr.js";import{S as s}from"./SyntaxHighlighter-EGtpdf6p.js";import"./index-3BObJsDJ.js";import"./index.esm-tlmx5QOY.js";import"./index-M-3nUjXp.js";import"./AdaptableCard-bZc8g127.js";import"./Card-OFJMqrf6.js";import"./Views-rz_27Y7n.js";import"./Affix-SMQ9nWa8.js";import"./Button-lbg_hS91.js";import"./context-NuRkSskr.js";import"./Tooltip-PxOiAuea.js";import"./index.esm-cOK3YiHr.js";import"./floating-ui.react-rqxm2o5S.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xjj2bTFj.js";import"./motion-pKXwz-yX.js";import"./index.esm-2Nj3n_IK.js";import"./index-TgIVsgqN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
