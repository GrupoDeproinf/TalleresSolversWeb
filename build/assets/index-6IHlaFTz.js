import{j as e}from"./index-BDN-NirA.js";import{D as t}from"./DemoComponentApi-6mNcbgK2.js";import{D as o}from"./DemoLayout-mltW-eVK.js";import{S as r}from"./SyntaxHighlighter-WnFaBBqv.js";import"./index-QBN3JdOA.js";import"./index.esm-WGOkTBh9.js";import"./index-M60gcwBn.js";import"./AdaptableCard-GQtji-vL.js";import"./Card-ru8SSgle.js";import"./Views-D5n2Trj8.js";import"./Affix-amj0xHVW.js";import"./Button-6-9C-O8H.js";import"./context--qCY6-De.js";import"./Tooltip-poJdwxB8.js";import"./index.esm-GiNzBMsC.js";import"./floating-ui.react-REDD7Bey.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-nkwvr9YC.js";import"./motion-XTxZ_YMB.js";import"./index.esm-JVWMqiQz.js";import"./index-DuFQRDnk.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
