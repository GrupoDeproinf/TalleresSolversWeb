import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)
    const queryRedirect = useQuery()

    const signIn = async (
        values: SignInCredential,
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        const query1 = query(
            collection(db, 'Usuarios'),
            where('email', '==', values.userName),
        )
        const querySnapshot = await getDocs(query1)
        let infoFinal: any = []
        querySnapshot.forEach((doc) => {
            let dataTempo: any = doc.data()
            dataTempo.key = doc.id
            dataTempo.total = 0
            infoFinal.push(dataTempo)
        })

        console.log(infoFinal)
        if (infoFinal.length == 0) {
            return {
                status: 'failed',
                message: 'El usuario no se encuentra registrado',
            }
        } else {
            try {
                const auth = getAuth()
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    values.userName,
                    values.password,
                )

                // .then(resp=>{
                if (userCredential?.user?.uid) {
                    const token = userCredential?.user?.uid
                    dispatch(signInSuccess(token))
                    if (userCredential?.user) {
                        console.log(userCredential?.user?.uid)
                        getDoc(
                            doc(db, 'u_users', userCredential?.user?.uid),
                        ).then((resp) => {
                            const info = resp.data()
                            localStorage.setItem('userName', info?.name)
                            dispatch(
                                setUser({
                                    avatar: '',
                                    userName: info?.name,
                                    email: info?.email,
                                    key: resp.id,
                                    authority: ['admin', 'user'], // ['user']
                                }),
                            )
                            const redirectUrl =
                                queryRedirect.get(REDIRECT_URL_KEY)
                            navigate(
                                redirectUrl
                                    ? redirectUrl
                                    : appConfig.authenticatedEntryPath,
                            )
                            return {
                                status: 'success',
                                message: '',
                            }
                        })
                    }
                } else {
                    console.log(userCredential)
                    return {
                        status: 'failed',
                        message: 'fallo',
                    }
                }
            } catch (errors: any) {
                // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                // }
                return {
                    status: 'failed',
                    message:
                        errors?.response?.data?.message || errors.toString(),
                }
            }
        }
    }

    const signUp = async (values: any) => {
        return new Promise((resolve, reject) => {
            console.log(values)
            const auth = getAuth()
            createUserWithEmailAndPassword(auth, values.email, values.password)
                .then((userCredential) => {
                    const user = userCredential.user
                    console.log('aqui')
                    console.log(user?.uid)
                    if (user?.uid) {
                        console.log(user?.uid)
                        const token = user?.uid
                        console.log(token)

                        values.uid = user?.uid
                        setDoc(doc(db, 'Usuarios', token), values).then(
                            (resp) => {
                                console.log(resp)
                                dispatch(signInSuccess(token))
                                if (user?.uid) {
                                    localStorage.setItem(
                                        'userName',
                                        values.name,
                                    )
                                    dispatch(
                                        setUser({
                                            avatar: '',
                                            userName: values?.name,
                                            email: values?.email,
                                            key: token,
                                            authority: ['admin', 'user'], // ['user']
                                        }),
                                    )
                                }
                                const redirectUrl =
                                    queryRedirect.get(REDIRECT_URL_KEY)
                                navigate(
                                    redirectUrl
                                        ? redirectUrl
                                        : appConfig.authenticatedEntryPath,
                                )

                                return {
                                    status: 'success',
                                    message: 'Usuario creado exitosamente',
                                }
                            },
                            (err) => {},
                        )
                    } else {
                        console.log('Error en Guardado en BD')
                        return {
                            status: 'failed',
                            message: 'Error',
                        }
                    }
                })
                .catch((error) => {
                    console.log(error)
                    const errorMessage = error.message
                    reject(errorMessage)
                    // return {
                    //     status: 'failed',
                    //     message: errorMessage.toString(),
                    // }
                })
        })
    }

    const handleSignOut = () => {
        // Limpiamos los datos del usuario en el estado de la aplicación
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                authority: [],
            }),
        )
        // Redirigimos al usuario a la página de entrada no autenticada
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = () => {
        // Ejecutamos directamente el cierre de sesión sin llamar a la API
        handleSignOut()
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
