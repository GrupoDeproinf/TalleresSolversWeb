import{j as e}from"./index-MXeuXt6D.js";import{D as t}from"./DemoComponentApi-Irwn1uIB.js";import{D as o}from"./DemoLayout-XoEn_4k-.js";import{S as r}from"./SyntaxHighlighter-YXTMy4M4.js";import"./index-hfXV9fO5.js";import"./index.esm-Nne6VUru.js";import"./index-KjETz4nL.js";import"./AdaptableCard-pBoZ8GaV.js";import"./Card-K535tOj0.js";import"./Views-YIa05gYP.js";import"./Affix-aX1zVhtC.js";import"./Button-vr5nYjWh.js";import"./context-CyHO4l0y.js";import"./Tooltip-tunHCYEK.js";import"./index.esm-tXvc1PCn.js";import"./floating-ui.react-diTN8vIO.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-TkOf27ZX.js";import"./motion-WWGuudfi.js";import"./index.esm-QY0V8pz3.js";import"./index-hI2o6F97.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
