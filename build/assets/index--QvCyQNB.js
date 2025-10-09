import{j as t}from"./index-NsbKStwV.js";import{D as e}from"./DemoComponentApi-ZTJgIuu-.js";import{D as o}from"./DemoLayout-loRHvrar.js";import{S as s}from"./SyntaxHighlighter-RVyAO-kN.js";import"./index-WaLOIBvG.js";import"./index.esm-orl39wdU.js";import"./index-9W1V2LMW.js";import"./AdaptableCard-YPt_Dofb.js";import"./Card-VqsFwQIo.js";import"./Views-I29_hvdt.js";import"./Affix-It3l-FrH.js";import"./Button-XnwKhdvE.js";import"./context-oRCGbGnv.js";import"./Tooltip-i9ud1ENZ.js";import"./index.esm-2Q-50ffC.js";import"./floating-ui.react-VCMzFDFm.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7Af8_Ef6.js";import"./motion-6wXtmffM.js";import"./index.esm-DPuKpfEd.js";import"./index-yS24mju4.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
