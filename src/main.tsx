/* eslint-disable import/default */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Tras un nuevo deploy, un usuario con la app abierta puede tener en memoria
// nombres de chunks viejos que ya no existen en el hosting. Cuando un import
// dinámico (lazy) falla al descargarse, recargamos la página una sola vez
// para obtener el index.html nuevo con los nombres de chunk correctos.
// Esto elimina el error "Failed to fetch dynamically imported module".
if (typeof window !== 'undefined') {
    const RELOAD_FLAG = 'solvers:chunk-reloaded'
    window.addEventListener('vite:preloadError', () => {
        if (sessionStorage.getItem(RELOAD_FLAG)) {
            return
        }
        sessionStorage.setItem(RELOAD_FLAG, '1')
        window.location.reload()
    })
    window.addEventListener('load', () => {
        sessionStorage.removeItem(RELOAD_FLAG)
    })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
