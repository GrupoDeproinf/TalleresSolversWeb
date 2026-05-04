import{j as e}from"./index-xKsZ8l35.js";import{D as t}from"./DemoComponentApi-o8o4WmSh.js";import{D as o}from"./DemoLayout-njDmAs9i.js";import{S as r}from"./SyntaxHighlighter-_vqI2C9f.js";import"./index-ghUfQZjr.js";import"./index.esm-quO7oBH8.js";import"./index-FhQ8XXVG.js";import"./AdaptableCard-wYzy3Bvj.js";import"./Card-RMw-H-zQ.js";import"./Views-wIC69dCb.js";import"./Affix-uE8COQxo.js";import"./Button-YxCM68tE.js";import"./context-6_7T_3zC.js";import"./Tooltip-NDwm1HBW.js";import"./index.esm-ACeyYci_.js";import"./floating-ui.react-tuQVGGNH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-btnPQ0wi.js";import"./motion-jlOC7Xzp.js";import"./index.esm-HJEJ8FEu.js";import"./index-SZK8lSYa.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
