import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
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
import {
    FaCamera,
    FaCheckCircle,
    FaExclamationCircle,
    FaQuestionCircle,
    FaRegEye,
    FaTimesCircle,
    FaTrash,
    FaFileUpload,
    FaFilePdf,
    FaImage,
    FaTimes,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    deleteDoc,
    where,
    setDoc,
    updateDoc,
    Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import Drawer from '@/components/ui/Drawer' // Asegúrate de que esta ruta sea correcta
import { Avatar, Switcher } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import { GiMechanicGarage } from 'react-icons/gi'
import * as Yup from 'yup'
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik'
import Maps from './components/Googlemaps'
import { GrMapLocation } from 'react-icons/gr'
import Password from '@/views/account/Settings/components/Password'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/configs/firebaseAssets.config';
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import DatePicker from '@/components/ui/DatePicker'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'

interface SelectedPlace {
    latiLng: { lat: number; lng: number }
    zoom: number
}
type Subscripcion = {
    cantidad_servicios?: number
    fecha_fin?: Timestamp | { seconds: number; nanoseconds?: number } | string
    fecha_inicio?: Timestamp | { seconds: number; nanoseconds?: number } | string
    monto?: number
    nombre?: string
    status?: string
    vigencia?: string
}

type Garage = {
    nombre?: string
    email?: string
    rif?: string
    phone?: string
    uid: string
    typeUser?: string
    image_perfil?: string
    image_file?: string
    Direccion?: string
    ubicacion?: string
    certificador_nombre?: string
    createdAt?: number | { seconds: number; nanoseconds?: number } | string
    scheduled_visit?: string
    subscripcion_actual?: Subscripcion
    id?: string
    status?: string
    password?: string
    confirmPassword?: string
    estado?: string
    LinkInstagram?: string
}

type StatusFilterOption = { value: string; label: string }

const GARAGE_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'En espera por aprobación', label: 'En espera por aprobación' },
    { value: 'Vencidos', label: 'Vencen hoy' },
]

function timestampLikeToMs(value: unknown): number {
    if (value == null) return 0
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (value instanceof Timestamp) return value.toMillis()
    if (
        typeof value === 'object' &&
        value !== null &&
        'seconds' in value &&
        typeof (value as { seconds: unknown }).seconds === 'number'
    ) {
        return (value as { seconds: number }).seconds * 1000
    }
    if (typeof value === 'string') {
        const t = new Date(value).getTime()
        return Number.isNaN(t) ? 0 : t
    }
    return 0
}

function formatEsDate(ms: number): string {
    if (!ms) return ''
    try {
        return new Date(ms).toLocaleDateString('es-ES')
    } catch {
        return ''
    }
}

/** Texto concatenado de todas las columnas visibles para búsqueda global */
function garageSearchableText(g: Garage): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }

    push(
        g.nombre,
        g.email,
        g.rif,
        g.phone,
        g.estado,
        g.certificador_nombre,
        g.status,
        g.Direccion,
        g.ubicacion,
        g.scheduled_visit,
        g.uid,
        g.id,
        g.LinkInstagram,
    )

    const createdMs = timestampLikeToMs(g.createdAt)
    if (createdMs) {
        push(
            formatEsDate(createdMs),
            new Date(createdMs).toISOString().slice(0, 10),
        )
    }

    const sub = g.subscripcion_actual
    if (sub) {
        push(sub.nombre, sub.status, sub.vigencia)
        if (sub.monto !== undefined && sub.monto !== null)
            parts.push(String(sub.monto))
        const fi = timestampLikeToMs(sub.fecha_inicio)
        const ff = timestampLikeToMs(sub.fecha_fin)
        if (fi) {
            push(formatEsDate(fi), new Date(fi).toISOString().slice(0, 10))
        }
        if (ff) {
            push(formatEsDate(ff), new Date(ff).toISOString().slice(0, 10))
        }
    }

    return parts.join(' ').toLowerCase()
}

function creationRangeToYmd(range: DatePickerRangeValue): {
    from: string
    to: string
} {
    const [start, end] = range
    return {
        from: start ? dayjs(start).format('YYYY-MM-DD') : '',
        to: end ? dayjs(end).format('YYYY-MM-DD') : '',
    }
}

