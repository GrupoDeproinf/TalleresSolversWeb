import{j as t}from"./index-O97KD1XJ.js";import{D as e}from"./DemoComponentApi-70Rn5dlJ.js";import{D as o}from"./DemoLayout-FTvUNpgu.js";import{S as s}from"./SyntaxHighlighter-sgYpcjyk.js";import"./index-rlKC0YRg.js";import"./index.esm-fVIXAgam.js";import"./index--8hiBZyK.js";import"./AdaptableCard-4InEVC4Z.js";import"./Card-pE1gTaeJ.js";import"./Views-iRCRASdY.js";import"./Affix-WCLmmWv0.js";import"./Button-n3c8cB2K.js";import"./context-BS4LvZM6.js";import"./Tooltip-XgU6s3I9.js";import"./index.esm-wnwH_6NS.js";import"./floating-ui.react-BJZwznw0.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-ZAnTfVAf.js";import"./motion-vruOJL_Y.js";import"./index.esm-MD-IZzhi.js";import"./index-kAodoiZN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
