import{j as t}from"./index-H_SJxUeU.js";import{D as e}from"./DemoComponentApi-osBSW0m9.js";import{D as o}from"./DemoLayout-15j21vfX.js";import{S as s}from"./SyntaxHighlighter-wxILA_Ry.js";import"./index-6I3jupY8.js";import"./index.esm-btdTbd8Z.js";import"./index-4nxjES-T.js";import"./AdaptableCard-KWp_cZQb.js";import"./Card-f4k0xg6u.js";import"./Views-c4DnWJLZ.js";import"./Affix-y2GC7SVb.js";import"./Button-kEEMBmx5.js";import"./context-hQhleY2c.js";import"./Tooltip-H_zZqpZQ.js";import"./index.esm-h0-JemCa.js";import"./floating-ui.react-DVNBwuUg.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yCNZ8lcq.js";import"./motion-FHnWFy5I.js";import"./index.esm-8401eSNr.js";import"./index-zi7d0PRN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
