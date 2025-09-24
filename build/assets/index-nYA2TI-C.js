import{j as t}from"./index-iPBGd0jP.js";import{D as e}from"./DemoComponentApi-IWLNt3xg.js";import{D as o}from"./DemoLayout-7c9VNwm2.js";import{S as s}from"./SyntaxHighlighter-yU0WGUDl.js";import"./index-lupvUEqj.js";import"./index.esm-pDzRu5rN.js";import"./index-cwzhKvQG.js";import"./AdaptableCard-SuNPJiLp.js";import"./Card-any3pDMk.js";import"./Views-JmN_26On.js";import"./Affix-G-abYIfr.js";import"./Button-qbGHUbjU.js";import"./context-suePrQf5.js";import"./Tooltip-FcjdLHRu.js";import"./index.esm-WaLwlOAM.js";import"./floating-ui.react-gCkXl95_.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7qxwMuxk.js";import"./motion-9yTXZEhO.js";import"./index.esm-xsyTc8bt.js";import"./index-Do6YuCsD.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
