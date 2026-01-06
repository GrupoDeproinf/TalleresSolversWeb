import{j as t}from"./index-52EgRySw.js";import{D as e}from"./DemoComponentApi-sIr3aP9t.js";import{D as o}from"./DemoLayout-49kyRumc.js";import{S as s}from"./SyntaxHighlighter-5yyrKh23.js";import"./index-iCLfkUHm.js";import"./index.esm-joVjrdv4.js";import"./index-tKVWlxOi.js";import"./AdaptableCard-8H-flceS.js";import"./Card-YX4I-iPW.js";import"./Views-Ea6uyAyT.js";import"./Affix-muUDTULJ.js";import"./Button-k9SRSx0b.js";import"./context-GNh3KNAT.js";import"./Tooltip-jn3cme1x.js";import"./index.esm-XI3tC7yo.js";import"./floating-ui.react-DnKrBTw-.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-VOrF6s14.js";import"./motion-4fqlWLTJ.js";import"./index.esm-l-LADNwI.js";import"./index-tM7rwq25.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
