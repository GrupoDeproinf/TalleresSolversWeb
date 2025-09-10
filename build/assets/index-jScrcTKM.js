import{j as e}from"./index-KuHpp12A.js";import{D as t}from"./DemoComponentApi-7noEPM_d.js";import{D as o}from"./DemoLayout-LNAzJo7H.js";import{S as r}from"./SyntaxHighlighter-x3Mxhuot.js";import"./index-boacLOhc.js";import"./index.esm-rGXFteFT.js";import"./index-ZJP3Cke8.js";import"./AdaptableCard-rw4ZbIDd.js";import"./Card-vm7RtGp9.js";import"./Views-na6mpSjV.js";import"./Affix-awK88hfJ.js";import"./Button-eyFfbJth.js";import"./context-7oHEF7cI.js";import"./Tooltip-dkuVUjr7.js";import"./index.esm-EUjj_JVu.js";import"./floating-ui.react-u3CjLYej.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-WMG8M0Yi.js";import"./motion-N0SAmF_z.js";import"./index.esm-kBL7sQe6.js";import"./index-v0Cy3ZU9.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
