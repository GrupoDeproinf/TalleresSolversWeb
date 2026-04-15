import { useEffect, useState } from 'react'
import React from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type {
    ColumnDef,
    ColumnSort,
    ColumnFiltersState,
} from '@tanstack/react-table'
import {
    FaEdit,
    FaTrash,
    FaEye,
    FaEyeSlash,
    FaUserCircle,
    FaUserShield,
    FaCar,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    where,
    deleteField,
    Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Avatar, Drawer, Select } from '@/components/ui'
import * as Yup from 'yup'
import Password from '@/views/account/Settings/components/Password'
import { HiOutlineRefresh, HiOutlineSearch, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi'
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik'
import * as XLSX from 'xlsx'
import { components as selectComponents } from 'react-select'

type Person = {
    nombre?: string
    email: string
    cedula?: string
    phone?: string
    password: string
    confirmPassword?: string
    uid: string
    typeUser?: string
    id: string
    estado?: string | string[]
}

const TODOS_ESTADOS_LABEL = 'Todos los estados'
const TODOS_ESTADOS_VALUE = '__TODOS_ESTADOS__'

const estadoOptions = [
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

const TODOS_ESTADOS_OPTION = {
    value: TODOS_ESTADOS_VALUE,
    label: TODOS_ESTADOS_LABEL,
}

const certificadorEstadoSelectOptions = [TODOS_ESTADOS_OPTION, ...estadoOptions]

function getAllEstadoValues(): string[] {
    return estadoOptions.map((o) => o.value)
}

/** Normaliza lo que venga de Firestore (array, string con comas, espacios). */
function toEstadoValuesList(estado: string | string[] | undefined): string[] {
    if (estado === undefined || estado === null) return []
    if (Array.isArray(estado)) {
        return estado.map((e) => String(e).trim()).filter(Boolean)
    }
    if (typeof estado === 'string') {
        const s = estado.trim()
        if (!s) return []
        if (s.includes(',')) {
            return s.split(',').map((x) => x.trim()).filter(Boolean)
        }
        return [s]
    }
    return []
}

/** True si el usuario tiene al menos un valor por cada estado canónico (p. ej. duplicados en BD no impiden reconocerlo). */
function isTodosLosEstados(estado: string | string[] | undefined): boolean {
    const all = getAllEstadoValues()
    if (all.length === 0) return false
    const values = toEstadoValuesList(estado)
    if (values.length === 0) return false
    const set = new Set(values)
    return all.every((v) => set.has(v))
}

function formatEstadoForTableExport(
    estado: string | string[] | undefined,
): string {
    if (isTodosLosEstados(estado)) return TODOS_ESTADOS_LABEL
    if (Array.isArray(estado)) return estado.join(', ')
    return estado ?? ''
}

function getCertificadorMultiSelectValue(
    estado: string | string[] | undefined,
): { value: string; label: string }[] {
    const list = toEstadoValuesList(estado)
    if (list.length === 0) return []
    if (isTodosLosEstados(estado)) return [TODOS_ESTADOS_OPTION]
    return estadoOptions.filter((o) => list.includes(o.value))
}

function resolveCertificadorEstadoMultiOnChange(
    prevEstado: string | string[] | undefined,
    selectedOptions: readonly { value: string; label: string }[] | null,
): string[] {
    const all = getAllEstadoValues()
    const opts = selectedOptions ?? []
    const hasTodos = opts.some((o) => o.value === TODOS_ESTADOS_VALUE)
    const indivVals = opts
        .filter((o) => o.value !== TODOS_ESTADOS_VALUE)
        .map((o) => o.value)
    const wasTodos = isTodosLosEstados(
        Array.isArray(prevEstado) ? prevEstado : undefined,
    )

    if (hasTodos && indivVals.length === 0) {
        return [...all]
    }
    if (!hasTodos) {
        return indivVals
    }
    if (wasTodos) {
        return all.filter((v) => !indivVals.includes(v))
    }
    return [...all]
}

function CertificadorEstadosMultiValue(
    estado: string | string[] | undefined,
    props: any,
) {
    if (isTodosLosEstados(estado) && props.index > 0) return null
    if (isTodosLosEstados(estado) && props.index === 0) {
        return (
            <selectComponents.MultiValue {...props} data={TODOS_ESTADOS_OPTION}>
                {TODOS_ESTADOS_LABEL}
            </selectComponents.MultiValue>
        )
    }
    return <selectComponents.MultiValue {...props} />
}

/** Documento de la subcolección Vehiculos (Usuarios/{uid}/Vehiculos). */
type VehicleData = {
    id: string
    KM?: number
    KM_correa_tiempo?: number
    KM_ultima_rotacion_cauchos?: number
    contratacion_RCV?: boolean
    grua?: boolean
    proximo_cambio_aceite?: Timestamp
    tipo_vehiculo?: string
    uid_tipo_vehiculo?: string
    ultimo_cambio_bujias_filtro?: Timestamp
    ultimo_cambio_pila_gasolina?: Timestamp
    ultimo_lavado?: Timestamp
    vehiculo_anio?: number
    vehiculo_color?: string
    vehiculo_marca?: string
    vehiculo_modelo?: string
    vehiculo_placa?: string
    path?: string
    ultima_vez_gasolina?: Timestamp | { seconds: number; nanoseconds?: number }
    ultima_vez_alineacion?: Timestamp | { seconds: number; nanoseconds?: number }
    activo?: boolean
    por_defecto?: boolean
}

function formatVehicleTimestamp(
    ts: Timestamp | { seconds: number; nanoseconds?: number } | undefined
): string {
    if (!ts) return '—'
    const date =
        ts && typeof (ts as Timestamp).toDate === 'function'
            ? (ts as Timestamp).toDate()
            : new Date((ts as { seconds: number }).seconds * 1000)
    return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

function personSearchableText(p: Person): string {
    const parts: string[] = []
    const push = (...vals: (string | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(p.nombre, p.email, p.cedula, p.phone, p.typeUser, p.uid, p.id)
    if (Array.isArray(p.estado)) {
        if (isTodosLosEstados(p.estado)) {
            push(TODOS_ESTADOS_LABEL)
        } else {
            for (const e of p.estado) {
                if (e) parts.push(String(e))
            }
        }
    } else if (isTodosLosEstados(p.estado)) {
        push(TODOS_ESTADOS_LABEL)
    } else {
        push(p.estado)
    }
    return parts.join(' ').toLowerCase()
}

const Users = () => {
    const [dataUsers, setDataUsers] = useState<Person[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
    const [selectedPersonForVehicle, setSelectedPersonForVehicle] = useState<Person | null>(null)
    const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0)
    const [userVehicles, setUserVehicles] = useState<VehicleData[]>([])
    const [vehiclesLoading, setVehiclesLoading] = useState(false)
    const [imagePopupOpen, setImagePopupOpen] = useState(false)
    const [imagePopupUrl, setImagePopupUrl] = useState<string | null>(null)
    const [imageZoom, setImageZoom] = useState(1)

    const getData = async () => {
        const q = query(collection(db, 'Usuarios'))
        const querySnapshot = await getDocs(q)
        const usuarios: Person[] = []

        querySnapshot.forEach((doc) => {
            const userData = doc.data() as Person
            // Filtrar por typeUser "Cliente" o "Certificador"
            if (
                userData.typeUser === 'Cliente' ||
                userData.typeUser === 'Certificador'
            ) {
                usuarios.push({
                    ...userData,
                    id: doc.id, // Guarda el id generado por Firebase
                })
            }
        })

        setDataUsers(usuarios)
    }

    useEffect(() => {
        getData()
    }, [])
    const handleRefresh = async () => {
        await getData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newUser, setNewUser] = useState<Person | null>({
        nombre: '',
        email: '',
        cedula: '',
        phone: '',
        typeUser: 'Cliente',
        password: '',
        uid: '', // Asignar valor vacío si no quieres que sea undefined
        id: '', // También puedes asignar un valor vacío si no quieres undefined
        estado: '',
    })

    const openDialog = (person: Person) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Person) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    const openVehicleDialog = async (person: Person) => {
        setSelectedPersonForVehicle(person)
        setSelectedVehicleIndex(0)
        setVehicleDialogOpen(true)
        setVehiclesLoading(true)
        setUserVehicles([])
        try {
            const vehiculosRef = collection(db, 'Usuarios', person.id, 'Vehiculos')
            const snapshot = await getDocs(vehiculosRef)
            const vehiculos: VehicleData[] = snapshot.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<VehicleData, 'id'>),
            }))
            setUserVehicles(vehiculos)
        } catch (err) {
            console.error('Error al cargar vehículos:', err)
            toast.push(
                <Notification title="Error" type="danger">
                    No se pudieron cargar los vehículos del usuario.
                </Notification>,
            )
        } finally {
            setVehiclesLoading(false)
        }
    }

    const closeVehicleDialog = () => {
        setVehicleDialogOpen(false)
        setSelectedPersonForVehicle(null)
        setSelectedVehicleIndex(0)
        setUserVehicles([])
    }

    const openImagePopup = (url: string) => {
        setImagePopupUrl(url)
        setImageZoom(1)
        setImagePopupOpen(true)
    }
    const closeImagePopup = () => {
        setImagePopupOpen(false)
        setImagePopupUrl(null)
        setImageZoom(1)
    }
    const ZOOM_MIN = 0.5
    const ZOOM_MAX = 3
    const ZOOM_STEP = 0.25
    const handleZoomIn = () => setImageZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
    const handleZoomOut = () => setImageZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))

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
        cedula: Yup.string()
            .matches(/^[V,E,C,G,J,P]-\d{7,10}$/, 'tener entre 7 y 10 dígitos')
            .required('La cédula es obligatoria'),
        phone: Yup.string()
            .matches(/^[1-9]\d{9}$/, 'El teléfono debe tener 10 dígitos y no puede comenzar con 0')
            .required('El teléfono es obligatorio'),
        typeUser: Yup.string()
            .oneOf(['Cliente', 'Certificador'], 'Tipo de usuario inválido')
            .required('El tipo de usuario es obligatorio'),
        estado: Yup.mixed().when('typeUser', {
            is: 'Certificador',
            then: () => Yup.array().min(1, 'Debe seleccionar al menos un estado').required('El estado es obligatorio'),
            otherwise: () => Yup.string().required('El estado es obligatorio'),
        }),
        password: Yup.string()
            .required('Por favor ingrese una contraseña')
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
            .required('Por favor confirme su contraseña'),
    })

    const handleCreateUser = async (values: any) => {
        try {
            await validationSchema.validate(values, { abortEarly: false })

            const usersRef = collection(db, 'Usuarios')
            const emailLower = values.email.toLowerCase();

            const cedulaQuery = query(
                usersRef,
                where('cedula', '==', values.cedula),
            )
            const cedulaSnapshot = await getDocs(cedulaQuery)

            const phoneQuery = query(
                usersRef,
                where('phone', '==', values.phone),
            )
            const phoneSnapshot = await getDocs(phoneQuery)

            const emailQuery = query(
                usersRef,
                where('email', '==', emailLower),
            )
            const emailSnapshot = await getDocs(emailQuery)

            if (!emailSnapshot.empty) {
                toast.push(
                    <Notification title="Error">
                        ¡El correo electrónico ya está registrado!
                    </Notification>,
                )
                return
            }

            if (!cedulaSnapshot.empty) {
                toast.push(
                    <Notification title="Error">
                        ¡La cédula ya está registrada!
                    </Notification>,
                )
                return
            }

            if (!phoneSnapshot.empty) {
                toast.push(
                    <Notification title="Error">
                        ¡El número de teléfono ya está registrado!
                    </Notification>,
                )
                return
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                emailLower,
                values.password,
            )
            const user = userCredential.user

            const userRef = collection(db, 'Usuarios')

            const docRef = await addDoc(userRef, {
                nombre: values.nombre,
                email: emailLower,
                cedula: values.cedula,
                phone: values.phone,
                Password: values.password,
                typeUser: values.typeUser || 'Cliente',
                uid: user.uid,
                estado: values.typeUser === 'Certificador' ? (Array.isArray(values.estado) ? values.estado : [values.estado]) : values.estado,
            })

            await updateDoc(docRef, {
                uid: docRef.id,
            })

            toast.push(
                <Notification title="Éxito">
                    Usuario creado exitosamente.
                </Notification>,
            )

            setDrawerCreateIsOpen(false)

            getData()
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                error.inner.forEach((validationError) => {
                    toast.push(
                        <Notification title="Error">
                            {validationError.message}
                        </Notification>,
                    )
                })
            } else {
                console.error('Error creando Usuario:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el Usuario.
                    </Notification>,
                )
            }
        }
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const handleExportExcel = () => {
        const rows = table.getRowModel().rows.map((row) => {
            const p = row.original
            const estadoStr = formatEstadoForTableExport(p.estado)
            return {
                Nombre: p.nombre ?? '',
                Cédula: p.cedula ?? '',
                Email: p.email ?? '',
                'Número telefónico': p.phone ?? '',
                Estado: estadoStr,
                'Tipo de usuario': p.typeUser ?? '',
            }
        })
        if (rows.length === 0) {
            toast.push(
                <Notification title="Sin datos">
                    No hay usuarios para exportar.
                </Notification>,
            )
            return
        }
        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios')
        XLSX.writeFile(workbook, 'Usuarios.xlsx')
        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        )
    }

    const handleSaveChanges = async () => {
        if (selectedPerson) {
            try {
                const usersRef = collection(db, 'Usuarios')
                const emailLower = selectedPerson.email.toLowerCase();

                const cedulaQuery = query(
                    usersRef,
                    where('cedula', '==', selectedPerson.cedula),
                )
                const cedulaSnapshot = await getDocs(cedulaQuery)

                const phoneQuery = query(
                    usersRef,
                    where('phone', '==', selectedPerson.phone),
                )
                const phoneSnapshot = await getDocs(phoneQuery)

                // Validar cédula: debe ser única o la misma que ya tenía el usuario
                if (!cedulaSnapshot.empty) {
                    const existingUser = cedulaSnapshot.docs[0].data()
                    // Si la cédula existe y pertenece a otro usuario (diferente UID), es un error
                    if (existingUser.uid !== selectedPerson.uid) {
                        toast.push(
                            <Notification title="Error">
                                ¡La cédula ya está registrada por otro usuario!
                            </Notification>,
                        )
                        return
                    }
                }

                // Validar teléfono: debe ser único o el mismo que ya tenía el usuario
                if (!phoneSnapshot.empty) {
                    const existingUser = phoneSnapshot.docs[0].data()
                    // Si el teléfono existe y pertenece a otro usuario (diferente UID), es un error
                    if (existingUser.uid !== selectedPerson.uid) {
                        toast.push(
                            <Notification title="Error">
                                ¡El número de teléfono ya está registrado por otro usuario!
                            </Notification>,
                        )
                        return
                    }
                }

                const userDoc = doc(db, 'Usuarios', selectedPerson.uid)
                const updateData: any = {
                    nombre: selectedPerson.nombre,
                    email: emailLower,
                    cedula: selectedPerson.cedula,
                    phone: selectedPerson.phone,
                    typeUser: selectedPerson.typeUser,
                    estado: selectedPerson.typeUser === 'Certificador' ? (Array.isArray(selectedPerson.estado) ? selectedPerson.estado : [selectedPerson.estado]) : selectedPerson.estado
                }

                await updateDoc(userDoc, updateData)

                toast.push(
                    <Notification title="Éxito">
                        Usuario actualizado con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData()
            } catch (error) {
                console.error('Error actualizando el usuario:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el usuario.
                    </Notification>,
                )
            }
        }
    }

    // Obtener iniciales de los nombres
    const getInitials = (nombre: string | undefined): string => {
        if (!nombre) return ''
        const words = nombre.split(' ').filter(Boolean)
        return words
            .map((word) => {
                if (typeof word === 'string' && word.length > 0) {
                    return word[0].toUpperCase()
                }
                return ''
            })
            .join('')
    }
    const columns: ColumnDef<Person>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue }) => getValue(),
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'Cedula',
            accessorKey: 'cedula',
            filterFn: 'includesString',
        },
        {
            header: 'Email',
            accessorKey: 'email',
            filterFn: 'includesString',
        },

        {
            header: 'Numero Telefonico',
            accessorKey: 'phone',
            filterFn: 'includesString',
            cell: ({ row }) => {
                const nombre = row.original.nombre
                return (
                    <div className="flex items-center">
                        <Avatar
                            style={{ backgroundColor: '#887677' }}
                            className="mr-2 w-6 h-6 flex items-center justify-center rounded-full"
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
            header: 'Estado',
            accessorKey: 'estado',
            filterFn: 'includesString',
            cell: ({ row }) => {
                const estado = row.original.estado
                if (isTodosLosEstados(estado)) {
                    return (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {TODOS_ESTADOS_LABEL}
                        </span>
                    )
                }
                if (Array.isArray(estado)) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {estado.map((est, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                    {est}
                                </span>
                            ))}
                        </div>
                    )
                }
                return <span>{estado}</span>
            },
        },
        {
            header: 'Tipo de Usuario',
            accessorKey: 'typeUser',
            cell: ({ row }) => {
                const typeUser = row.getValue('typeUser') as string // Aserción de tipo
                let icon
                let color

                switch (typeUser) {
                    case 'Cliente':
                        icon = <FaUserCircle className="text-green-500 mr-1" />
                        color = 'text-green-500'
                        break
                    case 'Certificador':
                        icon = <FaUserShield className="text-yellow-500 mr-1" />
                        color = 'text-yellow-500'
                        break
                    default:
                        icon = null
                        color = 'text-gray-500'
                }

                return (
                    <div className={`flex items-center ${color}`}>
                        {icon}
                        <span>{typeUser}</span>
                    </div>
                )
            },
        },
        {
            header: ' ',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => openVehicleDialog(person)}
                            className="text-amber-600 hover:text-amber-700"
                            title="Ver vehículo"
                        >
                            <FaCar />
                        </button>
                        <button
                            onClick={() => openDrawer(person)}
                            className="text-blue-900"
                            title="Editar"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => openDialog(person)}
                            className="text-red-700"
                            title="Eliminar"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )
            },
        },
    ]

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedPerson(null)
    }

    const handleDrawerClose = (e: MouseEvent) => {
        setDrawerCreateIsOpen(false)
        setNewUser({
            nombre: '',
            email: '',
            cedula: '',
            phone: '',
            typeUser: 'Cliente',
            password: '',
            confirmPassword: '',
            id: '',
            uid: '',
            estado: '',
        })

        setSelectedPerson(null)
    }

    const handleDelete = async () => {
        if (selectedPerson) {
            console.log('Eliminando a:', selectedPerson)

            try {
                const userDoc = doc(db, 'Usuarios', selectedPerson.id)
                await deleteDoc(userDoc)

                const toastNotification = (
                    <Notification title="Éxito">
                        Usuario {selectedPerson.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData()
            } catch (error) {
                console.error('Error eliminando el usuario:', error)

                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando el usuario.
                    </Notification>
                )
                toast.push(errorNotification)
            } finally {
                setIsOpen(false)
                setSelectedPerson(null)
            }
        }
    }

    const table = useReactTable({
        data: dataUsers,
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
            return personSearchableText(row.original).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const data = table.getRowModel().rows
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false)
    }

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-[#000B7E]">
                        Usuarios
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
                <div className="flex flex-wrap items-end justify-end gap-3">
                    <div className="w-full min-w-[12rem] max-w-sm sm:w-80">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            Buscar en la tabla
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nombre, cédula, email, teléfono, estado, tipo, id…"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                    <Button
                        className="h-10 w-40 shrink-0 text-sm text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setDrawerCreateIsOpen(true)}
                    >
                        Crear Usuario
                    </Button>
                    <button
                        type="button"
                        style={{ backgroundColor: '#10B981' }}
                        className="h-10 min-w-[180px] shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90"
                        onClick={handleExportExcel}
                    >
                        Exportar a Excel
                    </button>
                </div>
            </div>
            <div className="p-3 rounded-lg shadow">
                <Table className="w-full rounded-lg ">
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
                        {data.slice(startIndex, endIndex).map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
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
                    ¿Estás seguro de que deseas eliminar a{' '}
                    {selectedPerson?.nombre}?
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

            {/* Popup información del vehículo. Datos desde subcolección Usuarios/{uid}/Vehiculos. */}
            <Dialog
                isOpen={vehicleDialogOpen}
                onClose={closeVehicleDialog}
                onRequestClose={closeVehicleDialog}
            >
                <div className="flex items-center gap-2 mb-2">
                    <FaCar className="text-amber-600 w-5 h-5" />
                    <h5 className="mb-0">Información del vehículo</h5>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                    Usuario: <span className="font-semibold text-gray-800">{selectedPersonForVehicle?.nombre ?? '—'}</span>
                </p>

                {vehiclesLoading ? (
                    <p className="text-gray-500 text-sm py-4">Cargando vehículos...</p>
                ) : userVehicles.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">Este usuario no tiene vehículos registrados.</p>
                ) : (
                    <>
                        {/* Selector de vehículo (tabs): marca, modelo, año */}
                        {userVehicles.length > 1 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vehículo</label>
                                <div className="flex gap-2 flex-wrap">
                                    {userVehicles.map((v, idx) => {
                                        const tabLabel = [v.vehiculo_marca, v.vehiculo_modelo, v.vehiculo_anio]
                                            .filter(Boolean)
                                            .join(' ') || `Vehículo ${idx + 1}`
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setSelectedVehicleIndex(idx)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedVehicleIndex === idx
                                                        ? 'bg-[#000B7E] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {tabLabel}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {userVehicles[selectedVehicleIndex] && (() => {
                            const v = userVehicles[selectedVehicleIndex]
                            const marcaModeloAnio = [v.vehiculo_marca, v.vehiculo_modelo, v.vehiculo_anio]
                                .filter(Boolean)
                                .join(' ') || '—'
                            return (
                                <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-start gap-3 border-b border-gray-200 pb-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-gray-600 block">Vehículo</span>
                                            <span className="font-medium">{marcaModeloAnio}{v.vehiculo_color ? ` — ${v.vehiculo_color}` : ''}</span>
                                        </div>
                                        {v.path && (
                                            <button
                                                type="button"
                                                onClick={() => openImagePopup(v.path!)}
                                                className="shrink-0 rounded overflow-hidden border border-gray-200 bg-white cursor-pointer hover:opacity-90 transition-opacity"
                                                title="Ver imagen del vehículo"
                                            >
                                                <img
                                                    src={v.path}
                                                    alt="Vehículo"
                                                    className="w-20 h-14 object-cover block"
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {(v.vehiculo_placa != null && v.vehiculo_placa !== '') && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Placa:</span>
                                            <span className="font-medium">{v.vehiculo_placa}</span>
                                        </div>
                                    )}
                                    {v.tipo_vehiculo != null && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tipo de vehículo:</span>
                                            <span className="font-medium">{v.tipo_vehiculo}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">KM del vehículo:</span>
                                        <span className="font-medium">{v.KM != null ? `${v.KM.toLocaleString('es-ES')} km` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Próximo cambio de aceite:</span>
                                        <span className="font-medium">{formatVehicleTimestamp(v.proximo_cambio_aceite)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">KM de correa de tiempo:</span>
                                        <span className="font-medium">{v.KM_correa_tiempo != null ? `${v.KM_correa_tiempo.toLocaleString('es-ES')} km` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Último cambio de bujías y filtros:</span>
                                        <span className="font-medium">{formatVehicleTimestamp(v.ultimo_cambio_bujias_filtro)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Último cambio de pila de gasolina:</span>
                                        <span className="font-medium">{formatVehicleTimestamp(v.ultimo_cambio_pila_gasolina)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">KM de la última rotación de cauchos:</span>
                                        <span className="font-medium">{v.KM_ultima_rotacion_cauchos != null ? `${v.KM_ultima_rotacion_cauchos.toLocaleString('es-ES')} km` : '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Último lavado completo (chasis, motor, ducha marina):</span>
                                        <span className="font-medium">{formatVehicleTimestamp(v.ultimo_lavado)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Contratación de RCV (versión Plus):</span>
                                        <span className="font-medium">{v.contratacion_RCV == null ? '—' : v.contratacion_RCV ? 'Sí' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Contratación de servicio de grúa (versión Plus):</span>
                                        <span className="font-medium">{v.grua == null ? '—' : v.grua ? 'Sí' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Última vez gasolina:</span>
                                        <span className="font-medium">{formatVehicleTimestamp(v.ultima_vez_gasolina)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Última vez alineación:</span>
                                        <span className="font-medium">{formatVehicleTimestamp(v.ultima_vez_alineacion)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Activo:</span>
                                        <span className="font-medium">{v.activo == null ? '—' : v.activo ? 'Sí' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Por defecto:</span>
                                        <span className="font-medium">{v.por_defecto == null ? '—' : v.por_defecto ? 'Sí' : 'No'}</span>
                                    </div>
                                </div>
                            )
                        })()}
                    </>
                )}

                <div className="text-right mt-6">
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className="text-white hover:opacity-80"
                        onClick={closeVehicleDialog}
                    >
                        Cerrar
                    </Button>
                </div>
            </Dialog>

            {/* Popup imagen del vehículo con zoom */}
            <Dialog
                isOpen={imagePopupOpen}
                onClose={closeImagePopup}
                onRequestClose={closeImagePopup}
                width={640}
                className="overflow-hidden"
            >
                <div className="flex flex-col h-full max-h-[85vh] pr-8">
                    <div className="flex items-center gap-4 mb-3">
                        <h5 className="mb-0">Imagen del vehículo</h5>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={handleZoomOut}
                                disabled={imageZoom <= ZOOM_MIN}
                                icon={<HiOutlineMinus className="text-lg" />}
                                title="Alejar"
                            />
                            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                                {Math.round(imageZoom * 100)}%
                            </span>
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={handleZoomIn}
                                disabled={imageZoom >= ZOOM_MAX}
                                icon={<HiOutlinePlus className="text-lg" />}
                                title="Acercar"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-100 rounded-lg flex items-center justify-center p-2 min-h-[300px]">
                        {imagePopupUrl && (
                            <img
                                src={imagePopupUrl}
                                alt="Vehículo"
                                className="max-w-full max-h-[70vh] object-contain transition-transform duration-150 select-none"
                                style={{ transform: `scale(${imageZoom})` }}
                                draggable={false}
                            />
                        )}
                    </div>
                    <div className="text-right mt-3">
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={closeImagePopup}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Dialog>

            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerCloseEdit}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Editar Usuario</h2>
                <div className="flex flex-col space-y-6">
                    {/* Campo para Nombre */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.nombre || ''}
                            onChange={(e) =>
                                setSelectedPerson((prev: any) => ({
                                    ...prev,
                                    nombre: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>

                    {/* Campo para Email */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Email:
                        </span>
                        <input
                            type="email"
                            value={selectedPerson?.email || ''}
                            readOnly
                            onChange={(e) =>
                                setSelectedPerson((prev: any) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 transition duration-200 cursor-not-allowed"
                        />
                    </label>

                    {/* Campo para Cédula */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Cédula:
                        </span>
                        <div className="flex items-center mt-1">
                            <select
                                value={
                                    selectedPerson?.cedula?.split('-')[0] || 'V'
                                }
                                onChange={(e) =>
                                    setSelectedPerson((prev: any) => ({
                                        ...prev,
                                        cedula: `${e.target.value}-${
                                            prev?.cedula?.split('-')[1] || ''
                                        }`,
                                    }))
                                }
                                className="mx-2 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                <option value="V">V-</option>
                                <option value="E">E-</option>
                                <option value="C">C-</option>
                                <option value="G">G-</option>
                                <option value="J">J-</option>
                                <option value="P">P-</option>
                            </select>
                            <input
                                type="text"
                                value={
                                    selectedPerson?.cedula?.split('-')[1] || ''
                                }
                                onChange={(e) =>
                                    setSelectedPerson((prev: any) => ({
                                        ...prev,
                                        cedula: `${
                                            prev?.cedula?.split('-')[0] || 'V'
                                        }-${e.target.value}`,
                                    }))
                                }
                                className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
                            />
                        </div>
                    </label>

                    {/* Campo para Teléfono */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Teléfono:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.phone || ''}
                            placeholder="Ejem (4142611966)"
                            onChange={(e) => {
                                // Remover 0 al principio si se pega texto
                                const value = e.target.value.replace(/^0+/, '')
                                setSelectedPerson((prev: any) => ({
                                    ...prev,
                                    phone: value,
                                }))
                            }}
                            onKeyDown={(e) => {
                                // Prevenir escribir 0 al principio
                                if (e.currentTarget.value === '' && e.key === '0') {
                                    e.preventDefault()
                                }
                            }}
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>

                    {/* Campo para Tipo de Usuario */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Tipo de Usuario:
                        </span>
                        <select
                            value={selectedPerson?.typeUser || 'Cliente'}
                            onChange={(e) => {
                                const newTypeUser = e.target.value
                                setSelectedPerson((prev: any) => {
                                    if (!prev) return prev
                                    if (prev.typeUser === newTypeUser) return prev
                                    return {
                                        ...prev,
                                        typeUser: newTypeUser,
                                        estado:
                                            newTypeUser === 'Certificador'
                                                ? []
                                                : '',
                                    }
                                })
                            }}
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        >
                            <option value="Cliente">Cliente</option>
                            <option value="Certificador">Certificador</option>
                        </select>
                    </label>

                    {/* Campo para Estados */}
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Estado:
                            </span>
                            {selectedPerson?.typeUser === 'Certificador' ? (
                                <Select
                                    isMulti
                                    options={certificadorEstadoSelectOptions}
                                    value={getCertificadorMultiSelectValue(
                                        selectedPerson?.estado,
                                    )}
                                    onChange={(selectedOptions) => {
                                        setSelectedPerson((prev: any) => ({
                                            ...prev,
                                            estado:
                                                resolveCertificadorEstadoMultiOnChange(
                                                    prev?.estado,
                                                    selectedOptions as any,
                                                ),
                                        }))
                                    }}
                                    components={{
                                        MultiValue: (props: any) =>
                                            CertificadorEstadosMultiValue(
                                                selectedPerson?.estado,
                                                props,
                                            ),
                                    }}
                                    placeholder="Seleccione los estados..."
                                    className="mt-1"
                                />
                            ) : (
                                <Select
                                    options={estadoOptions}
                                    value={estadoOptions.find((option) => 
                                        !Array.isArray(selectedPerson?.estado) && option.value === selectedPerson?.estado
                                    ) || null}
                                    onChange={(selectedOption) => {
                                        setSelectedPerson((prev: any) => ({
                                            ...prev,
                                            estado: selectedOption ? selectedOption.value : '',
                                        }));
                                    }}
                                    placeholder="Seleccione un estado..."
                                    className="mt-1"
                                />
                            )}
                        </label>
                </div>

                <div className="text-right mt-6">
                    <Button
                        className="mr-2"
                        variant="default"
                        onClick={handleDrawerCloseEdit}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveChanges}
                        style={{ backgroundColor: '#000B7E' }}
                        className="text-white hover:opacity-80"
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </Drawer>

            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Usuario</h2>
                <Formik
                    initialValues={{
                        nombre: '',
                        email: '',
                        cedula: '',
                        phone: '',
                        typeUser: 'Cliente',
                        password: '',
                        confirmPassword: '',
                        estado: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleCreateUser(values)
                        setSubmitting(false)
                    }}
                >
                    {({ isSubmitting, setFieldValue, values }) => {
                        // Efecto para limpiar el estado cuando cambie el tipo de usuario
                        React.useEffect(() => {
                            if (values.typeUser === 'Certificador') {
                                setFieldValue('estado', [])
                            } else {
                                setFieldValue('estado', '')
                            }
                        }, [values.typeUser, setFieldValue])

                        return (
                        <Form className="flex flex-col space-y-6">
                            {/* Nombre */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre:
                                </label>
                                <Field
                                    type="text"
                                    name="nombre"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="nombre"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Email:
                                </label>
                                <Field
                                    type="email"
                                    name="email"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="email"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Cédula */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Cédula:
                                </label>
                                <div className="flex items-center mt-1">
                                    <select
                                        name="cedulaPrefix"
                                        value={
                                            values.cedula.split('-')[0] || 'V'
                                        }
                                        onChange={(e) => {
                                            const newCedula = `${
                                                e.target.value
                                            }-${
                                                values.cedula.split('-')[1] ||
                                                ''
                                            }`
                                            setFieldValue('cedula', newCedula)
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
                                        name="cedula"
                                        value={
                                            values.cedula.split('-')[1] || ''
                                        }
                                        onChange={(e: any) => {
                                            const newCedula = `${
                                                values.cedula.split('-')[0] ||
                                                'V'
                                            }-${e.target.value}`
                                            setFieldValue('cedula', newCedula)
                                        }}
                                        className="p-3 border border-gray-300 rounded-r-lg mx-2 w-full"
                                    />
                                    <ErrorMessage
                                        name="cedula"
                                        component="div"
                                        className="text-red-600 text-sm mt-1"
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Teléfono:
                                </label>
                                <Field
                                    type="text"
                                    name="phone"
                                    placeholder="Ejem (4142611966)"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        // Prevenir escribir 0 al principio
                                        if (e.currentTarget.value === '' && e.key === '0') {
                                            e.preventDefault()
                                        }
                                    }}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        // Remover 0 al principio si se pega texto
                                        const value = e.target.value.replace(/^0+/, '')
                                        // Actualizar el valor del campo usando Formik
                                        setFieldValue('phone', value)
                                    }}
                                />
                                <ErrorMessage
                                    name="phone"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Tipo de Usuario */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Tipo de Usuario:
                                </label>
                                <Field
                                    as="select"
                                    name="typeUser"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Cliente">Cliente</option>
                                    <option value="Certificador">
                                        Certificador
                                    </option>
                                </Field>
                                <ErrorMessage
                                    name="typeUser"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Campo para Estados */}
<div className="flex flex-col">
    <label className="font-semibold text-gray-700">Estado:</label>
    {values.typeUser === 'Certificador' ? (
        <Field name="estado">
            {({ field, form }: any) => (
                <Select
                    isMulti
                    field={field}
                    form={form}
                    options={certificadorEstadoSelectOptions}
                    value={getCertificadorMultiSelectValue(values.estado)}
                    onChange={(selectedOptions) => {
                        form.setFieldValue(
                            field.name,
                            resolveCertificadorEstadoMultiOnChange(
                                values.estado,
                                selectedOptions as any,
                            ),
                        )
                    }}
                    components={{
                        MultiValue: (props: any) =>
                            CertificadorEstadosMultiValue(
                                values.estado,
                                props,
                            ),
                    }}
                    placeholder="Seleccione los estados..."
                    className="mt-1"
                />
            )}
        </Field>
    ) : (
        <Field name="estado">
            {({ field, form }: any) => (
                <Select
                    field={field}
                    form={form}
                    options={estadoOptions}
                    value={estadoOptions.find((option) => option.value === values.estado) || null}
                    onChange={(selectedOption) => {
                        form.setFieldValue(field.name, selectedOption ? selectedOption.value : '');
                    }}
                    placeholder="Seleccione un estado..."
                    className="mt-1"
                />
            )}
        </Field>
    )}
    <ErrorMessage
        name="estado"
        component="div"
        className="text-red-600 text-sm mt-1"
    />
</div>

                            {/* Contraseña */}
                            <div className="flex flex-col relative">
                                <label className="font-semibold text-gray-700">
                                    Contraseña:
                                </label>
                                <Field
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-10 text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Confirmar Contraseña */}
                            <div className="flex flex-col relative mt-4">
                                <label className="font-semibold text-gray-700">
                                    Confirmar Contraseña:
                                </label>
                                <Field
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="confirmPassword"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-10 text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>
                                <ErrorMessage
                                    name="confirmPassword"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Botones */}
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
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Crear'}
                                </Button>
                            </div>
                        </Form>
                    );
                    }}
                </Formik>
            </Drawer>
        </>
    )
}

export default Users
