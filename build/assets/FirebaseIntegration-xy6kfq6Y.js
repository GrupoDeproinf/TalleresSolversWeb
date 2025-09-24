import{j as e}from"./index-D1MrS5xY.js";import{S as s}from"./SyntaxHighlighter-4OjnlPcL.js";import"./toConsumableArray-YYxflNc8.js";import"./objectWithoutPropertiesLoose-pdUxmcoj.js";const o=()=>e.jsxs(e.Fragment,{children:[e.jsx("p",{children:"Firebase is a platform developed by Google for creating mobile and web applications. It offers various tools and services such as authentication, real-time database, cloud storage, hosting, and more, which known as a backend as service."}),e.jsx("p",{children:"While our template doesn't have Firebase integration pre-built, we've noticed a high demand from our customers for it. As a result, we've put together a straightforward auth integration tutorial to help you seamlessly incorporate Firebase into the template."}),e.jsxs("div",{className:"mt-10",id:"prerequisites",children:[e.jsx("h5",{children:"Prerequisites"}),e.jsxs("ul",{className:"mt-1",children:[e.jsxs("li",{children:[e.jsx("p",{children:"A Firebase project created on the Firebase Console."}),e.jsxs("ol",{children:[e.jsxs("li",{children:["Go to the ",e.jsx("a",{target:"_new",href:"https://console.firebase.google.com/",children:"Firebase Console"})," and create a new project."]}),e.jsx("li",{children:'Once the project is created, click on the "Web" option to add a web app to your project.'}),e.jsx("li",{children:"Follow the instructions to register the app and obtain the Firebase configuration object."})]})]}),e.jsxs("li",{children:[e.jsx("p",{children:"Install Firebase SDK and its dependencies using npm."}),e.jsx(s,{language:"js",children:"npm install firebase"})]})]})]}),e.jsxs("div",{className:"mt-10",id:"initialize-firebase",children:[e.jsx("h5",{children:"Initialize Firebase"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsxs("p",{children:["In your template directory, go ahead and create a file named ",e.jsx("code",{children:"firebase.config.ts"})," within the ",e.jsx("code",{children:"/configs"})," directory. Put your Firebase configuration details in this file (you can find this information in your Firebase account). It's best practice to store these values in a ",e.jsx("code",{children:".env"})," file."]}),e.jsx(s,{language:"js",children:`const firebaseConfig = {
    apiKey: 'xxxxxxx',
    authDomain: 'yourApp.firebaseapp.com',
    databaseURL: 'https://yourApp.firebaseio.com',
    projectId: 'yourApp',
    storageBucket: 'yourApp.appspot.com',
    messagingSenderId: 'xxxxxxx',
    appId: 'xxxxxx',
    measurementId: 'xxxxx'
};

export default firebaseConfig`})]}),e.jsxs("li",{children:[e.jsxs("p",{children:["Create a Firebase entry in your ",e.jsx("code",{children:"/src"})," directory. You can do this by adding a file named firebase.ts"]}),e.jsx(s,{language:"js",children:`import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore/lite'
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import firebaseConfig from '@/configs/firebase.config'

const firebaseApp = initializeApp(firebaseConfig)

const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)
const currentUser = auth.currentUser

export {
    db,
    auth,
    currentUser,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
}`})]})]})]}),e.jsxs("div",{className:"mt-10",id:"integrating-firebase",children:[e.jsx("h5",{children:"Start integrating Firebase"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsxs("p",{children:["Open ",e.jsx("code",{children:"AuthService.ts"})," under ",e.jsx("code",{children:"/services"})," directory, & paste the following code"]}),e.jsx(s,{language:"js",children:`import ApiService from './ApiService'
import type {
    ForgotPassword,
    ResetPassword,
} from '@/@types/auth'

import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from '@/firebase';

export async function apiSignIn ({email, password}: {email: string, password: string}) {
    return await signInWithEmailAndPassword(auth, email, password).then(user => user).catch(err => err);
}

export async function apiSignUp ({email, password}: {email: string, password: string}) {
    return createUserWithEmailAndPassword(auth, email, password).then(user => user).catch(err => err);  
}

export async function apiSignOut () {
    return await signOut(auth).then(user => user).catch(err => err);
}`})]}),e.jsxs("li",{children:[e.jsxs("p",{children:["As Firebase utilizes ",e.jsx("code",{children:"email"})," rather than ",e.jsx("code",{children:"username"})," as a credential, you'll need to make adjustments to the input and schema in ",e.jsx("code",{children:"SignInForm.tsx"}),", ",e.jsx("code",{children:"SignUpForm.tsx"})," & ",e.jsx("code",{children:"@types/auth.ts"}),". Below, you'll find the updated code that you can use to replace them."]}),e.jsx("strong",{children:"auth.ts"}),e.jsx(s,{language:"js",children:`export type SignInCredential = {
    email: string
    password: string
}

export type SignUpCredential = {
    email: string
    password: string
}`}),e.jsx("strong",{children:"SignInForm.tsx"}),e.jsx(s,{language:"js",children:`type SignInFormSchema = {
    email: string
    password: string
    rememberMe: boolean
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Please enter your email'),
    password: Yup.string().required('Please enter your password'),
    rememberMe: Yup.bool(),
})

const SignInForm = (props: SignInFormProps) => {
    ...

    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { email, password } = values
        setSubmitting(true)

        const result = await signIn({ email, password })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
                initialValues={{
                    email: 'admin@example.com',
                    password: '123Qwe',
                    rememberMe: true,
                }}
                ...
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="User Name"
                                invalid={
                                    (errors.email &&
                                        touched.email) as boolean
                                }
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                />
                            </FormItem>
                            ...
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}`}),e.jsx("strong",{children:"SignUpForm.tsx"}),e.jsx(s,{language:"js",children:`type SignUpFormSchema = {
    password: string
    email: string
}

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
    password: Yup.string().required('Please enter your password'),
    confirmPassword: Yup.string().oneOf(
        [Yup.ref('password')],
        'Your passwords do not match'
    ),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

    const { signUp } = useAuth()

    const [message, setMessage] = useTimeOutMessage()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { password, email } = values
        setSubmitting(true)
        const result = await signUp({ password, email })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    userName: 'admin1',
                    password: '123Qwe1',
                    confirmPassword: '123Qwe1',
                    email: 'test@testmail.com',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Email"
                                invalid={errors.email && touched.email}
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Password"
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Confirm Password"
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? 'Creating Account...'
                                    : 'Sign Up'}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>Already have an account? </span>
                                <ActionLink to={signInUrl}>Sign in</ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}`})]})]})]}),e.jsxs("div",{className:"mt-10",id:"conclusion",children:[e.jsx("h5",{children:"Conclusion"}),e.jsx("p",{children:"By following these steps, you have successfully integrated Firebase SDK auth with to the template. You can leverage the powerful features offered by Firebase to enhance the functionality and user experience along with Solvers."}),e.jsxs("p",{children:["Make sure to refer to the ",e.jsx("a",{target:"_new",href:"https://firebase.google.com/docs",children:"Firebase documentation"})," for detailed information on using Firebase services in your application"]})]})]});export{o as default};
