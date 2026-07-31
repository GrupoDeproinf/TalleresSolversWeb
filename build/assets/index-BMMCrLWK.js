import{j as t}from"./index-c3tk-28l.js";import{D as e}from"./DemoComponentApi-I_losSoG.js";import{D as o}from"./DemoLayout-QyWGjLRg.js";import{S as s}from"./SyntaxHighlighter-2yd3lg-W.js";import"./index-uzExSQ8q.js";import"./index.esm-_F1MhDNx.js";import"./index-W2I2t87C.js";import"./AdaptableCard-oq4UoEMI.js";import"./Card-vDJQQwcv.js";import"./Views-CcnADSHN.js";import"./Affix-e-D77SLE.js";import"./Button-0ZytU0Lu.js";import"./context-aOzumP2l.js";import"./Tooltip-rw9f_jKc.js";import"./index.esm-U4ZUTPeh.js";import"./floating-ui.react-YZHDoCKW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-OlbfkzwG.js";import"./motion-l21dNlMq.js";import"./index.esm-AbsWJ_Oy.js";import"./index-pUDB1hfI.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
