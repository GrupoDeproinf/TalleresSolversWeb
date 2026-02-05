import{j as e}from"./index-539wkWb6.js";import{D as t}from"./DemoComponentApi-zVNeRGbL.js";import{D as o}from"./DemoLayout-YuP4ggXL.js";import{S as r}from"./SyntaxHighlighter-QnkWZTle.js";import"./index-vfq4_N5K.js";import"./index.esm-SfcosvjZ.js";import"./index-vEkyP9jl.js";import"./AdaptableCard-bbKlZ80X.js";import"./Card-3d2Ny-JF.js";import"./Views-NOUPq-xv.js";import"./Affix-QbeMlExd.js";import"./Button-lbbOHDaq.js";import"./context-GzcGESCG.js";import"./Tooltip-fVR4Pvc0.js";import"./index.esm-0CsLKNQK.js";import"./floating-ui.react-n50WnHyP.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-Z9EcYsrp.js";import"./motion-Orz9ojqj.js";import"./index.esm-OL94PTg3.js";import"./index-1cVp-vaj.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
