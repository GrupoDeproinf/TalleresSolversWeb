import { useEffect, useState, useCallback, useMemo } from 'react'
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
    FaFileUpload,
    FaFilePdf,
    FaImage,
    FaTimes,
    FaRegEye,
    FaSearchPlus,
    FaSearchMinus,
    FaExpand,
    FaRedo,
    FaUndo,
    FaArrowsAltH,
    FaArrowsAltV,
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
import EditServiceDrawer from './Components/EditServiceDrawer'
import axios from 'axios'

type Service = {
    nombre_servicio: string
    descripcion: string
    precio: string
    taller: string
    puntuacion: string
    uid_servicio: string
    estatus: boolean
    uid_taller: string
    uid_categoria: string
    nombre_categoria: string
    subcategoria: any[]
    garantia: string
    typeService: string
    service_image: string[]
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
    const [dataOrigin, setdataOrigin] = useState<DocumentData | null>(null)
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
        rifIdFiscal?: string
        permisoOperacion?: string
        logotipoNegocio?: string
        fotoFrenteTaller?: string
        fotoInternaTaller?: string
        rifIdFiscal_file?: File | null
        permisoOperacion_file?: File | null
        logotipoNegocio_file?: File | null
        fotoFrenteTaller_file?: File | null
        fotoInternaTaller_file?: File | null
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
        newLogoFile: null,
        rifIdFiscal: '',
        permisoOperacion: '',
        logotipoNegocio: '',
        fotoFrenteTaller: '',
        fotoInternaTaller: '',
        rifIdFiscal_file: null,
        permisoOperacion_file: null,
        logotipoNegocio_file: null,
        fotoFrenteTaller_file: null,
        fotoInternaTaller_file: null,
    })

    const [selectedPlace, setSelectedPlace] = useState<{
        lat: number
        lng: number
    } | null>(null)

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

            setdataOrigin(dataFinal)

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
                    uid_taller: serviceData?.uid_taller || '',
                    uid_categoria: serviceData?.uid_categoria || '',
                    nombre_categoria: serviceData?.nombre_categoria || '',
                    subcategoria: serviceData?.subcategoria || [],
                    garantia: serviceData?.garantia || '',
                    typeService: serviceData?.typeService || 'local',
                    service_image: serviceData?.service_image || serviceData?.imagenes || [],
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
            //console.log(services)
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
                rifIdFiscal: dataFinal?.rifIdFiscal ?? '',
                permisoOperacion: dataFinal?.permisoOperacion ?? '',
                logotipoNegocio: dataFinal?.logotipoNegocio ?? '',
                fotoFrenteTaller: dataFinal?.fotoFrenteTaller ?? '',
                fotoInternaTaller: dataFinal?.fotoInternaTaller ?? '',
                rifIdFiscal_file: null,
                permisoOperacion_file: null,
                logotipoNegocio_file: null,
                fotoFrenteTaller_file: null,
                fotoInternaTaller_file: null,
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

    // Función helper para extraer el nombre del archivo de una URL
    const getFileNameFromUrl = (url: string | undefined): string => {
        if (!url) return 'Documento existente'
        try {
            // Decodificar la URL para manejar caracteres especiales
            const decodedUrl = decodeURIComponent(url)
            
            // Intentar extraer el nombre del archivo de diferentes formatos de URL
            // Formato 1: .../documents/{uid}/{fieldName}.{extension}?...
            // Formato 2: .../o/documents%2F{uid}%2F{fieldName}.{extension}?...
            
            // Buscar el patrón /documents/ o documents%2F
            const documentsMatch = decodedUrl.match(/\/documents\/[^\/]+\/([^?]+)/) || 
                                  decodedUrl.match(/documents%2F[^%]+%2F([^?%]+)/)
            
            if (documentsMatch && documentsMatch[1]) {
                const fileName = documentsMatch[1]
                // Si el nombre tiene extensión, devolverlo
                if (fileName.includes('.')) {
                    return fileName
                }
            }
            
            // Si no se encontró con el patrón anterior, intentar extraer de la última parte de la URL
            const urlParts = decodedUrl.split('/')
            const lastPart = urlParts[urlParts.length - 1]
            const fileName = lastPart.split('?')[0]
            
            // Si el nombre tiene extensión, devolverlo
            if (fileName && fileName.includes('.')) {
                return fileName
            }
            
            return 'Documento existente'
        } catch (error) {
            console.error('Error extrayendo nombre del archivo:', error)
            return 'Documento existente'
        }
    }

    const handleSubscribe = async (plan: any) => {
        try {
            const usuarioDocRef = doc(db, 'Usuarios', path)
            const newSubscriptionRef = doc(collection(db, 'Subscripciones'))

            // Determinar si el plan es gratuito
            const isFreePlan = plan.monto === 0 || (plan.monto < 0.01 && plan.monto > -0.01)
            
            // Si es plan gratuito, aprobar automáticamente; si no, dejar pendiente
            const subscriptionStatus = isFreePlan ? 'Aprobado' : 'Por Aprobar'

            const fechaInicio = new Date()
            const vigenciaDias = parseInt(plan.vigencia, 10) || 30 // Si no hay vigencia, usar 30 días por defecto
            const fechaFin = new Date(fechaInicio)
            fechaFin.setDate(fechaInicio.getDate() + vigenciaDias)

            const subscriptionData = {
                uid: newSubscriptionRef.id,
                nombre: plan.nombre,
                monto: plan.monto,
                vigencia: plan.vigencia,
                cantidad_servicios: plan.cantidad_servicios,
                status: subscriptionStatus,
                taller_uid: path,
                fechaCreacion: Timestamp.fromDate(new Date()),
                ...(isFreePlan && {
                    fecha_inicio: Timestamp.fromDate(fechaInicio),
                    fecha_fin: Timestamp.fromDate(fechaFin),
                }),
            }

            await setDoc(newSubscriptionRef, subscriptionData)

            await updateDoc(usuarioDocRef, {
                subscripcion_actual: {
                    uid: newSubscriptionRef.id,
                    nombre: plan.nombre,
                    monto: plan.monto,
                    vigencia: plan.vigencia,
                    cantidad_servicios: plan.cantidad_servicios,
                    status: subscriptionStatus,
                    fecha_inicio: Timestamp.fromDate(fechaInicio),
                    fecha_fin: Timestamp.fromDate(fechaFin),
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
                    {isFreePlan 
                        ? 'Se ha subscrito correctamente al plan gratuito. Tu plan está activo.'
                        : 'Se ha subscrito correctamente a este plan. Espera la aprobación del pago.'}
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

        if (
            !formData.phone ||
            !/^[1-9]\d*$/.test(formData.phone)
        ) {
            toast.push(
                <Notification title="Error">
                    El teléfono debe contener solo números y no puede comenzar
                    con 0.
                </Notification>,
            )
            return
        }

        if (
            formData.whatsapp &&
            !/^[1-9]\d*$/.test(formData.whatsapp)
        ) {
            toast.push(
                <Notification title="Error">
                    El WhatsApp debe contener solo números y no puede comenzar
                    con 0.
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

        // Validar que los documentos obligatorios existan (archivo nuevo o URL existente)
        if (!formData.rifIdFiscal_file && !formData.rifIdFiscal) {
            toast.push(
                <Notification title="Error">
                    El RIF ID Fiscal es obligatorio. Debes subir un archivo o mantener el existente.
                </Notification>,
            )
            return
        }

        if (!formData.fotoFrenteTaller_file && !formData.fotoFrenteTaller) {
            toast.push(
                <Notification title="Error">
                    La foto del frente del taller es obligatoria. Debes subir un archivo o mantener el existente.
                </Notification>,
            )
            return
        }

        if (!formData.fotoInternaTaller_file && !formData.fotoInternaTaller) {
            toast.push(
                <Notification title="Error">
                    La foto interna del taller es obligatoria. Debes subir un archivo o mantener el existente.
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

                //console.log(lastImageName, lastNumber, newImageName)

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

            // Función helper para eliminar documento del storage
            const deleteDocumentFromStorage = async (url: string, fieldName: string) => {
                try {
                    // Extraer el nombre del archivo de la URL
                    const urlParts = url.split('/')
                    const fileNameWithQuery = urlParts[urlParts.length - 1]
                    const fileName = fileNameWithQuery.split('?')[0]
                    const oldDocRef = ref(storage, `documents/${path}/${fileName}`)
                    await deleteObject(oldDocRef)
                    console.log(`Documento ${fieldName} eliminado del storage`)
                } catch (error) {
                    console.error(`Error eliminando documento ${fieldName} del storage:`, error)
                }
            }

            // Función helper para subir/actualizar documentos
            const uploadDocument = async (
                file: File | null,
                fieldName: string,
                currentUrl: string | undefined,
                shouldDelete: boolean = false
            ): Promise<string | null> => {
                // Si se debe eliminar y hay una URL actual, eliminar del storage
                if (shouldDelete && currentUrl) {
                    await deleteDocumentFromStorage(currentUrl, fieldName)
                    return null
                }

                // Si no hay archivo nuevo, mantener la URL actual
                if (!file) {
                    return currentUrl || null
                }

                try {
                    // Eliminar documento anterior si existe
                    if (currentUrl) {
                        await deleteDocumentFromStorage(currentUrl, fieldName)
                    }

                    // Obtener la extensión del archivo
                    const fileType = file.name.split('.').pop()?.toLowerCase()
                    if (!fileType) {
                        console.warn(`No se pudo obtener la extensión del archivo: ${fieldName}`)
                        return currentUrl || null
                    }

                    // Crear el nombre del archivo: {nombreCampo}.{extension}
                    const fileName = `${fieldName}.${fileType}`
                    const storageRef = ref(storage, `documents/${path}/${fileName}`)
                    
                    // Subir el archivo
                    await uploadBytes(storageRef, file)
                    
                    // Obtener la URL del archivo subido
                    const downloadUrl = await getDownloadURL(storageRef)
                    return downloadUrl
                } catch (error) {
                    console.error(`Error subiendo ${fieldName}:`, error)
                    return currentUrl || null
                }
            }

            // Determinar qué documentos deben eliminarse (campo vacío en formData pero había URL en dataOrigin)
            const shouldDeleteRifIdFiscal = !formData.rifIdFiscal_file && !formData.rifIdFiscal && !!dataOrigin?.rifIdFiscal
            const shouldDeletePermisoOperacion = !formData.permisoOperacion_file && !formData.permisoOperacion && !!dataOrigin?.permisoOperacion
            const shouldDeleteLogotipoNegocio = !formData.logotipoNegocio_file && !formData.logotipoNegocio && !!dataOrigin?.logotipoNegocio
            const shouldDeleteFotoFrenteTaller = !formData.fotoFrenteTaller_file && !formData.fotoFrenteTaller && !!dataOrigin?.fotoFrenteTaller
            const shouldDeleteFotoInternaTaller = !formData.fotoInternaTaller_file && !formData.fotoInternaTaller && !!dataOrigin?.fotoInternaTaller

            // Subir/actualizar documentos
            const documentPromises = [
                uploadDocument(
                    formData.rifIdFiscal_file || null,
                    'rifIdFiscal',
                    formData.rifIdFiscal || dataOrigin?.rifIdFiscal || undefined,
                    shouldDeleteRifIdFiscal
                ),
                uploadDocument(
                    formData.permisoOperacion_file || null,
                    'permisoOperacion',
                    formData.permisoOperacion || dataOrigin?.permisoOperacion || undefined,
                    shouldDeletePermisoOperacion
                ),
                uploadDocument(
                    formData.logotipoNegocio_file || null,
                    'logotipoNegocio',
                    formData.logotipoNegocio || dataOrigin?.logotipoNegocio || undefined,
                    shouldDeleteLogotipoNegocio
                ),
                uploadDocument(
                    formData.fotoFrenteTaller_file || null,
                    'fotoFrenteTaller',
                    formData.fotoFrenteTaller || dataOrigin?.fotoFrenteTaller || undefined,
                    shouldDeleteFotoFrenteTaller
                ),
                uploadDocument(
                    formData.fotoInternaTaller_file || null,
                    'fotoInternaTaller',
                    formData.fotoInternaTaller || dataOrigin?.fotoInternaTaller || undefined,
                    shouldDeleteFotoInternaTaller
                ),
            ]

            const documentResults = await Promise.all(documentPromises)
            
            // Preparar actualizaciones para Firestore
            const documentUpdates: Record<string, string | null> = {}
            const fieldNames = ['rifIdFiscal', 'permisoOperacion', 'logotipoNegocio', 'fotoFrenteTaller', 'fotoInternaTaller']
            
            fieldNames.forEach((fieldName, index) => {
                // Si el resultado es null, significa que se eliminó, así que establecer como null
                // Si hay un resultado, actualizar con la nueva URL
                if (documentResults[index] !== undefined) {
                    documentUpdates[fieldName] = documentResults[index]
                }
            })

            // Actualiza los datos
            const docRef = doc(db, 'Usuarios', path)
            const updatedData = { 
                ...formData, 
                image_perfil: newImageUrl,
                ...documentUpdates
            }
            delete updatedData.newLogoFile // Elimina cualquier campo no deseado antes de actualizar
            delete updatedData.rifIdFiscal_file
            delete updatedData.permisoOperacion_file
            delete updatedData.logotipoNegocio_file
            delete updatedData.fotoFrenteTaller_file
            delete updatedData.fotoInternaTaller_file

            await updateDoc(docRef, updatedData)

            // Actualiza el estado local
            setData({ ...formData, image_perfil: newImageUrl })
            setEditModalOpen(false)
            getData()

            console.log('Datos actualizados correctamente', formData)
            console.log('Datos originales', dataOrigin)

            if (formData?.status !== dataOrigin?.status) {
                console.log('Cambio de estado kelfsklflksflks')

                try {
                    await axios.post('https://apisolvers.solversapp.com/api/usuarios/sendNotification', {
                        token: dataOrigin?.token,
                        title: 'Cambio de estatus',
                        body: "Hola, su usuario ha cambiado de estado " + formData?.status + ". Cierre sesión y vuelva a ingresar por favor.",
                        secretCode: "Cambio de estado",
                    });
                } catch (error) {
                    console.error('Error al enviar notificación:', error);
                }

            }


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

    const handleEditService = (service: Service) => {
        setSelectedService(service)
        setIsEditDrawerOpen(true)
    }

    const columns: ColumnDef<Service>[] = useMemo(() => [
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
                    // Si intenta encender el servicio, verificar que el plan esté activo y aprobado
                    if (val === true) {
                        if (subscription?.status !== 'Aprobado') {
                            toast.push(
                                <Notification
                                    title="Plan no activo"
                                    type="warning"
                                >
                                    No puedes encender servicios. Tu plan debe estar activo y aprobado.
                                </Notification>,
                            )
                            return
                        }
                    }

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
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="">
                        <Button
                            size="sm"
                            variant="solid"
                            onClick={() => handleEditService(row.original)}
                            className="text-blue-900 hover:bg-blue-700"
                        >
                            <FaEdit />
                        </Button>
                    </div>
                )
            },
        },
    ], [subscription, services, handleEditService])

    const columns2: ColumnDef<Planes>[] = [
        {
            header: 'Nombre del Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
            cell: ({ getValue }) => {
                const value = getValue() as number;
                if (value === 0 || (value < 0.01 && value > -0.01)) {
                    return 'Gratis';
                }
                return value;
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
    const columns3: ColumnDef<SubscriptionHistory>[] = [
        {
            header: 'Nombre del Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
            cell: ({ getValue }) => {
                const value = getValue() as number;
                if (value === 0 || (value < 0.01 && value > -0.01)) {
                    return 'Gratuito';
                }
                return `$${value}`;
            },
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
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const dataservice = table.getRowModel().rows
    const totalRows = dataservice.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    //console.log('data del taller', formData)

    const [isMapOpen, setIsMapOpen] = useState(false) // Estado para controlar el modal del mapa
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false) // Estado para controlar el drawer de edición
    const [selectedService, setSelectedService] = useState<Service | null>(null) // Servicio seleccionado para editar
    const [documentModalOpen, setDocumentModalOpen] = useState(false) // Estado para controlar el modal de documentos
    const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string; type: 'image' | 'pdf' } | null>(null) // Documento seleccionado para mostrar en el modal
    const [zoomLevel, setZoomLevel] = useState(1) // Nivel de zoom (1 = 100%)
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 }) // Posición de arrastre
    const [isDragging, setIsDragging] = useState(false) // Si está arrastrando
    const [imageRotation, setImageRotation] = useState(0) // Rotación en grados (0, 90, 180, 270)
    const [flipHorizontal, setFlipHorizontal] = useState(false)
    const [flipVertical, setFlipVertical] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 }) // Posición inicial del mouse al comenzar arrastre

    const toggleMapModal = () => {
        setIsMapOpen((prev) => !prev) // Alternar la visibilidad del modal
    }

    const openDocumentModal = (url: string, name: string, type: 'image' | 'pdf') => {
        setSelectedDocument({ url, name, type })
        setDocumentModalOpen(true)
        setZoomLevel(1) // Resetear zoom al abrir un nuevo documento
        setDragPosition({ x: 0, y: 0 }) // Resetear posición de arrastre
        setImageRotation(0)
        setFlipHorizontal(false)
        setFlipVertical(false)
    }

    const closeDocumentModal = () => {
        setDocumentModalOpen(false)
        setSelectedDocument(null)
        setZoomLevel(1) // Resetear zoom al cerrar
        setDragPosition({ x: 0, y: 0 }) // Resetear posición de arrastre
        setIsDragging(false)
        setImageRotation(0)
        setFlipHorizontal(false)
        setFlipVertical(false)
    }

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.25, 3)) // Máximo 300%
    }

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.25, 0.5)) // Mínimo 50%
    }

    const handleZoomReset = () => {
        setZoomLevel(1)
        setDragPosition({ x: 0, y: 0 }) // Resetear posición al resetear zoom
    }

    const handleRotateRight = () => {
        setImageRotation((prev) => (prev + 90) % 360)
    }

    const handleRotateLeft = () => {
        setImageRotation((prev) => (prev - 90 + 360) % 360)
    }

    const handleFlipHorizontal = () => setFlipHorizontal((prev) => !prev)
    const handleFlipVertical = () => setFlipVertical((prev) => !prev)

    const handleWheelZoom = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev + delta)))
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoomLevel > 1 && selectedDocument?.type === 'image') {
            setIsDragging(true)
            setDragStart({ x: e.clientX - dragPosition.x, y: e.clientY - dragPosition.y })
            e.preventDefault()
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoomLevel > 1) {
            const newX = e.clientX - dragStart.x
            const newY = e.clientY - dragStart.y
            setDragPosition({ x: newX, y: newY })
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Resetear posición cuando el zoom vuelve a 1
    useEffect(() => {
        if (zoomLevel === 1) {
            setDragPosition({ x: 0, y: 0 })
        }
    }, [zoomLevel])

    // Manejar eventos globales para el arrastre
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (e: MouseEvent) => {
                const newX = e.clientX - dragStart.x
                const newY = e.clientY - dragStart.y
                setDragPosition({ x: newX, y: newY })
            }

            const handleGlobalMouseUp = () => {
                setIsDragging(false)
            }

            document.addEventListener('mousemove', handleGlobalMouseMove)
            document.addEventListener('mouseup', handleGlobalMouseUp)

            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove)
                document.removeEventListener('mouseup', handleGlobalMouseUp)
            }
        }
    }, [isDragging, dragStart])

    const handleCloseEditDrawer = () => {
        setIsEditDrawerOpen(false)
        setSelectedService(null)
    }

    const handleServiceUpdated = () => {
        // Recargar los servicios después de una actualización
        getData()
    }

    return (
        <Container className="min-h-screen overflow-y-auto pb-8">
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
            {/* Aqui empieza el card del taller */}
            <div className="flex flex-col xl:flex-row gap-4 pb-8">
                <Card>
                    {/* Botón Editar */}
                    <div className="mt-4 flex justify-end">
                        <button
                            className="bg-[#1d1e56] rounded-md p-2 hover:bg-[#1E3a8a] text-white"
                            onClick={onEdit}
                        >
                            Editar
                        </button>
                    </div>
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
                        </div>
                    </div>
                </Card>
                {/* Aqui empieza el tab */}
                <div className="flex-1 min-w-0">
                    <Tabs defaultValue="tab1">
                        <TabList>
                            <TabNav value="tab1">Planes</TabNav>
                            <TabNav value="tab2">Servicios</TabNav>
                            <TabNav value="tab3">Documentos</TabNav>
                        </TabList>
                        <div className="w-full">
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
                                                    className="bg-transparent"
                                                    shape="circle"
                                                    icon={<HiFire className="text-blue-600" />}
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
                                                                    : subscription?.status === 'Vencido'
                                                                    ? 'bg-red-100 text-red-400'
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
                                                                {subscription?.monto !== undefined && subscription?.monto !== null
                                                                    ? (subscription.monto === 0 || (subscription.monto < 0.01 && subscription.monto > -0.01))
                                                                        ? 'Gratis'
                                                                        : `$${subscription.monto}`
                                                                    : '---'}
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
                                                'Vencido' && (
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() =>
                                                            setDialogOpensub(true)
                                                        }
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                                                    >
                                                        Elegir Plan
                                                    </button>
                                                    {subscription?.uid && (
                                                        <PaymentDrawer
                                                            talleruid={path}
                                                            subscriptionId={
                                                                subscription?.uid || ''
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            {subscription?.status ===
                                                'Aprobado' && (
                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        onClick={() => setDialogOpensub(true)}
                                                        className="bg-blue-900 rounded-md p-2 text-white hover:bg-blue-700"
                                                    >
                                                        Renovar Pago
                                                    </button>
                                                </div>
                                            )}
                                            {subscription?.status ===
                                                'Por Aprobar' && (
                                                <div className="flex justify-end mt-2">
                                                    <PaymentDrawer
                                                        talleruid={path}
                                                        subscriptionId={
                                                            subscription?.uid || ''
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
                                            onRowsPerPageChange={onRowsPerPageChange}
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
                        <div className="w-full h-full">
                            <div className="p-4 rounded-lg">
                                <h6 className="mb-6 flex justify-start mt-4">
                                    Lista de Servicios
                                </h6>
                                <Table
                                    className="w-full rounded-lg"
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
                                    onRowsPerPageChange={onRowsPerPageChange}
                                />
                            </div>
                        </div>
                    </TabContent>
                    <TabContent value="tab3">
                        <div className="w-full h-full p-4">
                            <h6 className="mb-6 flex justify-start mt-4">
                                Documentos del Taller
                            </h6>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Todos los documentos en un grid de 3 columnas */}
                                {data?.rifIdFiscal && (
                                    <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                        onClick={() => openDocumentModal(
                                            data.rifIdFiscal,
                                            'RIF ID Fiscal',
                                            data.rifIdFiscal.includes('.pdf') ? 'pdf' : 'image'
                                        )}
                                    >
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                            {data.rifIdFiscal.includes('.pdf') ? (
                                                <div className="text-center">
                                                    <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-gray-700">RIF ID Fiscal</p>
                                                    <p className="text-xs text-gray-500">PDF</p>
                                                </div>
                                            ) : (
                                                <img
                                                    src={data.rifIdFiscal}
                                                    alt="RIF ID Fiscal"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none'
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                            <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                                {data?.permisoOperacion && (
                                    <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                        onClick={() => openDocumentModal(
                                            data.permisoOperacion,
                                            'Permiso de Operación',
                                            data.permisoOperacion.includes('.pdf') ? 'pdf' : 'image'
                                        )}
                                    >
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                            {data.permisoOperacion.includes('.pdf') ? (
                                                <div className="text-center">
                                                    <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-gray-700">Permiso de Operación</p>
                                                    <p className="text-xs text-gray-500">PDF</p>
                                                </div>
                                            ) : (
                                                <img
                                                    src={data.permisoOperacion}
                                                    alt="Permiso de Operación"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none'
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                            <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                                {data?.logotipoNegocio && (
                                    <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                        onClick={() => openDocumentModal(
                                            data.logotipoNegocio,
                                            'Logotipo Negocio',
                                            'image'
                                        )}
                                    >
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={data.logotipoNegocio}
                                                alt="Logotipo Negocio"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                            <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                                {data?.fotoFrenteTaller && (
                                    <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                        onClick={() => openDocumentModal(
                                            data.fotoFrenteTaller,
                                            'Foto Frente Taller',
                                            'image'
                                        )}
                                    >
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={data.fotoFrenteTaller}
                                                alt="Foto Frente Taller"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                            <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                                {data?.fotoInternaTaller && (
                                    <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                        onClick={() => openDocumentModal(
                                            data.fotoInternaTaller,
                                            'Foto Interna Taller',
                                            'image'
                                        )}
                                    >
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={data.fotoInternaTaller}
                                                alt="Foto Interna Taller"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                            <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {(!data?.rifIdFiscal && !data?.permisoOperacion && !data?.logotipoNegocio && !data?.fotoFrenteTaller && !data?.fotoInternaTaller) && (
                                <div className="text-center py-12 text-gray-500">
                                    <FaFileUpload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-semibold">No hay documentos disponibles</p>
                                    <p className="text-sm">Los documentos aparecerán aquí una vez que se suban</p>
                                </div>
                            )}
                        </div>
                    </TabContent>
                </Tabs>
                    </div>
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
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        // Prevenir escribir 0 al principio
                                        if (e.currentTarget.value === '' && e.key === '0') {
                                            e.preventDefault()
                                        }
                                    }}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                        // Remover 0 al principio si se pega texto
                                        const target = e.target as HTMLInputElement
                                        const value = target.value.replace(/^0+/, '')
                                        if (value !== target.value) {
                                            setFormData((prev) => ({ ...prev, phone: value }))
                                        }
                                    }}
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
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        // Prevenir escribir 0 al principio
                                        if (e.currentTarget.value === '' && e.key === '0') {
                                            e.preventDefault()
                                        }
                                    }}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                        // Remover 0 al principio si se pega texto
                                        const target = e.target as HTMLInputElement
                                        const value = target.value.replace(/^0+/, '')
                                        if (value !== target.value) {
                                            setFormData((prev) => ({ ...prev, whatsapp: value }))
                                        }
                                    }}
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
                                        disabled
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
                                        'La Guaira',
                                        'Mérida',
                                        'Miranda',
                                        'Monagas',
                                        'Nueva Esparta',
                                        'Portuguesa',
                                        'Sucre',
                                        'Táchira',
                                        'Trujillo',
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
                                    Mapa
                                </span>
                                <button
                                    type="button"
                                    className="w-full mt-1 p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                                    onClick={toggleMapModal} // Abre el modal al hacer clic
                                >
                                    Abrir Mapa
                                </button>
                            </label>

                            {/* Modal para el mapa */}
                            {isMapOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-semibold text-gray-800">
                                                Editar ubicación
                                            </h2>
                                            <button
                                                className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                                onClick={toggleMapModal} // Cierra el modal
                                            >
                                                ✖
                                            </button>
                                        </div>
                                        {/* Componente del mapa */}
                                        <MapsEdit
                                            initialLocation={{
                                                lat: formData.ubicacion.lat,
                                                lng: formData.ubicacion.lng,
                                            }}
                                            onLocationChange={(newLocation) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    ubicacion: newLocation, // Actualiza la ubicación en el formulario
                                                }))
                                            }
                                        />
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                                                onClick={toggleMapModal} // Guarda y cierra el modal
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
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

                        {/* Campos de documentos */}
                        <div className="border-t pt-4 mt-4 col-span-2">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Documentos
                            </h3>
                            
                            {/* RIF ID Fiscal */}
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    RIF ID Fiscal: <span className="text-red-500">*</span>
                                </label>
                                {!formData.rifIdFiscal_file && !formData.rifIdFiscal ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                                            id="rifIdFiscal-upload"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        rifIdFiscal_file: file
                                                    }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="rifIdFiscal-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors duration-200"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-2">
                                                <FaFileUpload className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600 hover:text-blue-700">Click para subir</span> o arrastra aquí
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Imágenes o PDF</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            {formData.rifIdFiscal_file ? (
                                                (formData.rifIdFiscal_file as File).type.includes('pdf') ? (
                                                    <FaFilePdf className="w-6 h-6 text-red-500" />
                                                ) : (
                                                    <FaImage className="w-6 h-6 text-blue-500" />
                                                )
                                            ) : formData.rifIdFiscal?.includes('.pdf') ? (
                                                <FaFilePdf className="w-6 h-6 text-red-500" />
                                            ) : (
                                                <FaImage className="w-6 h-6 text-blue-500" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {formData.rifIdFiscal_file 
                                                        ? (formData.rifIdFiscal_file as File).name
                                                        : getFileNameFromUrl(formData.rifIdFiscal)}
                                                </p>
                                                {formData.rifIdFiscal_file && (
                                                    <p className="text-xs text-gray-500">
                                                        {((formData.rifIdFiscal_file as File).size / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({
                                                ...prev,
                                                rifIdFiscal_file: null,
                                                rifIdFiscal: ''
                                            }))}
                                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Permisos de Operación */}
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Permisos de Operación:
                                </label>
                                {!formData.permisoOperacion_file && !formData.permisoOperacion ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                                            id="permisoOperacion-upload"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        permisoOperacion_file: file
                                                    }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="permisoOperacion-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors duration-200"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-2">
                                                <FaFileUpload className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600 hover:text-blue-700">Click para subir</span> o arrastra aquí
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Imágenes o PDF</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            {formData.permisoOperacion_file ? (
                                                (formData.permisoOperacion_file as File).type.includes('pdf') ? (
                                                    <FaFilePdf className="w-6 h-6 text-red-500" />
                                                ) : (
                                                    <FaImage className="w-6 h-6 text-blue-500" />
                                                )
                                            ) : formData.permisoOperacion?.includes('.pdf') ? (
                                                <FaFilePdf className="w-6 h-6 text-red-500" />
                                            ) : (
                                                <FaImage className="w-6 h-6 text-blue-500" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {formData.permisoOperacion_file 
                                                        ? (formData.permisoOperacion_file as File).name
                                                        : getFileNameFromUrl(formData.permisoOperacion)}
                                                </p>
                                                {formData.permisoOperacion_file && (
                                                    <p className="text-xs text-gray-500">
                                                        {((formData.permisoOperacion_file as File).size / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({
                                                ...prev,
                                                permisoOperacion_file: null,
                                                permisoOperacion: ''
                                            }))}
                                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Logotipo Negocio */}
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Logotipo Negocio:
                                </label>
                                {!formData.logotipoNegocio_file && !formData.logotipoNegocio ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            id="logotipoNegocio-upload"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        logotipoNegocio_file: file
                                                    }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="logotipoNegocio-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors duration-200"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-2">
                                                <FaImage className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600 hover:text-blue-700">Click para subir</span> o arrastra aquí
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Solo imágenes</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            <FaImage className="w-6 h-6 text-blue-500" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {formData.logotipoNegocio_file 
                                                        ? (formData.logotipoNegocio_file as File).name
                                                        : getFileNameFromUrl(formData.logotipoNegocio)}
                                                </p>
                                                {formData.logotipoNegocio_file && (
                                                    <p className="text-xs text-gray-500">
                                                        {((formData.logotipoNegocio_file as File).size / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({
                                                ...prev,
                                                logotipoNegocio_file: null,
                                                logotipoNegocio: ''
                                            }))}
                                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Foto Frente Taller */}
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Foto Frente Taller: <span className="text-red-500">*</span>
                                </label>
                                {!formData.fotoFrenteTaller_file && !formData.fotoFrenteTaller ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            id="fotoFrenteTaller-upload"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        fotoFrenteTaller_file: file
                                                    }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="fotoFrenteTaller-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors duration-200"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-2">
                                                <FaCamera className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600 hover:text-blue-700">Click para subir</span> o arrastra aquí
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Solo imágenes</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            <FaImage className="w-6 h-6 text-blue-500" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {formData.fotoFrenteTaller_file 
                                                        ? (formData.fotoFrenteTaller_file as File).name
                                                        : getFileNameFromUrl(formData.fotoFrenteTaller)}
                                                </p>
                                                {formData.fotoFrenteTaller_file && (
                                                    <p className="text-xs text-gray-500">
                                                        {((formData.fotoFrenteTaller_file as File).size / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({
                                                ...prev,
                                                fotoFrenteTaller_file: null,
                                                fotoFrenteTaller: ''
                                            }))}
                                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Foto Interna Taller */}
                            <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Foto Interna Taller: <span className="text-red-500">*</span>
                                </label>
                                {!formData.fotoInternaTaller_file && !formData.fotoInternaTaller ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            id="fotoInternaTaller-upload"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        fotoInternaTaller_file: file
                                                    }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="fotoInternaTaller-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors duration-200"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-2">
                                                <FaCamera className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600 hover:text-blue-700">Click para subir</span> o arrastra aquí
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Solo imágenes</p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            <FaImage className="w-6 h-6 text-blue-500" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {formData.fotoInternaTaller_file 
                                                        ? (formData.fotoInternaTaller_file as File).name
                                                        : getFileNameFromUrl(formData.fotoInternaTaller)}
                                                </p>
                                                {formData.fotoInternaTaller_file && (
                                                    <p className="text-xs text-gray-500">
                                                        {((formData.fotoInternaTaller_file as File).size / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({
                                                ...prev,
                                                fotoInternaTaller_file: null,
                                                fotoInternaTaller: ''
                                            }))}
                                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ConfirmDialog>
            )}

            {/* Drawer para editar servicio */}
            <EditServiceDrawer
                isOpen={isEditDrawerOpen}
                onClose={handleCloseEditDrawer}
                service={selectedService}
                onServiceUpdated={handleServiceUpdated}
            />

            {/* Modal para visualizar documentos */}
            {documentModalOpen && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeDocumentModal}>
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {selectedDocument.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                {/* Controles de zoom */}
                                <div className="flex items-center gap-2 mr-4 border-r pr-4">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 0.5}
                                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Alejar (Ctrl + Rueda del mouse)"
                                    >
                                        <FaSearchMinus className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 3}
                                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Acercar (Ctrl + Rueda del mouse)"
                                    >
                                        <FaSearchPlus className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleZoomReset}
                                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                        title="Restablecer zoom"
                                    >
                                        <FaExpand className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* Controles de rotar/voltear (solo para imágenes) */}
                                {selectedDocument.type === 'image' && (
                                    <div className="flex items-center gap-2 mr-4 border-r pr-4">
                                        <button
                                            onClick={handleRotateLeft}
                                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                            title="Rotar 90° a la izquierda"
                                        >
                                            <FaUndo className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleRotateRight}
                                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                            title="Rotar 90° a la derecha"
                                        >
                                            <FaRedo className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleFlipHorizontal}
                                            className={`p-2 rounded-md transition-colors ${flipHorizontal ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                                            title="Voltear horizontal"
                                        >
                                            <FaArrowsAltH className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleFlipVertical}
                                            className={`p-2 rounded-md transition-colors ${flipVertical ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                                            title="Voltear vertical"
                                        >
                                            <FaArrowsAltV className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={closeDocumentModal}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                                >
                                    <FaTimes className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div 
                            className="flex-1 overflow-hidden p-4 bg-gray-100 flex items-center justify-center relative"
                            onWheel={handleWheelZoom}
                        >
                            {selectedDocument.type === 'pdf' ? (
                                <div 
                                    style={{ 
                                        transform: `scale(${zoomLevel})`,
                                        transformOrigin: 'center center',
                                        transition: zoomLevel === 1 ? 'transform 0.2s ease-in-out' : 'none',
                                        width: `${100 / zoomLevel}%`,
                                        height: `${100 / zoomLevel}%`
                                    }}
                                >
                                    <iframe
                                        src={selectedDocument.url}
                                        className="w-full h-full min-h-[600px] border-0"
                                        title={selectedDocument.name}
                                    />
                                </div>
                            ) : (
                                <img
                                    src={selectedDocument.url}
                                    alt={selectedDocument.name}
                                    style={{
                                        transform: `rotate(${imageRotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1}) scale(${zoomLevel}) translate3d(${dragPosition.x / zoomLevel}px, ${dragPosition.y / zoomLevel}px, 0)`,
                                        transformOrigin: 'center center',
                                        transition: isDragging ? 'none' : (zoomLevel === 1 && dragPosition.x === 0 && dragPosition.y === 0 && imageRotation === 0 && !flipHorizontal && !flipVertical ? 'transform 0.2s ease-in-out' : 'none'),
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                    }}
                                    className="object-contain rounded-lg shadow-lg select-none"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    draggable={false}
                                    onError={(e) => {
                                        const imgElement = e.target as HTMLImageElement
                                        imgElement.style.display = 'none'
                                        const errorDiv = document.createElement('div')
                                        errorDiv.className = 'text-center text-gray-500 p-8'
                                        errorDiv.innerHTML = `
                                            <FaFilePdf class="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <p class="text-lg font-semibold">Error al cargar la imagen</p>
                                            <p class="text-sm">No se pudo mostrar el documento</p>
                                        `
                                        const parent = imgElement.parentElement
                                        if (parent) {
                                            parent.appendChild(errorDiv)
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <a
                                href={selectedDocument.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Abrir en una nueva pestaña
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}

export default ProfileGarage
