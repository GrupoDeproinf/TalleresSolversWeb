import{j as t}from"./index-KQFNJtc4.js";import{D as e}from"./DemoComponentApi--IKrKf-H.js";import{D as o}from"./DemoLayout-5i8Fn9l7.js";import{S as s}from"./SyntaxHighlighter-8DMt-r7j.js";import"./index-HK5HFBCm.js";import"./index.esm-ern5TROG.js";import"./index-VXFiPzRQ.js";import"./AdaptableCard-KBCkay_F.js";import"./Card-xLnaagij.js";import"./Views-aA243lDZ.js";import"./Affix-pYALYg0Y.js";import"./Button--D0tRVmb.js";import"./context-U4uJiOlk.js";import"./Tooltip-rFfMZWAg.js";import"./index.esm-ODZ_1Gk0.js";import"./floating-ui.react-gVU2UEvr.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-xIA8Eb8D.js";import"./motion-4MnqOKZu.js";import"./index.esm-jb16UrWF.js";import"./index-lFfMMwZ5.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
