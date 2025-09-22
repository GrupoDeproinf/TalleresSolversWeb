import{j as t}from"./index-zN_cMCXj.js";import{D as e}from"./DemoComponentApi-3rUe8QU-.js";import{D as o}from"./DemoLayout-zgtRGiUG.js";import{S as s}from"./SyntaxHighlighter-wq9tsgxf.js";import"./index-8X2bHxJW.js";import"./index.esm-bWNlESX5.js";import"./index-JLBgVWbO.js";import"./AdaptableCard-Z9nht5s7.js";import"./Card-q0IeE3mQ.js";import"./Views-zD_Q7SBY.js";import"./Affix-eBh0j_EU.js";import"./Button-3FDHFgBt.js";import"./context-4K_It7vM.js";import"./Tooltip-TmV83Zem.js";import"./index.esm-qF4ozkmo.js";import"./floating-ui.react-NPg6DBrp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-e95nRWq5.js";import"./motion-TPlYCOYk.js";import"./index.esm-Wztopsom.js";import"./index-Aw7A1Eb2.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
