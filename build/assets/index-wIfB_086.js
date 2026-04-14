import{j as t}from"./index-_ApK-q7i.js";import{D as e}from"./DemoComponentApi-tUFP8iJb.js";import{D as o}from"./DemoLayout-bPRUQ1cH.js";import{S as s}from"./SyntaxHighlighter-lx8N5tTC.js";import"./index-RPzHcFNN.js";import"./index.esm-526PTSiR.js";import"./index-ahp1cX6b.js";import"./AdaptableCard-ZvtbZBXx.js";import"./Card-ajus7HF1.js";import"./Views-TMbN6l_1.js";import"./Affix-B300VCNH.js";import"./Button-7wssbTrW.js";import"./context-c9HS1Vrm.js";import"./Tooltip-Ltwlgd3h.js";import"./index.esm-rAmnvJSt.js";import"./floating-ui.react-jYRpeG6P.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-wOxl9PUs.js";import"./motion-fHOwczjb.js";import"./index.esm-QmnQh55S.js";import"./index-4Cbk6KGY.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
