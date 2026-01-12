import{j as e}from"./index-NU55aeHu.js";import{S as t}from"./SyntaxHighlighter-UtZjHk7N.js";import{A as s}from"./Alert-JKSYkUJa.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";import"./useTimeout-vIVNNRHO.js";import"./index.esm-SEqrhXUV.js";import"./CloseButton-oYZxTPd2.js";import"./StatusIcon-HiSXY8GV.js";import"./motion-qvTSg2GE.js";const u=()=>e.jsxs(e.Fragment,{children:[e.jsx("p",{children:"Follow the steps below to make backend api linkage working."}),e.jsxs("ol",{children:[e.jsx("li",{children:e.jsxs("p",{children:["Create a new service file specific to your feature or module. For example, if you are working on user management, create a file named"," ",e.jsx("code",{children:"UserManagementService.ts"})," in the services directory."]})}),e.jsxs("li",{children:[e.jsxs("p",{children:["Inside the service file, declare an asynchronous function that will handle the API request. This function should use the",e.jsx("code",{children:"ApiService.fetchData"})," method and accept two generic types: Response and Request along with",e.jsx("a",{href:"https://axios-http.com/docs/req_config",target:"_blank",rel:"noreferrer",children:"Axios config"}),"as parameter. It is recommended to specify these types while creating a new service. You can either directly pass the types to the",e.jsx("code",{children:"ApiService.fetchData"})," method. Here is an example:"]}),e.jsx(t,{language:"ts",children:`type MyApiResponse = {
    someResponseData: string
    someResponseData2: boolean
}

type MyApiRequest = {
    someRequestData: string
}

export async function myApi (data) {
    return ApiService.fetchData<MyApiResponse,MyApiRequest>({
        url: '/my-api-url',
        method: 'post',
        data
    })
}
...`}),e.jsx("p",{children:"or inherit them from the upper level:"}),e.jsx(t,{language:"ts",children:`import ApiService from "./ApiService"

export async function myApi<TResponse, TRequest>(data) {
    return ApiService.fetchData<TResponse, TRequest>({
        url: '/my-api-url',
        method: 'post',
        data
    })
}
...`})]}),e.jsxs("li",{children:[e.jsx("p",{children:"And now you can hook up this API in your component"}),e.jsx(t,{language:"tsx",children:`
type MyApiResponse = {
    someResponseData: string
    someResponseData2: boolean
}

type MyApiRequest = {
    someRequestData: string
}

import { myApi } from './MyService.ts'

const MyComponent = props => {

    const fetchData = async () => {
        const reqeustParam = { key: 'value'}
        try {
            const resp = await myApi<MyApiResponse, MyApiRequest>(reqeustParam)
            if (resp.data) {
                ...do something
            }
        } catch (errors) {
            ...handle errors
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
    ...
)`})]}),e.jsxs("li",{children:[e.jsxs("p",{children:["You can also use this service with"," ",e.jsx("code",{children:"createAsyncThunk"})]}),e.jsx(t,{language:"ts",children:`import { createSlice } from '@reduxjs/toolkit'
import { myApi } from './MyService.ts'

type RequestParam = {
    someRequestData: string
}

export const getApiData = createAsyncThunk('sliceName/getApiData',async (data: RequestParam) => {
    const response = await myApi(data)
    return response.data
})

const mySlice = createSlice({
    ...
    extraReducers: (builder) => {
        builder
            .addCase(getApiData.fulfilled, (state, action) => {
                ...
            })
    },
})

export const { someActionFromYourSlice } = yourSlice.actions

export default yourSlice.reducer`})]})]}),e.jsxs(s,{showIcon:!0,type:"info",title:"Note:",children:["If you want to connect API with your dev server, please change"," ",e.jsx("code",{children:"enableMock"})," to ",e.jsx("code",{children:"false"})," in"," ",e.jsx("code",{children:"src/configs/app.config.ts"})]}),e.jsxs("div",{className:"mt-10",id:"proxying",children:[e.jsx("h5",{children:"Proxying"}),e.jsx("p",{className:"mt-1",children:"Developer often consume API from different servers than the frontend application, there are complications that arise as a result of requests being sent across both servers, here is some way to setting up a proxy server."}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Add proxy package.json"}),e.jsx("p",{className:"mt-1",children:"A simple & quick solution to proxying a server"}),e.jsx(t,{language:"ts",children:'"proxy": "http:yourDevDomain.com"'})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Manually setup"}),e.jsxs("p",{className:"mt-1",children:["You can choose to setup with"," ",e.jsx("code",{children:"vite.config.ts"})," for more flexible configuration."]}),e.jsx(t,{language:"ts",children:`export default defineConfig({
    plugins: ...,
    server: {
        proxy: {
            '/api': {
                // config the target url based on your backend server
                target: 'http:yourDevDomain.com',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})`})]})]})]})]});export{u as default};
