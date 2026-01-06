import{j as e}from"./index-H_SJxUeU.js";import{D as t}from"./DemoComponentApi-osBSW0m9.js";import{D as o}from"./DemoLayout-15j21vfX.js";import{S as r}from"./SyntaxHighlighter-wxILA_Ry.js";import"./index-6I3jupY8.js";import"./index.esm-btdTbd8Z.js";import"./index-4nxjES-T.js";import"./AdaptableCard-KWp_cZQb.js";import"./Card-f4k0xg6u.js";import"./Views-c4DnWJLZ.js";import"./Affix-y2GC7SVb.js";import"./Button-kEEMBmx5.js";import"./context-hQhleY2c.js";import"./Tooltip-H_zZqpZQ.js";import"./index.esm-h0-JemCa.js";import"./floating-ui.react-DVNBwuUg.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-yCNZ8lcq.js";import"./motion-FHnWFy5I.js";import"./index.esm-8401eSNr.js";import"./index-zi7d0PRN.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
