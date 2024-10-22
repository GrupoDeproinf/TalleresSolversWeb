// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyB7JeVA4YZBzTblEOnZ-drNT-vwv085fgM',
    authDomain: 'talleres-solvers-app.firebaseapp.com',
    projectId: 'talleres-solvers-app',
    storageBucket: 'talleres-solvers-app.appspot.com',
    messagingSenderId: '144076824848',
    appId: '1:144076824848:web:cdaf60b28136561b338595',
    measurementId: 'G-DXQ986SLJR',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
})
export const storage = getStorage(app)
export { auth, db }
