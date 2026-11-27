import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { useAppSelector } from '@/store'
import { ADMIN } from '@/constants/roles.constant'
import { EVENTO_VER_RECORRIDO } from '@/components/shared/RecorridoGuiado'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineLightBulb } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import { FaUserCircle } from 'react-icons/fa'

const _UserDropdown = ({ className }: CommonProps) => {
    const { userName, email, authority } = useAppSelector(
        (state) => state.auth.user,
    )
    const esAdmin = (authority || []).includes(ADMIN)

    const { signOut } = useAuth()

    const UserAvatar = (
        <div
            data-tour="menu-usuario"
            className={classNames(className, 'flex items-center gap-2')}
        >
            <FaUserCircle className="w-10 h-10" />
            <div className="hidden md:block">
                <div className="font-bold">{userName}</div>
            </div>
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {userName}
                            </div>
                            <div className="text-xs">{email}</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {esAdmin && (
                    <Dropdown.Item
                        eventKey="Ver recorrido"
                        className="gap-2"
                        onClick={() =>
                            window.dispatchEvent(new Event(EVENTO_VER_RECORRIDO))
                        }
                    >
                        <span className="text-xl opacity-50">
                            <HiOutlineLightBulb />
                        </span>
                        <span>Ver recorrido</span>
                    </Dropdown.Item>
                )}
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>Cerrar Sesión</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
