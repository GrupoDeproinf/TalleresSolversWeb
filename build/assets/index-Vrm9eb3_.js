import{j as e}from"./index-NsbKStwV.js";import{D as t}from"./DemoComponentApi-ZTJgIuu-.js";import{D as o}from"./DemoLayout-loRHvrar.js";import{S as r}from"./SyntaxHighlighter-RVyAO-kN.js";import"./index-WaLOIBvG.js";import"./index.esm-orl39wdU.js";import"./index-9W1V2LMW.js";import"./AdaptableCard-YPt_Dofb.js";import"./Card-VqsFwQIo.js";import"./Views-I29_hvdt.js";import"./Affix-It3l-FrH.js";import"./Button-XnwKhdvE.js";import"./context-oRCGbGnv.js";import"./Tooltip-i9ud1ENZ.js";import"./index.esm-2Q-50ffC.js";import"./floating-ui.react-VCMzFDFm.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-7Af8_Ef6.js";import"./motion-6wXtmffM.js";import"./index.esm-DPuKpfEd.js";import"./index-yS24mju4.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
