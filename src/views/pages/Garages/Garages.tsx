import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
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
    FaEdit,
    FaExclamationCircle,
    FaFolder,
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
    updateDoc,
    addDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import Drawer from '@/components/ui/Drawer' // Asegúrate de que esta ruta sea correcta
import Shape from '@/views/ui-components/common/Button/Shape'
import { Avatar } from '@/components/ui'
import { HiOutlineUser } from 'react-icons/hi'

type Person = {
    nombre?: string
    email?: string
    rif?: string
    phone?: string
    uid: string
    typeUser?: string
    logoUrl?: string
    direccion?: string,
    id?: string
    status?: string
}

const Garages = () => {
    const [dataUsers, setDataUsers] = useState<Person[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false) // Estado para el Drawer

    const getData = async () => {
        const q = query(collection(db, 'Usuarios'))
        const querySnapshot = await getDocs(q)
        const usuarios: Person[] = []

        querySnapshot.forEach((doc) => {
            const userData = doc.data() as Person
            if (userData.typeUser === 'Taller') {
                usuarios.push({ ...userData, id: doc.id }) // Guardar el ID del documento
            }
        })

        setDataUsers(usuarios)
    }

    const navigate = useNavigate();
    

    useEffect(() => {
        getData()
    }, [])

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newUser, setNewUser] = useState<Person | null>({
        nombre: '',
        email: '',
        rif: '',
        phone: '',
        uid: '', // Asignar valor vacío si no quieres que sea undefined
        typeUser: 'Taller',
        logoUrl: '',
        status: 'Aprobado',
        direccion: '',
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

    // Define el esquema de validación
    const createUserSchema = z.object({
        nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Ingrese un correo válido"),
        //cedula: z.string()
        //    .regex(/^\d{7,8}$/, "La cédula debe tener entre 7 y 8 caracteres y contener solo números"), // Solo números y longitud de 7 o 8
        phone: z.string()
            .regex(/^\d{9,10}$/, "El teléfono debe tener entre 9 y 10 caracteres y contener solo números"),
        //typeUser
        });

    const handleCreateUser = async () => {
        if (newUser && newUser.nombre && newUser.email) {
            try {

                // Validación de Zod
                createUserSchema.parse(newUser);

                const userRef = collection(db, 'Usuarios')
                const docRef = await addDoc(userRef, {
                    nombre: newUser.nombre,
                    email: newUser.email,
                    rif: newUser.rif,
                    phone: newUser.phone,
                    typeUser: newUser.typeUser,
                    logoUrl: newUser.logoUrl,
                    status: newUser.status,
                    direccion: newUser.direccion,
                    // Inicialmente puedes dejar el campo uid vacío aquí
                    uid: '', // Este se actualizará después
                })

                // Ahora actualiza el documento para incluir el uid generado
                await updateDoc(docRef, {
                    uid: docRef.id, // Establece el uid al ID del documento generado
                })

                toast.push(
                    <Notification title="Éxito">
                        Taller creado con éxito.
                    </Notification>,
                )
                setDrawerCreateIsOpen(false) // Cerrar el Drawer después de crear el usuario
                // getData() // Refrescar la lista de usuarios
                window.location.reload();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errorMessages = error.errors.map((err) => err.message).join(', ');
                    toast.push(
                        <Notification title="Error">
                            {errorMessages}
                        </Notification>
                    );
                } else {
                    console.error('Error creando usuario:', error);
                    toast.push(
                        <Notification title="Error">
                            Hubo un error al crear el Taller.
                        </Notification>
                    );
                }
            }
        }
    }

    const handleFilterChange = (columnId: string, value: string) => {
        setFiltering((prev) => {
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
                    rif: selectedPerson.rif,
                    phone: selectedPerson.phone,
                    logoUrl: selectedPerson.logoUrl,
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Taller actualizado con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData() // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando el usuario:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el Taller.
                    </Notification>,
                )
            }
        }
    }

    const getInitials = (nombre: string | undefined): string => {
        if (!nombre) return ''
        const words = nombre.split(' ')
        return words.map((word: string) => word[0].toUpperCase()).join('')
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF'
        let color = '#'
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)]
        }
        return color
    }

    const columns: ColumnDef<Person>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue, row }) => {
                const logoUrl = row.original.logoUrl as string | undefined // Obtener el logo de la fila
                return (
                    <div className="flex items-center">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="h-10 w-10 object-cover rounded-full mr-4" // Espaciado a la derecha del logo
                            />
                        ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                                <FaFolder
                                    className="h-6 w-6 text-gray-400"
                                    aria-hidden="true"
                                />{' '}
                                {/* Icono por defecto */}
                            </div>
                        )}
                        {getValue() as string}{' '}
                        {/* Mostrar el nombre de la categoría */}
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
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Numero Telefonico',
            accessorKey: 'phone',
            cell: ({ row }) => {
                const nombre = row.original.nombre // Accede al nombre del cliente
                return (
                    <div className="flex items-center">
                        <Avatar
                            className="mr-2 w-8 h-8 flex items-center justify-center rounded-full"
                            style={{ backgroundColor: '#FFCC29' }}
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
                            onClick={() => navigate(`/profilegarage/${person.uid}`)}
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
                        Usuario {selectedPerson.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el usuario:', error)

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
                <h1 className="mb-6 flex justify-start">Lista de Talleres</h1>
                <div className="flex justify-end">
                    <Button
                        className="w-40 text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                    >
                        Crear Taller
                    </Button>
                </div>
            </div>
            <div>
                <Table>
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
                {/* Agregar la paginación */}
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
                        className='text-white hover:opacity-80'
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>

            {/* Drawer para edición */}
            <Dialog
                isOpen={drawerIsOpen}
                onClose={() => setDrawerIsOpen(false)}
                className="rounded-md shadow"
            >
                <h2 className="text-xl font-bold">Editar Taller</h2>

                {/* Componente Avatar con iniciales */}
                <Avatar
                    className="mr-2 w-12 h-12 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: getRandomColor() }}
                >
                    <span className="text-white font-bold">
                        {getInitials(selectedPerson?.nombre)}
                    </span>
                </Avatar>

                <div className="flex flex-col space-y-4">
                    {/* Campo para Nombre */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre Taller:
                        </span>
                        <p className="mt-1 p-3 border border-gray-300 rounded-lg">
                            {selectedPerson?.nombre || 'No especificado'}
                        </p>
                    </label>

                    {/* Campo para Email */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Email:
                        </span>
                        <p className="mt-1 p-3 border border-gray-300 rounded-lg">
                            {selectedPerson?.email || 'No especificado'}
                        </p>
                    </label>

                    {/* Campo para RIF */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            RIF:
                        </span>
                        <p className="mt-1 p-3 border border-gray-300 rounded-lg">
                            {selectedPerson?.rif || 'No especificado'}
                        </p>
                    </label>

                    {/* Campo para Teléfono */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Teléfono:
                        </span>
                        <p className="mt-1 p-3 border border-gray-300 rounded-lg">
                            {selectedPerson?.phone || 'No especificado'}
                        </p>
                    </label>
                </div>

                <div className="text-right mt-6">
                    <Button
                        className="mr-2"
                        variant="default"
                        onClick={() => setDrawerIsOpen(false)}
                    >
                        Cerrar
                    </Button>
                    <Button variant="solid" onClick={handleSaveChanges}>
                        Guardar Cambios
                    </Button>
                </div>
            </Dialog>

            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Taller</h2>
                <div className="flex flex-col space-y-6">
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre Taller:
                        </span>
                        <input
                            type="text"
                            value={newUser?.nombre || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...prev, // Esto preserva los valores existentes
                                    nombre: e.target.value, // Solo actualiza el campo necesario
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Email:
                        </span>
                        <input
                            type="email"
                            value={newUser?.email || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...(prev ?? {}),
                                    email: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
    <span className="font-semibold text-gray-700">RIF:</span>
    <div className="flex items-center mt-1">
        <select
            value={newUser?.rif?.split('-')[0] || 'J'}
            onChange={(e) =>
                setNewUser((prev: any) => ({
                    ...(prev ?? {}),
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
            value={newUser?.rif?.split('-')[1] || ''}
            onChange={(e) =>
                setNewUser((prev: any) => ({
                    ...(prev ?? {}),
                    rif: `${(prev?.rif?.split('-')[0] || 'J')}-${e.target.value}`,
                }))
            }
            className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
        />
    </div>
</label>

                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Teléfono:
                        </span>
                        <input
                            type="text"
                            value={newUser?.phone || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...(prev ?? {}),
                                    phone: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                            {!newUser?.logoUrl ? (
                                <FaCamera
                                    className="mx-auto h-12 w-12 text-gray-300"
                                    aria-hidden="true"
                                />
                            ) : (
                                <img
                                    src={newUser.logoUrl}
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
                                        {newUser?.logoUrl
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
                                                    setNewUser(
                                                        (prev: any) => ({
                                                            ...prev,
                                                            logoUrl:
                                                                reader.result, // Almacena la URL del logo
                                                        }),
                                                    )
                                                }
                                                reader.readAsDataURL(file) // Leer el archivo como una URL de datos
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="default"
                            onClick={() => setDrawerCreateIsOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className='text-white hover:opacity-80'
                            onClick={handleCreateUser} // Llamar a la función para crear usuario
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Garages
