import{j as e}from"./index-D1MrS5xY.js";import{D as t}from"./DemoComponentApi-LOh212rE.js";import{D as o}from"./DemoLayout-H9Sqp6iu.js";import{S as r}from"./SyntaxHighlighter-4OjnlPcL.js";import"./index-MbLzU_Cs.js";import"./index.esm-T7MKHyVP.js";import"./index-sva1Rkyn.js";import"./AdaptableCard-PMlzgRML.js";import"./Card-8EgQUYhF.js";import"./Views-7KIxFcen.js";import"./Affix-ego_VAt5.js";import"./Button-a7ssyZMC.js";import"./context-tQTS5G38.js";import"./Tooltip-o3UBWBxC.js";import"./index.esm-9IgJ_EbT.js";import"./floating-ui.react-0MFFUaCH.js";import"./floating-ui.dom-0rLBacrf.js";import"./index-DglP9m2U.js";import"./motion-l3eyuBh1.js";import"./index.esm-p6Elkq3m.js";import"./index-5bgjMnor.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const i=()=>e.jsx(r,{language:"js",children:`import useMenuActive from '@/utils/hooks/useMenuActive'
import navigationConfig from '@/configs/navigation.config'
import { useSelector } from 'react-redux'

const Component = () => {

    const currentRouteKey = useSelector(state => state.base.common.currentRouteKey)

	const { activedRoute, includedRouteTree } = useMenuActive(navigationConfig, routeKey)

	return (...)
}
`}),a="UseMenuActiveDoc",n={title:"useMenuActive",desc:"useMenuActive helps to get navigation meta related with current route."},m=[{mdName:"Example",mdPath:a,title:"Example",desc:"",component:e.jsx(i,{})}],p=[{component:"useMenuActive",api:[{propName:"navTree",type:"<code>NavConfigMeta[]</code>",default:"-",desc:"Nav config tree"},{propName:"key",type:"<code>string</code>",default:"-",desc:"Current route key"}]}],c=e.jsx(t,{hideApiTitle:!0,keyText:"return",api:[{api:[{propName:"activedRoute",type:"<code>NavConfigMeta</code>",default:"-",desc:"NavConfigMeta that paired with current route key"},{propName:"includedRouteTree",type:"<code>NavConfigMeta</code>",default:"-",desc:"Root NavConfigMeta tree that included current route key"}]}]}),w=()=>e.jsx(o,{hideApiTitle:!0,hideFooter:!0,innerFrame:!1,header:n,demos:m,api:p,mdPrefixPath:"utils",extra:c,keyText:"param"});export{w as default};
