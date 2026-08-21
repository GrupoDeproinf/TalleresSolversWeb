import authRoute from './authRoute'
import appsRoute from './appsRoute'
import pagesRoute from './pagesRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

// Rutas demo del template (uiComponents, authDemo, docs) eliminadas del
// bundle de producción: no forman parte de la app real y solo agregaban peso
// de build (SyntaxHighlighter, DemoLayout, showcases de componentes, etc.).
export const protectedRoutes: Routes = [...appsRoute, ...pagesRoute]
