import{j as t}from"./index-KuHpp12A.js";import{D as e}from"./DemoComponentApi-7noEPM_d.js";import{D as o}from"./DemoLayout-LNAzJo7H.js";import{S as s}from"./SyntaxHighlighter-x3Mxhuot.js";import"./index-boacLOhc.js";import"./index.esm-rGXFteFT.js";import"./index-ZJP3Cke8.js";import"./AdaptableCard-rw4ZbIDd.js";import"./Card-vm7RtGp9.js";import"./Views-na6mpSjV.js";import"./Affix-awK88hfJ.js";import"./Button-eyFfbJth.js";import"./context-7oHEF7cI.js";import"./Tooltip-dkuVUjr7.js";import"./index.esm-EUjj_JVu.js";import"./floating-ui.react-u3CjLYej.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-WMG8M0Yi.js";import"./motion-N0SAmF_z.js";import"./index.esm-kBL7sQe6.js";import"./index-v0Cy3ZU9.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
