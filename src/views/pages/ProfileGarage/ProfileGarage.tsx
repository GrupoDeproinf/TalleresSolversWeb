import { useEffect, useState, useCallback } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import Switcher from '@/components/ui/Switcher';
import { ChangeEvent } from 'react';
import {
    doc,
    getDocs,
    getDoc,
    updateDoc,
    collection,
    where,
    DocumentData,
    query,
    addDoc,
    Timestamp,
    setDoc,
} from 'firebase/firestore'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FaCamera, FaFacebookF, FaInstagram, FaArrowLeft, FaTiktok } from 'react-icons/fa'
import { HiPencilAlt } from 'react-icons/hi'
import { db } from '@/configs/firebaseAssets.config'
import { useNavigate } from 'react-router-dom'
import Tag from '@/components/ui/Tag'
import { HiFire } from 'react-icons/hi'
import Table from '@/components/ui/Table'
import { Dialog, Notification, Pagination, toast } from '@/components/ui'
import { FaEdit, FaStar, FaStarHalfAlt } from 'react-icons/fa'
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
import PaymentDrawer from './Components/PaymentForm'


type Service = {
    nombre_servicio: string
    descripcion: string
    precio: string
    taller: string
    puntuacion: string
    uid_servicio: string
    estatus: boolean
}
type Planes = {
    uid: string;
    nombre: string;
    descripcion: string;
    monto: number;
    status: string;
    vigencia: string;
    cantidad_servicios: number;  
};

type SubscriptionHistory = {
    uid: string;
    nombre: string;
    monto: number;
    vigencia: string;
    status: string;
    cantidad_servicios: number; 
    fecha_fin: Timestamp;
    fecha_inicio: Timestamp;
    taller_uid: string;
};

