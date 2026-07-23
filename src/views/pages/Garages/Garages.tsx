import { useEffect, useMemo, useRef, useState } from 'react'
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
import Checkbox from '@/components/ui/Checkbox'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import Drawer from '@/components/ui/Drawer' // Asegúrate de que esta ruta sea correcta
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent, ChangeEvent } from 'react'
import { Avatar, Switcher } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import { GiMechanicGarage } from 'react-icons/gi'
import * as Yup from 'yup'
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik'
import Maps from './components/Googlemaps'
import { GrMapLocation } from 'react-icons/gr'
import Password from '@/views/account/Settings/components/Password'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/configs/firebaseAssets.config';
import {
    exportStyledExcel,
    type ExcelColumnConfig,
} from '@/utils/excelExport'
import dayjs from 'dayjs'
import DatePicker from '@/components/ui/DatePicker'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
import { useAppSelector } from '@/store'
import { CERTIFIER, SUPPORT } from '@/constants/roles.constant'
import { deleteAuthUsers } from '@/utils/deleteAuthUsers'
import {
    findGaragesWithHistorico,
    type EntityHistoricoHit,
} from '@/utils/entityDeleteHistoryCheck'
import { DeleteHistoricoWarning } from '@/components/shared/DeleteHistoricoWarning'
import { assignFreePlanToNewTaller } from '@/utils/subscriptionServiceActivation'

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
    ubicacion?: string | { lat?: number; lng?: number }
    certificador_nombre?: string
    certificador_key?: string
    createdAt?: number | { seconds: number; nanoseconds?: number } | string
    subscripcion_actual?: Subscripcion
    id?: string
    status?: string
    password?: string
    confirmPassword?: string
    estado?: string
    LinkInstagram?: string
    LinkFacebook?: string
    LinkTiktok?: string
    whatsapp?: string
    Caracteristicas?: string
    Experiencia?: string
    Garantia?: string
    RegComercial?: string
    Tarifa?: string
    seguro?: string
    token?: string
    lat?: number
    lng?: number
    fotoFrenteTaller?: string
    fotoInternaTaller?: string
    logotipoNegocio?: string | null
    rifIdFiscal?: string
    permisoOperacion?: string | null
    agenteAutorizado?: boolean
    showModalKm?: boolean
    motivo_eliminacion?: string
    eliminado_en?: Timestamp | { seconds: number; nanoseconds?: number }
    horarios_atencion?: Record<string, unknown>
    metodos_pago?: Record<string, unknown>
}

type StatusFilterOption = { value: string; label: string }

const GARAGE_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'En espera por aprobación', label: 'En espera por aprobación' },
    { value: 'Vencidos', label: 'Vencen hoy' },
]

const CERTIFIER_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
    { value: 'En espera por aprobación', label: 'En espera por aprobación' },
]

const CIUDAD_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Todas las ciudades' },
    { value: 'Amazonas', label: 'Amazonas' },
    { value: 'Anzoátegui', label: 'Anzoátegui' },
    { value: 'Apure', label: 'Apure' },
    { value: 'Aragua', label: 'Aragua' },
    { value: 'Barinas', label: 'Barinas' },
    { value: 'Bolívar', label: 'Bolívar' },
    { value: 'Carabobo', label: 'Carabobo' },
    { value: 'Cojedes', label: 'Cojedes' },
    { value: 'Delta Amacuro', label: 'Delta Amacuro' },
    { value: 'Distrito Capital', label: 'Distrito Capital' },
    { value: 'Falcón', label: 'Falcón' },
    { value: 'Guárico', label: 'Guárico' },
    { value: 'Lara', label: 'Lara' },
    { value: 'La Guaira', label: 'La Guaira' },
    { value: 'Mérida', label: 'Mérida' },
    { value: 'Miranda', label: 'Miranda' },
    { value: 'Monagas', label: 'Monagas' },
    { value: 'Nueva Esparta', label: 'Nueva Esparta' },
    { value: 'Portuguesa', label: 'Portuguesa' },
    { value: 'Sucre', label: 'Sucre' },
    { value: 'Táchira', label: 'Táchira' },
    { value: 'Trujillo', label: 'Trujillo' },
    { value: 'Yaracuy', label: 'Yaracuy' },
    { value: 'Zulia', label: 'Zulia' },
]

