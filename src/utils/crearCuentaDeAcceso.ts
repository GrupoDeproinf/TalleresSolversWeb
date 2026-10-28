import { getApps, initializeApp } from 'firebase/app'
import {
    createUserWithEmailAndPassword,
    getAuth,
    signOut,
    type User,
} from 'firebase/auth'
import { app } from '@/configs/firebaseAssets.config'

// Crea la cuenta de acceso (Firebase Auth) de un usuario nuevo SIN cambiar la
// sesión de quien la crea.
//
// createUserWithEmailAndPassword inicia sesión con la cuenta nueva. Con la
// instancia principal, el administrador quedaba conectado como el usuario
// recién creado y lo siguiente (guardar su ficha, asignarle plan) se hacía con
// esa sesión. Con las reglas de Firestore solo para el personal, eso falla.
// Por eso se usa una instancia aparte y se cierra al terminar.
const NOMBRE = 'creacion-de-cuentas'

export async function crearCuentaDeAcceso(
    correo: string,
    clave: string,
): Promise<User> {
    const secundaria =
        getApps().find((a) => a.name === NOMBRE) ??
        initializeApp(app.options, NOMBRE)
    const authSecundaria = getAuth(secundaria)
    try {
        const credencial = await createUserWithEmailAndPassword(
            authSecundaria,
            correo,
            clave,
        )
        return credencial.user
    } finally {
        await signOut(authSecundaria).catch(() => {})
    }
}
