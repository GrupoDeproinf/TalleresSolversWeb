import{j as e}from"./index-50rgKX9S.js";import{D as t}from"./DemoComponentApi-9CHMera2.js";import{D as o}from"./DemoLayout-SY0wuGyv.js";import{S as r}from"./SyntaxHighlighter-oOJMta1t.js";import"./index-X3G8Yg8B.js";import"./index.esm-BzTP7NzC.js";import"./index-5fWUxSe9.js";import"./AdaptableCard-LFMvjwtD.js";import"./Card-vqKpG-UA.js";import"./Views-A7x8nqpb.js";import"./Affix-LE9nnfuO.js";import"./Button-xRLYDkxn.js";import"./context-S2-woICp.js";import"./Tooltip-GIYbDsiP.js";import"./index.esm-opZQsgq7.js";import"./floating-ui.react-bRmrURkd.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-oREErx12.js";import"./motion-QExVqk61.js";import"./index.esm-CTp4r0U4.js";import"./index-q4uYtSHq.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
