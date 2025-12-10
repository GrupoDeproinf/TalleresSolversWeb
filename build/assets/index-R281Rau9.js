import{j as t}from"./index-N-1RluuA.js";import{D as e}from"./DemoComponentApi-x775CCjJ.js";import{D as o}from"./DemoLayout-ct69zWf6.js";import{S as s}from"./SyntaxHighlighter-O8JgOWdM.js";import"./index-kHevX6Xf.js";import"./index.esm--IdS3ikX.js";import"./index-F7dqYLcC.js";import"./AdaptableCard--kwp3Zb5.js";import"./Card-kRdnf6fx.js";import"./Views-jTGFnbRp.js";import"./Affix-tz3FBMPM.js";import"./Button-DL-xRWcd.js";import"./context-khs8ZuWg.js";import"./Tooltip-sewaCRiQ.js";import"./index.esm-Og_Wyf2u.js";import"./floating-ui.react-8ub5PJIZ.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-tC48GSbs.js";import"./motion-YE_afSFk.js";import"./index.esm-suDg3zH5.js";import"./index-yxOeA48F.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
