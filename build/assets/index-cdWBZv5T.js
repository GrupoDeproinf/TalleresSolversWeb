import{j as e}from"./index-NE0lhnJe.js";import{D as t}from"./DemoComponentApi-yNFU_31E.js";import{D as o}from"./DemoLayout-8xVZIx3B.js";import{S as r}from"./SyntaxHighlighter-QjvwOn1d.js";import"./index-cCzbUbyn.js";import"./index.esm-XcQjK8we.js";import"./index-PfKOga0z.js";import"./AdaptableCard-Wg3oWL2m.js";import"./Card-4Itq99fL.js";import"./Views-RbBz5vWv.js";import"./Affix-wEe_pn0Y.js";import"./Button-8kVeD03n.js";import"./context-FskeaiM2.js";import"./Tooltip-FW8ZrPIo.js";import"./index.esm-OUfSdYNt.js";import"./floating-ui.react-dGl_1mDX.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-sZcIPUmP.js";import"./motion-Ruv7UFTr.js";import"./index.esm-LTy801Y9.js";import"./index-q1FPoc0-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
