import{j as t}from"./index-BDN-NirA.js";import{D as e}from"./DemoComponentApi-6mNcbgK2.js";import{D as o}from"./DemoLayout-mltW-eVK.js";import{S as s}from"./SyntaxHighlighter-WnFaBBqv.js";import"./index-QBN3JdOA.js";import"./index.esm-WGOkTBh9.js";import"./index-M60gcwBn.js";import"./AdaptableCard-GQtji-vL.js";import"./Card-ru8SSgle.js";import"./Views-D5n2Trj8.js";import"./Affix-amj0xHVW.js";import"./Button-6-9C-O8H.js";import"./context--qCY6-De.js";import"./Tooltip-poJdwxB8.js";import"./index.esm-GiNzBMsC.js";import"./floating-ui.react-REDD7Bey.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-nkwvr9YC.js";import"./motion-XTxZ_YMB.js";import"./index.esm-JVWMqiQz.js";import"./index-DuFQRDnk.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
