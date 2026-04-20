import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface SessionState {
    signedIn: boolean
    token: string | null
    isLoading: boolean
}

const initialState: SessionState = {
    signedIn: false,
    token: null,
    isLoading: false,
}

const sessionSlice = createSlice({
    name: `${SLICE_BASE_NAME}/session`,
    initialState,
    reducers: {
        signInSuccess(state, action: PayloadAction<string>) {
            state.signedIn = true
            state.token = action.payload
        },
        setSessionLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        },
        signOutSuccess(state) {
            state.signedIn = false
            state.token = null
            state.isLoading = false
        },
    },
})

export const { signInSuccess, signOutSuccess, setSessionLoading } =
    sessionSlice.actions
export default sessionSlice.reducer
