// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCO-cOxWRR_JQ5RgKbBhObIGV4RhB_W5rM",
  authDomain: "talleressolvers.firebaseapp.com",
  projectId: "talleressolvers",
  storageBucket: "talleressolvers.appspot.com",
  messagingSenderId: "647071486584",
  appId: "1:647071486584:web:c0eb02fcb2b1553f25538d",
  measurementId: "G-XT3NPL3EKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
})
export const storage = getStorage(app);
export {auth, db }
