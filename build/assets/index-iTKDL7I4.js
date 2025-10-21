import{j as t}from"./index-50rgKX9S.js";import{D as e}from"./DemoComponentApi-9CHMera2.js";import{D as o}from"./DemoLayout-SY0wuGyv.js";import{S as s}from"./SyntaxHighlighter-oOJMta1t.js";import"./index-X3G8Yg8B.js";import"./index.esm-BzTP7NzC.js";import"./index-5fWUxSe9.js";import"./AdaptableCard-LFMvjwtD.js";import"./Card-vqKpG-UA.js";import"./Views-A7x8nqpb.js";import"./Affix-LE9nnfuO.js";import"./Button-xRLYDkxn.js";import"./context-S2-woICp.js";import"./Tooltip-GIYbDsiP.js";import"./index.esm-opZQsgq7.js";import"./floating-ui.react-bRmrURkd.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-oREErx12.js";import"./motion-QExVqk61.js";import"./index.esm-CTp4r0U4.js";import"./index-q4uYtSHq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