const Garages = () => {
    const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
        null,
    )
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([
        { id: 'createdAt', desc: true } // Ordenar por fecha de creación descendente (más recientes primero)
    ])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('') // '' = Todos, 'Aprobado', 'En espera por aprobación', 'Vencidos'
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedPerson, setSelectedPerson] = useState<Garage | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false) // Estado para el Drawer
    const [exportDialogIsOpen, setExportDialogIsOpen] = useState(false) // Estado para el modal de exportación
    const [showEliminados, setShowEliminados] = useState(false) // Estado para mostrar/ocultar talleres eliminados
    const [creationDateRange, setCreationDateRange] =
        useState<DatePickerRangeValue>([null, null])
    const [isLoading, setIsLoading] = useState(false) // Estado para mostrar cargando al cambiar filtros pesados

    const isSameDay = (dateA: Date, dateB: Date) => {
        return (
            dateA.getFullYear() === dateB.getFullYear() &&
            dateA.getMonth() === dateB.getMonth() &&
            dateA.getDate() === dateB.getDate()
        )
    }

    const getData = async () => {
        setIsLoading(true)
        const q = query(collection(db, 'Usuarios'))
        const querySnapshot = await getDocs(q)
        const talleres: Garage[] = []
        const hoy = new Date()

        querySnapshot.forEach((doc) => {
            const garageData = doc.data() as Garage
            if (garageData.typeUser === 'Taller') {
                // Si showEliminados es true: solo eliminados; si es false: solo no eliminados
                if (showEliminados ? garageData.status === 'Eliminado' : garageData.status !== 'Eliminado') {
                    // Si el filtro de estado es "Vencidos", solo incluir talleres cuyo plan vence hoy
                    if (statusFilter === 'Vencidos') {
                        const subs = garageData.subscripcion_actual
                        if (subs && subs.fecha_fin instanceof Timestamp) {
                            const fechaFin = subs.fecha_fin.toDate()
                            if (isSameDay(fechaFin, hoy)) {
                                talleres.push({ ...garageData, id: doc.id }) // Guardar el ID del documento
                            }
                        }
                    } else {
                        talleres.push({ ...garageData, id: doc.id }) // Guardar el ID del documento
                    }
                }
            }
        })

        setDataGarages(talleres)
        setIsLoading(false)
    }

    const navigate = useNavigate()

    useEffect(() => {
        getData()
    }, [showEliminados, statusFilter])

    const handleRefresh = async () => {
        await getData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }

    const handleExportToExcel = () => {
        // Campos que queremos exportar
        const camposDeseados = [
            'nombre',
            'rif',
            'estado',
            'email',
            'phone',
            'status',
            'Direccion',
            'createdAt',
            'LinkInstagram',
        ]

        // Mapeo de encabezados en español
        const encabezados: Record<string, string> = {
            nombre: 'Nombre del Negocio',
            rif: 'RIF',
            estado: 'Estado',
            email: 'Correo Electrónico',
            phone: 'Número Telefónico',
            status: 'Estado de Aprobación',
            Direccion: 'Dirección',
            createdAt: 'Fecha de Creación',
            LinkInstagram: 'Link Instagram',
        }

        // Obtener los datos filtrados Y ordenados de la tabla (mantiene el orden por fecha de creación)
        const filteredData = table.getRowModel().rows.map(row => row.original)

        // Preparar los datos para exportar
        const tableData = filteredData.map((row) => {
            const rowData: Record<string, any> = {}
            camposDeseados.forEach((campo) => {
                let value = row[campo as keyof Garage]
                const header = encabezados[campo] || campo
                
                // Formatear la fecha de creación si es un timestamp
                if (campo === 'createdAt' && value) {
                    let timestampNumber: number
                    if (typeof value === 'number') {
                        timestampNumber = value
                    } else if (typeof value === 'object' && (value as any).seconds) {
                        // Si es un timestamp de Firestore
                        timestampNumber = (value as any).seconds * 1000
                    } else if (typeof value === 'string') {
                        // Si es un string, intentar convertirlo
                        timestampNumber = new Date(value).getTime()
                    } else {
                        timestampNumber = 0
                    }
                    
                    if (timestampNumber > 0) {
                        value = new Date(timestampNumber).toLocaleDateString('es-ES')
                    }
                }
                
                rowData[header] = value ?? ''
            })
            // Agregar columna Certificador con el email
            rowData['Certificador'] = row.certificador_nombre ?? ''
            return rowData
        })

        if (tableData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay negocios disponibles para exportar con los filtros aplicados.
                </Notification>,
            )
            return
        }

        // Generar nombre de archivo con información de filtros
        let fileName = 'negocios'
        if (searchTerm) {
            fileName += `_filtro_${searchTerm}`
        }
        if (statusFilter) {
            fileName += `_estado_${statusFilter}`
        }
        const { from: ymdFrom, to: ymdTo } = creationRangeToYmd(creationDateRange)
        if (ymdFrom || ymdTo) {
            const fromDate = ymdFrom
                ? new Date(ymdFrom).toLocaleDateString('es-ES').replace(/\//g, '-')
                : ''
            const toDate = ymdTo
                ? new Date(ymdTo).toLocaleDateString('es-ES').replace(/\//g, '-')
                : ''
            fileName += `_fecha_${fromDate}_${toDate}`
        }
        if (showEliminados) {
            fileName += '_incluye_eliminados'
        }
        fileName += '.xlsx'

        // Crear el archivo Excel
        const worksheet = XLSX.utils.json_to_sheet(tableData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Negocios')
        XLSX.writeFile(workbook, fileName)

        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente con {tableData.length} registros.
            </Notification>,
        )
        setExportDialogIsOpen(false) // Cerrar el modal
    }

    const handleOpenExportDialog = () => {
        setExportDialogIsOpen(true)
    }

    const handleCloseExportDialog = () => {
        setExportDialogIsOpen(false)
    }

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newGarage, setNewGarage] = useState<Garage | null>({
        nombre: '',
        email: '',
        rif: '',
        phone: '',
        uid: '', // Asignar valor vacío si no quieres que sea undefined
        typeUser: 'Taller',
        image_perfil: '',
        image_file: '',
        status: 'Aprobado',
        Direccion: '',
        ubicacion: '',
        id: '', // También puedes asignar un valor vacío si no quieres undefined
        password: '',
        estado: '',
    })

    const openDialog = (person: Garage) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }

    const openDrawer = (person: Garage) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    const validationSchema = Yup.object().shape({
        nombre: Yup.string()
            .min(3, 'El nombre debe tener al menos 3 caracteres')
            .required('El nombre es obligatorio'),
        email: Yup.string()
            .email('Debe ser un email válido')
            .required('El correo electrónico es obligatorio')  
            .test(
                'termina-en-com',
                'El email debe terminar en ".com"',
                (value) => value?.endsWith('.com') ?? false,
            ),
        rif: Yup.string()
            .matches(/^[V,E,C,G,J,P]-\d{7,10}$/, 'tener entre 7 y 10 dígitos')
            .required('El rif es obligatoria'),
        phone: Yup.string()
            .matches(/^[1-9]\d{9}$/, 'El teléfono debe tener 10 dígitos y no puede comenzar con 0')
            .required('El teléfono es obligatorio'),        
        password: Yup.string()
            .required('Por favor ingrese una contraseña')
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
            .required('Por favor confirme su contraseña'),
        estado: Yup.string().required('El estado es obligatorio'),
        rifIdFiscal_file: Yup.mixed()
            .required('El RIF ID Fiscal es obligatorio'),
        fotoFrenteTaller_file: Yup.mixed()
            .required('La foto del frente del negocio es obligatoria'),
        fotoInternaTaller_file: Yup.mixed()
            .required('La foto interna del negocio es obligatoria'),
    })

    const [showPassword, setShowPassword] = useState(false)

    const handleCreateGarage = async (values: any, coordenadas: any) => {
        if (values.password !== values.confirmPassword) {
            toast.push(
                <Notification title="Error">
                    Las contraseñas no coinciden. Por favor, verifica los campos.
                </Notification>
            );
            return;
        }

        setIsCreating(true);

        try {
            const userRef = collection(db, 'Usuarios');
            const emailLower = values.email.toLowerCase();
    
            // Validar correo electrónico único
            const emailQuery = query(userRef, where('email', '==', emailLower));
            const emailSnapshot = await getDocs(emailQuery);
            if (!emailSnapshot.empty) {
                setIsCreating(false);
                toast.push(<Notification title="Error">¡El correo electrónico ya está registrado!</Notification>);
                return;
            }
    
            // Validar RIF único
            const rifQuery = query(userRef, where('rif', '==', values.rif));
            const rifSnapshot = await getDocs(rifQuery);
            if (!rifSnapshot.empty) {
                setIsCreating(false);
                toast.push(<Notification title="Error">¡El RIF ya está registrado!</Notification>);
                return;
            }
    
            // Validar número de teléfono único
            const phoneQuery = query(userRef, where('phone', '==', values.phone));
            const phoneSnapshot = await getDocs(phoneQuery);
            if (!phoneSnapshot.empty) {
                setIsCreating(false);
                toast.push(<Notification title="Error">¡El número de teléfono ya está registrado!</Notification>);
                return;
            }
    
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, emailLower, values.password);
            const user = userCredential.user;
    
            // Crear documento en Firestore
            const docRef = doc(userRef, user.uid);
            const currentTimestamp = Date.now();
            
            // Preparar datos iniciales del documento
            const initialData: Record<string, any> = {
                uid: user.uid,
                nombre: values.nombre,
                email: emailLower,
                rif: values.rif,
                phone: values.phone,
                typeUser: 'Taller',
                status: 'Aprobado',
                Direccion: values.Direccion,
                ubicacion: coordenadas === null ? '' : coordenadas.latiLng,
                estado: values.estado,
                image_perfil: '',
                createdAt: currentTimestamp,
            };

            await setDoc(docRef, initialData);

            // Cerrar drawer inmediatamente después de crear el usuario
            setDrawerCreateIsOpen(false);
            setSelectedPlace(null);
            setIsCreating(false);
            
            // Mostrar notificación de éxito
            toast.push(
                <Notification title="Éxito">
                    Negocio creado exitosamente. Los documentos se están subiendo en segundo plano.
                </Notification>
            );
            
            // Refrescar lista
            getData();
    
            // Función helper para subir documentos (en segundo plano)
            const uploadDocument = async (file: File | null, fieldName: string): Promise<string | null> => {
                if (!file) return null;

                try {
                    // Obtener la extensión del archivo
                    const fileType = file.name.split('.').pop()?.toLowerCase();
                    if (!fileType) {
                        console.warn(`No se pudo obtener la extensión del archivo: ${fieldName}`);
                        return null;
                    }

                    // Crear el nombre del archivo: {nombreCampo}.{extension}
                    const fileName = `${fieldName}.${fileType}`;
                    const storageRef = ref(storage, `documents/${user.uid}/${fileName}`);
                    
                    // Subir el archivo
                    await uploadBytes(storageRef, file);
                    
                    // Obtener la URL del archivo subido
                    const downloadUrl = await getDownloadURL(storageRef);
                    return downloadUrl;
                } catch (error) {
                    console.error(`Error subiendo ${fieldName}:`, error);
                    return null;
                }
            };

            // Subir logo del perfil en segundo plano
            if (values.image_file) {
                (async () => {
                    try {
                        const fileType = values.image_file.name.split('.').pop()?.toLowerCase();
                        // Aceptar jpg, jpeg, png, webp
                        if (fileType && ['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                            const newImageName = `${user.uid}_1.${fileType}`;
                            const storageRef = ref(storage, `profileImages/${newImageName}`);
                            await uploadBytes(storageRef, values.image_file);
                            const logoDownloadUrl = await getDownloadURL(storageRef);
                            await updateDoc(docRef, { image_perfil: logoDownloadUrl });
                        }
                    } catch (error) {
                        console.error('Error subiendo logo:', error);
                    }
                })();
            }

            // Subir documentos opcionales en segundo plano (no bloquea)
            (async () => {
                try {
                    const documentPromises = [
                        uploadDocument(values.rifIdFiscal_file, 'rifIdFiscal'),
                        uploadDocument(values.permisoOperacion_file, 'permisoOperacion'),
                        uploadDocument(values.logotipoNegocio_file, 'logotipoNegocio'),
                        uploadDocument(values.fotoFrenteTaller_file, 'fotoFrenteTaller'),
                        uploadDocument(values.fotoInternaTaller_file, 'fotoInternaTaller'),
                    ];

                    const documentResults = await Promise.all(documentPromises);
                    
                    // Preparar actualizaciones para Firestore
                    const documentUpdates: Record<string, string> = {};
                    const fieldNames = ['rifIdFiscal', 'permisoOperacion', 'logotipoNegocio', 'fotoFrenteTaller', 'fotoInternaTaller'];
                    
                    fieldNames.forEach((fieldName, index) => {
                        if (documentResults[index]) {
                            documentUpdates[fieldName] = documentResults[index] as string;
                        }
                    });

                    // Actualizar Firestore con las URLs de los documentos (solo si existen)
                    if (Object.keys(documentUpdates).length > 0) {
                        await updateDoc(docRef, documentUpdates);
                        console.log('Documentos actualizados en Firestore:', documentUpdates);
                        // Refrescar lista después de subir documentos
                        getData();
                    }
                } catch (error) {
                    console.error('Error subiendo documentos:', error);
                }
            })();
            
        } catch (error: any) {
            console.error('Error creando el taller:', error);
            setIsCreating(false);
            
            let errorMessage = 'Hubo un error al crear el Negocio.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'El correo electrónico ya está en uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña es muy débil.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.push(
                <Notification title="Error">
                    {errorMessage}
                </Notification>
            );
        }
    };
       

    const buildColumnFilters = (overrides?: { dateFrom?: string; dateTo?: string; status?: string }) => {
        const filters: ColumnFiltersState = []
        const status = overrides?.status ?? statusFilter
        // Para "Vencidos" no aplicamos filtro por columna "status",
        // porque la lógica se maneja al cargar los datos desde Firestore.
        if (status && status !== 'Vencidos') {
            filters.push({ id: 'status', value: status })
        }
        const { from: rangeFrom, to: rangeTo } =
            creationRangeToYmd(creationDateRange)
        const from = overrides?.dateFrom ?? rangeFrom
        const to = overrides?.dateTo ?? rangeTo
        if (from || to) {
            filters.push({
                id: 'createdAt',
                value: JSON.stringify({ from: from || '', to: to || '' }),
            })
        }
        return filters
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)
        setFiltering(buildColumnFilters())
    }

    const handleCreationRangeChange = (value: DatePickerRangeValue) => {
        setCreationDateRange(value)
        const { from, to } = creationRangeToYmd(value)
        setFiltering(buildColumnFilters({ dateFrom: from, dateTo: to }))
    }

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerCreateIsOpen(false)
        setSelectedPlace(null) // Cierra el Drawer
        setNewGarage({
            // Limpia los campos de usuario
            nombre: '',
            email: '',
            rif: '',
            phone: '',
            id: '',
            Direccion: '',
            uid: '',
            estado: '',
            password: '',
            image_perfil: '',
        })
        setSelectedPerson(null) // Limpia la selección (si es necesario)
    }

    // Obtener iniciales de los nombres
    const getInitials = (nombre: string | undefined): string => {
        if (!nombre) return ''
        const words = nombre.split(' ').filter(Boolean) // Filtrar elementos vacíos
        return words
            .map((word) => {
                if (typeof word === 'string' && word.length > 0) {
                    return word[0].toUpperCase()
                }
                return '' // Retorna una cadena vacía si la palabra no es válida
            })
            .join('')
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF'
        let color = '#'
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)]
        }
        return color
    }

    // Función para convertir fecha "dd-mm-yyyy" a timestamp
    const parseDateString = (dateString: string | undefined): number => {
        if (!dateString) return 0
        const parts = dateString.split('-')
        if (parts.length !== 3) return 0
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // Los meses en JS van de 0 a 11
        const year = parseInt(parts[2], 10)
        return new Date(year, month, day).getTime()
    }

    // Función para verificar si la fecha ya pasó
    const isDatePast = (dateString: string | undefined): boolean => {
        if (!dateString) return false
        const dateTimestamp = parseDateString(dateString)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo la fecha
        return dateTimestamp < today.getTime()
    }

    const columns: ColumnDef<Garage>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue, row }) => {
                const image_perfil = row.original.image_perfil as
                    | string
                    | undefined // Obtener el logo de la fila
                return (
                    <div className="flex items-center">
                        {image_perfil ? (
                            <img
                                src={image_perfil}
                                alt="Logo"
                                className="h-10 w-10 object-cover rounded-full mr-4"
                            />
                        ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                                <GiMechanicGarage
                                    className="h-6 w-6 text-gray-400"
                                    aria-hidden="true"
                                />{' '}
                            </div>
                        )}
                        {getValue() as string}{' '}
                    </div>
                )
            },
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'RIF',
            accessorKey: 'rif',
        },
        {
            header: 'Estado',
            accessorKey: 'estado',
        },
        {
            header: 'Certificador',
            accessorKey: 'certificador_nombre',
        },
        {
            header: 'Email',
            accessorKey: 'email',
            filterFn: (row, columnId, filterValue) => {
                const email = row.getValue(columnId) as string
                return email?.toLowerCase().includes(filterValue.toLowerCase()) || false
            },
        },
        {
            header: 'Numero Telefonico',
            accessorKey: 'phone',
            cell: ({ row }) => {
                const nombre = row.original.nombre
                return (
                    <div className="flex items-center">
                        <Avatar
                            className="mr-2 w-8 h-8 flex items-center justify-center rounded-full"
                            style={{ backgroundColor: '#887677' }}
                        >
                            <span className="text-white font-bold">
                                {getInitials(nombre)}
                            </span>
                        </Avatar>
                        {row.original.phone}{' '}
                    </div>
                )
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true
                return row.getValue(columnId) === filterValue
            },
            cell: ({ row }) => {
                const status = row.getValue('status') as string // Aserción de tipo
                let icon
                let color

                switch (status) {
                    case 'Aprobado':
                        icon = <FaCheckCircle className="text-green-500 mr-1" />
                        color = 'text-green-500' // Color para el texto
                        break
                    case 'Rechazado':
                        icon = <FaTimesCircle className="text-red-500 mr-1" />
                        color = 'text-red-500' // Color para el texto
                        break
                    case 'Pendiente':
                        icon = (
                            <FaExclamationCircle className="text-yellow-500 mr-1" />
                        )
                        color = 'text-yellow-500' // Color para el texto
                        break
                    case 'En espera por aprobación':
                        icon = (
                            <FaQuestionCircle className="text-blue-500 mr-1" />
                        )
                        color = 'text-blue-500' // Color para el texto
                        break
                    case 'Eliminado':
                        icon = <FaTrash className="text-gray-500 mr-1" />
                        color = 'text-gray-500' // Color para el texto
                        break
                    default:
                        icon = null
                }

                return (
                    <div className={`flex items-center ${color}`}>
                        {icon}
                        <span>{status}</span>
                    </div>
                )
            },
        },
        {
            header: 'Estado Subscripción',
            accessorKey: 'subscripcion_actual',
            cell: ({ row }) => {
                const subscripcion = row.original.subscripcion_actual
                
                if (!subscripcion) {
                    return (
                        <div className="flex items-center text-gray-400">
                            <span>Sin suscripción</span>
                        </div>
                    )
                }

                const statusSub = subscripcion.status || 'Sin estado'
                const nombreSub = subscripcion.nombre || ''
                let icon
                let color

                switch (statusSub) {
                    case 'Aprobado':
                        icon = <FaCheckCircle className="text-green-500 mr-1" />
                        color = 'text-green-500'
                        break
                    case 'Rechazado':
                        icon = <FaTimesCircle className="text-red-500 mr-1" />
                        color = 'text-red-500'
                        break
                    case 'Pendiente':
                        icon = (
                            <FaExclamationCircle className="text-yellow-500 mr-1" />
                        )
                        color = 'text-yellow-500'
                        break
                    default:
                        icon = <FaQuestionCircle className="text-gray-500 mr-1" />
                        color = 'text-gray-500'
                }

                return (
                    <div className={`flex items-center ${color}`}>
                        {icon}
                        <span>{nombreSub ? `${nombreSub} - ${statusSub}` : statusSub}</span>
                    </div>
                )
            },
        },
        {
            header: 'Fecha de Creación',
            accessorKey: 'createdAt',
            cell: ({ getValue }) => {
                const timestamp = getValue()
                
                if (!timestamp) return 'N/A'
                
                // Convertir el timestamp a número si es necesario
                let timestampNumber: number
                if (typeof timestamp === 'number') {
                    timestampNumber = timestamp
                } else if (typeof timestamp === 'object' && (timestamp as any).seconds) {
                    // Si es un timestamp de Firestore
                    timestampNumber = (timestamp as any).seconds * 1000
                } else if (typeof timestamp === 'string') {
                    // Si es un string, intentar convertirlo
                    timestampNumber = new Date(timestamp).getTime()
                } else {
                    return 'N/A'
                }
                
                return new Date(timestampNumber).toLocaleDateString('es-ES')
            },
            sortingFn: (rowA, rowB, columnId) => {
                const timestampA = rowA.getValue(columnId)
                const timestampB = rowB.getValue(columnId)
                
                // Función helper para convertir timestamp a número
                const getTimestampNumber = (timestamp: any): number => {
                    if (!timestamp) return 0
                    
                    if (typeof timestamp === 'number') {
                        return timestamp
                    } else if (typeof timestamp === 'object' && (timestamp as any).seconds) {
                        // Si es un timestamp de Firestore
                        return (timestamp as any).seconds * 1000
                    } else if (typeof timestamp === 'string') {
                        // Si es un string, intentar convertirlo
                        return new Date(timestamp).getTime()
                    }
                    return 0
                }
                
                const timestampNumberA = getTimestampNumber(timestampA)
                const timestampNumberB = getTimestampNumber(timestampB)
                
                // Ordenar descendente: más recientes primero (mayor timestamp primero)
                return timestampNumberB - timestampNumberA
            },
            filterFn: (row, columnId, value) => {
                if (!value) return true

                try {
                    const dateRange = JSON.parse(value as string) as {
                        from?: string
                        to?: string
                    }
                    const rowTimestamp = row.getValue(columnId)

                    if (!rowTimestamp) return false

                    let timestampNumber: number
                    if (typeof rowTimestamp === 'number') {
                        timestampNumber = rowTimestamp
                    } else if (
                        typeof rowTimestamp === 'object' &&
                        rowTimestamp !== null &&
                        'seconds' in rowTimestamp
                    ) {
                        timestampNumber =
                            (rowTimestamp as { seconds: number }).seconds * 1000
                    } else if (typeof rowTimestamp === 'string') {
                        timestampNumber = new Date(rowTimestamp).getTime()
                    } else {
                        return false
                    }

                    const fromDate = dateRange.from
                        ? new Date(dateRange.from + 'T00:00:00')
                        : null
                    const toDate = dateRange.to
                        ? new Date(dateRange.to + 'T23:59:59.999')
                        : null

                    if (fromDate && !toDate) {
                        return timestampNumber >= fromDate.getTime()
                    }

                    if (!fromDate && toDate) {
                        return timestampNumber <= toDate.getTime()
                    }

                    if (fromDate && toDate) {
                        const fromTimestamp = fromDate.getTime()
                        const toTimestamp = toDate.getTime()
                        return (
                            timestampNumber >= fromTimestamp &&
                            timestampNumber <= toTimestamp
                        )
                    }

                    return true
                } catch {
                    return true
                }
            },
        },
        {
            header: 'Fecha de Visita',
            accessorKey: 'scheduled_visit',
            cell: ({ getValue }) => {
                const value = getValue()
                return value || 'N/A'
            },
            sortingFn: (rowA, rowB, columnId) => {
                const valueA = rowA.getValue(columnId) as string
                const valueB = rowB.getValue(columnId) as string
                
                // Si A no tiene fecha pero B sí, B va primero
                if (!valueA && valueB) return 1
                // Si B no tiene fecha pero A sí, A va primero
                if (valueA && !valueB) return -1
                // Si ninguno tiene fecha, son iguales
                if (!valueA && !valueB) return 0
                
                // Si ambos tienen fecha, ordenar por fecha
                const dateA = parseDateString(valueA)
                const dateB = parseDateString(valueB)
                return dateA - dateB
            },
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: ' ',
            cell: ({ row }) => {
                const person = row.original
                const isEliminado = person.status === 'Eliminado'
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                navigate(`/profilegarage/${person.uid}`)
                            }
                            className={`${isEliminado ? 'text-gray-400 cursor-not-allowed' : 'text-blue-900'}`}
                            disabled={isEliminado}
                            title={isEliminado ? 'Negocio eliminado' : 'Ver perfil'}
                        >
                            <FaRegEye />
                        </button>
                        {!isEliminado && (
                            <button
                                onClick={() => openDialog(person)}
                                className="text-red-700"
                                title="Eliminar negocio"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                )
            },
        },
    ]

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedPerson(null) // Limpiar selección
    }

    const handleDelete = async () => {
        if (selectedPerson) {
            console.log('Eliminando a:', selectedPerson)

            try {
                // 1. Cambiar el status del taller a "Eliminado"
                const userDoc = doc(db, 'Usuarios', selectedPerson.uid)
                await updateDoc(userDoc, {
                    status: 'Eliminado'
                })

                // 2. Buscar y actualizar servicios relacionados
                const serviciosRef = collection(db, 'Servicios')
                const serviciosQuery = query(serviciosRef, where('uid_taller', '==', selectedPerson.uid))
                const serviciosSnapshot = await getDocs(serviciosQuery)

                // Actualizar todos los servicios encontrados
                const updatePromises = serviciosSnapshot.docs.map(async (servicioDoc) => {
                    await updateDoc(doc(db, 'Servicios', servicioDoc.id), {
                        estatus: false
                    })
                })

                // Esperar a que se completen todas las actualizaciones
                await Promise.all(updatePromises)

                const toastNotification = (
                    <Notification title="Éxito">
                        Negocio {selectedPerson.nombre} eliminado con éxito. Se actualizaron {serviciosSnapshot.docs.length} servicios relacionados.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el taller:', error)

                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando el negocio.
                    </Notification>
                )
                toast.push(errorNotification)
            } finally {
                setIsOpen(false) // Cerrar diálogo después de la operación
                setSelectedPerson(null) // Limpiar selección
            }
        }
    }

    const table = useReactTable({
        data: dataGarages,
        columns,
        state: {
            sorting,
            columnFilters: filtering,
            globalFilter: searchTerm,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        onGlobalFilterChange: (updater) => {
            const next = typeof updater === 'function' ? updater(searchTerm) : updater
            setSearchTerm(next ?? '')
        },
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            return garageSearchableText(row.original).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Suponiendo que tienes un array de datos
    const data = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const statusFilterOption =
        GARAGE_STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter) ??
        GARAGE_STATUS_FILTER_OPTIONS[0]

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-[#000B7E]">
                        Negocios
                    </h1>
                    <button
                        type="button"
                        title="Actualizar datos desde el servidor"
                        aria-label="Actualizar datos desde el servidor"
                        onClick={handleRefresh}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#000B7E] shadow-sm transition hover:border-[#000B7E]/35 hover:bg-[#000B7E]/5 active:scale-[0.98]"
                    >
                        <HiOutlineRefresh className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-wrap items-end gap-3 min-w-0">
                    <div className="flex min-w-[14rem] max-w-[20rem] shrink-0 flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Fecha de creación
                        </span>
                        <DatePicker.DatePickerRange
                            clearable
                            className="w-full min-w-[14rem]"
                            inputFormat="DD/MM/YYYY"
                            placeholder="Desde — hasta"
                            separator=" — "
                            size="sm"
                            value={creationDateRange}
                            onChange={handleCreationRangeChange}
                        />
                    </div>

                    <div className="flex min-w-[12rem] max-w-[16rem] shrink-0 flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Vista rápida
                        </span>
                        <Select<StatusFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[12rem]"
                            options={GARAGE_STATUS_FILTER_OPTIONS}
                            value={statusFilterOption}
                            onChange={(opt) => {
                                const v = opt?.value ?? ''
                                setStatusFilter(v)
                                setFiltering(buildColumnFilters({ status: v }))
                            }}
                            placeholder="Estado de aprobación"
                        />
                    </div>

                    <div className="w-full min-w-[12rem] max-w-xs shrink-0 sm:w-72">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            Buscar en la tabla
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nombre, RIF, email, teléfono, suscripción…"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shrink-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                            Mostrar eliminados
                        </span>
                        <Switcher
                            checked={showEliminados}
                            onChange={() => setShowEliminados((prev) => !prev)}
                        />
                    </div>

                    <Button
                        className="h-10 w-36 shrink-0 text-sm text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setDrawerCreateIsOpen(true)}
                    >
                        Crear Negocio
                    </Button>

                    <button
                        type="button"
                        style={{ backgroundColor: '#10B981' }}
                        className="h-10 w-36 shrink-0 rounded-md px-3 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90 whitespace-nowrap"
                        onClick={handleOpenExportDialog}
                    >
                        Exportar a Excel
                    </button>
                </div>
            </div>
            <div className="relative p-3 rounded-lg shadow min-h-[200px]">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm font-medium text-gray-700">
                            Cargando negocios, por favor espera...
                        </p>
                    </div>
                )}
                <Table className="w-full rounded-lg">
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <Th
                                            key={header.id}
                                            colSpan={header.colSpan}
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
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}
                                                </div>
                                            )}
                                        </Th>
                                    )
                                })}
                            </Tr>
                        ))}
                    </THead>
                    <TBody>
                        {table
                            .getRowModel()
                            .rows.slice(startIndex, endIndex)
                            .map((row) => {
                                const isEliminado = row.original.status === 'Eliminado'
                                const isPastVisit = isDatePast(row.original.scheduled_visit)
                                
                                // Determinar el estilo de la fila
                                let rowClassName = ''
                                if (isEliminado) {
                                    rowClassName = 'opacity-50 bg-gray-50'
                                } else if (isPastVisit) {
                                    rowClassName = 'bg-red-100 hover:bg-red-200'
                                }
                                
                                return (
                                    <Tr 
                                        key={row.id}
                                        className={rowClassName}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            let cellClassName = ''
                                            if (isEliminado) {
                                                cellClassName = 'line-through text-gray-500'
                                            } else if (isPastVisit) {
                                                cellClassName = 'text-red-900 font-medium'
                                            }
                                            
                                            return (
                                                <Td 
                                                    key={cell.id}
                                                    className={cellClassName}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
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
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p>
                    ¿Estás seguro de que deseas marcar como eliminado al negocio{' '}
                    {selectedPerson?.nombre}? Esta acción también desactivará todos los servicios asociados.
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: '#B91C1C' }}
                        className="text-white hover:opacity-80"
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
            <Dialog
                isOpen={exportDialogIsOpen}
                onClose={handleCloseExportDialog}
                onRequestClose={handleCloseExportDialog}
            >
                <h5 className="mb-4">Confirmar Exportación</h5>
                <p>
                    ¿Estás seguro de que deseas exportar todos los negocios a Excel?
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={handleCloseExportDialog}
                    >
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: '#10B981' }}
                        className="text-white hover:opacity-80"
                        onClick={handleExportToExcel}
                    >
                        Exportar
                    </Button>
                </div>
            </Dialog>
            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={handleDrawerClose}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Negocio</h2>
                <Formik
    initialValues={{
        nombre: '',
        email: '',
        rif: 'J-',
        phone: '',
        Direccion: '',
        ubicacion: '',
        password: '',
        image_perfil: '',
        estado: '',
        image_file: null, // Añadimos el campo `image_file` en los valores de Formik
        rifIdFiscal_file: null,
        permisoOperacion_file: null,
        logotipoNegocio_file: null,
        fotoFrenteTaller_file: null,
        fotoInternaTaller_file: null,
    }}
    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleCreateGarage(values, selectedPlace)
                        setSubmitting(false)
                        console.log(selectedPlace)
                        console.log(newGarage)
                    }}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
        <Form>
            <div className="flex flex-col space-y-6">
                {/* Campo para el logo */}
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        {!values.image_perfil ? (
                            <FaCamera className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                        ) : (
                            <img
                                src={values.image_perfil} // Usamos `values.image_perfil` directamente aquí
                                alt="Preview Logo"
                                className="mx-auto h-32 w-32 object-cover"
                            />
                        )}
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                            <label
                                htmlFor="logo-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
                            >
                                <span>
                                    {values.image_perfil ? 'Cambiar Logo' : 'Seleccionar Logo'}
                                </span>
                                <input
                                    id="logo-upload"
                                    name="logo-upload"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFieldValue('image_perfil', reader.result); // Establecemos el URL para la vista previa
                                                setFieldValue('image_file', file); // Establecemos el archivo para enviarlo al backend
                                            };
                                            reader.readAsDataURL(file); // Convierte el archivo en URL de datos para vista previa
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Nombre Negocio:
                                    </span>
                                    <Field
                                        type="text"
                                        name="nombre"
                                        className="mt-1 p-3 border border-gray-300 rounded-lg"
                                    />
                                    <ErrorMessage
                                        name="nombre"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>

                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Email:
                                    </span>
                                    <Field
                                        type="email"
                                        name="email"
                                        className="mt-1 p-3 border border-gray-300 rounded-lg"
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        RIF:
                                    </span>
                                    <div className="flex items-center mt-1">
                                        <select
                                            name="rifPrefix"
                                            value={
                                                values.rif.split('-')[0] || 'J'
                                            }
                                            onChange={(e) => {
                                                const newCedula = `${
                                                    e.target.value
                                                }-${
                                                    values.rif.split('-')[1] ||
                                                    ''
                                                }`
                                                setFieldValue('rif', newCedula)
                                            }}
                                            className="mx-2 p-3 border border-gray-300 rounded-l-lg"
                                        >
                                            <option value="V">V-</option>
                                            <option value="E">E-</option>
                                            <option value="C">C-</option>
                                            <option value="G">G-</option>
                                            <option value="J">J-</option>
                                            <option value="P">P-</option>
                                        </select>
                                        <Field
                                            type="text"
                                            name="rif"
                                            value={
                                                values.rif.split('-')[1] || ''
                                            }
                                            onChange={(e: any) => {
                                                const newCedula = `${
                                                    values.rif.split('-')[0] ||
                                                    'J'
                                                }-${e.target.value}`
                                                setFieldValue('rif', newCedula)
                                            }}
                                            className="mx-2 p-3 border border-gray-300 rounded-l-lg"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="rif"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>
                                {/* Estado */}
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Estado:
                                    </span>
                                    <Field
                                        as="select"
                                        name="estado"
                                        value={values.estado}
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
                                    </Field>

                                    <ErrorMessage
                                        name="estado"
                                        component="div"
                                        className="text-red-600 text-sm"
                                    />
                                </label>

                                {/* Teléfono */}
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Teléfono:
                                    </span>
                                    <Field
                                        type="text"
                                        name="phone"
                                        placeholder="Ejem (4142611966)"
                                        className="mt-1 p-3 border border-gray-300 rounded-lg"
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            // Prevenir escribir 0 al principio
                                            if (e.currentTarget.value === '' && e.key === '0') {
                                                e.preventDefault()
                                                return
                                            }
                                            
                                            // Permitir solo números y teclas de control
                                            const allowedKeys = [
                                                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                                                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                                'Home', 'End', 'PageUp', 'PageDown'
                                            ]
                                            
                                            // Si es una tecla de control, permitir
                                            if (allowedKeys.includes(e.key)) {
                                                return
                                            }
                                            
                                            // Si no es un número, prevenir
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            // Remover 0 al principio y mantener solo números
                                            const value = e.target.value.replace(/^0+/, '').replace(/[^0-9]/g, '')
                                            setFieldValue('phone', value)
                                        }}
                                    />
                                    <ErrorMessage
                                        name="phone"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Dirección:
                                    </span>
                                    <Field
                                        type="text"
                                        name="Direccion"
                                        placeholder="Indique su direccion"
                                        className="mt-1 p-3 border border-gray-300 rounded-lg"
                                    />
                                    <ErrorMessage
                                        name="Direccion"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Ubicación:
                                    </span>
                                    <div className="flex items-center mt-1 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                                        <Maps
                                            data={selectedPlace}
                                            save={setSelectedPlace}
                                        />
                                    </div>

                                    {/* Mensaje de error */}
                                    <ErrorMessage
                                        name="ubicacion"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </label>

                                {/* Campos de documentos */}
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                        Documentos
                                    </h3>
                                    
                                    {/* RIF ID Fiscal */}
                                    <div className="mb-4">
                                        <label className="block font-semibold text-gray-700 mb-2">
                                            RIF ID Fiscal: <span className="text-red-500">*</span>
                                        </label>
                                        {!values.rifIdFiscal_file ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                                                    id="rifIdFiscal-upload"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setFieldValue('rifIdFiscal_file', file);
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
                                                    {(values.rifIdFiscal_file as File).type.includes('pdf') ? (
                                                        <FaFilePdf className="w-6 h-6 text-red-500" />
                                                    ) : (
                                                        <FaImage className="w-6 h-6 text-blue-500" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {(values.rifIdFiscal_file as File).name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {((values.rifIdFiscal_file as File).size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue('rifIdFiscal_file', null)}
                                                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <FaTimes className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        <ErrorMessage
                                            name="rifIdFiscal_file"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>

                                    {/* Permisos de Operación */}
                                    <div className="mb-4">
                                        <label className="block font-semibold text-gray-700 mb-2">
                                            Permisos de Operación:
                                        </label>
                                        {!values.permisoOperacion_file ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                                                    id="permisoOperacion-upload"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setFieldValue('permisoOperacion_file', file);
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
                                                    {(values.permisoOperacion_file as File).type.includes('pdf') ? (
                                                        <FaFilePdf className="w-6 h-6 text-red-500" />
                                                    ) : (
                                                        <FaImage className="w-6 h-6 text-blue-500" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {(values.permisoOperacion_file as File).name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {((values.permisoOperacion_file as File).size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue('permisoOperacion_file', null)}
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
                                        {!values.logotipoNegocio_file ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    id="logotipoNegocio-upload"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setFieldValue('logotipoNegocio_file', file);
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
                                                            {(values.logotipoNegocio_file as File).name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {((values.logotipoNegocio_file as File).size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue('logotipoNegocio_file', null)}
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
                                            Foto Frente Negocio: <span className="text-red-500">*</span>
                                        </label>
                                        {!values.fotoFrenteTaller_file ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    id="fotoFrenteTaller-upload"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setFieldValue('fotoFrenteTaller_file', file);
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
                                                            {(values.fotoFrenteTaller_file as File).name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {((values.fotoFrenteTaller_file as File).size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue('fotoFrenteTaller_file', null)}
                                                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <FaTimes className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        <ErrorMessage
                                            name="fotoFrenteTaller_file"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>

                                    {/* Foto Interna Taller */}
                                    <div className="mb-4">
                                        <label className="block font-semibold text-gray-700 mb-2">
                                            Foto Interna Negocio: <span className="text-red-500">*</span>
                                        </label>
                                        {!values.fotoInternaTaller_file ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    id="fotoInternaTaller-upload"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setFieldValue('fotoInternaTaller_file', file);
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
                                                            {(values.fotoInternaTaller_file as File).name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {((values.fotoInternaTaller_file as File).size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue('fotoInternaTaller_file', null)}
                                                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <FaTimes className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        <ErrorMessage
                                            name="fotoInternaTaller_file"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Contraseña */}
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Contraseña:
                                    </span>
                                    <Field
                                        type="password"
                                        name="password"
                                        className="mt-1 p-3 border border-gray-300 rounded-lg"
                                    />
                                    <ErrorMessage
                                        name="password"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>

                                {/* Confirmar Contraseña */}
                                <label className="flex flex-col">
                                    <span className="font-semibold text-gray-700">
                                        Confirmar Contraseña:
                                    </span>
                                    <Field
                                        type="password"
                                        name="confirmPassword"
                                        className="mt-1 p-3 border border-gray-300 rounded-lg"
                                    />
                                    <ErrorMessage
                                        name="confirmPassword"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </label>

                                <div className="text-right mt-6">
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            setDrawerCreateIsOpen(false) // Cierra el drawer
                                        }}
                                        className="mr-2"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isCreating}
                                        style={{ backgroundColor: '#000B7E' }}
                                        className="text-white hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creando...
                                            </span>
                                        ) : (
                                            'Crear Negocio'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Drawer>
        </>
    )
}

export default Garages
