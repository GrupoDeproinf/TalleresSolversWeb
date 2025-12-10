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
        let collectionToCheck: 'Usuarios' | 'Admins' | null = null
        let userData: any = null
    
        // Consultar en la colección Usuarios
        const queryUsuarios = query(
            collection(db, 'Usuarios'),
            where('email', '==', values.userName),
        )
        const usuariosSnapshot = await getDocs(queryUsuarios)
    
        if (!usuariosSnapshot.empty) {
            // Si el usuario está en la colección Usuarios
            const potentialUser = usuariosSnapshot.docs[0].data()
            if (potentialUser.typeUser === 'Taller' || potentialUser.typeUser === 'Certificador') {
                collectionToCheck = 'Usuarios'
                userData = potentialUser
            } else {
                return {
                    status: 'failed',
                    message: 'El usuario no tiene permitido iniciar sesión',
                }
            }
        } else {
            // Consultar en la colección Admins si no está en Usuarios
            const queryAdmins = query(
                collection(db, 'Admins'),
                where('email', '==', values.userName),
            )
            const adminsSnapshot = await getDocs(queryAdmins)
    
            if (!adminsSnapshot.empty) {
                // Si el usuario está en la colección Admins
                collectionToCheck = 'Admins'
                userData = adminsSnapshot.docs[0].data()
            }
        }
    
        // Si el usuario no se encuentra en ninguna colección
        if (!collectionToCheck || !userData) {
            return {
                status: 'failed',
                message: 'El usuario no se encuentra registrado',
            }
        }
        
    
        // Intentar iniciar sesión con Firebase Auth
        try {
            const auth = getAuth()
            const userCredential = await signInWithEmailAndPassword(
                auth,
                values.userName,
                values.password,
            )
    
            if (userCredential?.user?.uid) {
                const token = userCredential.user.uid
                dispatch(signInSuccess(token))
    
                // Obtener detalles del usuario desde la colección correspondiente
                const userDoc = await getDoc(
                    doc(db, collectionToCheck, userCredential.user.uid),
                )
    
                if (userDoc.exists()) {
                    const userInfo = userDoc.data()
                    localStorage.setItem('nombre', userInfo?.nombre)
                    // Los usuarios Certificador tienen los mismos permisos que Admin
                    const userAuthority = userInfo?.typeUser === 'Certificador' ? 'Admin' : userInfo?.typeUser
                    dispatch(
                        setUser({
                            avatar: '',
                            userName: userInfo?.nombre,
                            email: userInfo?.email,
                            key: userDoc.id,
                            authority: [userAuthority], // ['Taller'], ['Admin'], o ['Admin'] para Certificador
                        }),
                    )
                    const redirectUrl = queryRedirect.get(REDIRECT_URL_KEY)
                    navigate(
                        redirectUrl
                            ? redirectUrl
                            : appConfig.authenticatedEntryPath,
                    )
                    return {
                        status: 'success',
                        message: '',
                    }
                }
            } else {
                return {
                    status: 'failed',
                    message: 'Error al obtener la información del usuario',
                }
            }
        } catch (error: any) {
            return {
                status: 'failed',
                message: 'Su contraseña es inválida',
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
                                
                                const redirectUrl ='/sign-in'
                                navigate(redirectUrl)

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
