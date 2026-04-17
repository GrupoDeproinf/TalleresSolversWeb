import{j as e}from"./index-49VJK46O.js";import{D as t}from"./DemoComponentApi-m-e4sl8x.js";import{D as o}from"./DemoLayout-TsVDUC5b.js";import{S as r}from"./SyntaxHighlighter-y5msM8_j.js";import"./index-NND_QyzC.js";import"./index.esm-nNjcsMgN.js";import"./index-_TgZyloI.js";import"./AdaptableCard-P0GI32P2.js";import"./Card-x8Afl9LD.js";import"./Views-RQmIN1FY.js";import"./Affix-94zZobw2.js";import"./Button-bqI3GDyv.js";import"./context-JrpcaBA5.js";import"./Tooltip-OYDlPLoW.js";import"./index.esm-16-OZXRr.js";import"./floating-ui.react-ZAMaDPJk.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-QIpWpgz1.js";import"./motion-Vp-thHGU.js";import"./index.esm-1z9Mj4Wf.js";import"./index-2dwt-Q1e.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
