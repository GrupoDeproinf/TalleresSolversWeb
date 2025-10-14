import{j as e}from"./index-sxY2vR_b.js";import{D as t}from"./DemoComponentApi-597voAgO.js";import{D as o}from"./DemoLayout-evFXGnBx.js";import{S as r}from"./SyntaxHighlighter-cbRe9zU-.js";import"./index-AN3niVhH.js";import"./index.esm-7rMJeW_p.js";import"./index-XOOicjk1.js";import"./AdaptableCard-oIjzq9rA.js";import"./Card-3z76uwgw.js";import"./Views-YxvfAhNX.js";import"./Affix-LcdOe-fz.js";import"./Button-gHfU8a9b.js";import"./context-ugtK0z0w.js";import"./Tooltip-tOnNgS6K.js";import"./index.esm-lAhGiBpp.js";import"./floating-ui.react-xh7t2hCc.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-beo0AS2x.js";import"./motion-h-3axnRn.js";import"./index.esm-cN1LGhJ4.js";import"./index-t_CREONj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
