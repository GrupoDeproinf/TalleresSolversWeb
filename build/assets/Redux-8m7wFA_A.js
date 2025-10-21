import{j as e}from"./index-50rgKX9S.js";import{S as t}from"./SyntaxHighlighter-oOJMta1t.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const a=()=>e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[e.jsx("a",{href:"https://redux.js.org/",target:"_blank",rel:"noreferrer",children:"Redux"})," ","is a popular application state management solution that can be integrated with front-end frameworks like React, it allows you to write scalable apps with maintainable codebases, however, using redux requires a lot of boilerplate code. To reduce the boilerplate codes and facilitate easier functionalities,"," ",e.jsx("a",{href:"https://redux-toolkit.js.org/",target:"_blank",rel:"noreferrer",children:"Redux toolkit (RTK)"})," ","is a better option, it comes with comes with built in Redux Thunk Middleware that use for asynchronous actions and standard way to writing Redux logic."]}),e.jsxs("p",{children:["You can find out Redux store configurations under"," ",e.jsx("code",{children:"src/store/"}),", there's also several slice globally used as following:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"theme"}),e.jsx("p",{className:"m-0",children:"This state handle all theme related data."})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"auth"}),e.jsx("p",{className:"m-0",children:"This state handles the app authentication info."})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"locale"}),e.jsx("p",{className:"m-0",children:"This state handles locale of the app."})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"base"}),e.jsx("p",{className:"m-0",children:"This state is a general app state, you can place any commonly used data here."})]})]}),e.jsxs("p",{children:["We also"," ",e.jsx("a",{href:"https://github.com/rt2zz/redux-persist",target:"_blank",rel:"noreferrer",children:"redux-persist"})," ","to keep ",e.jsx("code",{children:"auth"}),", ",e.jsx("code",{children:"theme"})," &"," ",e.jsx("code",{children:"locale"})," state alive in localStorage."]}),e.jsxs("div",{className:"mt-10",id:"codeSplitting",children:[e.jsx("h5",{children:"Code Splitting"}),e.jsx("p",{className:"mt-1",children:"We have implemented reducer injection approaches in our code base for a code splitting strategy, it can dynamically add reducers to the store when needed. Here is some example code for reducers registry:"}),e.jsx(t,{language:"ts",children:`// store/index.ts 
import { combineReducers } from '@reduxjs/toolkit'
import yourFirstSliceReducers, { YOUR_FIRST_SLICE_NAME } from './yourFirstSlice'
import yourSecondSliceReducers, { YOUR_SECOND_SLICE_NAME } from './yourSecondSlice'
import { useSelector } from 'react-redux'

import type { YourFirstSliceState } from './yourFirstSlice'
import type { YourSecondSliceState } from './yourSecondSlice'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const reducer = combineReducers({
    yourFirstStateKeyName: yourFirstSliceReducers,
    yourSecondStateKeyName: yourSecondSliceReducers
})

// create useAppSelector hook combining RootState & your new added state
export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [YOUR_FIRST_SLICE_NAME]: {
            yourFirstStateKeyName: YourFirstSliceState
        },
        [YOUR_SECOND_SLICE_NAME]: {
            yourSecondStateKeyName: YourSecondSliceState
        }
    }
> = useSelector

export * from './yourFirstSlice'
export * from './yourSecondSlice'
export { useAppDispatch } from '@/store'

export default reducer
`})]}),e.jsx("p",{children:"And then you can expose them to your components (we prefer the entry of your view component)"}),e.jsx(t,{language:"tsx",children:`import reducer, {
    someActionFromYourSlice,
    useAppDispatch,
    useAppSelector,
} from './store'
import { injectReducer } from '@/store'

injectReducer('yourReducerName', reducer)

const YourComponent = () => {

	const dispatch = useAppDispatch()

	// Use the useAppSelector hook to access the store state.
	const someStateFromYourSlice = useAppSelector((state) => state.yourReducerName.yourFirstStateKeyName.someState)

	useEffect(() => {
		// Use useAppDispatch hook to dispatch an action.
		dispatch(someActionFromYourSlice())
	}, [])

	return (
		<>{someStateFromYourSlice}</>
	)
}`}),e.jsxs("div",{className:"mt-10",id:"creatingNewSlice",children:[e.jsx("h5",{children:"Creating New Slice"}),e.jsx("p",{className:"mt-1",children:"Slice is a collection of reducer logic and actions for a single feature, hence we sugguest to place slice file under your features module folder for better logic scoping. Here is a basic example of a slice."}),e.jsx(t,{language:"ts",children:`import { createSlice } from '@reduxjs/toolkit'

export type SliceState = {
    someState: string
}

const initialState: SliceState = {
    someState: ''
}

export const SLICE_NAME = 'yourSliceName';

const yourSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {}
})

export default yourSlice.reducer`})]}),e.jsxs("div",{className:"mt-10",id:"creatingReduces",children:[e.jsx("h5",{children:"Creating a reducer"}),e.jsx("p",{className:"mt-1",children:"You can define your reducers in slice as following code:"}),e.jsx(t,{language:"ts",children:`import { createSlice } from '@reduxjs/toolkit'

export type SliceState = {
    someState: string
}

const initialState: SliceState = {
    someState: ''
}

export const SLICE_NAME = 'yourSliceName';

const yourSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        someActionFromYourSlice: (state, action) => {
            state.someState = action.payload
        },
    }
})

export default yourSlice.reducer`})]}),e.jsxs("div",{className:"mt-10",id:"asyncRequestsWithCreateAsyncThunk",children:[e.jsx("h5",{children:"Async Requests with createAsyncThunk"}),e.jsxs("p",{className:"mt-1",children:["You can also make an API request with"," ",e.jsx("code",{children:"createAsyncThunk"})," via extraReducers"]}),e.jsx(t,{language:"ts",children:`import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { someService } from '@/services/SomeService'

export type SliceState = {
    someState: string
    loading: boolean
}

type ApiResponse = {
    ...
}

type ApiRequest = {
    ...
}

export const SLICE_NAME = 'yourSliceName';

export const getApiData = createAsyncThunk(SLICE_NAME + '/getApiData',async (data: ApiRequest) => {
    // assume someService required reesponse & require type as generic
    const response = await someService<ApiResponse, ApiRequest>(data)
    return response.data
})

const initialState: SliceState = {
    someState: ''
    loading: false
}

const yourSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        someActionFromYourSlice: (state, action) => {
            state.someState = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getApiData.fulfilled, (state, action) => {
            state.someState = action.payload.someString
            state.loading = false
        })
        .addCase(getApiData.pending, (state) => {
            state.loading = true
        })
        .addCase(getApiData.rejected, (state) => {
            state.loading = false
        })
    },
})

export const { someActionFromYourSlice } = yourSlice.actions

export default yourSlice.reducer`})]}),e.jsxs("p",{children:["You can also study the"," ",e.jsx("a",{href:"https://redux-toolkit.js.org/",target:"_blank",rel:"noreferrer",children:"redux-toolkit"})," ","documentation to better understand if you are not familiar redux-toolkit."," "]}),e.jsxs("div",{className:"mt-10",id:"rtkQuery",children:[e.jsx("h5",{children:"RTK Query"}),e.jsxs("p",{className:"mt-1",children:["RTK Query is an exceptionally robust data fetching and caching tool along with Redux toolkit. In Solvers, we have further enhanced its functionality by encapsulating a pre-configured RTK Query setup within the"," ",e.jsx("code",{children:"src/service/RtkQueryService.ts"}),". If you prefer not to employ the useEffect hook for data fetching, you have the option to utilize the RtkQueryService and create an API instance within your slice."]}),e.jsx("p",{children:"Below is a simple example to demonstrate the implementation:"}),e.jsx(t,{language:"ts",children:`// yourSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import RtkQueryService from '@/services/RtkQueryService';

export type SliceState = {
    someState: string
}

type GetUserApiResponse = {
    ...
}

const initialState: SliceState = {
    someState: ''
}

export const SLICE_NAME = 'yourSliceName';

const getUserApi = RtkQueryService.injectEndpoints({
    endpoints: (build) => ({
        getUser: build.query<GetUserApiResponse, void>({
            query: () => (
                { 
                    // Specify the URL for the endpoint
                    url: '/crm/calendar', 
                    // Specify the method for the endpoint (GET, POST, PUT, etc.)
                    method: 'GET'
                }
            ),
        }),
    }),
}) 

const yourSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {}
})

export const { useGetUserQuery } = getUserApi

export default yourSlice.reducer`}),e.jsx(t,{language:"ts",children:`// YourComponent.tsx
import reducer, {
    useGetUserQuery 
} from './store'
import { injectReducer } from '@/store'

injectReducer('yourReducerName', reducer)

const YourComponent = () => {

	const { data, error, isLoading } = useGetUserQuery();

	return (
		<>
			{
				error && 'there was an error'
			}
			{
				isLoading && 'loading...'
			}
			{
				(data && !error && !isLoading) && <h1>data</h1>
			}
		</>
	)
}`}),e.jsxs("p",{children:["For more detailed information and additional examples, we recommend visiting the official RTK Query documentation site at"," ",e.jsx("a",{href:"https://redux-toolkit.js.org/rtk-query/overview",target:"_blank",rel:"noreferrer",children:"https://redux-toolkit.js.org/rtk-query/overview"})]})]})]});export{a as default};
