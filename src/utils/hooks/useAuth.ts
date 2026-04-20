import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    setSessionLoading,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import {
    getAuthenticatedHomePath,
    resolvePostSignInPath,
} from '@/utils/getAuthenticatedHomePath'
import { USER, ADMIN } from '@/constants/roles.constant'
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
        let matchedUserKey = ''
    
        // Consultar en la colección Usuarios
        const queryUsuarios = query(
            collection(db, 'Usuarios'),
            where('email', '==', values.userName),
        )
        const usuariosSnapshot = await getDocs(queryUsuarios)
    
        if (!usuariosSnapshot.empty) {
            // Si el usuario está en la colección Usuarios
            const firstUserDoc = usuariosSnapshot.docs[0]
            const potentialUser = firstUserDoc.data()
            if (potentialUser.typeUser === 'Taller' || potentialUser.typeUser === 'Certificador') {
                collectionToCheck = 'Usuarios'
                userData = potentialUser
                matchedUserKey = firstUserDoc.id
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
                const firstAdminDoc = adminsSnapshot.docs[0]
                collectionToCheck = 'Admins'
                userData = firstAdminDoc.data()
                matchedUserKey = firstAdminDoc.id
            }
        }
    
        // Si el usuario no se encuentra en ninguna colección
        if (!collectionToCheck || !userData) {
            return {
                status: 'failed',
                message: 'El usuario no se encuentra registrado',
            }
        }
        
    
        dispatch(setSessionLoading(true))

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
                const userDocRef = doc(db, collectionToCheck, userCredential.user.uid)
    
                // Obtener detalles del usuario desde la colección correspondiente
                const userDoc = await getDoc(userDocRef)
                const userInfo = userDoc.exists() ? userDoc.data() : userData
                const userKey = userDoc.exists() ? userDoc.id : matchedUserKey || token

                if (!userInfo) {
                    return {
                        status: 'failed',
                        message: 'Error al obtener la información del usuario',
                    }
                }

                localStorage.setItem('nombre', userInfo?.nombre ?? '')
                const trimmedType = String(userInfo?.typeUser ?? '').trim()
                let userAuthority: string =
                    trimmedType === 'Certificador' ? ADMIN : trimmedType
                if (!userAuthority) {
                    userAuthority =
                        collectionToCheck === 'Admins' ? ADMIN : USER
                } else {
                    const lower = userAuthority.toLowerCase()
                    if (lower === 'admin' || lower === 'administrador') {
                        userAuthority = ADMIN
                    }
                }
                const authority = [userAuthority]
                dispatch(
                    setUser({
                        avatar: '',
                        userName: userInfo?.nombre,
                        email: userInfo?.email,
                        key: userKey,
                        authority, // ['Taller'], ['Admin'], o ['Admin'] para Certificador
                    }),
                )
                dispatch(signInSuccess(token))
                const redirectUrl = queryRedirect.get(REDIRECT_URL_KEY)
                const homePath = getAuthenticatedHomePath(authority, userKey)
                // Taller: siempre entrada en Mi Perfil (no seguir redirect al dashboard u otras rutas admin).
                if (authority.includes(USER)) {
                    navigate(homePath)
                } else {
                    navigate(
                        resolvePostSignInPath(
                            redirectUrl,
                            authority,
                            userKey,
                        ),
                    )
                }
                return {
                    status: 'success',
                    message: '',
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
        } finally {
            dispatch(setSessionLoading(false))
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
