import{j as e}from"./index-ATNefdVG.js";import{D as t}from"./DemoComponentApi-FyrH3ksG.js";import{D as o}from"./DemoLayout-6SVNet_Y.js";import{S as r}from"./SyntaxHighlighter-kInNipeJ.js";import"./index-1QBWWPtH.js";import"./index.esm-SLyUBwzt.js";import"./index-kSWsxBAA.js";import"./AdaptableCard-T7K6WEWc.js";import"./Card-OSPH2pm3.js";import"./Views-oxXEUsSY.js";import"./Affix-AZxOkwtW.js";import"./Button-m8cr7QK0.js";import"./context-GUUKwgTl.js";import"./Tooltip-RPBixJuV.js";import"./index.esm-6sKRXwnY.js";import"./floating-ui.react-6woUHVe8.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-LDVYzlxf.js";import"./motion-qY3QHwHT.js";import"./index.esm-RzyebFAI.js";import"./index-D5lh9mO-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
