import{j as t}from"./index-NE0lhnJe.js";import{D as e}from"./DemoComponentApi-yNFU_31E.js";import{D as o}from"./DemoLayout-8xVZIx3B.js";import{S as s}from"./SyntaxHighlighter-QjvwOn1d.js";import"./index-cCzbUbyn.js";import"./index.esm-XcQjK8we.js";import"./index-PfKOga0z.js";import"./AdaptableCard-Wg3oWL2m.js";import"./Card-4Itq99fL.js";import"./Views-RbBz5vWv.js";import"./Affix-wEe_pn0Y.js";import"./Button-8kVeD03n.js";import"./context-FskeaiM2.js";import"./Tooltip-FW8ZrPIo.js";import"./index.esm-OUfSdYNt.js";import"./floating-ui.react-dGl_1mDX.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-sZcIPUmP.js";import"./motion-Ruv7UFTr.js";import"./index.esm-LTy801Y9.js";import"./index-q1FPoc0-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
