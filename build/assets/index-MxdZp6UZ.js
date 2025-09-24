import{j as t}from"./index-15sR2hcI.js";import{D as e}from"./DemoComponentApi-eqPc_NgO.js";import{D as o}from"./DemoLayout-cXVmXjXk.js";import{S as s}from"./SyntaxHighlighter-zwDPWW1e.js";import"./index-_AoI4hSc.js";import"./index.esm-NmTktVeB.js";import"./index-1XJReBnJ.js";import"./AdaptableCard-mtbjqd0n.js";import"./Card-Zg6jSWKE.js";import"./Views-dlAO8rPI.js";import"./Affix-wDCEcnYH.js";import"./Button-8f3-31O1.js";import"./context-3jl7jrYD.js";import"./Tooltip-JETBhhx_.js";import"./index.esm-yJD-bGj6.js";import"./floating-ui.react-AHIwqOdP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-og_L5k7n.js";import"./motion-JCtWUOno.js";import"./index.esm-7YOjLpfE.js";import"./index-dpskanKY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
