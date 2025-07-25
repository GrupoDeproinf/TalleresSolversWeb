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
} from 'firebase/firestore'
import { db, auth } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import Drawer from '@/components/ui/Drawer' // Asegúrate de que esta ruta sea correcta
import { Avatar } from '@/components/ui'
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

interface SelectedPlace {
    latiLng: { lat: number; lng: number }
    zoom: number
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

    id?: string
    status?: string
    password?: string
    confirmPassword?: string
    estado?: string
}

const Garages = () => {
    const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
        null,
    )
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre')
    const [searchTerm, setSearchTerm] = useState('')
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedPerson, setSelectedPerson] = useState<Garage | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false) // Estado para el Drawer
    const [exportDialogIsOpen, setExportDialogIsOpen] = useState(false) // Estado para el modal de exportación

    const getData = async () => {
        const q = query(collection(db, 'Usuarios'))
        const querySnapshot = await getDocs(q)
        const talleres: Garage[] = []

        querySnapshot.forEach((doc) => {
            const garageData = doc.data() as Garage
            if (garageData.typeUser === 'Taller') {
                talleres.push({ ...garageData, id: doc.id }) // Guardar el ID del documento
            }
        })

        setDataGarages(talleres)
    }

    const navigate = useNavigate()

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
        ]

        // Mapeo de encabezados en español
        const encabezados: Record<string, string> = {
            nombre: 'Nombre del Taller',
            rif: 'RIF',
            estado: 'Estado',
            email: 'Correo Electrónico',
            phone: 'Número Telefónico',
            status: 'Estado de Aprobación',
            Direccion: 'Dirección',
        }

        // Preparar los datos para exportar
        const tableData = dataGarages.map((row) => {
            const rowData: Record<string, any> = {}
            camposDeseados.forEach((campo) => {
                const value = row[campo as keyof Garage]
                const header = encabezados[campo] || campo
                rowData[header] = value ?? ''
            })
            // Agregar columna Certificador con el email
            rowData['Certificador'] = row.certificador_nombre ?? ''
            return rowData
        })

        if (tableData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay talleres disponibles para exportar.
                </Notification>,
            )
            return
        }

        // Crear el archivo Excel
        const worksheet = XLSX.utils.json_to_sheet(tableData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Talleres')
        XLSX.writeFile(workbook, 'talleres.xlsx')

        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
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
            .matches(/^(?!0)\d{10}$/, 'El teléfono debe tener 11 dígitos y no puede comenzar con 0')
            .required('El teléfono es obligatorio'),        
        password: Yup.string()
            .required('Por favor ingrese una contraseña')
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
            .required('Por favor confirme su contraseña'),
        estado: Yup.string().required('El estado es obligatorio'),
    })

    const [showPassword, setShowPassword] = useState(false)

    const handleCreateGarage = async (values: any, coordenadas: any) => {
        console.log('Datos del garage a crear', values);
    
        if (values.password !== values.confirmPassword) {
            toast.push(
                <Notification title="Error">
                    Las contraseñas no coinciden. Por favor, verifica los campos.
                </Notification>
            );
            return;
        }
        console.log(coordenadas)

        try {
            const userRef = collection(db, 'Usuarios');
            const emailLower = values.email.toLowerCase();
    
            // Validar correo electrónico único
            const emailQuery = query(userRef, where('email', '==', emailLower));
            const emailSnapshot = await getDocs(emailQuery);
            if (!emailSnapshot.empty) {
                toast.push(<Notification title="Error">¡El correo electrónico ya está registrado!</Notification>);
                return;
            }
    
            // Validar RIF único
            const rifQuery = query(userRef, where('rif', '==', values.rif));
            const rifSnapshot = await getDocs(rifQuery);
            if (!rifSnapshot.empty) {
                toast.push(<Notification title="Error">¡El RIF ya está registrado!</Notification>);
                return;
            }
    
            // Validar número de teléfono único
            const phoneQuery = query(userRef, where('phone', '==', values.phone));
            const phoneSnapshot = await getDocs(phoneQuery);
            if (!phoneSnapshot.empty) {
                toast.push(<Notification title="Error">¡El número de teléfono ya está registrado!</Notification>);
                return;
            }
    
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, emailLower, values.password);
            const user = userCredential.user;
    
            // Crear documento en Firestore
            const docRef = doc(userRef, user.uid);
            await setDoc(docRef, {
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
                image_perfil: '', // Inicialmente vacío, se actualiza más tarde
            });
    
            let logoDownloadUrl = '';
    
            // Subir imagen si se proporciona
            if (values.image_file) {
                // Obtener la extensión del archivo
                const fileType = values.image_file.name.split('.').pop()?.toLowerCase();
    
                // Validar si el archivo es una imagen válida
                if (!fileType || !['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                    toast.push(
                        <Notification title="Error">
                            Tipo de archivo no soportado. Solo se permiten imágenes.
                        </Notification>
                    );
                    return;
                }
    
                // Subir la imagen al Storage
                const newImageName = `${user.uid}_1.${fileType}`; // Usar la extensión del archivo
                const storageRef = ref(storage, `profileImages/${newImageName}`);
                const imageFile = values.image_file; // Asegúrate de que sea un archivo `File`
                await uploadBytes(storageRef, imageFile);
    
                // Obtener la URL de la imagen subida
                logoDownloadUrl = await getDownloadURL(storageRef);
    
                // Actualizar la URL de la imagen en Firestore
                await updateDoc(docRef, { image_perfil: logoDownloadUrl });
            }
    
            toast.push(<Notification title="Éxito">Taller creado y autenticado con éxito.</Notification>);
            setDrawerCreateIsOpen(false);
            getData(); // Refrescar lista
        } catch (error) {
            console.error('Error creando el taller:', error);
            toast.push(<Notification title="Error">Hubo un error al crear el Taller.</Notification>);
        }
    };
       

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)

        // Aplica el filtro dinámico según la columna seleccionada
        const newFilters = [
            {
                id: selectedColumn, // Usar la columna seleccionada
                value,
            },
        ]
        setFiltering(newFilters)
    }

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value
        setSelectedColumn(value)

        // Aplicar filtro vacío cuando se cambia la columna
        if (searchTerm !== '') {
            const newFilters = [
                {
                    id: value, // La columna seleccionada
                    value: searchTerm, // Filtrar por el término de búsqueda actual
                },
            ]
            setFiltering(newFilters)
        }
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
            header: 'Estado',
            accessorKey: 'status',
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
            header: ' ',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                navigate(`/profilegarage/${person.uid}`)
                            }
                            className="text-blue-900"
                        >
                            <FaRegEye />
                        </button>
                        <button
                            onClick={() => openDialog(person)}
                            className="text-red-700"
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
        setSelectedPerson(null) // Limpiar selección
    }

    const handleDelete = async () => {
        if (selectedPerson) {
            console.log('Eliminando a:', selectedPerson)

            try {
                const userDoc = doc(db, 'Usuarios', selectedPerson.uid)
                await deleteDoc(userDoc)

                const toastNotification = (
                    <Notification title="Éxito">
                        Taller {selectedPerson.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el taller:', error)

                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando el taller.
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
    const data = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        console.log('onPaginationChange', page)
        setCurrentPage(page) // Actualiza la página actual
    }

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    {' '}
                    <span className="text-[#000B7E]">Talleres</span>
                    <button
                        className="p-2  bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="relative w-32">
                            {' '}
                            <select
                                className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleSelectChange}
                                value={selectedColumn}
                            >
                                <option value="" disabled>
                                    Seleccionar columna...
                                </option>
                                <option value="nombre">Nombre</option>
                                <option value="rif">Rif</option>
                                <option value="email">Email</option>
                                <option value="status">Estado</option>
                            </select>
                        </div>
                        <div className="relative w-80 ml-4">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                        <Button
                            className="w-40 ml-4 text-white hover:opacity-80"
                            style={{ backgroundColor: '#000B7E' }}
                            onClick={() => setDrawerCreateIsOpen(true)}
                        >
                            Crear Taller
                        </Button>
                        <button
                            style={{ backgroundColor: '#10B981' }}
                            className="w-40 ml-4 p-2 text-white rounded-md shadow-md hover:bg-green-600 active:bg-green-700 transition duration-200 hover:opacity-80"
                            onClick={handleOpenExportDialog}
                        >
                            Exportar a Excel
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-3 rounded-lg shadow">
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
                                return (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <Td key={cell.id}>
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
            <Dialog
                isOpen={exportDialogIsOpen}
                onClose={handleCloseExportDialog}
                onRequestClose={handleCloseExportDialog}
            >
                <h5 className="mb-4">Confirmar Exportación</h5>
                <p>
                    ¿Estás seguro de que deseas exportar todos los talleres a Excel?
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
                <h2 className="mb-4 text-xl font-bold">Crear Taller</h2>
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
                                    accept="image/*"
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
                                        Nombre Taller:
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
                                        style={{ backgroundColor: '#000B7E' }}
                                        className="text-white hover:opacity-80"
                                    >
                                        Crear Taller
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
