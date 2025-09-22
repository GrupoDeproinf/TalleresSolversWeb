import{j as e}from"./index-3IkpMvhw.js";import{D as t}from"./DemoComponentApi-cmJBvF2N.js";import{D as o}from"./DemoLayout-2qTRSusM.js";import{S as r}from"./SyntaxHighlighter-p_uAj12i.js";import"./index-lcKbu1WV.js";import"./index.esm-_rP08CZJ.js";import"./index-LzwFMNRR.js";import"./AdaptableCard-LoSVFvKm.js";import"./Card-Kmp1JZ8K.js";import"./Views-vkZwXWEA.js";import"./Affix-gjUM4zB5.js";import"./Button-uUgD1Isd.js";import"./context-_KlN2uti.js";import"./Tooltip-pBZGkNEN.js";import"./index.esm-HcdvCICo.js";import"./floating-ui.react-rtxm9hsq.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Qx-8tb_L.js";import"./motion-Ho6XhLxy.js";import"./index.esm-O3ADo3W0.js";import"./index-s_O6YLS3.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
