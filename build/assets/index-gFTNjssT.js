import{j as t}from"./index-yOh4elUK.js";import{D as e}from"./DemoComponentApi-pKlVztF1.js";import{D as o}from"./DemoLayout-WZlUGBpO.js";import{S as s}from"./SyntaxHighlighter-oOlKxWcZ.js";import"./index-VaZYrBm8.js";import"./index.esm-EH5xtEO9.js";import"./index-02RnuBvO.js";import"./AdaptableCard-J542gM39.js";import"./Card-WaxYct8O.js";import"./Views-4xLEiuVY.js";import"./Affix-SGFB5J4m.js";import"./Button-ESr_rbs6.js";import"./context-zGpVC6c9.js";import"./Tooltip-V34zaYLt.js";import"./index.esm-POYYGs7h.js";import"./floating-ui.react-8CQFUeYv.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-jTss0mFi.js";import"./motion-GwjGJPSL.js";import"./index.esm-sS6Bh1cn.js";import"./index-E4eNJ87t.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const r=()=>t.jsx(s,{language:"js",children:`import useAuth from '@/utils/hooks/useAuth'

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
