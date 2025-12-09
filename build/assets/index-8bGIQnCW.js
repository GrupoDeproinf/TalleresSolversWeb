import{j as t}from"./index-MXeuXt6D.js";import{D as e}from"./DemoComponentApi-Irwn1uIB.js";import{D as o}from"./DemoLayout-XoEn_4k-.js";import{S as s}from"./SyntaxHighlighter-YXTMy4M4.js";import"./index-hfXV9fO5.js";import"./index.esm-Nne6VUru.js";import"./index-KjETz4nL.js";import"./AdaptableCard-pBoZ8GaV.js";import"./Card-K535tOj0.js";import"./Views-YIa05gYP.js";import"./Affix-aX1zVhtC.js";import"./Button-vr5nYjWh.js";import"./context-CyHO4l0y.js";import"./Tooltip-tunHCYEK.js";import"./index.esm-tXvc1PCn.js";import"./floating-ui.react-diTN8vIO.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-TkOf27ZX.js";import"./motion-WWGuudfi.js";import"./index.esm-QY0V8pz3.js";import"./index-hI2o6F97.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