const ProfileGarage = () => {
    const [data, setData] = useState<DocumentData | null>(null)
    const [isSuscrito, setIsSuscrito] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<Planes | null>(null)
    const [services, setServices] = useState<Service[]>([])

    const [planes, setPlanes] = useState<Planes[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogOpensub, setDialogOpensub] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
    const [subscription, setSubscription] = useState({
        fecha_fin: Timestamp,
        fecha_inicio: Timestamp,
        nombre: '',
        cantidad_servicios: 0,
        monto: 0,
        status: '',
        vigencia: '',
        uid: '',
    }); 
    const [subscripcionestable, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
    const [formData, setFormData] = useState({
        logoUrl: '',
        nombre: '',
        email: '',
        phone: '',
        rif: '',
        status: '',
        location: '',
        LinkFacebook: '',
        LinkTiktok: '',
        LinkInstagram: '',
    })
    const [paymentMethodsState, setPaymentMethodsState] = useState<Record<string, boolean>>({
        pagoMovil: false,
        transferencia: false,
        puntoVenta: false,
        zinli: false,
        efectivo: false,
        zelle: false,
        tarjetaCreditoN: false,
        tarjetaCreditoI: false,
    });

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1,
    )
    const navigate = useNavigate()


    const getData = async () => {
        setLoading(true);
        try {
            // Obtener datos del usuario desde la colección 'Usuarios'
            const docRef = doc(db, 'Usuarios', path); // `path` es el ID del usuario o taller
            const resp = await getDoc(docRef);
            const dataFinal = resp.data() || null;

            console.log(dataFinal)

            const paymentMethodsData = dataFinal?.metodos_pago || {};
            setPaymentMethodsState((prevState) => ({
                ...prevState,
                ...paymentMethodsData,
            }));

            // Obtener información de la suscripción actual
            const subscripcionActual = dataFinal?.subscripcion_actual || null;
            console.log("aqui el plan", subscripcionActual)

            setIsSuscrito(!!subscripcionActual)


            const subscripcionesQuery = query(
                collection(db, 'Subscripciones'),
                where('taller_uid', '==', path)
            );

            const subscripcionesSnapshot = await getDocs(subscripcionesQuery);
            const subscripciones = subscripcionesSnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    uid: doc.id,
                    nombre: data.nombre || '',
                    monto: data.monto || '0',
                    vigencia: data.vigencia || '',
                    status: data.status || '',
                    cantidad_servicios: data.cantidad_servicios || '0',
                    fecha_fin: data.fecha_fin || "no hay fecha",
                    fecha_inicio: data.fecha_inicio || "no hay fecha",
                    taller_uid: data.taller_uid || '', // UID del taller
                };
            });



            // Obtener detalles de cada servicio basado en los IDs
            const servicesQuery = query(
                collection(db, 'Servicios'),
                where('uid_taller', '==', path)
            );

            // Obtener los servicios que coinciden con el `uid_taller`
            const querySnapshot = await getDocs(servicesQuery);

            // Procesar los resultados y devolver un array con los servicios
            const services = querySnapshot.docs.map((doc) => {
                const serviceData = doc.data();

                return {
                    uid_servicio: doc.id,
                    nombre_servicio: serviceData?.nombre || '',
                    descripcion: serviceData?.descripcion || '',
                    precio: serviceData?.precio || '0',
                    estatus: serviceData?.estatus,
                    taller: serviceData?.taller || '',
                    puntuacion: serviceData?.puntuacion || '0',
                };
            });

            // Obtener todos los planes desde la colección 'Planes'
            const planesSnapshot = await getDocs(collection(db, 'Planes'));
            const planes = planesSnapshot.docs.map((doc) => ({
                uid: doc.id,
                nombre: doc.data().nombre || '',
                descripcion: doc.data().descripcion || '',
                monto: doc.data().monto || 0,
                status: doc.data().status || '',
                vigencia: doc.data().vigencia || '',
                cantidad_servicios: doc.data().cantidad_servicios || 0,
            }));

            setData(dataFinal);
            setServices(services);
            console.log(services)
            setPlanes(planes);
            setSubscription(subscripcionActual);
            setSubscriptionHistory(subscripciones);

            const endDate = subscripcionActual?.fecha_fin;
            console.log("aqui endDate", endDate)
            console.log('data', subscripciones)

            if (endDate) {
                const daysRemaining = calculateDaysRemaining(endDate);
                console.log('aqui la vigencia w', daysRemaining)
                setDiasRestantes(daysRemaining);
            }

            // Actualizar formData con los datos relevantes del usuario o taller
            setFormData({
                nombre: dataFinal?.nombre || '',
                logoUrl: dataFinal?.logoUrl || '',
                email: dataFinal?.email || '',
                phone: dataFinal?.phone || '',
                rif: dataFinal?.rif || '',
                status: dataFinal?.status || '',
                location: dataFinal?.direccion || '',
                LinkFacebook: dataFinal?.LinkFacebook || '',
                LinkInstagram: dataFinal?.LinkInstagram || '',
                LinkTiktok: dataFinal?.LinkTiktok || '',
            });
        } catch (error) {
            console.error('Error al obtener los datos del cliente:', error);
            toast.push(
                <Notification title="Error">
                    Ocurrio un error al cargar los datos del cliente.
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);


    type CustomerInfoFieldProps = {
        title?: string
        value?: string
    }

    const calculateDaysRemaining = (endDate: any) => {
        const today = Math.floor(Date.now() / 1000);
        const end = endDate.seconds;
        const timeDifference = end - today;
        const daysRemaining = Math.ceil(timeDifference / (60 * 60 * 24));
        return daysRemaining;
    };


    const formatDate = (timestamp: any) => {
        const date = new Date(timestamp.seconds * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };



    const handleSubscribe = async (plan: any) => {
        try {
            const usuarioDocRef = doc(db, 'Usuarios', path);
            const newSubscriptionRef = doc(collection(db, 'Subscripciones'));

            await setDoc(newSubscriptionRef, {
                uid: newSubscriptionRef.id, 
                nombre: plan.nombre,
                monto: plan.monto,
                vigencia: plan.vigencia,
                cantidad_servicios: plan.cantidad_servicios,
                status: 'Por Aprobar',
                taller_uid: path,
            });

            await updateDoc(usuarioDocRef, {
                subscripcion_actual: {
                    uid: newSubscriptionRef.id,
                    nombre: plan.nombre,
                    monto: plan.monto,
                    vigencia: plan.vigencia,
                    cantidad_servicios: plan.cantidad_servicios,
                    status: 'Por Aprobar',
                },
            });


            setIsSuscrito(true);
            await getData();

            onDialogClosesub();
            console.log('Subscripción actualizada y guardada en Subscripciones.');
            toast.push(
                <Notification title="Éxito" type="success">
                    Se ha subscrito correctamente a este plan.
                </Notification>
            );
        } catch (error) {
            console.error('Error al guardar la subscripción:', error);
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al subscribirse a este plan. Inténtalo nuevamente.
                </Notification>
            );
        }
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
            setData(formData)
            setEditModalOpen(false)
            toast.push(
                <Notification title="Éxito" type="success">
                    Datos de Usuario actualizados correctamente.
                </Notification>
            );
        } catch (error) {
            console.error('Error al actualizar los datos:', error)
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al actualizar los datos del usuario. Inténtalo nuevamente.
                </Notification>
            );
        }
    }


    const handleSavePaymentMethods = async () => {
        try {
            const docRef = doc(db, 'Usuarios', path);
            await updateDoc(docRef, {
                metodos_pago: paymentMethodsState,
            });
            toast.push(
                <Notification title="Éxito" type="success">
                    Métodos de pago actualizados correctamente.
                </Notification>
            );
        } catch (error) {
            console.error('Error al guardar los métodos de pago:', error);
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al actualizar los métodos de pago. Inténtalo nuevamente.
                </Notification>
            );
        }
    };


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

    const onDialogOpensub = () => setDialogOpensub(true)
    const onDialogOpen = () => setDialogOpen(true)
    const onDialogClosesub = () => setDialogOpensub(false)
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
                const precio = parseFloat(row.original.precio); 
                return `$${precio.toFixed(2)}`;
            },
        },
        {
            header: 'Estatus',
            accessorKey: 'estatus',
            cell: ({ row }) => {
                const [estatus, setEstatus] = useState<boolean>(row.original.estatus ?? false); 
                const handleStatusChange = async (val: boolean) => {
                    setEstatus(val); 

                    const updatedServices = services.map(service =>
                        service.uid_servicio === row.original.uid_servicio
                            ? { ...service, estatus: val }
                            : service
                    );
                    setServices(updatedServices); 

                    try {
                        const docRef = doc(db, 'Servicios', row.original.uid_servicio);
                        await updateDoc(docRef, { estatus: val });
                        console.log('Estado del servicio actualizado');
                    } catch (error) {
                        console.error('Error al actualizar el estado del servicio:', error);
                    }
                };

                return (
                    <div>
                        <Switcher
                            checked={estatus}
                            onChange={() => handleStatusChange(!estatus)} 
                        />
                    </div>
                );
            },
        },
        {
            header: 'Puntuación',
            accessorKey: 'puntuacion',
            cell: ({ row }) => {
                const puntuacion = parseFloat(row.original.puntuacion);
                const fullStars = Math.floor(puntuacion);
                const hasHalfStar = puntuacion % 1 >= 0.5;
                const stars = [];

                for (let i = 0; i < fullStars; i++) {
                    stars.push(
                        <FaStar key={`full-${i}`} className="text-yellow-500" />
                    );
                }
                if (hasHalfStar) {
                    stars.push(
                        <FaStarHalfAlt key="half" className="text-yellow-500" />
                    );
                }
                for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
                    stars.push(
                        <FaStar key={`empty-${i}`} className="text-gray-300" />
                    );
                }

                return <div className="flex">{stars}</div>;
            },
        },
    ];


    const columns2: ColumnDef<Planes>[] = [
        {
            header: 'Nombre del Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
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
    const columns3: ColumnDef<SubscriptionHistory>[] = [
        {
            header: 'Nombre del Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
        },
        {
            header: 'vigencia',
            accessorKey: 'vigencia',
        },
        {
            header: 'Fecha de vencimiento',
            accessorKey: 'fecha_fin',
            cell: ({ row }) => {
                const fecha = formatDate(row.original.fecha_fin)
                return `${fecha}`
            }

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
        data: planes, 
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
    const table3 = useReactTable({
        data: subscripcionestable, 
        columns: columns3,
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
    const rowsPerPage = 6 

    
    const dataservice = table.getRowModel().rows 
    const totalRows = dataservice.length

    const onPaginationChange = (page: number) => {
        console.log('onPaginationChange', page)
        setCurrentPage(page) 
    }



    return (
        <Container className="h-full">
            <div className="flex items-center">
                <button
                    onClick={() => navigate(`${APP_PREFIX_PATH}/garages`)}
                    className="flex items-center text-blue-900 mb-3 ml-2 px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    <span>Volver</span>
                </button>
            </div>
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
                                    data?.direccion || 'Ubicacion no disponible'
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
                                        <div className="flex justify-end">
                                            <p className="text-xs mr-64 mt-3">
                                                Puede visualizar y suscribirse a un plan para su taller...
                                            </p>
                                            <button
                                                onClick={() => setDialogOpensub(true)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                                            >
                                                Ver Planes
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border rounded-lg shadow-md bg-white">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    className="bg-emerald-500"
                                                    shape="circle"
                                                    icon={<HiFire />}
                                                />
                                                <div>
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-semibold text-gray-800">{subscription?.nombre || 'Cargando...'}</h3>
                                                        <Tag
                                                            className={`rounded-md border-0 mx-2 ${subscription?.status === 'Aprobado' ? 'bg-green-100 text-green-400' : 'bg-yellow-100 text-yellow-400'}`}
                                                        >
                                                            {subscription?.status || 'Pendiente'}
                                                        </Tag>
                                                    </div>
                                                    <div className="grid grid-cols-4">
                                                        <p className="text-xs text-gray-500">
                                                            Vigencia: {subscription?.vigencia ?? '---'} días
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Monto mensual: <span className="font-bold text-gray-800">${subscription?.monto ?? '---'}</span>
                                                        </p>
                                                        {subscription?.status === 'Aprobado' && (
                                                            <>
                                                                <p className="text-sm ml-2 text-gray-600">
                                                                    {diasRestantes ?? '---'} días restantes
                                                                </p>
                                                                <p className="text-xs mt-1 text-gray-400">
                                                                    Próximo pago: <span className="text-gray-600">{formatDate(subscription.fecha_fin)}</span>
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {subscription?.status === 'Por Aprobar' && (
                                                <div className="flex justify-end mt-2">
                                                    <PaymentDrawer subscriptionId={subscripcionestable[0]?.uid} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                                <div>
                                    <div>
                                        <h6 className="mb-6 flex justify-start mt-4">
                                            Historial de planes
                                        </h6>
                                        <Table>
                                            <THead>
                                                {table3
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
                                                {table3
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
                                        <div key={method.name} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={paymentMethodsState[method.dbKey] || false}
                                                onChange={(checked: boolean) => {
                                                    setPaymentMethodsState((prevState) => ({
                                                        ...prevState,
                                                        [method.dbKey]: checked,
                                                    }));
                                                }}
                                            />
                                            <span>{method.icon}</span>
                                            <span>{method.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleSavePaymentMethods}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                                    >
                                        Guardar
                                    </button>
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

            <Dialog
                width={1000}
                isOpen={dialogOpensub}
                onClose={onDialogClosesub}
            >
                <div className="table-responsive">
                    <h2 className='mb-4'>Planes de Subscripción</h2>
                    <Table>
                        <THead>
                            {table2.getHeaderGroups().map((headerGroup) => (
                                <Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}
                                                    <Sorter
                                                        sort={header.column.getIsSorted()}
                                                    />
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
                                                            onChange={(e) =>
                                                                handleFilterChange(
                                                                    header.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Buscar"
                                                            className="mt-2 p-1 border rounded"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        />
                                                    ) : null}
                                                </div>
                                            )}
                                        </Th>
                                    ))}
                                    <Th>Acción</Th>{' '}

                                </Tr>
                            ))}
                        </THead>
                        <TBody>
                            {table2
                                .getRowModel()
                                .rows.slice(
                                    (currentPage - 1) * rowsPerPage,
                                    currentPage * rowsPerPage,
                                )
                                .map((row) => (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        ))}
                                        <Td>
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                                onClick={() =>
                                                    handleSubscribe(
                                                        row.original,
                                                    )
                                                } 
                                            >
                                                Suscribirse
                                            </button>
                                        </Td>
                                    </Tr>
                                ))}
                        </TBody>
                    </Table>
                </div>
            </Dialog>


           
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
                    <div className="max-h-[450px] overflow-y-auto">
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
                                                                    reader.result, 
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
                                    disabled
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
                                    <option value="Rechazado">Rechazado</option>
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
                    </div>
                </ConfirmDialog>
            )}
        </Container>
    )
}

export default ProfileGarage
