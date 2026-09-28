// Sesión verificable hacia la API de Solvers (apisolvers.solversapp.com).
//
// El servidor ahora comprueba quién llama a cada ruta (middlewares/auth.js del
// backend). Antes el panel mandaba "Bearer <uid>", que cualquiera puede
// inventar. Aquí se agrega, a TODA llamada de axios hacia la API, el ID token
// de Firebase del usuario que inició sesión en el panel (Firebase lo renueva
// solo). Se importa una vez en main.tsx; no hay que tocar cada pantalla.
import axios from 'axios'
import { getAuth } from 'firebase/auth'

const API_HOST = 'apisolvers.solversapp.com'

axios.interceptors.request.use(async (config) => {
    try {
        const url = String(config.url || '')
        if (!url.includes(API_HOST)) return config
        const user = getAuth().currentUser
        if (user) {
            const token = await user.getIdToken()
            config.headers = config.headers || {}
            config.headers['Authorization'] = `Bearer ${token}`
        }
    } catch {
        // Sin token la llamada sigue: el servidor decide según su modo.
    }
    return config
})
