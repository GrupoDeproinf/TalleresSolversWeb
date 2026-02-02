import{j as e}from"./index-JmHojjZF.js";import{D as t}from"./DemoComponentApi-GreJxXga.js";import{D as o}from"./DemoLayout-IAr37rdY.js";import{S as r}from"./SyntaxHighlighter-KEuVydnx.js";import"./index-ToqI7_Kp.js";import"./index.esm-kXaIV95b.js";import"./index-rEOp-HW-.js";import"./AdaptableCard-JGgv_ev8.js";import"./Card-IB018HxE.js";import"./Views-B7Axq-_H.js";import"./Affix-YceNC3yo.js";import"./Button-_U4vs34L.js";import"./context-sAlwGZHP.js";import"./Tooltip-2fc0Xghq.js";import"./index.esm-_q6RAcWH.js";import"./floating-ui.react-dnDtoXGa.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-BVb65nFb.js";import"./motion-d-XTyztW.js";import"./index.esm-fDGSM_mt.js";import"./index-phIxZ0Yy.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
