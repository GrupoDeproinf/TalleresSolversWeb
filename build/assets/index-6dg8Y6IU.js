import{j as e}from"./index-Nr7DOcs5.js";import{D as t}from"./DemoComponentApi-6zRb4_DW.js";import{D as o}from"./DemoLayout-TYFeUBFg.js";import{S as r}from"./SyntaxHighlighter-Lppmx1nC.js";import"./index-NkYS5vPG.js";import"./index.esm-7QtrnPrk.js";import"./index-nftdwZx5.js";import"./AdaptableCard-9_BPIhlC.js";import"./Card-GtPtNWmu.js";import"./Views-SzAC9t3D.js";import"./Affix-V3V6XeQW.js";import"./Button-RpRRBLhx.js";import"./context-gbG70jxa.js";import"./Tooltip-gLhVAyTO.js";import"./index.esm-ZAJo3edJ.js";import"./floating-ui.react-Siy9LDCN.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-c5JwgfFM.js";import"./motion-GODN01Pl.js";import"./index.esm-hDm5I03d.js";import"./index-YzJdvSvg.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
