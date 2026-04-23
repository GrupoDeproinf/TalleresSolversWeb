import{j as e}from"./index-EISNSMds.js";import{D as t}from"./DemoComponentApi-OKMA84Tk.js";import{D as o}from"./DemoLayout-Rf6s_2zp.js";import{S as r}from"./SyntaxHighlighter-4JlvOwBQ.js";import"./index-iNCwCYd5.js";import"./index.esm-EL2hHlmT.js";import"./index-YX6prj96.js";import"./AdaptableCard-qHFClxH0.js";import"./Card-wEpj0U8y.js";import"./Views-cYTCqjtj.js";import"./Affix-KE2mXACa.js";import"./Button-lkK6fZcD.js";import"./context-Ogq3jpii.js";import"./Tooltip-qNULHPcL.js";import"./index.esm-V-D0jquW.js";import"./floating-ui.react-oIN8kvGt.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-mrgGKg7t.js";import"./motion-uEy6ONEe.js";import"./index.esm-YYnUCUNr.js";import"./index-NH-tiSqR.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
