import { useEffect, useState, useCallback } from 'react'
import {
    doc,
    getDocs,
    getDoc,
    updateDoc,
    collection,
    where,
    DocumentData,
    query,
} from 'firebase/firestore'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FaCamera, FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa'
import { HiPencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { db } from '@/configs/firebaseAssets.config'
import Tag from '@/components/ui/Tag'
import { HiFire } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'
import Table from '@/components/ui/Table'
import { Pagination } from '@/components/ui'
import { FaEdit, FaStar, FaStarHalfAlt, FaTrash } from 'react-icons/fa'
import Tabs from '@/components/ui/Tabs'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type {
    ColumnDef,
    ColumnFiltersState,
    ColumnSort,
} from '@tanstack/react-table'
import { HiOutlineCash, HiOutlineCreditCard } from 'react-icons/hi'
import { RiBankLine } from 'react-icons/ri'
import { MdOutlinePhoneAndroid } from 'react-icons/md'
import Checkbox from '@/components/ui/Checkbox'
import { SiZelle } from 'react-icons/si'

type Service = {
    nombre_servicio: string
    descripcion: string
    precio: string
    taller: string
    puntuacion: string
    uid_servicio: string
}
type Planes = {
    nombre: string
    descripcion: string
    monto: string
    status: string
    vigencia: string
    cantidad_servicios: string
    uid: string
}

const ProfileGarage = () => {
    const [data, setData] = useState<DocumentData | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [planes, setPlanes] = useState<Planes[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        phone: '',
        rif: '',
        status: '',
        location: '',
        LinkFacebook: '',
        LinkTiktok: '',
        LinkInstagram: '',
        logoUrl: '',
    })

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1,
    )

    const getData = async () => {
        setLoading(true)
        try {
            const docRef = doc(db, 'Usuarios', path)
            const resp = await getDoc(docRef)
            const dataFinal = resp.data() || null

            const servicesRef = collection(db, 'Servicios')
            const servicesQuery = query(
                servicesRef,
                where('taller', '==', dataFinal?.nombre),
            )
            const servicesSnap = await getDocs(servicesQuery)
            const services = servicesSnap.docs.map((doc) => {
                const data = doc.data()
                return {
                    nombre_servicio: data.nombre_servicio || '',
                    descripcion: data.descripcion || '',
                    precio: data.precio || '0',
                    taller: data.taller || '',
                    puntuacion: data.puntuacion || '0',
                    uid_servicio: data.uid_servicio || '',
                }
            })

            setData(dataFinal)
            setServices(services)
            setPlanes(planes)

            console.log('aqui la data ', dataFinal, services) // Estado para los servicios

            setFormData({
                nombre: dataFinal?.nombre || '',
                email: dataFinal?.email || '',
                phone: dataFinal?.phone || '',
                rif: dataFinal?.rif || '',
                status: dataFinal?.status || '',
                location: dataFinal?.location || '',
                LinkFacebook: dataFinal?.LinkFacebook || '',
                LinkInstagram: dataFinal?.LinkInstagram || '',
                LinkTiktok: dataFinal?.LinkTiktok || '',
                logoUrl: dataFinal?.logoUrl || '',
            })
        } catch (error) {
            console.error('Error al obtener los datos del cliente:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    type CustomerInfoFieldProps = {
        title?: string
        value?: string
    }
    const [subscribed, setSubscribed] = useState(true)

    const unsubscribe = useCallback(() => {
        setSubscribed(false)
    }, [])

    const subscribe = useCallback(() => {
        setSubscribed(true)
    }, [])

    const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
        return (
            <div>
                <span>{title}</span>
                <p className="text-gray-700 dark:text-gray-200 font-semibold">
                    {value}
                </p>
            </div>
        )
    }

    const handleFilterChange = (columnId: string, value: string) => {
        setFiltering((prev) => {
            // Actualizar el filtro correspondiente a la columna
            const newFilters = prev.filter((filter) => filter.id !== columnId)
            if (value !== '') {
                newFilters.push({ id: columnId, value })
            }
            return newFilters
        })
    }

    const handleEditChange = (e: any) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleEditSave = async () => {
        try {
            const docRef = doc(db, 'Usuarios', path)
            await updateDoc(docRef, formData)
            setData(formData) // Actualizar estado local
            setEditModalOpen(false) // Cerrar el modal de edición
        } catch (error) {
            console.error('Error al actualizar los datos:', error)
        }
    }

    const paymentMethods = [
        {
            name: 'Pago móvil',
            icon: <MdOutlinePhoneAndroid />,
            dbKey: 'pagoMovil',
        },
        {
            name: 'Transferencias bancarias',
            icon: <RiBankLine />,
            dbKey: 'transferencia',
        },
        {
            name: 'Punto de venta',
            icon: <HiOutlineCreditCard />,
            dbKey: 'puntoVenta',
        },
        { name: 'Zinli', icon: <HiOutlineCash />, dbKey: 'zinli' },
        { name: 'Efectivo', icon: <HiOutlineCash />, dbKey: 'efectivo' },
        { name: 'Zelle', icon: <SiZelle />, dbKey: 'zelle' },
        {
            name: 'Tarjetas de crédito nacional',
            icon: <HiOutlineCreditCard />,
            dbKey: 'tarjetaCreditoN',
        },
        {
            name: 'Tarjetas de crédito internacional',
            icon: <HiOutlineCreditCard />,
            dbKey: 'tarjetaCreditoI',
        },
    ]

    type PaymentStatus = {
        [key: string]: boolean
    }

    const onDialogOpen = () => setDialogOpen(true)
    const onDialogClose = () => setDialogOpen(false)
    const onEdit = () => setEditModalOpen(true)
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])

    const { TabNav, TabList, TabContent } = Tabs

    const columns: ColumnDef<Service>[] = [
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
            cell: ({ row }) => {
                const precio = parseFloat(row.original.precio) // Asegúrate de que sea un número
                return `$${precio.toFixed(2)}`
            },
        },
        {
            header: 'Puntuación',
            accessorKey: 'puntuacion',
            cell: ({ row }) => {
                const puntuacion = parseFloat(row.original.puntuacion) // Asegúrate de que sea un número
                const fullStars = Math.floor(puntuacion)
                const hasHalfStar = puntuacion % 1 >= 0.5
                const stars = []

                // Agrega las estrellas llenas
                for (let i = 0; i < fullStars; i++) {
                    stars.push(
                        <FaStar
                            key={`full-${i}`}
                            className="text-yellow-500"
                        />,
                    )
                }
                // Agrega la estrella media si corresponde
                if (hasHalfStar) {
                    stars.push(
                        <FaStarHalfAlt
                            key="half"
                            className="text-yellow-500"
                        />,
                    )
                }
                // Agrega las estrellas vacías (si es necesario, para un total de 5)
                for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
                    stars.push(
                        <FaStar key={`empty-${i}`} className="text-gray-300" />,
                    )
                }

                return <div className="flex">{stars}</div> // Renderiza las estrellas
            },
        },
    ]
    const columns2: ColumnDef<Planes>[] = [
        {
            header: 'Nombre del Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
            cell: ({ row }) => {
                const precio = parseFloat(row.original.monto) // Asegúrate de que sea un número
                return `$${precio.toFixed(2)}`
            },
        },
        {
            header: 'Cantidad de servicios',
            accessorKey: 'cantidad_sevicios',
        },
    ]

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const table = useReactTable({
        data: services, // Cambiar aquí para usar el estado de servicios
        columns,
        state: {
            sorting,
            columnFilters: filtering,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const table2 = useReactTable({
        data: planes, // Cambiar aquí para usar el estado de servicios
        columns: columns2,
        state: {
            sorting,
            columnFilters: filtering,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 6 // Puedes cambiar esto si deseas un número diferente

    // Suponiendo que tienes un array de datos
    const dataservice = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = dataservice.length

    const onPaginationChange = (page: number) => {
        console.log('onPaginationChange', page)
        setCurrentPage(page) // Actualiza la página actual
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                Cargando...
            </div>
        )

    return (
        <Container className="h-full">
            <div className="flex flex-col xl:flex-row gap-4">
                <Card>
                    <div className="flex flex-col xl:justify-between min-w-[260px] h-full 2xl:min-w-[360px] mx-auto">
                        <div className="flex xl:flex-col items-center gap-4">
                            <Avatar
                                size={90}
                                shape="circle"
                                src={
                                    data?.img ||
                                    '/img/logo/logo-light-streamline.png'
                                }
                                className="p-2 bg-white shadow-lg"
                            />
                            <h4 className="font-bold">
                                {data?.nombre || 'Nombre no disponible'}
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-8">
                            <CustomerInfoField
                                title="Correo electronico"
                                value={data?.email || 'Correo no disponible'}
                            />
                            <CustomerInfoField
                                title="Numero de telefono"
                                value={data?.phone || 'Telefono no disponible'}
                            />
                            <CustomerInfoField
                                title="Rif"
                                value={data?.rif || 'Rif no disponible'}
                            />
                            <CustomerInfoField
                                title="Estatus"
                                value={data?.status || 'Estatus no disponible'}
                            />
                            <CustomerInfoField
                                title="Ubicacion"
                                value={
                                    data?.location || 'Ubicacion no disponible'
                                }
                            />

                            {/* Redes Sociales */}
                            <div className="mb-7">
                                <span>Redes Sociales</span>
                                <div className="flex mt-4 gap-2">
                                    {data?.LinkFacebook ||
                                    data?.LinkInstagram ||
                                    data?.LinkTiktok ? (
                                        <>
                                            {data.LinkFacebook && (
                                                <a
                                                    href={data.LinkFacebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={data.LinkFacebook} // Tooltip al pasar el mouse
                                                >
                                                    <Button
                                                        shape="circle"
                                                        size="sm"
                                                        icon={
                                                            <FaFacebookF className="text-[#1773ea]" />
                                                        }
                                                    />
                                                </a>
                                            )}
                                            {data.LinkInstagram && (
                                                <a
                                                    href={data.LinkInstagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={data.LinkInstagram} // Tooltip al pasar el mouse
                                                >
                                                    <Button
                                                        shape="circle"
                                                        size="sm"
                                                        icon={
                                                            <FaInstagram className="text-[#E1306C]" />
                                                        }
                                                    />
                                                </a>
                                            )}
                                            {data.LinkTiktok && (
                                                <a
                                                    href={data.LinkTiktok}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={data.LinkTiktok} // Tooltip al pasar el mouse
                                                >
                                                    <Button
                                                        shape="circle"
                                                        size="sm"
                                                        icon={
                                                            <FaTiktok className="text-black" />
                                                        }
                                                    />
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500">
                                            No hay redes sociales disponibles
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Botón Editar */}
                            <div className="mt-4 flex justify-end">
                                <Button
                                    className=""
                                    variant="solid"
                                    onClick={onEdit}
                                    icon={<HiPencilAlt />}
                                >
                                    Editar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
                {/* Aqui empieza el tab */}
                <Tabs defaultValue="tab1">
                    <TabList>
                        <TabNav value="tab1">Planes</TabNav>
                        <TabNav value="tab2">Servicios</TabNav>
                    </TabList>
                    <div>
                        <TabContent value="tab1">
                            <div className="mb-8 mt-4">
                                <h6 className="mb-4">Subscripción</h6>
                                <Card bordered className="mb-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <Avatar
                                                    className="bg-emerald-500"
                                                    shape="circle"
                                                    icon={<HiFire />}
                                                ></Avatar>
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    <h6>Plan 3</h6>
                                                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 rounded-md border-0 mx-2">
                                                        <span className="capitalize">
                                                            activo
                                                        </span>
                                                    </Tag>
                                                </div>
                                                <div>
                                                    <span>Pago mensual </span>
                                                    <span> | </span>
                                                    <span>
                                                        Siguiente pago el{' '}
                                                        {dayjs
                                                            .unix(19 / 21 / 12)
                                                            .format(
                                                                'MM/DD/YYYY',
                                                            )}
                                                    </span>
                                                    <span>
                                                        <span className="mx-1">
                                                            por
                                                        </span>
                                                        <NumericFormat
                                                            className="font-semibold text-gray-900 dark:text-gray-100"
                                                            displayType="text"
                                                            value={(
                                                                Math.round(
                                                                    100 * 100,
                                                                ) / 100
                                                            ).toFixed(2)}
                                                            prefix={'$'}
                                                            thousandSeparator={
                                                                true
                                                            }
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            {subscribed && (
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    onClick={unsubscribe}
                                                >
                                                    Cancel plan
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                className="ml-2 rtl:mr-2"
                                                onClick={subscribe}
                                            >
                                                Suscribirse
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <div>
                                    <div>
                                        <h6 className="mb-6 flex justify-start mt-4">
                                            Historial de planes
                                        </h6>
                                        <Table>
                                            <THead>
                                                {table2
                                                    .getHeaderGroups()
                                                    .map((headerGroup) => (
                                                        <Tr
                                                            key={headerGroup.id}
                                                        >
                                                            {headerGroup.headers.map(
                                                                (header) => {
                                                                    return (
                                                                        <Th
                                                                            key={
                                                                                header.id
                                                                            }
                                                                            colSpan={
                                                                                header.colSpan
                                                                            }
                                                                        >
                                                                            {header.isPlaceholder ? null : (
                                                                                <div
                                                                                    {...{
                                                                                        className:
                                                                                            header.column.getCanSort()
                                                                                                ? 'cursor-pointer select-none'
                                                                                                : '',
                                                                                        onClick:
                                                                                            header.column.getToggleSortingHandler(),
                                                                                    }}
                                                                                >
                                                                                    {flexRender(
                                                                                        header
                                                                                            .column
                                                                                            .columnDef
                                                                                            .header,
                                                                                        header.getContext(),
                                                                                    )}
                                                                                    <Sorter
                                                                                        sort={header.column.getIsSorted()}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </Th>
                                                                    )
                                                                },
                                                            )}
                                                        </Tr>
                                                    ))}
                                            </THead>
                                            <TBody>
                                                {table2
                                                    .getRowModel()
                                                    .rows.slice(
                                                        (currentPage - 1) *
                                                            rowsPerPage,
                                                        currentPage *
                                                            rowsPerPage,
                                                    )
                                                    .map((row) => {
                                                        return (
                                                            <Tr key={row.id}>
                                                                {row
                                                                    .getVisibleCells()
                                                                    .map(
                                                                        (
                                                                            cell,
                                                                        ) => {
                                                                            return (
                                                                                <Td
                                                                                    key={
                                                                                        cell.id
                                                                                    }
                                                                                >
                                                                                    {flexRender(
                                                                                        cell
                                                                                            .column
                                                                                            .columnDef
                                                                                            .cell,
                                                                                        cell.getContext(),
                                                                                    )}
                                                                                </Td>
                                                                            )
                                                                        },
                                                                    )}
                                                            </Tr>
                                                        )
                                                    })}
                                            </TBody>
                                        </Table>
                                        <Pagination
                                            onChange={onPaginationChange}
                                            currentPage={currentPage}
                                            totalRows={totalRows}
                                            rowsPerPage={rowsPerPage}
                                        />
                                    </div>
                                </div>
                                <div className="border-t border-gray-300 my-4" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.name}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox readOnly />
                                            <span>{method.icon}</span>
                                            <span>{method.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabContent>
                    </div>
                    <TabContent value="tab2">
                        <div>
                            <div>
                                <h6 className="mb-6 flex justify-start mt-4">
                                    Lista de Servicios
                                </h6>
                                <Table>
                                    <THead>
                                        {table
                                            .getHeaderGroups()
                                            .map((headerGroup) => (
                                                <Tr key={headerGroup.id}>
                                                    {headerGroup.headers.map(
                                                        (header) => {
                                                            return (
                                                                <Th
                                                                    key={
                                                                        header.id
                                                                    }
                                                                    colSpan={
                                                                        header.colSpan
                                                                    }
                                                                >
                                                                    {header.isPlaceholder ? null : (
                                                                        <div
                                                                            {...{
                                                                                className:
                                                                                    header.column.getCanSort()
                                                                                        ? 'cursor-pointer select-none'
                                                                                        : '',
                                                                                onClick:
                                                                                    header.column.getToggleSortingHandler(),
                                                                            }}
                                                                        >
                                                                            {flexRender(
                                                                                header
                                                                                    .column
                                                                                    .columnDef
                                                                                    .header,
                                                                                header.getContext(),
                                                                            )}
                                                                            <Sorter
                                                                                sort={header.column.getIsSorted()}
                                                                            />
                                                                            {/* Agregar un buscador para cada columna */}
                                                                            {header.column.getCanFilter() ? (
                                                                                <input
                                                                                    type="text"
                                                                                    value={
                                                                                        filtering
                                                                                            .find(
                                                                                                (
                                                                                                    filter,
                                                                                                ) =>
                                                                                                    filter.id ===
                                                                                                    header.id,
                                                                                            )
                                                                                            ?.value?.toString() ||
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        handleFilterChange(
                                                                                            header.id,
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    placeholder={`Buscar`}
                                                                                    className="mt-2 p-1 border rounded"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) =>
                                                                                        e.stopPropagation()
                                                                                    } // Evita la propagación del evento de clic
                                                                                />
                                                                            ) : null}
                                                                        </div>
                                                                    )}
                                                                </Th>
                                                            )
                                                        },
                                                    )}
                                                </Tr>
                                            ))}
                                    </THead>
                                    <TBody>
                                        {table
                                            .getRowModel()
                                            .rows.slice(
                                                (currentPage - 1) * rowsPerPage,
                                                currentPage * rowsPerPage,
                                            )
                                            .map((row) => {
                                                return (
                                                    <Tr key={row.id}>
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => {
                                                                return (
                                                                    <Td
                                                                        key={
                                                                            cell.id
                                                                        }
                                                                    >
                                                                        {flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext(),
                                                                        )}
                                                                    </Td>
                                                                )
                                                            })}
                                                    </Tr>
                                                )
                                            })}
                                    </TBody>
                                </Table>
                                <Pagination
                                    onChange={onPaginationChange}
                                    currentPage={currentPage}
                                    totalRows={totalRows}
                                    rowsPerPage={rowsPerPage}
                                />
                            </div>
                        </div>
                    </TabContent>
                </Tabs>
            </div>

            {/* Modal eliminar */}
            <ConfirmDialog
                isOpen={dialogOpen}
                type="danger"
                title="Eliminar taller"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={() => console.log('Customer deleted')} // Placeholder for actual delete logic
            >
                <p>Estas seguro de eliminar este taller?</p>
            </ConfirmDialog>

            {/* Modal editar */}
            {editModalOpen && (
                <ConfirmDialog
                    isOpen={editModalOpen}
                    title="Editar Taller"
                    confirmButtonColor="blue-600"
                    onClose={() => setEditModalOpen(false)}
                    onRequestClose={() => setEditModalOpen(false)}
                    onCancel={() => setEditModalOpen(false)}
                    onConfirm={handleEditSave}
                >
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 gap-2">
                        <div className="text-center">
                            {!formData.logoUrl ? (
                                <FaCamera
                                    className="mx-auto h-12 w-12 text-gray-300"
                                    aria-hidden="true"
                                />
                            ) : (
                                <div>
                                    <img
                                        src={formData.logoUrl}
                                        alt="Preview Logo"
                                        className="mx-auto h-32 w-32 object-cover"
                                    />
                                    {/* Botón para quitar la imagen */}
                                    <button
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                logoUrl: '',
                                            }))
                                        }
                                        className="mt-2 text-red-500 hover:text-red-700"
                                    >
                                        Quitar Logo
                                    </button>
                                </div>
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                <label
                                    htmlFor="logo-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
                                >
                                    <span>
                                        {formData.logoUrl
                                            ? 'Cambiar Logo'
                                            : 'Seleccionar Logo'}
                                    </span>
                                    <input
                                        id="logo-upload"
                                        name="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    setFormData(
                                                        (prev: any) => ({
                                                            ...prev,
                                                            logoUrl:
                                                                reader.result, // Guardar URL del logo en formData
                                                        }),
                                                    )
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Nombre
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Correo Electrónico
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="Correo Electrónico"
                                name="email"
                                value={formData.email}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Teléfono
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="Teléfono"
                                name="phone"
                                value={formData.phone}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                RIF
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="Rif"
                                name="rif"
                                value={formData.rif}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Ubicación
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder=""
                                name="location"
                                value={formData.location}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Estatus
                            </span>
                            <select
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                name="status"
                                value={formData.status}
                                onChange={handleEditChange}
                            >
                                <option value="Aprobado">Aprobado</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="No Operativo">
                                    No Operativo
                                </option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Facebook
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder=""
                                name="nombre"
                                value={formData.LinkFacebook}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Instagram
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder=""
                                name="nombre"
                                value={formData.LinkInstagram}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-semibold">
                                Tik tok
                            </span>
                            <input
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder=""
                                name="nombre"
                                value={formData.LinkTiktok}
                                onChange={handleEditChange}
                            />
                        </label>
                    </div>
                </ConfirmDialog>
            )}
        </Container>
    )
}

export default ProfileGarage
