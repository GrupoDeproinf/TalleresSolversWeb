import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
} from '@/@types/auth'

import { auth } from '@/configs/firebaseAssets.config';
import { getAuth , sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';



export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({
        url: '/sign-in',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/sign-up',
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/sign-out',
        method: 'post',
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    const auth = getAuth();
    const { email } = data;

    console.log("Email recibido en el backend:", email);

    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Error al enviar el correo: ", error);

        // Asegúrate de que el error es de tipo FirebaseError
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/invalid-email':
                    throw new Error("El correo electrónico no es válido.");
                // Puedes agregar otros casos según sea necesario
                default:
                    throw new Error("No se pudo enviar el correo de restablecimiento de contraseña. Por favor, verifica el correo electrónico e inténtalo de nuevo.");
            }
        } else {
            throw new Error("Se produjo un error inesperado.");
        }
    }
}


export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}
