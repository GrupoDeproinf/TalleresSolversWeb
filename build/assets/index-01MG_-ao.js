import{j as t}from"./index-ObPtJ5w-.js";import{D as e}from"./DemoComponentApi-LQeNVhyV.js";import{D as o}from"./DemoLayout-R64NsCKc.js";import{S as s}from"./SyntaxHighlighter-8CPog4j7.js";import"./index-qux3biZ9.js";import"./index.esm-XBjgx9Fs.js";import"./index-EMwAswi2.js";import"./AdaptableCard-40aX91j5.js";import"./Card-MCAhbk3s.js";import"./Views-SgYqjPyv.js";import"./Affix-B17nTta9.js";import"./Button-vm4fJ4W7.js";import"./context-lkTBNAwK.js";import"./Tooltip-uwez-WWL.js";import"./index.esm-7WEKSPY1.js";import"./floating-ui.react-RMGTWhlp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-SwJB8P6d.js";import"./motion-F2ImUn0a.js";import"./index.esm-AfzvVFOM.js";import"./index-zpjpykeE.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
