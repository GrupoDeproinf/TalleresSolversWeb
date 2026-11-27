export interface NavigationTree {
    key: string
    path: string
    isExternalLink?: boolean
    title: string
    translateKey: string
    icon: string
    type: 'title' | 'collapse' | 'item'
    authority: string[]
    /** Contador de pendientes que se muestra junto a la entrada (solo Admin). */
    badge?: 'enEspera' | 'pagosPorValidar' | 'registrosIncompletos'
    subMenu: NavigationTree[]
}