const PLAN_ESTADO_FILTER_OPTIONS: { value: '' | 'activo' | 'suspendido'; label: string }[] = [
    { value: '', label: 'Todos (plan)' },
    { value: 'activo', label: 'ACTIVO' },
    { value: 'suspendido', label: 'SUSPENDIDO' },
]

function getPlanNombreGarage(g: Garage): string {
    const n = g.subscripcion_actual?.nombre
    return String(n ?? '').trim() || '—'
}

/** Vigencia del plan: fecha_fin >= ahora */
function getPlanActividadKey(g: Garage): 'activo' | 'suspendido' {
    const finMs = timestampLikeToMs(g.subscripcion_actual?.fecha_fin)
    if (!finMs) return 'suspendido'
    return finMs >= Date.now() ? 'activo' : 'suspendido'
}

function getPlanActividadLabel(g: Garage): string {
    return getPlanActividadKey(g) === 'activo' ? 'ACTIVO' : 'SUSPENDIDO'
}

function formatGarageCreatedAtCell(g: Garage): string {
    const ms = timestampLikeToMs(g.createdAt)
    if (!ms) return '—'
    try {
        return new Date(ms).toLocaleString('es-VE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return '—'
    }
}

function safeJsonForExcel(value: unknown): string {
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return value
    try {
        return JSON.stringify(value)
    } catch {
        return String(value)
    }
}

/** Misma información que muestra la tabla (sin columnas solo de base de datos). */
function buildGarageGridExcelRow(g: Garage): Record<string, string> {
    return {
        fechaRegistro: formatGarageCreatedAtCell(g),
        nombre: g.nombre ?? '',
        rif: g.rif ?? '',
        telefono: g.phone ?? '',
        correo: g.email ?? '',
        ciudad: g.estado ?? '',
        direccionNegocio: g.Direccion ?? '',
        estadoAprobacion: g.status ?? '',
        planNombre: getPlanNombreGarage(g),
        estatusPlan: getPlanActividadLabel(g),
        certificador: g.certificador_nombre ?? '',
        redFacebook: g.LinkFacebook ?? '',
        redInstagram: g.LinkInstagram ?? '',
        redTiktok: g.LinkTiktok ?? '',
        redWhatsapp: g.whatsapp ?? '',
    }
}

const GARAGE_EXCEL_COLUMNS: ExcelColumnConfig[] = [
    { header: 'Fecha de registro', key: 'fechaRegistro' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'RIF', key: 'rif' },
    { header: 'Teléfono', key: 'telefono' },
    { header: 'Correo', key: 'correo', linkType: 'email' },
    { header: 'Ciudad', key: 'ciudad' },
    { header: 'Dirección del negocio', key: 'direccionNegocio' },
    { header: 'Estado de aprobación', key: 'estadoAprobacion' },
    { header: 'Plan', key: 'planNombre' },
    { header: 'Estatus del plan', key: 'estatusPlan' },
    { header: 'Certificador', key: 'certificador' },
    { header: 'Facebook', key: 'redFacebook', linkType: 'url' },
    { header: 'Instagram', key: 'redInstagram', linkType: 'url' },
    { header: 'TikTok', key: 'redTiktok', linkType: 'url' },
    { header: 'WhatsApp', key: 'redWhatsapp' },
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
        typeof g.ubicacion === 'object'
            ? safeJsonForExcel(g.ubicacion)
            : g.ubicacion,
        g.uid,
        g.id,
        g.LinkInstagram,
        g.LinkFacebook,
        g.LinkTiktok,
        g.whatsapp,
        getPlanNombreGarage(g),
        getPlanActividadLabel(g),
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

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
    onChange: (event: CheckBoxChangeEvent) => void
    indeterminate: boolean
}

function IndeterminateCheckbox({
    indeterminate,
    onChange,
    ...rest
}: IndeterminateCheckboxProps) {
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref.current) {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [indeterminate, rest.checked])

    return <Checkbox ref={ref} onChange={(_, e) => onChange(e)} {...rest} />
}

