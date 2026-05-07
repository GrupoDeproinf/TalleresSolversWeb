import{j as t}from"./index-Qnh9Jyr7.js";import{D as e}from"./DemoComponentApi-MEDru7Kp.js";import{D as o}from"./DemoLayout-zsVWZ04_.js";import{S as s}from"./SyntaxHighlighter-5sPCiOH4.js";import"./index-LoMjNpbz.js";import"./index.esm-Je2zi_5L.js";import"./index-W_gRNgN6.js";import"./AdaptableCard-7Sd9Vpgd.js";import"./Card-w5dzWSUl.js";import"./Views-cwPCb2sQ.js";import"./Affix-RaisI0DK.js";import"./Button-fDHJYPn0.js";import"./context-5dhaVJa2.js";import"./Tooltip-R6t5aivA.js";import"./index.esm-GjjzXZUo.js";import"./floating-ui.react-qUL_HLkt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OtTUSv2B.js";import"./motion-oFB1E3pj.js";import"./index.esm-oVnV7Kme.js";import"./index-nrjwcTxi.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
