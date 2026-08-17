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
import { USER, ADMIN, CERTIFIER, SUPPORT } from '@/constants/roles.constant'
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
        // -------------------------------------------------------------------
        // SEGURIDAD: autenticar SIEMPRE antes de leer Firestore.
        // El flujo anterior consultaba las colecciones Usuarios/Admins por
        // email ANTES de iniciar sesión. Eso (a) permitía enumerar usuarios sin
        // credenciales y (b) es incompatible con reglas que exigen sesión
        // (las reglas endurecidas denegarían esa lectura pre-auth y romperían
        // el login). Ahora: Firebase Auth primero -> luego leer el perfil por uid.
        // -------------------------------------------------------------------
        dispatch(setSessionLoading(true))
        try {
            const auth = getAuth()

            // 1) Autenticación
            const userCredential = await signInWithEmailAndPassword(
                auth,
                values.userName,
                values.password,
            )
            const uid = userCredential?.user?.uid
            if (!uid) {
                await auth.signOut().catch(() => {})
                return {
                    status: 'failed',
                    message: 'No pudimos iniciar sesión. Intenta de nuevo.',
                }
            }

            // 2) Ya autenticados: resolver el perfil por uid (no por email)
            let collectionToCheck: 'Usuarios' | 'Admins' | null = null
            let userInfo: any = null
            let perfilId: string = uid

            const usuarioSnap = await getDoc(doc(db, 'Usuarios', uid))
            if (usuarioSnap.exists()) {
                collectionToCheck = 'Usuarios'
                userInfo = usuarioSnap.data()
            } else {
                const adminSnap = await getDoc(doc(db, 'Admins', uid))
                if (adminSnap.exists()) {
                    collectionToCheck = 'Admins'
                    userInfo = adminSnap.data()
                }
            }

            // Respaldo: cuentas antiguas cuyo documento no usa el uid de
            // Firebase Auth como id. Ya hay sesion, asi que la consulta por
            // correo cumple las reglas.
            if (!collectionToCheck || !userInfo) {
                const correo =
                    userCredential.user.email ?? values.userName
                for (const nombre of ['Usuarios', 'Admins'] as const) {
                    const snap = await getDocs(
                        query(
                            collection(db, nombre),
                            where('email', '==', correo),
                        ),
                    )
                    const encontrado = snap.docs.find(
                        (d) => String(d.data()?.status ?? '') !== 'Eliminado',
                    ) ?? snap.docs[0]
                    if (encontrado) {
                        collectionToCheck = nombre
                        userInfo = encontrado.data()
                        perfilId = encontrado.id
                        break
                    }
                }
            }

            if (!collectionToCheck || !userInfo) {
                await auth.signOut().catch(() => {})
                return {
                    status: 'failed',
                    message: 'El usuario no se encuentra registrado',
                }
            }

            // 3) Reglas de acceso al panel
            const trimmedType = String(userInfo?.typeUser ?? '').trim()

            if (String(userInfo?.status ?? '').trim() === 'Eliminado') {
                await auth.signOut().catch(() => {})
                return { status: 'failed', message: 'Usuario no encontrado' }
            }

            if (
                collectionToCheck === 'Usuarios' &&
                !['Taller', 'Certificador', 'Soporte'].includes(trimmedType)
            ) {
                // p. ej. un 'Cliente' no tiene acceso al panel administrativo
                await auth.signOut().catch(() => {})
                return {
                    status: 'failed',
                    message: 'El usuario no tiene permitido iniciar sesión',
                }
            }

            // 4) Autoridad + sesión de la app
            const token = uid
            const userKey = perfilId
            localStorage.setItem('nombre', userInfo?.nombre ?? '')

            let userAuthority: string =
                trimmedType === 'Certificador'
                    ? CERTIFIER
                    : trimmedType === 'Soporte'
                      ? SUPPORT
                      : trimmedType
            if (!userAuthority) {
                userAuthority = collectionToCheck === 'Admins' ? ADMIN : USER
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
                    authority, // ['Taller'], ['Admin'] o ['Certificador']
                }),
            )
            dispatch(signInSuccess(token))

            const redirectUrl = queryRedirect.get(REDIRECT_URL_KEY)
            const homePath = getAuthenticatedHomePath(authority, userKey)
            // Taller: siempre entrada en Mi Perfil (no seguir redirect a rutas admin).
            if (authority.includes(USER)) {
                navigate(homePath)
            } else {
                navigate(resolvePostSignInPath(redirectUrl, authority, userKey))
            }

            return { status: 'success', message: '' }
        } catch (error: any) {
            // Mensajes específicos (antes: siempre "Su contraseña es inválida")
            const code = error?.code || ''
            let message =
                'No pudimos iniciar sesión. Revisa tu correo y contraseña.'
            if (
                code === 'auth/wrong-password' ||
                code === 'auth/invalid-credential'
            ) {
                message = 'Correo o contraseña incorrectos.'
            } else if (code === 'auth/user-not-found') {
                message = 'El usuario no se encuentra registrado.'
            } else if (code === 'auth/too-many-requests') {
                message =
                    'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
            } else if (code === 'auth/network-request-failed') {
                message =
                    'Problema de conexión. Revisa tu internet e intenta de nuevo.'
            }
            return { status: 'failed', message }
        } finally {
            dispatch(setSessionLoading(false))
        }
    }

    const signUp = async (values: any) => {
        const auth = getAuth()
        // Nunca guardar la contraseña en Firestore: solo vive en Firebase Auth.
        const { password, confirmPassword, ...profile } = values ?? {}
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            password,
        )
        const uid = userCredential.user?.uid
        if (!uid) {
            throw { code: 'signup/no-uid', message: 'No se pudo crear la cuenta' }
        }
        await setDoc(doc(db, 'Usuarios', uid), { ...profile, uid })
        return { status: 'success', uid, message: 'Usuario creado exitosamente' }
    }

    const handleSignOut = () => {
        // Cerrar también la sesión de Firebase Auth (antes solo se limpiaba Redux,
        // dejando una sesión de Firebase viva tras "cerrar sesión").
        getAuth()
            .signOut()
            .catch(() => {})
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
