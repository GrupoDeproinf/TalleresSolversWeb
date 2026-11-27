import Tooltip from '@/components/ui/Tooltip'
import Menu from '@/components/ui/Menu'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'
import { useAppSelector } from '@/store'
import usePendientesAdmin from '@/utils/hooks/usePendientesAdmin'
import { ADMIN } from '@/constants/roles.constant'

const { MenuItem } = Menu


interface CollapsedItemProps extends CommonProps {
    title: string
    translateKey: string
    direction?: Direction
}

interface DefaultItemProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    sideCollapsed?: boolean
    userAuthority: string[]
}

interface VerticalMenuItemProps extends CollapsedItemProps, DefaultItemProps { }

const CollapsedItem = ({
    title,
    translateKey,
    children,
    direction,
}: CollapsedItemProps) => {
    const { t } = useTranslation()

    return (
        <Tooltip
            title={t(translateKey) || title}
            placement={direction === 'rtl' ? 'left' : 'right'}
        >
            {children}
        </Tooltip>
    )
}

const DefaultItem = (props: DefaultItemProps) => {
    const { nav, onLinkClick, sideCollapsed, userAuthority } = props

    const userid = useAppSelector((state) => state.auth.user.key);
    const esAdmin = userAuthority.includes(ADMIN)
    // Solo se abre la escucha de pendientes si la entrada lleva contador.
    const pendientes = usePendientesAdmin(esAdmin && !!nav.badge)
    const contador = nav.badge ? pendientes[nav.badge] : 0

    const dynamicPath = nav.path 
    ? nav.path.includes(':id') 
        ? nav.path.replace(':id', userid || '') 
        : nav.path 
    : '';



    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuItem key={nav.key} eventKey={nav.key} className="mb-2">
                <Link
                    to={dynamicPath} // Aquí usamos la ruta dinámica
                    className="flex items-center h-full w-full"
                    onClick={() =>
                        onLinkClick?.({
                            key: nav.key,
                            title: nav.title,
                            path: dynamicPath, // También enviamos la ruta dinámica en el callback
                        })
                    }
                    target={nav.isExternalLink ? '_blank' : ''}
                    data-tour={`nav-${nav.key}`}
                >
                    <VerticalMenuIcon icon={nav.icon} />
                    {!sideCollapsed && (
                        <span className="flex-1">
                            <Trans
                                i18nKey={nav.translateKey}
                                defaults={nav.title}
                            />
                        </span>
                    )}
                    {contador > 0 && (
                        <span
                            className={`rounded-full bg-[#FCC800] text-[11px] font-bold leading-none text-[#151D61] tabular-nums ${
                                sideCollapsed
                                    ? 'absolute right-1 top-1 h-2.5 w-2.5'
                                    : 'ml-2 px-2 py-1'
                            }`}
                            aria-label={`${contador} pendientes`}
                        >
                            {sideCollapsed ? null : contador > 99 ? '99+' : contador}
                        </span>
                    )}
                </Link>
            </MenuItem>
        </AuthorityCheck>
    )
}

const VerticalSingleMenuItem = ({
    nav,
    onLinkClick,
    sideCollapsed,
    userAuthority,
    direction,
}: Omit<VerticalMenuItemProps, 'title' | 'translateKey'>) => {
    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            {sideCollapsed ? (
                <CollapsedItem
                    title={nav.title}
                    translateKey={nav.translateKey}
                    direction={direction}

                >
                    <DefaultItem
                        nav={nav}
                        sideCollapsed={sideCollapsed}
                        userAuthority={userAuthority}
                        onLinkClick={onLinkClick}

                    />
                </CollapsedItem>
            ) : (
                <DefaultItem
                    nav={nav}
                    sideCollapsed={sideCollapsed}
                    userAuthority={userAuthority}
                    onLinkClick={onLinkClick}
                />
            )}
        </AuthorityCheck>
    )
}

export default VerticalSingleMenuItem
