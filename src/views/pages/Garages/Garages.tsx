import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
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
    FaCheckCircle,
    FaEdit,
    FaExclamationCircle,
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

    const handleCreateUser = async () => {
        if (newUser && newUser.nombre && newUser.email) {
            try {
                const userRef = collection(db, 'Usuarios')
                const docRef = await addDoc(userRef, {
                    nombre: newUser.nombre,
                    email: newUser.email,
                    rif: newUser.rif,
                    phone: newUser.phone,
                    typeUser: newUser.typeUser,
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
                getData() // Refrescar la lista de usuarios
            } catch (error) {
                console.error('Error creando usuario:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el Taller.
                    </Notification>,
                )
            }
        } else {
            toast.push(
                <Notification title="Error">
                    Por favor, complete todos los campos requeridos.
                </Notification>,
            )
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
                            style={{ backgroundColor: '#FFCC29' }} // Establecer el color directamente
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
                            onClick={() => openDrawer(person)} // Cambiar aquí
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
                        style={{ backgroundColor: '#000B7E' }}
                        className='text-white hover:opacity-80'
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
                    onClick={handleDelete}>
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
                        Cancelar
                    </Button>
                    <Button 
                    style={{ backgroundColor: '#000B7E' }}
                    className='text-white hover:opacity-80' 
                    onClick={handleSaveChanges}
                    >
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
                        <span className="font-semibold text-gray-700">
                            RIF:
                        </span>
                        <input
                            type="text"
                            value={newUser?.rif || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...(prev ?? {}),
                                    rif: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
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
