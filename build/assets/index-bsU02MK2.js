import{j as t}from"./index-Nr7DOcs5.js";import{D as e}from"./DemoComponentApi-6zRb4_DW.js";import{D as o}from"./DemoLayout-TYFeUBFg.js";import{S as s}from"./SyntaxHighlighter-Lppmx1nC.js";import"./index-NkYS5vPG.js";import"./index.esm-7QtrnPrk.js";import"./index-nftdwZx5.js";import"./AdaptableCard-9_BPIhlC.js";import"./Card-GtPtNWmu.js";import"./Views-SzAC9t3D.js";import"./Affix-V3V6XeQW.js";import"./Button-RpRRBLhx.js";import"./context-gbG70jxa.js";import"./Tooltip-gLhVAyTO.js";import"./index.esm-ZAJo3edJ.js";import"./floating-ui.react-Siy9LDCN.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-c5JwgfFM.js";import"./motion-GODN01Pl.js";import"./index.esm-hDm5I03d.js";import"./index-YzJdvSvg.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
