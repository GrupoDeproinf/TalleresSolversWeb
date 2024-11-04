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
import { Dialog, Pagination } from '@/components/ui';
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
    uid: string
    nombre: string
    descripcion: string
    monto: string
    status: string
    vigencia: string
    cantidad_servicios: string
    
}

const ProfileGarage = () => {
    const [data, setData] = useState<DocumentData | null>(null);
    const [isSuscrito, setIsSuscrito] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Planes | null>(null);
    const [services, setServices] = useState<Service[]>([])
    const [planes, setPlanes] = useState<Planes[]>([])
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogOpensub, setDialogOpensub] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ logoUrl: '', nombre: '', email: '', phone: '', rif: '', status: '', location: '', LinkFacebook: '', LinkTiktok: '', LinkInstagram: '' });

    const path = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);

    const getData = async () => {
        setLoading(true)
        try {
            // Obtener datos del usuario
            const docRef = doc(db, 'Usuarios', path);
            const resp = await getDoc(docRef);
            const dataFinal = resp.data() || null;

            // Obtener IDs de los servicios
            const serviceIds = dataFinal?.servicios || [];

            // Obtener detalles de cada servicio
            const services = await Promise.all(
                serviceIds.map(async (serviceId: any) => {
                    const serviceDocRef = doc(db, 'Servicios', serviceId);
                    const serviceDoc = await getDoc(serviceDocRef);
                    const serviceData = serviceDoc.data();

                    return {
                        uid_servicio: serviceId,
                        nombre_servicio: serviceData?.nombre_servicio || '',
                        descripcion: serviceData?.descripcion || '',
                        precio: serviceData?.precio || '0',
                        taller: serviceData?.taller || '',
                        puntuacion: serviceData?.puntuacion || '0'
                    };
                })
            );

            // Obtener todos los planes desde la colección 'Planes'
            const planesSnapshot = await getDocs(collection(db, 'Planes'));
            const planes: Planes[] = planesSnapshot.docs.map((doc) => ({
                uid: doc.id,
                nombre: doc.data().nombre || '', // Asegúrate que existan estas propiedades
                descripcion: doc.data().descripcion || '',
                monto: doc.data().monto || 0,
                status: doc.data().status || '',
                vigencia: doc.data().vigencia || '', // Asegúrate de que esta propiedad esté incluida
                cantidad_servicios: doc.data().cantidad_servicios || 0 // Asegúrate de que esta propiedad esté incluida
            }));

            setData(dataFinal);
            setServices(services); // Estado actualizado con la información completa de cada servicio
            setPlanes(planes); // Estado con los datos de todos los planes

            setFormData({
                nombre: dataFinal?.nombre || '',
                logoUrl: dataFinal?.logoUrl || '',
                email: dataFinal?.email || '',
                phone: dataFinal?.phone || '',
                rif: dataFinal?.rif || '',
                status: dataFinal?.status || '',
                location: dataFinal?.location || '',
                LinkFacebook: dataFinal?.LinkFacebook || '',
                LinkInstagram: dataFinal?.LinkInstagram || '',
                LinkTiktok: dataFinal?.LinkTiktok || '',
            })
        } catch (error) {
            console.error('Error al obtener los datos del cliente:', error)
        } finally {
            setLoading(false)
        }
    };


    useEffect(() => {
        getData()
    }, [])

    type CustomerInfoFieldProps = {
        title?: string
        value?: string
    }

    const handleSubscribe = (plan: any) => {
        setSelectedPlan(plan); // Guardar el plan seleccionado
        setIsSuscrito(true); // Cambiar el estado a suscrito
        onDialogClosesub(); // Cerrar el modal
    };

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



    const onDialogOpensub = () => setDialogOpensub(true);
    const onDialogOpen = () => setDialogOpen(true);
    const onDialogClosesub = () => setDialogOpensub(false);
    const onDialogClose = () => setDialogOpen(false);
    const onEdit = () => setEditModalOpen(true);
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
            header: 'Descripcion',
            accessorKey: 'descripcion',

        },
        {
            header: 'Cantidad de servicios',
            accessorKey: 'cantidad_servicios',

        },
    ]
    const planesSub = [
        { id: 1, nombre: 'Plan Básico', descripcion: 'Descripción del Plan Básico', precio: '$10' },
        { id: 2, nombre: 'Plan Avanzado', descripcion: 'Descripción del Plan Avanzado', precio: '$20' },
        { id: 3, nombre: 'Plan Premium', descripcion: 'Descripción del Plan Premium', precio: '$30' }
    ];

    const suscribirse = (planId: any) => {
        setIsSuscrito(true);
        setDialogOpen(false);
    };

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
                                    data?.logoUrl ||
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
                                    {!isSuscrito ? (
                                        <button
                                            onClick={() => setDialogOpensub(true)}
                                            className="btn btn-primary"
                                        >
                                            Ver Planes
                                        </button>
                                    ) : (
                                        <>
                                        <div className="flex items-center space-x-4 p-4 border rounded-lg shadow-md bg-white">
                                            <div className="flex-grow">
                                                <p className="text-sm text-gray-500">Suscripción Activa</p>
                                                <h3 className="text-lg font-semibold text-gray-800">{selectedPlan?.nombre}</h3>
                                                <p className="text-sm text-gray-600">Vigencia: {selectedPlan?.vigencia} dias</p>
                                                <p className="text-sm text-gray-600">Monto mensual: <span className="font-bold text-gray-800">${selectedPlan?.monto}</span></p>
                                                <p className="text-xs text-gray-400">Próximo pago: <span className="font-medium text-gray-600">12/10/2021</span></p> {/* Puedes cambiar la fecha dinámica según el plan */}
                                            </div>
                                            <button
                                                onClick={() => setIsSuscrito(false)}
                                                className="ml-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
                                            >
                                                Cancelar Suscripción
                                            </button>
                                        </div>
                                    </>
                                    
                                    )}
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

            <ConfirmDialog
                width={1000}
                isOpen={dialogOpensub}
                onClose={onDialogClosesub}
                onCancel={onDialogClosesub}
                title="Planes de Suscripción"
            >
                <div className="table-responsive">
                    <Table>
                        <THead>
                            {table2.getHeaderGroups().map((headerGroup) => (
                                <Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Th key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <Sorter sort={header.column.getIsSorted()} />
                                                    {header.column.getCanFilter() ? (
                                                        <input
                                                            type="text"
                                                            value={
                                                                filtering.find((filter) => filter.id === header.id)?.value?.toString() || ''
                                                            }
                                                            onChange={(e) =>
                                                                handleFilterChange(header.id, e.target.value)
                                                            }
                                                            placeholder="Buscar"
                                                            className="mt-2 p-1 border rounded"
                                                            onClick={(e) => e.stopPropagation()} // Evita la propagación del evento de clic
                                                        />
                                                    ) : null}
                                                </div>
                                            )}
                                        </Th>
                                    ))}
                                    <Th>Acción</Th> {/* Encabezado para el botón */}
                                </Tr>
                            ))}
                        </THead>
                        <TBody>
                            {table2
                                .getRowModel()
                                .rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                .map((row) => (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <Td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </Td>
                                        ))}
                                        <Td>
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                                onClick={() => handleSubscribe(row.original)} // Llama a la función de suscripción
                                            >
                                                Suscribirse
                                            </button>
                                        </Td>
                                    </Tr>
                                ))}
                        </TBody>
                    </Table>
                </div>
            </ConfirmDialog>

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
                        <label className="flex flex-col">
    <span className="font-semibold text-gray-700">RIF:</span>
    <div className="flex items-center mt-1">
        <select
            value={formData.rif?.split('-')[0] || 'J'}
            onChange={(e) =>
                setFormData((prev: any) => ({
                    ...prev,
                    rif: `${e.target.value}-${(prev?.rif?.split('-')[1] || '')}`,
                }))
            }
            className="mx-2 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
            <option value="J">J-</option>
            <option value="V">V-</option>
            <option value="E">E-</option>
            <option value="C">C-</option>
            <option value="G">G-</option>
            <option value="P">P-</option>
        </select>
        <input
            type="text"
            value={formData.rif?.split('-')[1] || ''}
            onChange={(e) =>
                setFormData((prev: any) => ({
                    ...prev,
                    rif: `${(prev?.rif?.split('-')[0] || 'J')}-${e.target.value}`,
                }))
            }
            className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
        />
    </div>
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
