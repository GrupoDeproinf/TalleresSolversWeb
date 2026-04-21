import{j as e}from"./index-zDy8CJSv.js";import{D as t}from"./DemoComponentApi-PmAWVP9q.js";import{D as o}from"./DemoLayout-aTHta60v.js";import{S as r}from"./SyntaxHighlighter-J-vljlkn.js";import"./index-EhFY3FXZ.js";import"./index.esm-8oGGOvbw.js";import"./index-8GGQ_gkq.js";import"./AdaptableCard-9_XgOvg6.js";import"./Card-FPn1uwOm.js";import"./Views-flW81mru.js";import"./Affix-hArJOjjz.js";import"./Button-HfVDL6bK.js";import"./context-MajEoJBJ.js";import"./Tooltip-0_qZMJKE.js";import"./index.esm-PlBLKxwD.js";import"./floating-ui.react-fNLbRMMj.js";import"./floating-ui.dom-0rLBacrf.js";import"./index--31oHpxx.js";import"./motion-nXdFA5hx.js";import"./index.esm-CX28sAbI.js";import"./index-how8eNw-.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
