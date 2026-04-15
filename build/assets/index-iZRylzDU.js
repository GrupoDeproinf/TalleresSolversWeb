import{j as t}from"./index-ZuNEmVVx.js";import{D as e}from"./DemoComponentApi-sx-poHL7.js";import{D as o}from"./DemoLayout-ik6Z2SUb.js";import{S as s}from"./SyntaxHighlighter-KGCT-bYR.js";import"./index-uLtGwWpm.js";import"./index.esm-bBIQnT1a.js";import"./index-1EeQBmQG.js";import"./AdaptableCard-X95WZGfp.js";import"./Card-SNtW5iYw.js";import"./Views-NppcH7Yz.js";import"./Affix-Gsd9jZR2.js";import"./Button-q3uGp5Oh.js";import"./context-_rOU9DEt.js";import"./Tooltip-o4VLlIZb.js";import"./index.esm-eLbzTzcd.js";import"./floating-ui.react-sImFxmtW.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-5C2Pfpi6.js";import"./motion-G3vr1qIa.js";import"./index.esm-jRc9WQvP.js";import"./index-Jame8Dbd.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
