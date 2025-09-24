import{j as e}from"./index-KQFNJtc4.js";import{S as t}from"./SyntaxHighlighter-8DMt-r7j.js";import{D as n}from"./DemoComponentApi--IKrKf-H.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";import"./index-HK5HFBCm.js";import"./index.esm-ern5TROG.js";import"./index-VXFiPzRQ.js";const l=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["We form our navigation structure as array of objects & render it into UI eventually. You can change or customize the app navigation very easily by accessing"," ",e.jsx("code",{children:"src/configs/navigation.config/index.ts"})]}),e.jsx("p",{children:"Here is the type for a single menu item"}),e.jsx(t,{language:"ts",children:`interface NavigationTree {
    key: string;
    path: string;
    isExternalLink?: boolean;
    title: string;
    translateKey: string;
    icon: string;
    type: 'title' | 'collapse' | 'item';
    authority: string[];
    subMenu: NavigationTree[];
}`}),e.jsx("br",{}),e.jsx(n,{hideApiTitle:!0,keyText:"properties",api:[{api:[{propName:"key",type:"<code>string</code></code>",default:"-",desc:"An unique key that need to be match with the route this menu navigate to"},{propName:"path",type:"<code>string</code>",default:"-",desc:"An URL that this menu item link to"},{propName:"isExternalLink",type:"<code>boolean</code>",default:"-",desc:"Whether to open link in new tab upon click"},{propName:"title",type:"<code>string</code>",default:"-",desc:"Rendered text of this menu item"},{propName:"translateKey",type:"<code>string</code>",default:"-",desc:"Translate key to translate the rendered text in menu item, fallback to <code>title</code> if empty or invalid"},{propName:"icon",type:"<code>string</code>",default:"-",desc:"Render icon in menu item, string value must tally with object key in <code>navigation-icon.config.tsx</code>"},{propName:"type",type:"<code>'title'</code>  | <code>'collapse'</code> | <code>'item'</code>",default:"-",desc:"To define the type of current menu item"},{propName:"authority",type:"<code>string[]</code>",default:"-",desc:"Display menu items to users who have the roles given, there will be no access block if the this field is undefine or empty array"},{propName:"authority",type:"<code>navigationConfig[]</code>",default:"-",desc:"Whether have child in this menu item, it will render a menu group under this menu item, if the <code>type</code> is <code>'title'</code> or <code>'collapse'</code>, this field accept properties within this table"}]}]}),e.jsx("p",{children:"An example of structured navigation config"}),e.jsx(t,{language:"ts",children:`const navigationConfig = [
    {
        key: 'uiComponent',
        path: '',
        title: 'Ui Component',
        translateKey: 'nav.uiComponents',
        icon: 'uiComponents',
        type: 'title',
        authority: ['admin', 'user'],
        subMenu: [
            {
                key: 'uiComponent.common',
                path: '',
                title: 'Common',
                translateKey: 'nav.uiComponentsCommon.common',
                icon: 'common',
                type: 'collapse',
                authority: ['admin', 'user'],
                subMenu: [
                    {
                        key: 'uiComponent.common.button',
                        path: '/button',
                        title: 'Button',
                        translateKey: 'nav.uiComponentsCommon.button',
                        icon: '',
                        type: 'item',
                        authority: ['admin', 'user'],
                        subMenu: []
                    },
                    {
                        key: 'uiComponent.common.typography',
                        path: '/typography',
                        title: 'Typography',
                        translateKey: 'nav.uiComponentsCommon.typography',
                        icon: '',
                        type: 'item',
                        authority: ['admin', 'user'],
                        subMenu: []
                    }
                ]
            }
        ]
    }
]`}),e.jsxs("div",{className:"mt-10",id:"configuringNavigationIcon",children:[e.jsx("h5",{children:"Configuring navigation icon"}),e.jsxs("p",{className:"mt-1",children:["Navigation icon configuration placed on seperate file in"," ",e.jsx("code",{children:"src/configs/navigation-icon.config.tsx"})]}),e.jsxs("p",{children:["In the above example, we use string value"," ",e.jsx("code",{children:"uiComponents"})," in the ",e.jsx("code",{children:"icon"})," field, we must then use this value in"," ",e.jsx("code",{children:"navigation-icon.config.ts"})," to define the icon for the callout."]}),e.jsxs("p",{children:["First, import the icon you want from"," ",e.jsx("a",{href:"https://react-icons.github.io/react-icons/",target:"_blank",rel:"noreferrer",children:"react-icons"})]}),e.jsx(t,{language:"ts",children:`import { FaBeer } from 'react-icons/fa'

const navigationIcon = {}
`}),e.jsxs("p",{children:["Set the value used in ",e.jsx("code",{children:"icon"})," field as & the imported icon component as value"]}),e.jsx(t,{language:"tsx",children:`import { FaBeer } from 'react-icons/fa'

const navigationIcon = {
    uiComponents: <FaBeer />
}
`}),e.jsxs("p",{children:["Now the corresponding menu item will render"," ",e.jsx("code",{children:"FaBeer"})," as the menu icon."]})]})]});export{l as default};
