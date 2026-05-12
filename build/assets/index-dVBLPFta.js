import{j as e}from"./index-ObPtJ5w-.js";import{D as t}from"./DemoComponentApi-LQeNVhyV.js";import{D as o}from"./DemoLayout-R64NsCKc.js";import{S as r}from"./SyntaxHighlighter-8CPog4j7.js";import"./index-qux3biZ9.js";import"./index.esm-XBjgx9Fs.js";import"./index-EMwAswi2.js";import"./AdaptableCard-40aX91j5.js";import"./Card-MCAhbk3s.js";import"./Views-SgYqjPyv.js";import"./Affix-B17nTta9.js";import"./Button-vm4fJ4W7.js";import"./context-lkTBNAwK.js";import"./Tooltip-uwez-WWL.js";import"./index.esm-7WEKSPY1.js";import"./floating-ui.react-RMGTWhlp.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-SwJB8P6d.js";import"./motion-F2ImUn0a.js";import"./index.esm-AfzvVFOM.js";import"./index-zpjpykeE.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
