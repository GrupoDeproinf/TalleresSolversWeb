import { useEffect, useState, useCallback } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import Switcher from '@/components/ui/Switcher'
import { ChangeEvent } from 'react'
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
import {
    FaCamera,
    FaFacebookF,
    FaInstagram,
    FaArrowLeft,
    FaTiktok,
    FaWhatsapp,
} from 'react-icons/fa'
import { HiPencilAlt } from 'react-icons/hi'
import { db, storage } from '@/configs/firebaseAssets.config'
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
import { BsWhatsapp } from 'react-icons/bs'
import { useAppSelector } from '@/store'
import {
    deleteObject,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes,
} from 'firebase/storage'
import MapsProfile from './Components/MapsProfile'
import MapsEdit from './Components/MapsEdit'

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
    uid: string
    nombre: string
    descripcion: string
    monto: number
    status: string
    vigencia: string
    cantidad_servicios: number
}

type SubscriptionHistory = {
    uid: string
    nombre: string
    monto: number
    vigencia: string
    status: string
    cantidad_servicios: number
    fecha_fin: Timestamp
    fecha_inicio: Timestamp
    taller_uid: string
    fechaCreacion: Timestamp
}

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
    const [diasRestantes, setDiasRestantes] = useState<number | null>(null)
    const [subscription, setSubscription] = useState({
        fecha_fin: Timestamp,
        fecha_inicio: Timestamp,
        nombre: '',
        cantidad_servicios: 0,
        monto: 0,
        status: '',
        vigencia: '',
        uid: '',
        fechaCreacion: Timestamp.fromDate(new Date()),
    })
    const [subscripcionestable, setSubscriptionHistory] = useState<
        SubscriptionHistory[]
    >([])
    const [formData, setFormData] = useState<{
        image_perfil: string
        nombre: string
        email: string
        phone: string
        rif: string
        status: string
        Direccion: string
        ubicacion: { lat: number; lng: number }
        LinkFacebook: string
        LinkTiktok: string
        LinkInstagram: string
        estado: string
        whatsapp: string
        newLogoFile?: File | null
    }>({
        image_perfil: '',
        nombre: '',
        email: '',
        phone: '',
        rif: '',
        status: '',
        Direccion: '',
        ubicacion: { lat: 0, lng: 0 },
        LinkFacebook: '',
        LinkTiktok: '',
        LinkInstagram: '',
        estado: '',
        whatsapp: '',
        newLogoFile: null, // Inicializa como null
    })

    const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(null);


    const [paymentMethodsState, setPaymentMethodsState] = useState<
        Record<string, boolean>
    >({
        pagoMovil: false,
        transferencia: false,
        puntoVenta: false,
        zinli: false,
        efectivo: false,
        zelle: false,
        tarjetaCreditoN: false,
        tarjetaCreditoI: false,
    })

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1,
    )
    const navigate = useNavigate()
    const userAuthority = useAppSelector((state) => state.auth.user.authority)

    const canGoBack = userAuthority?.includes('Admin')

    const getData = async () => {
        setLoading(true)
        try {
            // Obtener datos del usuario desde la colección 'Usuarios'
            const docRef = doc(db, 'Usuarios', path) // `path` es el ID del usuario o taller
            const resp = await getDoc(docRef)
            const dataFinal = resp.data() || null

            const paymentMethodsData = dataFinal?.metodos_pago || {}
            setPaymentMethodsState((prevState) => ({
                ...prevState,
                ...paymentMethodsData,
            }))

            // Obtener información de la suscripción actual
            const subscripcionActual = dataFinal?.subscripcion_actual || null

            setIsSuscrito(!!subscripcionActual)

            const subscripcionesQuery = query(
                collection(db, 'Subscripciones'),
                where('taller_uid', '==', path),
            )

            const subscripcionesSnapshot = await getDocs(subscripcionesQuery)
            const subscripciones = subscripcionesSnapshot.docs.map((doc) => {
                const data = doc.data()

                return {
                    uid: doc.id,
                    nombre: data.nombre || '',
                    monto: data.monto || '0',
                    vigencia: data.vigencia || '',
                    status: data.status || '',
                    cantidad_servicios: data.cantidad_servicios || 0,
                    fecha_fin: data.fecha_fin || 'no hay fecha',
                    fecha_inicio: data.fecha_inicio || 'no hay fecha',
                    taller_uid: data.taller_uid || '', // UID del taller
                    fechaCreacion: Timestamp.fromDate(new Date()),
                }
            })

            // Obtener detalles de cada servicio basado en los IDs
            const servicesQuery = query(
                collection(db, 'Servicios'),
                where('uid_taller', '==', path),
            )

            // Obtener los servicios que coinciden con el `uid_taller`
            const querySnapshot = await getDocs(servicesQuery)

            // Procesar los resultados y devolver un array con los servicios
            const services = querySnapshot.docs.map((doc) => {
                const serviceData = doc.data()

                return {
                    uid_servicio: doc.id,
                    nombre_servicio: serviceData?.nombre_servicio || '',
                    descripcion: serviceData?.descripcion || '',
                    precio: serviceData?.precio || '0',
                    estatus: serviceData?.estatus,
                    taller: serviceData?.taller || '',
                    puntuacion: serviceData?.puntuacion || '0',
                }
            })

            // Obtener todos los planes desde la colección 'Planes'
            const planesSnapshot = await getDocs(collection(db, 'Planes'))
            const planes = planesSnapshot.docs.map((doc) => ({
                uid: doc.id,
                nombre: doc.data().nombre || '',
                descripcion: doc.data().descripcion || '',
                monto: doc.data().monto || 0,
                status: doc.data().status || '',
                vigencia: doc.data().vigencia || '',
                cantidad_servicios: doc.data().cantidad_servicios || 0,
            }))

            setData(dataFinal)
            setServices(services)
            console.log(services)
            setPlanes(planes)
            setSubscription(subscripcionActual)
            setSubscriptionHistory(subscripciones)

            const endDate = subscripcionActual?.fecha_fin

            if (endDate) {
                const daysRemaining = calculateDaysRemaining(endDate)
                console.log('aqui la vigencia w', daysRemaining)
                setDiasRestantes(daysRemaining)
            }

            // Actualizar formData con los datos relevantes del usuario o taller
            setFormData({
                nombre: dataFinal?.nombre ?? '',
                image_perfil: dataFinal?.image_perfil ?? '',
                email: dataFinal?.email ?? '',
                phone: dataFinal?.phone ?? '',
                rif: dataFinal?.rif ?? '',
                status: dataFinal?.status ?? '',
                Direccion: dataFinal?.Direccion ?? '',
                LinkFacebook: dataFinal?.LinkFacebook ?? '',
                LinkInstagram: dataFinal?.LinkInstagram ?? '',
                LinkTiktok: dataFinal?.LinkTiktok ?? '',
                whatsapp: dataFinal?.whatsapp ?? '',
                estado: dataFinal?.estado ?? '',
                ubicacion: dataFinal?.ubicacion
                    ? {
                          lat: dataFinal.ubicacion.lat,
                          lng: dataFinal.ubicacion.lng,
                      }
                    : { lat: 0, lng: 0 },
                newLogoFile: dataFinal?.newLogoFile ?? null,
            })
        } catch (error) {
            console.error('Error al obtener los datos del cliente:', error)
            toast.push(
                <Notification title="Error">
                    Ocurrio un error al cargar los datos del cliente.
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    type CustomerInfoFieldProps = {
        title?: string
        value?: any
    }

    const calculateDaysRemaining = (endDate: any) => {
        const today = Math.floor(Date.now() / 1000)
        const end = endDate.seconds
        const timeDifference = end - today
        const daysRemaining = Math.ceil(timeDifference / (60 * 60 * 24))
        return daysRemaining
    }

    const formatDate = (timestamp: any) => {
        const date = new Date(timestamp.seconds * 1000)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    const handleSubscribe = async (plan: any) => {
        try {
            const usuarioDocRef = doc(db, 'Usuarios', path)
            const newSubscriptionRef = doc(collection(db, 'Subscripciones'))

            await setDoc(newSubscriptionRef, {
                uid: newSubscriptionRef.id,
                nombre: plan.nombre,
                nombre_taller: data?.nombre,
                monto: plan.monto,
                vigencia: plan.vigencia,
                cantidad_servicios: plan.cantidad_servicios,
                status: 'Por Aprobar',
                taller_uid: path,
                fechaCreacion: Timestamp.fromDate(new Date()),
            })

            await updateDoc(usuarioDocRef, {
                subscripcion_actual: {
                    uid: newSubscriptionRef.id,
                    nombre: plan.nombre,
                    monto: plan.monto,
                    vigencia: plan.vigencia,
                    cantidad_servicios: plan.cantidad_servicios,
                    status: 'Por Aprobar',
                },
            })

            setIsSuscrito(true)
            await getData()

            onDialogClosesub()
            console.log(
                'Subscripción actualizada y guardada en Subscripciones.',
            )
            toast.push(
                <Notification title="Éxito" type="success">
                    Se ha subscrito correctamente a este plan.
                </Notification>,
            )
        } catch (error) {
            console.error('Error al guardar la subscripción:', error)
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al subscribirse a este plan. Inténtalo
                    nuevamente.
                </Notification>,
            )
        }
    }

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

    const [urlErrors, setUrlErrors] = useState({
        facebook: '',
        instagram: '',
        tiktok: '',
        whatsapp: '',
    })

    const validateUrl = (url: string, platform: string): string => {
        const regexMap: Record<string, RegExp> = {
            facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/,
            instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/,
            tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/,
        }

        if (!regexMap[platform].test(url)) {
            return `La URL ingresada no es válida para ${platform}.`
        }
        return ''
    }

    const handleUrlChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        platform: string,
    ) => {
        const { value } = e.target

        setFormData((prev) => ({
            ...prev,
            [`Link${platform.charAt(0).toUpperCase() + platform.slice(1)}`]:
                value,
        }))

        const error = validateUrl(value, platform)
        setUrlErrors((prev) => ({
            ...prev,
            [platform]: error,
        }))
    }
    const handleEditSave = async () => {
        // Validaciones antes de proceder con la actualización
        if (!formData.nombre || formData.nombre.trim() === '') {
            toast.push(
                <Notification title="Error">
                    El nombre no puede estar vacío.
                </Notification>,
            )
            return
        }

        if (!formData.phone || !/^\d+$/.test(formData.phone) || formData.phone.startsWith('0')) {
            toast.push(
                <Notification title="Error">
                    El teléfono debe contener solo números y no puede comenzar con 0.
                </Notification>
            );
            return;
        }       
        
        if (!formData.whatsapp || !/^\d+$/.test(formData.whatsapp) || formData.whatsapp.startsWith('0')) {
            toast.push(
                <Notification title="Error">
                    El WhatsApp debe contener solo números y no puede comenzar con 0.
                </Notification>
            );
            return;
        }    

        if (!formData.whatsapp || !/^\d+$/.test(formData.whatsapp)) {
            toast.push(
                <Notification title="Error">
                    El Whatsapp debe contener solo números.
                </Notification>,
            )
            return
        }

        if (!formData.rif || !/^[JVEGCP]-\d+$/.test(formData.rif)) {
            toast.push(
                <Notification title="Error">
                    El RIF debe estar en un formato válido (Ejemplo:
                    J-12345678).
                </Notification>,
            )
            return
        }

        if (!formData.Direccion || formData.Direccion.trim() === '') {
            toast.push(
                <Notification title="Error">
                    La Direccion no puede estar vacía.
                </Notification>,
            )
            return
        }

        if (!formData.status) {
            toast.push(
                <Notification title="Error">
                    Debes seleccionar un estatus.
                </Notification>,
            )
            return
        }

        if (!formData.estado) {
            toast.push(
                <Notification title="Error">
                    Debes seleccionar un estado.
                </Notification>,
            )
            return
        }

        try {
            // Referencia a la colección 'Usuarios'
            const usuariosRef = collection(db, 'Usuarios')
            const querySnapshot = await getDocs(usuariosRef)

            // Verifica si el RIF ya está registrado
            const rifExiste = querySnapshot.docs.some(
                (doc) => doc.data().rif === formData.rif && doc.id !== path, // Excluye el documento actual
            )

            if (rifExiste) {
                toast.push(
                    <Notification title="Error">
                        El RIF ya está registrado. Por favor, verifica e intenta
                        con otro.
                    </Notification>,
                )
                return
            }

            // Verifica si el teléfono ya está registrado
            const phoneExiste = querySnapshot.docs.some(
                (doc) => doc.data().phone === formData.phone && doc.id !== path, // Excluye el documento actual
            )

            if (phoneExiste) {
                toast.push(
                    <Notification title="Error">
                        El teléfono ya está registrado. Por favor, verifica e
                        intenta con otro.
                    </Notification>,
                )
                return
            }

            let newImageUrl = formData.image_perfil // Mantiene la URL actual por defecto

            // Subir nueva imagen si se seleccionó un archivo
            if (formData.newLogoFile) {
                const decodedUrl = decodeURIComponent(formData.image_perfil)
                const lastImageName = decodedUrl.split('/').pop()?.split('?')[0] // Usa el operador opcional "?" aquí
                const baseName = `${path}_` // Usa `path` como UID del taller
                const match = lastImageName?.match(/_(\d+)\.jpg$/) // Busca un número antes de ".jpg"
                const lastNumber = match ? parseInt(match[1], 10) : 0
                const newImageName = `${baseName}${lastNumber + 1}.jpg`

                console.log(lastImageName, lastNumber, newImageName)

                // Referencia a la imagen anterior
                const oldImageRef = ref(
                    storage,
                    `profileImages/${lastImageName}`,
                )

                try {
                    // Eliminar la imagen anterior si existe
                    await deleteObject(oldImageRef)
                } catch (error) {
                    console.error(
                        'Error al eliminar la imagen anterior:',
                        error,
                    )
                    // Si la imagen no existe o no se puede eliminar, se registra el error pero no se detiene el flujo
                }

                // Subir la nueva imagen
                const storageRef = ref(storage, `profileImages/${newImageName}`)
                await uploadBytes(storageRef, formData.newLogoFile)

                // Obtener la URL de la nueva imagen
                newImageUrl = await getDownloadURL(storageRef)
            }

            // Actualiza los datos
            const docRef = doc(db, 'Usuarios', path)
            const updatedData = { ...formData, image_perfil: newImageUrl }
            delete updatedData.newLogoFile // Elimina cualquier campo no deseado antes de actualizar

            await updateDoc(docRef, updatedData)

            // Actualiza el estado local
            setData({ ...formData, image_perfil: newImageUrl })
            setEditModalOpen(false)
            getData()

            // Notifica éxito
            toast.push(
                <Notification title="Éxito" type="success">
                    Datos de Usuario actualizados correctamente.
                </Notification>,
            )
        } catch (error) {
            console.error('Error al actualizar los datos:', error)
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al actualizar los datos del usuario.
                    Inténtalo nuevamente.
                </Notification>,
            )
        }
    }

    const handleSavePaymentMethods = async () => {
        try {
            const docRef = doc(db, 'Usuarios', path)
            await updateDoc(docRef, {
                metodos_pago: paymentMethodsState,
            })
            toast.push(
                <Notification title="Éxito" type="success">
                    Métodos de pago actualizados correctamente.
                </Notification>,
            )
        } catch (error) {
            console.error('Error al guardar los métodos de pago:', error)
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al actualizar los métodos de pago.
                    Inténtalo nuevamente.
                </Notification>,
            )
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
                const precio = parseFloat(row.original.precio)
                return `$${precio.toFixed(2)}`
            },
        },
        {
            header: 'Estatus',
            accessorKey: 'estatus',
            cell: ({ row }) => {
                const [estatus, setEstatus] = useState<boolean>(
                    row.original.estatus ?? false,
                )
                const handleStatusChange = async (val: boolean) => {
                    setEstatus(val)

                    const updatedServices = services.map((service) =>
                        service.uid_servicio === row.original.uid_servicio
                            ? { ...service, estatus: val }
                            : service,
                    )
                    setServices(updatedServices)

                    try {
                        const docRef = doc(
                            db,
                            'Servicios',
                            row.original.uid_servicio,
                        )
                        await updateDoc(docRef, { estatus: val })
                        console.log('Estado del servicio actualizado')
                    } catch (error) {
                        console.error(
                            'Error al actualizar el estado del servicio:',
                            error,
                        )
                    }
                }

                return (
                    <div>
                        <Switcher
                            checked={estatus}
                            onChange={() => handleStatusChange(!estatus)}
                        />
                    </div>
                )
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
            },
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

    console.log('data del taller', formData)

    return (
        <Container className="h-full">
            {canGoBack && (
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(`${APP_PREFIX_PATH}/garages`)}
                        className="flex items-center text-blue-900 mb-3 ml-2 px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-200"
                    >
                        <FaArrowLeft className="mr-2" />
                        <span>Volver</span>
                    </button>
                </div>
            )}
            <div className="flex flex-col xl:flex-row gap-4">
                <Card>
                    <div className="flex flex-col xl:justify-between min-w-[260px] h-full 2xl:min-w-[360px] mx-auto">
                        <div className="flex xl:flex-col items-center gap-4">
                            <Avatar
                                size={90}
                                shape="circle"
                                src={
                                    data?.image_perfil ||
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
                                title="Estado"
                                value={data?.estado || 'Estado no disponible'}
                            />
                            <CustomerInfoField
                                title="Estatus"
                                value={data?.status || 'Estatus no disponible'}
                            />
                            <CustomerInfoField
                                title="Direccion"
                                value={
                                    data?.Direccion || 'Direccion no disponible'
                                }
                            />
                            {/* <CustomerInfoField
                                title="Ubicación"
                                value=
                            /> */}

                            {data?.ubicacion ? (
                                <MapsProfile
                                    center={{
                                        lat: data.ubicacion.lat,
                                        lng: data.ubicacion.lng,
                                    }}
                                    markers={[
                                        {
                                            lat: data.ubicacion.lat,
                                            lng: data.ubicacion.lng,
                                        },
                                    ]}
                                />
                            ) : (
                                'Ubicación no disponible'
                            )}

                            {/* Redes Sociales */}
                            <div className="mb-7">
                                <span>Redes Sociales</span>
                                <div className="flex mt-4 gap-2">
                                    {data?.LinkFacebook ||
                                    data?.LinkInstagram ||
                                    data?.whatsapp ||
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
                                            {data.whatsapp && (
                                                <a
                                                    href={`https://wa.me/${
                                                        data.whatsapp
                                                    }?text=${encodeURIComponent(
                                                        'Hola, quiero más información sobre el servicio',
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={data.whatsapp}
                                                >
                                                    <Button
                                                        shape="circle"
                                                        size="sm"
                                                        icon={
                                                            <FaWhatsapp className="text-[#25d366]" />
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
                                <button
                                    className="bg-[#1d1e56] rounded-md p-2 hover:bg-[#1E3a8a] text-white"
                                    onClick={onEdit}
                                >
                                    Editar
                                </button>
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
                                                Puede visualizar y suscribirse a
                                                un plan para su taller...
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setDialogOpensub(true)
                                                }
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
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {subscription?.nombre ||
                                                                'Cargando...'}
                                                        </h3>
                                                        <Tag
                                                            className={`rounded-md border-0 mx-2 ${
                                                                subscription?.status ===
                                                                'Aprobado'
                                                                    ? 'bg-green-100 text-green-400'
                                                                    : 'bg-yellow-100 text-yellow-400'
                                                            }`}
                                                        >
                                                            {subscription?.status ||
                                                                'Pendiente'}
                                                        </Tag>
                                                    </div>
                                                    <div className="grid grid-cols-4">
                                                        <p className="text-xs text-gray-500">
                                                            Vigencia:{' '}
                                                            {subscription?.vigencia ??
                                                                '---'}{' '}
                                                            días
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Monto mensual:{' '}
                                                            <span className="font-bold text-gray-800">
                                                                $
                                                                {subscription?.monto ??
                                                                    '---'}
                                                            </span>
                                                        </p>
                                                        {subscription?.status ===
                                                            'Aprobado' && (
                                                            <>
                                                                <p className="text-xs ml-2 text-gray-600">
                                                                    {diasRestantes ??
                                                                        '---'}{' '}
                                                                    días
                                                                    restantes
                                                                </p>
                                                                <p className="text-xs ml-2 text-gray-600">
                                                                    Fecha de
                                                                    vencimiento:{' '}
                                                                    <span className="text-xs text-gray-600">
                                                                        {subscription.fecha_fin
                                                                            ? formatDate(
                                                                                  subscription.fecha_fin,
                                                                              )
                                                                            : 'Fecha no disponible'}
                                                                    </span>
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {subscription?.status ===
                                                'Por Aprobar' && (
                                                <div className="flex justify-end mt-2">
                                                    <PaymentDrawer
                                                        talleruid={path}
                                                        subscriptionId={
                                                            subscripcionestable[0]
                                                                ?.uid
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                                <div>
                                    <div className="p-4 rounded-lg shadow">
                                        <h6 className="mb-6 flex justify-start mt-4">
                                            Historial de Subscripciones
                                        </h6>
                                        <Table className="w-full rounded-lg">
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
                                        <div
                                            key={method.name}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                checked={
                                                    paymentMethodsState[
                                                        method.dbKey
                                                    ] || false
                                                }
                                                onChange={(
                                                    checked: boolean,
                                                ) => {
                                                    setPaymentMethodsState(
                                                        (prevState) => ({
                                                            ...prevState,
                                                            [method.dbKey]:
                                                                checked,
                                                        }),
                                                    )
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
                                        className="px-4 py-2 bg-[#1d1e56] text-white rounded-md hover:bg-blue-900 focus:outline-none"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </TabContent>
                    </div>
                    <TabContent value="tab2">
                        <div className="w-[50vw]">
                            <div className="p-1 rounded-lg">
                                <h6 className="mb-6 flex justify-start mt-4">
                                    Lista de Servicios
                                </h6>
                                <Table
                                    className="w-full  rounded-lg"
                                    width={700}
                                >
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
                    <h2 className="mb-4">Planes de Subscripción</h2>
                    <div className="p-2 rounded-lg shadow">
                        <Table className="w-full rounded-lg">
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
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}

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
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <Td key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </Td>
                                                ))}
                                            <Td>
                                                <button
                                                    className="bg-[#1d1e56] text-white px-4 py-2 rounded"
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
                                {!formData.image_perfil &&
                                !formData.newLogoFile ? (
                                    <FaCamera
                                        className="mx-auto h-12 w-12 text-gray-300"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <div>
                                        <img
                                            src={
                                                formData.newLogoFile
                                                    ? URL.createObjectURL(
                                                          formData.newLogoFile,
                                                      )
                                                    : formData.image_perfil
                                            }
                                            alt="Preview Logo"
                                            className="mx-auto h-32 w-32 object-cover"
                                        />
                                        <button
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    newLogoFile: null,
                                                    image_perfil: '',
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
                                            {formData.newLogoFile
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
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    newLogoFile: file || null, // Actualiza el archivo o lo establece como null
                                                }))
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
                            <label className="block">
                                <span className="text-gray-700 font-semibold">
                                    WhatsApp
                                </span>
                                <input
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder="WhatsApp"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleEditChange}
                                />
                            </label>
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    RIF:
                                </span>
                                <div className="flex items-center mt-1">
                                    <select
                                        value={
                                            formData.rif?.split('-')[0] || 'J'
                                        }
                                        onChange={(e) =>
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                rif: `${e.target.value}-${
                                                    prev?.rif?.split('-')[1] ||
                                                    ''
                                                }`,
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
                                        value={
                                            formData.rif?.split('-')[1] || ''
                                        }
                                        onChange={(e) =>
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                rif: `${
                                                    prev?.rif?.split('-')[0] ||
                                                    'J'
                                                }-${e.target.value}`,
                                            }))
                                        }
                                        className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
                                    />
                                </div>
                            </label>

                            {/* Estado */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Estado:
                                </span>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleEditChange} // Asegúrate de tener esta función para manejar el cambio
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <option value="">
                                        Seleccione un Estado
                                    </option>
                                    {[
                                        'Amazonas',
                                        'Anzoátegui',
                                        'Apure',
                                        'Aragua',
                                        'Barinas',
                                        'Bolívar',
                                        'Carabobo',
                                        'Cojedes',
                                        'Delta Amacuro',
                                        'Distrito Capital',
                                        'Falcón',
                                        'Guárico',
                                        'Lara',
                                        'Mérida',
                                        'Miranda',
                                        'Monagas',
                                        'Nueva Esparta',
                                        'Portuguesa',
                                        'Sucre',
                                        'Táchira',
                                        'Trujillo',
                                        'Vargas',
                                        'Yaracuy',
                                        'Zulia',
                                    ].map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-700 font-semibold">
                                    Direccion
                                </span>
                                <input
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder=""
                                    name="Direccion"
                                    value={formData.Direccion}
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
                                    <option value="En espera por aprobación">
                                        En espera por aprobación
                                    </option>
                                </select>
                            </label>
                            {/* URL de Facebook */}
                            <label className="block">
                                <span className="text-gray-700 font-semibold">
                                    Facebook
                                </span>
                                <input
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder="URL de Facebook"
                                    name="LinkFacebook"
                                    value={formData.LinkFacebook}
                                    onChange={(e) =>
                                        handleUrlChange(e, 'facebook')
                                    }
                                />
                                {urlErrors.facebook && (
                                    <span className="text-red-500 text-sm">
                                        {urlErrors.facebook}
                                    </span>
                                )}
                            </label>

                            {/* URL de Instagram */}
                            <label className="block">
                                <span className="text-gray-700 font-semibold">
                                    Instagram
                                </span>
                                <input
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder="URL de Instagram"
                                    name="LinkInstagram"
                                    value={formData.LinkInstagram}
                                    onChange={(e) =>
                                        handleUrlChange(e, 'instagram')
                                    }
                                />
                                {urlErrors.instagram && (
                                    <span className="text-red-500 text-sm">
                                        {urlErrors.instagram}
                                    </span>
                                )}
                            </label>

                            {/* URL de TikTok */}
                            <label className="block">
                                <span className="text-gray-700 font-semibold">
                                    TikTok
                                </span>
                                <input
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder="URL de TikTok"
                                    name="LinkTiktok"
                                    value={formData.LinkTiktok}
                                    onChange={(e) =>
                                        handleUrlChange(e, 'tiktok')
                                    }
                                />
                                {urlErrors.tiktok && (
                                    <span className="text-red-500 text-sm">
                                        {urlErrors.tiktok}
                                    </span>
                                )}
                            </label>
                        </div>
                    </div>
                </ConfirmDialog>
            )}
        </Container>
    )
}

export default ProfileGarage
