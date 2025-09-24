import{j as t}from"./index-D1MrS5xY.js";import{D as e}from"./DemoComponentApi-LOh212rE.js";import{D as o}from"./DemoLayout-H9Sqp6iu.js";import{S as s}from"./SyntaxHighlighter-4OjnlPcL.js";import"./index-MbLzU_Cs.js";import"./index.esm-T7MKHyVP.js";import"./index-sva1Rkyn.js";import"./AdaptableCard-PMlzgRML.js";import"./Card-8EgQUYhF.js";import"./Views-7KIxFcen.js";import"./Affix-ego_VAt5.js";import"./Button-a7ssyZMC.js";import"./context-tQTS5G38.js";import"./Tooltip-o3UBWBxC.js";import"./index.esm-9IgJ_EbT.js";import"./floating-ui.react-0MFFUaCH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-DglP9m2U.js";import"./motion-l3eyuBh1.js";import"./index.esm-p6Elkq3m.js";import"./index-5bgjMnor.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
