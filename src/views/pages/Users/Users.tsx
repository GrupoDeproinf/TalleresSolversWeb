import { useEffect, useState } from 'react'
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
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
} from 'firebase/firestore'
import { db, auth } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Avatar, Drawer } from '@/components/ui'
import * as Yup from 'yup'
import Password from '@/views/account/Settings/components/Password'
import { HiOutlineRefresh } from 'react-icons/hi'
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik'

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
}

const Users = () => {
    const [dataUsers, setDataUsers] = useState<Person[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([]) // Cambiar a ColumnFiltersState
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

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
    })

    const openDialog = (person: Person) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Person) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es obligatorio'),
        email: Yup.string()
            .email('Debe ser un email válido')
            .required('El correo electrónico es obligatorio'),
        cedula: Yup.string()
            .matches(/^[V,E,C,G,J,P]-\d{7,10}$/, 'tener entre 7 y 10 dígitos')
            .required('La cédula es obligatoria'),
        phone: Yup.string()
            .matches(/^\d{11}$/, 'El teléfono debe tener 11 dígitos')
            .required('El teléfono es obligatorio'),
        typeUser: Yup.string()
            .oneOf(['Cliente', 'Certificador'], 'Tipo de usuario inválido')
            .required('El tipo de usuario es obligatorio'),
        password: Yup.string().required('Por favor ingrese una contraseña'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
            .required('Por favor confirme su contraseña'),
    })

    const handleCreateUser = async (values: any) => {
        const { resetForm } = useFormikContext() // Aquí obtenemos resetForm
        try {
            // Verifica que los valores sean válidos a través de Yup
            await validationSchema.validate(values, { abortEarly: false })

            // Crear y autenticar el usuario en Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password,
            )
            const user = userCredential.user // Usuario autenticado desde Firebase

            // Crear el documento en Firestore con el UID de Firebase
            const userRef = collection(db, 'Usuarios')
            const docRef = await addDoc(userRef, {
                nombre: values.nombre,
                email: values.email,
                cedula: values.cedula,
                phone: values.phone,
                Password: values.password,
                typeUser: values.typeUser || 'Cliente',
                uid: user.uid, // Usar el UID de Firebase para asociar el usuario
            })

            // Actualización del UID en Firestore
            await updateDoc(docRef, {
                uid: docRef.id,
            })

            toast.push(
                <Notification title="Éxito">
                    Usuario creado exitosamente.
                </Notification>,
            )

            setDrawerCreateIsOpen(false) // Cerrar el Drawer después de crear el usuario
            resetForm() // Resetea los valores del formulario después de crear el usuario
            getData() // Llamada a obtener los datos (si es necesario)
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
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el Usuario.
                    </Notification>,
                )
            }
        }
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
    const handleSaveChanges = async () => {
        if (selectedPerson) {
            try {
                const userDoc = doc(db, 'Usuarios', selectedPerson.uid)
                await updateDoc(userDoc, {
                    nombre: selectedPerson.nombre,
                    email: selectedPerson.email,
                    cedula: selectedPerson.cedula,
                    phone: selectedPerson.phone,
                    typeUser: selectedPerson.typeUser,
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Usuario actualizado con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData() // Refrescar datos después de guardar
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
                const nombre = row.original.nombre // Accede al nombre del cliente
                return (
                    <div className="flex items-center">
                        <Avatar
                            style={{ backgroundColor: '#887677' }} // Establecer el color directamente
                            className="mr-2 w-6 h-6 flex items-center justify-center rounded-full"
                        >
                            <span className="text-white font-bold">
                                {getInitials(nombre)}
                            </span>
                        </Avatar>
                        {row.original.phone}{' '}
                        {/* Muestra el número telefónico */}
                    </div>
                )
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
                        color = 'text-green-500' // Color para el texto
                        break
                    case 'Certificador':
                        icon = <FaUserShield className="text-yellow-500 mr-1" />
                        color = 'text-yellow-500' // Color para el texto
                        break
                    default:
                        icon = null
                        color = 'text-gray-500' // Color predeterminado
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
                    <div className="flex gap-2">
                        <button
                            onClick={() => openDrawer(person)} // Cambiar aquí
                            className="text-blue-900"
                        >
                            <FaEdit />
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

    const handleDrawerClose = (e: MouseEvent) => {
        // Cierra el Drawer
        setDrawerCreateIsOpen(false)
        // Limpia otros estados si es necesario (como el estado de newUser)
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
        })

        setSelectedPerson(null) // Limpia la selección (si es necesario)
    }

    const handleDelete = async () => {
        if (selectedPerson) {
            console.log('Eliminando a:', selectedPerson)

            try {
                // Usa el id del documento en lugar de uid
                const userDoc = doc(db, 'Usuarios', selectedPerson.id)
                await deleteDoc(userDoc)

                // Usar toast para mostrar el mensaje de éxito
                const toastNotification = (
                    <Notification title="Éxito">
                        Usuario {selectedPerson.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el usuario:', error)

                // Usar toast para mostrar el mensaje de error
                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando el usuario.
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
        data: dataUsers,
        columns,
        state: {
            sorting,
            columnFilters: filtering, // Usar el array de filtros
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 6 // Puedes cambiar esto si deseas un número diferente

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false) // Usar el estado correcto para cerrar el Drawer
    }

    return (
        <>
            <div className="grid grid-cols-2 mb-6">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    {' '}
                    <span className="text-[#000B7E]">Lista de Usuarios</span>
                    <button
                        className="p-2  bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end">
                    <Button
                        className="w-40 text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setDrawerCreateIsOpen(true)}
                    >
                        Crear Usuario
                    </Button>
                </div>
            </div>
            <div className="p-3 rounded-lg shadow">
                <Table className="w-full  rounded-lg">
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
                                                            onChange={(e) =>
                                                                handleFilterChange(
                                                                    header.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={`Buscar`}
                                                            className="mt-2 p-1 border rounded"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        />
                                                    ) : null}
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
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 transition duration-200  cursor-not-allowed"
                        />
                    </label>
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
                                        cedula: `${e.target.value}-${prev?.cedula?.split('-')[1] || ''
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
                                        cedula: `${prev?.cedula?.split('-')[0] || 'V'
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
                            onChange={(e) =>
                                setSelectedPerson((prev: any) => ({
                                    ...prev,
                                    phone: e.target.value,
                                }))
                            }
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
                            onChange={(e) =>
                                setSelectedPerson((prev: any) => ({
                                    ...prev,
                                    typeUser: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        >
                            <option value="Cliente">Cliente</option>
                            <option value="Certificador">Certificador</option>
                        </select>
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
            <Formik
                initialValues={{
                    nombre: '',
                    email: '',
                    cedula: '',
                    phone: '',
                    typeUser: 'Cliente',
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleCreateUser}
            >
                {({
                    values,
                    handleChange,
                    setFieldValue,
                    errors,
                    touched,
                    resetForm,
                    setTouched,
                }) => (
                    <Drawer
                        isOpen={drawerCreateIsOpen}
                        onClose={() => {
                            setDrawerCreateIsOpen(false) // Cierra el Drawer
                            resetForm() // Resetea el formulario, lo que limpia los valores
                            setSelectedPerson(null) // Limpia la selección, si es necesario
                        }}
                        className="rounded-md shadow"
                    >
                        <h2 className="mb-4 text-xl font-bold">
                            Crear Usuario
                        </h2>
                        <Form className="flex flex-col space-y-6">
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Nombre:
                                </span>
                                <Field
                                    type="text"
                                    name="nombre"
                                    value={values.nombre}
                                    onChange={handleChange}
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
                                    value={values.email}
                                    onChange={handleChange}
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
                                    Cédula:
                                </span>
                                <div className="flex items-center mt-1">
                                    <select
                                        name="cedulaPrefix"
                                        value={
                                            values.cedula.split('-')[0] || 'V'
                                        }
                                        onChange={(e) => {
                                            const newCedula = `${e.target.value
                                                }-${values.cedula.split('-')[1] ||
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
                                            const newCedula = `${values.cedula.split('-')[0] ||
                                                'V'
                                                }-${e.target.value}`
                                            setFieldValue('cedula', newCedula)
                                        }}
                                        className="p-3 border border-gray-300 rounded-r-lg mx-2 w-full"
                                    />
                                    <ErrorMessage
                                        name="cedula"
                                        component="div"
                                        className="text-red-500"
                                    />
                                </div>
                            </label>

                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Teléfono:
                                </span>
                                <Field
                                    type="text"
                                    name="phone"
                                    placeholder="Ejem (4142611966)"
                                    value={values.phone}
                                    onChange={handleChange}
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
                                    Tipo de Usuario:
                                </span>
                                <Field
                                    as="select"
                                    name="typeUser"
                                    value={values.typeUser}
                                    onChange={handleChange}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="Cliente">Cliente</option>
                                    <option value="Certificador">
                                        Certificador
                                    </option>
                                </Field>
                                <ErrorMessage
                                    name="typeUser"
                                    component="div"
                                    className="text-red-500"
                                />
                            </label>
                            <label className="flex flex-col relative">
                                <span className="font-semibold text-gray-700">
                                    Contraseña:
                                </span>
                                <Field
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg"
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
                                    className="text-red-500"
                                />
                            </label>

                            <label className="flex flex-col relative mt-4">
                                <span className="font-semibold text-gray-700">
                                    Confirmar Contraseña:
                                </span>
                                <Field
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="confirmPassword"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg"
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
                                    className="text-red-500"
                                />
                            </label>
                            <div className="text-right mt-6">
                                <Button
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
                                    type="submit"
                                >
                                    Crear
                                </Button>
                            </div>
                        </Form>
                    </Drawer>
                )}
            </Formik>
        </>
    )
}

export default Users