async function markGarageAsDeleted(
    garage: Garage,
    motivo: string,
): Promise<number> {
    const userDoc = doc(db, 'Usuarios', garage.uid)
    await updateDoc(userDoc, {
        status: 'Eliminado',
        motivo_eliminacion: motivo,
        eliminado_en: Timestamp.now(),
    })

    const serviciosQuery = query(
        collection(db, 'Servicios'),
        where('uid_taller', '==', garage.uid),
    )
    const serviciosSnapshot = await getDocs(serviciosQuery)

    await Promise.all(
        serviciosSnapshot.docs.map((servicioDoc) =>
            updateDoc(doc(db, 'Servicios', servicioDoc.id), {
                estatus: false,
            }),
        ),
    )

    return serviciosSnapshot.docs.length
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
    const [filterCiudad, setFilterCiudad] = useState('')
    const [filterPlanActividad, setFilterPlanActividad] = useState<
        '' | 'activo' | 'suspendido'
    >('')
    const [deleteMotivo, setDeleteMotivo] = useState('')
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
    const [bulkDeleteMotivo, setBulkDeleteMotivo] = useState('')
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
    const [singleDeleteHistorico, setSingleDeleteHistorico] = useState<{
        loading: boolean
        items: EntityHistoricoHit[]
    }>({ loading: false, items: [] })
    const [bulkDeleteHistorico, setBulkDeleteHistorico] = useState<{
        loading: boolean
        items: EntityHistoricoHit[]
    }>({ loading: false, items: [] })
    const [creationDateRange, setCreationDateRange] =
        useState<DatePickerRangeValue>([null, null])
    const [isLoading, setIsLoading] = useState(false) // Estado para mostrar cargando al cambiar filtros pesados
    const authority = useAppSelector((state) => state.auth.user.authority)
    const isCertifier = authority.includes(CERTIFIER)
    const isSupportRole = authority.includes(SUPPORT)

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
                // Un certificador solo debe visualizar solicitudes pendientes de aprobación.
                if (
                    isCertifier &&
                    garageData.status !== 'En espera por aprobación'
                ) {
                    return
                }

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

    const garagesDisplayed = useMemo(() => {
        return dataGarages.filter((g) => {
            if (filterCiudad && String(g.estado ?? '') !== filterCiudad) {
                return false
            }
            if (filterPlanActividad) {
                if (getPlanActividadKey(g) !== filterPlanActividad) {
                    return false
                }
            }
            return true
        })
    }, [dataGarages, filterCiudad, filterPlanActividad])

    const navigate = useNavigate()

    useEffect(() => {
        if (isCertifier) {
            setStatusFilter('En espera por aprobación')
            setShowEliminados(false)
        }
    }, [isCertifier])

    useEffect(() => {
        if (isCertifier) {
            setFiltering(buildColumnFilters({ status: 'En espera por aprobación' }))
            return
        }
        setFiltering(buildColumnFilters({ status: statusFilter }))
    }, [isCertifier, statusFilter])

    useEffect(() => {
        getData()
    }, [isCertifier, showEliminados, statusFilter])

    const handleRefresh = async () => {
        await getData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }

    const handleExportToExcel = async () => {
        const filteredData = table.getRowModel().rows.map((row) => row.original)
        const tableData = filteredData.map((row) => buildGarageGridExcelRow(row))

        if (tableData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay negocios disponibles para exportar con los filtros aplicados.
                </Notification>,
            )
            return
        }

        let fileName = 'negocios'
        if (searchTerm) {
            fileName += `_filtro_${searchTerm.slice(0, 24)}`
        }
        if (statusFilter) {
            fileName += `_aprob_${statusFilter.replace(/\s+/g, '_')}`
        }
        if (filterCiudad) {
            fileName += `_ciudad_${filterCiudad.replace(/\s+/g, '_')}`
        }
        if (filterPlanActividad) {
            fileName += `_plan_${filterPlanActividad}`
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

        await exportStyledExcel({
            rows: tableData,
            columns: GARAGE_EXCEL_COLUMNS,
            sheetName: 'Negocios',
            fileName,
        })

        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente con {tableData.length}{' '}
                registros.
            </Notification>,
        )
        setExportDialogIsOpen(false)
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
        setDeleteMotivo('')
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

            const freePlanResult = await assignFreePlanToNewTaller(user.uid)
            if (!freePlanResult.ok) {
                console.error(
                    'No se pudo asignar el plan gratis al negocio nuevo:',
                    freePlanResult,
                )
                toast.push(
                    <Notification title="Advertencia" type="warning">
                        {freePlanResult.reason === 'plan_not_found'
                            ? 'Negocio creado, pero no se encontró un plan gratis en Planes para asignarlo automáticamente.'
                            : 'Negocio creado, pero hubo un error al asignar el plan gratis automáticamente.'}
                    </Notification>,
                )
            }

            // Cerrar drawer inmediatamente después de crear el usuario
            setDrawerCreateIsOpen(false);
            setSelectedPlace(null);
            setIsCreating(false);
            
            // Mostrar notificación de éxito
            toast.push(
                <Notification title="Éxito">
                    {freePlanResult.ok
                        ? `Negocio creado exitosamente con plan ${freePlanResult.planNombre} asignado. Los documentos se están subiendo en segundo plano.`
                        : 'Negocio creado exitosamente. Los documentos se están subiendo en segundo plano.'}
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

    const columns: ColumnDef<Garage>[] = [
        ...(!isCertifier && !isSupportRole
            ? [
                  {
                      id: 'select',
                      header: ({ table }) => (
                          <IndeterminateCheckbox
                              checked={table.getIsAllPageRowsSelected()}
                              indeterminate={table.getIsSomePageRowsSelected()}
                              onChange={table.getToggleAllPageRowsSelectedHandler()}
                          />
                      ),
                      cell: ({ row }) => (
                          <div className="px-1">
                              <IndeterminateCheckbox
                                  checked={row.getIsSelected()}
                                  disabled={!row.getCanSelect()}
                                  indeterminate={row.getIsSomeSelected()}
                                  onChange={row.getToggleSelectedHandler()}
                              />
                          </div>
                      ),
                      enableSorting: false,
                  } as ColumnDef<Garage>,
              ]
            : []),
        {
            header: 'Fecha de registro',
            accessorKey: 'createdAt',
            cell: ({ row }) => formatGarageCreatedAtCell(row.original),
            sortingFn: (rowA, rowB, columnId) => {
                const a = timestampLikeToMs(rowA.getValue(columnId))
                const b = timestampLikeToMs(rowB.getValue(columnId))
                return a - b
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
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue, row }) => {
                const image_perfil = row.original.image_perfil as
                    | string
                    | undefined
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
        },
        {
            header: 'RIF',
            accessorKey: 'rif',
        },
        {
            header: 'Teléfono',
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
            header: 'Correo',
            accessorKey: 'email',
            filterFn: (row, columnId, filterValue) => {
                const email = row.getValue(columnId) as string
                return (
                    email?.toLowerCase().includes(
                        String(filterValue).toLowerCase(),
                    ) || false
                )
            },
        },
        {
            header: 'Ciudad',
            accessorKey: 'estado',
        },
        {
            header: 'Estado de aprobación',
            accessorKey: 'status',
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true
                return row.getValue(columnId) === filterValue
            },
            cell: ({ row }) => {
                const status = row.getValue('status') as string
                let icon
                let color

                switch (status) {
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
                    case 'En espera por aprobación':
                        icon = (
                            <FaQuestionCircle className="text-blue-500 mr-1" />
                        )
                        color = 'text-blue-500'
                        break
                    case 'Eliminado':
                        icon = <FaTrash className="text-gray-500 mr-1" />
                        color = 'text-gray-500'
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
            header: 'Plan',
            accessorFn: (row) => getPlanNombreGarage(row),
            id: 'planNombre',
            sortingFn: 'alphanumeric',
        },
        {
            header: 'Estatus del plan',
            accessorFn: (row) => getPlanActividadLabel(row),
            id: 'planActividad',
            sortingFn: 'alphanumeric',
            cell: ({ row }) => {
                const activo = getPlanActividadKey(row.original) === 'activo'
                return (
                    <span
                        className={
                            activo
                                ? 'font-semibold text-emerald-700'
                                : 'font-semibold text-amber-800'
                        }
                    >
                        {getPlanActividadLabel(row.original)}
                    </span>
                )
            },
        },
        {
            header: 'Certificador',
            accessorKey: 'certificador_nombre',
        },
        {
            id: 'acciones',
            header: ' ',
            enableSorting: false,
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
                        {!isCertifier && !isSupportRole && !isEliminado && (
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
        setDeleteMotivo('')
        setSelectedPerson(null)
    }

    const onBulkDeleteDialogClose = () => {
        setBulkDeleteDialogOpen(false)
        setBulkDeleteMotivo('')
    }

    const openBulkDeleteDialog = () => {
        const selectedCount = Object.keys(rowSelection).filter(
            (key) => rowSelection[key],
        ).length
        if (selectedCount === 0) {
            toast.push(
                <Notification title="Sin selección" type="warning">
                    Selecciona al menos un negocio para eliminar.
                </Notification>,
            )
            return
        }
        setBulkDeleteMotivo('')
        setBulkDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (isSupportRole) {
            toast.push(
                <Notification title="Acción no permitida" type="warning">
                    El rol Soporte no tiene permisos para eliminar negocios.
                </Notification>,
            )
            setIsOpen(false)
            setDeleteMotivo('')
            setSelectedPerson(null)
            return
        }
        if (selectedPerson) {
            const motivo = deleteMotivo.trim()
            if (motivo.length < 5) {
                toast.push(
                    <Notification title="Motivo requerido" type="danger">
                        Indica el motivo de la eliminación (mínimo 5 caracteres).
                    </Notification>,
                )
                return
            }

            try {
                const serviciosCount = await markGarageAsDeleted(
                    selectedPerson,
                    motivo,
                )

                try {
                    await deleteAuthUsers([selectedPerson.uid])
                } catch (authError) {
                    console.error(
                        'Error eliminando cuenta de Auth:',
                        authError,
                    )
                    toast.push(
                        <Notification title="Advertencia" type="warning">
                            El negocio fue marcado como eliminado, pero no se
                            pudo eliminar la cuenta de autenticación.
                        </Notification>,
                    )
                }

                const toastNotification = (
                    <Notification title="Éxito">
                        Negocio {selectedPerson.nombre} eliminado con éxito. Se
                        actualizaron {serviciosCount} servicios relacionados.
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
                setIsOpen(false)
                setDeleteMotivo('')
                setSelectedPerson(null)
            }
        }
    }

    const table = useReactTable({
        data: garagesDisplayed,
        columns,
        state: {
            sorting,
            columnFilters: filtering,
            globalFilter: searchTerm,
            rowSelection,
        },
        enableRowSelection: (row) => row.original.status !== 'Eliminado',
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row.uid,
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

    const selectedGaragesCount = Object.keys(rowSelection).filter(
        (key) => rowSelection[key],
    ).length

    const handleBulkDelete = async () => {
        if (isSupportRole) {
            toast.push(
                <Notification title="Acción no permitida" type="warning">
                    El rol Soporte no tiene permisos para eliminar negocios.
                </Notification>,
            )
            onBulkDeleteDialogClose()
            return
        }

        const motivo = bulkDeleteMotivo.trim()
        if (motivo.length < 5) {
            toast.push(
                <Notification title="Motivo requerido" type="danger">
                    Indica el motivo de la eliminación (mínimo 5 caracteres).
                </Notification>,
            )
            return
        }

        const selectedGarages = garagesDisplayed.filter(
            (garage) => rowSelection[garage.uid],
        )
        if (selectedGarages.length === 0) {
            toast.push(
                <Notification title="Sin selección" type="warning">
                    No hay negocios seleccionados para eliminar.
                </Notification>,
            )
            onBulkDeleteDialogClose()
            return
        }

        setIsBulkDeleting(true)
        try {
            let totalServicios = 0
            for (const garage of selectedGarages) {
                totalServicios += await markGarageAsDeleted(garage, motivo)
            }

            let authDeleted = 0
            let authFailed = 0
            try {
                const authResult = await deleteAuthUsers(
                    selectedGarages.map((garage) => garage.uid),
                )
                authDeleted = authResult.deletedCount
                authFailed = authResult.failedCount
            } catch (authError) {
                console.error('Error eliminando cuentas de Auth:', authError)
                authFailed = selectedGarages.length
            }

            setRowSelection({})
            await getData()
            onBulkDeleteDialogClose()

            if (authFailed > 0) {
                toast.push(
                    <Notification title="Eliminación parcial" type="warning">
                        Se marcaron {selectedGarages.length} negocio(s) como
                        eliminados y se desactivaron {totalServicios}{' '}
                        servicio(s). Cuentas Auth eliminadas: {authDeleted};
                        fallidas: {authFailed}.
                    </Notification>,
                )
            } else {
                toast.push(
                    <Notification title="Éxito" type="success">
                        Se eliminaron {selectedGarages.length} negocio(s) con
                        éxito. Se actualizaron {totalServicios} servicio(s)
                        relacionados.
                    </Notification>,
                )
            }
        } catch (error) {
            console.error('Error eliminando negocios en lote:', error)
            toast.push(
                <Notification title="Error">
                    Hubo un error eliminando los negocios seleccionados.
                </Notification>,
            )
        } finally {
            setIsBulkDeleting(false)
        }
    }

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

    useEffect(() => {
        setCurrentPage(1)
    }, [filterCiudad, filterPlanActividad])

    useEffect(() => {
        if (!dialogIsOpen || !selectedPerson) {
            setSingleDeleteHistorico({ loading: false, items: [] })
            return
        }

        let cancelled = false
        setSingleDeleteHistorico({ loading: true, items: [] })

        findGaragesWithHistorico([
            {
                uid: selectedPerson.uid,
                nombre: selectedPerson.nombre,
            },
        ])
            .then((items) => {
                if (!cancelled) {
                    setSingleDeleteHistorico({ loading: false, items })
                }
            })
            .catch((error) => {
                console.error('Error verificando histórico del negocio:', error)
                if (!cancelled) {
                    setSingleDeleteHistorico({ loading: false, items: [] })
                }
            })

        return () => {
            cancelled = true
        }
    }, [dialogIsOpen, selectedPerson])

    useEffect(() => {
        if (!bulkDeleteDialogOpen) {
            setBulkDeleteHistorico({ loading: false, items: [] })
            return
        }

        const selectedGarages = garagesDisplayed.filter(
            (garage) => rowSelection[garage.uid],
        )
        if (selectedGarages.length === 0) {
            setBulkDeleteHistorico({ loading: false, items: [] })
            return
        }

        let cancelled = false
        setBulkDeleteHistorico({ loading: true, items: [] })

        findGaragesWithHistorico(
            selectedGarages.map((garage) => ({
                uid: garage.uid,
                nombre: garage.nombre,
            })),
        )
            .then((items) => {
                if (!cancelled) {
                    setBulkDeleteHistorico({ loading: false, items })
                }
            })
            .catch((error) => {
                console.error(
                    'Error verificando histórico de negocios:',
                    error,
                )
                if (!cancelled) {
                    setBulkDeleteHistorico({ loading: false, items: [] })
                }
            })

        return () => {
            cancelled = true
        }
    }, [bulkDeleteDialogOpen, rowSelection, garagesDisplayed])

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const statusFilterOption =
        (isCertifier ? CERTIFIER_STATUS_FILTER_OPTIONS : GARAGE_STATUS_FILTER_OPTIONS).find(
            (o) => o.value === statusFilter,
        ) ??
        (isCertifier ? CERTIFIER_STATUS_FILTER_OPTIONS[0] : GARAGE_STATUS_FILTER_OPTIONS[0])

    const hayFiltrosToolbar =
        creationDateRange[0] != null ||
        creationDateRange[1] != null ||
        Boolean(filterCiudad) ||
        Boolean(filterPlanActividad) ||
        Boolean(searchTerm.trim()) ||
        (!isCertifier && Boolean(statusFilter))

    const clearGarageFilters = () => {
        setCreationDateRange([null, null])
        setFilterCiudad('')
        setFilterPlanActividad('')
        setSearchTerm('')
        if (!isCertifier) {
            setStatusFilter('')
            setFiltering(buildColumnFilters({ status: '', dateFrom: '', dateTo: '' }))
        } else {
            setFiltering(
                buildColumnFilters({
                    status: 'En espera por aprobación',
                    dateFrom: '',
                    dateTo: '',
                }),
            )
        }
    }

    return (
        <>
            <div className="mb-6 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex shrink-0 items-center gap-2">
                        <h1 className="text-3xl font-bold text-[#000B7E] sm:text-4xl">
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

                    <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                        {!isCertifier && !isSupportRole && (
                            <Button
                                className="h-10 shrink-0 whitespace-nowrap px-3 text-sm text-white hover:opacity-80 sm:px-4"
                                style={{ backgroundColor: '#B91C1C' }}
                                disabled={
                                    selectedGaragesCount === 0 || isBulkDeleting
                                }
                                loading={isBulkDeleting}
                                onClick={openBulkDeleteDialog}
                            >
                                Eliminar Negocios
                                {selectedGaragesCount > 0
                                    ? ` (${selectedGaragesCount})`
                                    : ''}
                            </Button>
                        )}
                        <Button
                            className="h-10 shrink-0 whitespace-nowrap px-3 text-sm text-white hover:opacity-80 sm:px-4"
                            style={{ backgroundColor: '#000B7E' }}
                            onClick={() => setDrawerCreateIsOpen(true)}
                        >
                            Crear Negocio
                        </Button>
                        <button
                            type="button"
                            style={{ backgroundColor: '#10B981' }}
                            className="h-10 shrink-0 whitespace-nowrap rounded-md px-3 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90 sm:px-4"
                            onClick={handleOpenExportDialog}
                        >
                            Exportar Excel
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[13.5rem] shrink-0 sm:w-[15rem]">
                        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                            Creación
                        </span>
                        <DatePicker.DatePickerRange
                            clearable
                            className="w-full"
                            inputFormat="DD/MM/YYYY"
                            placeholder="Desde — hasta"
                            separator=" — "
                            size="sm"
                            value={creationDateRange}
                            onChange={handleCreationRangeChange}
                        />
                    </div>

                    <div className="w-[10.5rem] shrink-0 sm:w-44">
                        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                            Aprobación
                        </span>
                        <Select<StatusFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="w-full"
                            options={
                                isCertifier
                                    ? CERTIFIER_STATUS_FILTER_OPTIONS
                                    : GARAGE_STATUS_FILTER_OPTIONS
                            }
                            value={statusFilterOption}
                            onChange={(opt) => {
                                if (isCertifier) return
                                const v = opt?.value ?? ''
                                setStatusFilter(v)
                                setFiltering(buildColumnFilters({ status: v }))
                            }}
                            placeholder="Estado"
                            isDisabled={isCertifier}
                        />
                    </div>

                    <div className="w-[9.5rem] shrink-0 sm:w-40">
                        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                            Ciudad
                        </span>
                        <Select<{ value: string; label: string }, false>
                            size="sm"
                            isSearchable
                            className="w-full"
                            options={CIUDAD_FILTER_OPTIONS}
                            value={
                                CIUDAD_FILTER_OPTIONS.find(
                                    (o) => o.value === filterCiudad,
                                ) ?? CIUDAD_FILTER_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setFilterCiudad(opt?.value ?? '')
                            }}
                            placeholder="Ciudad"
                        />
                    </div>

                    <div className="w-[8.5rem] shrink-0 sm:w-36">
                        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                            Plan
                        </span>
                        <Select<(typeof PLAN_ESTADO_FILTER_OPTIONS)[number], false>
                            size="sm"
                            isSearchable={false}
                            className="w-full"
                            options={PLAN_ESTADO_FILTER_OPTIONS}
                            value={
                                PLAN_ESTADO_FILTER_OPTIONS.find(
                                    (o) => o.value === filterPlanActividad,
                                ) ?? PLAN_ESTADO_FILTER_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setFilterPlanActividad(
                                    (opt?.value ?? '') as
                                        | ''
                                        | 'activo'
                                        | 'suspendido',
                                )
                            }}
                            placeholder="Plan"
                        />
                    </div>

                    <div className="w-52 shrink-0 sm:w-56">
                        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                            Buscar
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nombre, RIF, correo…"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-2 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    <div className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5">
                        <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap sm:text-xs">
                            Eliminados
                        </span>
                        <Switcher
                            checked={showEliminados}
                            onChange={() => setShowEliminados((prev) => !prev)}
                        />
                    </div>

                    <button
                        type="button"
                        title="Limpiar filtros"
                        aria-label="Limpiar filtros"
                        onClick={clearGarageFilters}
                        disabled={!hayFiltrosToolbar}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:border-[#000B7E]/40 hover:bg-[#000B7E]/5 hover:text-[#000B7E] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <HiOutlineX className="h-5 w-5" />
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
                                const rowClassName = isEliminado
                                    ? 'opacity-50 bg-gray-50'
                                    : ''

                                return (
                                    <Tr 
                                        key={row.id}
                                        className={rowClassName}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const cellClassName = isEliminado
                                                ? 'line-through text-gray-500'
                                                : ''
                                            
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
                <h5 className="mb-4">Confirmar eliminación</h5>
                <DeleteHistoricoWarning
                    loading={singleDeleteHistorico.loading}
                    items={singleDeleteHistorico.items}
                    entitySingular="negocio"
                    entityPlural="negocios"
                />
                <p className="mb-3 text-gray-700">
                    ¿Marcar como eliminado al negocio{' '}
                    <strong>{selectedPerson?.nombre}</strong>? Se desactivarán los
                    servicios asociados y se eliminará su cuenta de autenticación.
                </p>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Motivo de la eliminación <span className="text-red-600">*</span>
                </label>
                <textarea
                    className="mb-4 w-full min-h-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                    placeholder="Describe el motivo (mínimo 5 caracteres)…"
                    value={deleteMotivo}
                    onChange={(e) => setDeleteMotivo(e.target.value)}
                    maxLength={2000}
                />
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
                isOpen={bulkDeleteDialogOpen}
                onClose={onBulkDeleteDialogClose}
                onRequestClose={onBulkDeleteDialogClose}
            >
                <h5 className="mb-4">Confirmar eliminación múltiple</h5>
                <DeleteHistoricoWarning
                    loading={bulkDeleteHistorico.loading}
                    items={bulkDeleteHistorico.items}
                    entitySingular="negocio"
                    entityPlural="negocios"
                />
                <p className="mb-3 text-gray-700">
                    ¿Marcar como eliminados{' '}
                    <strong>{selectedGaragesCount}</strong> negocio(s)
                    seleccionado(s)? Se desactivarán sus servicios asociados y se
                    eliminarán sus cuentas de autenticación.
                </p>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Motivo de la eliminación{' '}
                    <span className="text-red-600">*</span>
                </label>
                <textarea
                    className="mb-4 w-full min-h-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                    placeholder="Describe el motivo (mínimo 5 caracteres)…"
                    value={bulkDeleteMotivo}
                    onChange={(e) => setBulkDeleteMotivo(e.target.value)}
                    maxLength={2000}
                />
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onBulkDeleteDialogClose}
                        disabled={isBulkDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: '#B91C1C' }}
                        className="text-white hover:opacity-80"
                        onClick={handleBulkDelete}
                        loading={isBulkDeleting}
                    >
                        Eliminar Negocios
                    </Button>
                </div>
            </Dialog>
            <Dialog
                isOpen={exportDialogIsOpen}
                onClose={handleCloseExportDialog}
                onRequestClose={handleCloseExportDialog}
            >
                <h5 className="mb-4">Confirmar exportación</h5>
                <p>
                    Se exportarán los negocios que ves en la tabla con los filtros
                    actuales (incluye columnas de la vista y datos internos del
                    documento).
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
