import{j as e}from"./index-H_SJxUeU.js";import{S as n}from"./SyntaxHighlighter-wxILA_Ry.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const o=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["Solvers use"," ",e.jsx("a",{href:"https://react.i18next.com/",target:"_blank",rel:"noopener noreferrer",children:"react-i18next"})," ","for internationalization, you can find corresponding files can be found in ",e.jsx("code",{children:"src/locales/*"})]}),e.jsxs("div",{className:"mt-10",id:"translatingText",children:[e.jsx("h5",{children:"Translating text"}),e.jsxs("p",{className:"mt-1",children:["One of the simplest usage for translate text is using"," ",e.jsx("code",{children:"useTranslate"})," hook provided by react-i18next."]}),e.jsx(n,{language:"tsx",children:`import { useTranslation } from 'react-i18next'

const Component = () => {

    const { t } = useTranslation()

    return (
        <div>{t('your.translate.key')}</div>
    )
}

export default Component`})]}),e.jsxs("div",{className:"mt-10",id:"changingLanguage",children:[e.jsx("h5",{children:"Changing language"}),e.jsxs("p",{className:"mt-1",children:["You can also use ",e.jsx("code",{children:"useTranslate"})," hook to update the current language"]}),e.jsx(n,{language:"tsx",children:`import { useTranslation } from 'react-i18next'

const Component = () => {

    const { i18n } = useTranslation()

    return (
        <button onClick={() => i18n.changeLanguage('fr')}>Change language</button>
    )
}

export default Component`})]}),e.jsxs("div",{className:"mt-10",id:"addNewLocale",children:[e.jsx("h5",{children:"Add new locale"}),e.jsxs("p",{className:"mt-1",children:["We store all the locale data under"," ",e.jsx("code",{children:"src/locales/lang/*"}),". To add a new locale, create a Json file under this directory. For example"," ",e.jsx("code",{children:"fr.json"})]}),e.jsx(n,{language:"json",children:`{
    "your": {
        "translate": {
            "key": "votre clé de traduction"
        },
    }
}`}),e.jsxs("p",{children:["Now you can import this file into"," ",e.jsx("code",{children:"src/locales/index.ts"})," & inject them to"," ",e.jsx("code",{children:"resources"})," field, this is the entry file of all locales. Also, create an object to load date locale dynamically from"," ",e.jsx("a",{href:"https://github.com/iamkun/dayjs/tree/dev/src/locale",target:"_blank",rel:"noopener noreferrer",children:e.jsx("code",{children:"dayjs"})}),"."]}),e.jsx(n,{language:"ts",children:`import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './lang/en.json'
import fr from './lang/fr.json'

const resources = {
    en: {
        translation: en
    },
    fr: { // <--- this will be the value you use on changeLanguage method
        translation: fr
    },
}

// Consistent the key with resource to load relavant locale from day.js
export const dateLocales: {
    [key: string]: () => Promise<ILocale>;
} = {
    en: () => import('dayjs/locale/en'),
    fr: () => import('dayjs/locale/fr'),
}

`}),e.jsx("p",{children:"And, the new locale is basically set."})]}),e.jsxs("div",{className:"mt-10",id:"settingDefaultLanguage",children:[e.jsx("h5",{children:"Remove internationalization"}),e.jsxs("p",{className:"mt-1",children:["To set the default language, you might need to visit"," ",e.jsx("code",{children:"src/configs/app.config.ts"})," and change the"," ",e.jsx("code",{children:"locale"})," field value"]}),e.jsx(n,{language:"ts",children:`export const appConfig = {
    ...
    locale: 'fr'
}`})]})]});export{o as default};
