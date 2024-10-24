import { useEffect, useState } from 'react'
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
import { FaEdit, FaTrash } from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    deleteDoc,
    updateDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer } from '@/components/ui'

type Person = {
    nombre?: string
    email?: string
    cedula?: string
    phone?: string
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
            // Asegúrate de filtrar por typeUser "Cliente"
            if (userData.typeUser === 'Cliente') {
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

    const openDialog = (person: Person) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Person) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
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
        },
        {
            header: ' ',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openDrawer(person)} // Cambiar aquí
                            className="hover:text-blue-700"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => openDialog(person)}
                            className="hover:text-red-700"
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

    return (
        <>
            <h1 className="mb-6">Lista de Clientes</h1>
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
                                                                    (filter) =>
                                                                        filter.id ===
                                                                        header.id,
                                                                )
                                                                ?.value?.toString() ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            handleFilterChange(
                                                                header.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Buscar`}
                                                        className="mt-2 p-1 border rounded"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        } // Evita la propagación del evento de clic
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
                        .rows.slice(0, 10)
                        .map((row) => {
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
                    <Button variant="solid" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </div>
            </Dialog>
            <Drawer
                isOpen={drawerIsOpen}
                onClose={() => setDrawerIsOpen(false)}
                className="rounded-md shadow" // Añadir estilo al Drawer
            >
                <h2 className="mb-4 text-xl font-bold">Editar Usuario</h2>
                <div className="flex flex-col space-y-6">
                    {' '}
                    {/* Aumentar el espacio entre campos */}
                    {/* Campo para Nombre */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.nombre || ''}
                            onChange={(e) =>
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        cedula: '',
                                        nombre: '',
                                        email: '',
                                        phone: '',
                                        uid: '',
                                        typeUser: '',
                                        id: '',
                                        status: '',
                                    }),
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
                            onChange={(e) =>
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        cedula: '',
                                        nombre: '',
                                        email: '',
                                        phone: '',
                                        uid: '',
                                        typeUser: '',
                                        id: '',
                                        status: '',
                                    }),
                                    email: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    {/* Campo para cedula */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Cédula:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.cedula || ''}
                            onChange={(e) =>
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        cedula: '',
                                        nombre: '',
                                        email: '',
                                        phone: '',
                                        uid: '',
                                        typeUser: '',
                                        id: '',
                                        status: '',
                                    }),
                                    rif: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
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
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        cedula: '',
                                        nombre: '',
                                        email: '',
                                        phone: '',
                                        uid: '',
                                        typeUser: '',
                                        id: '',
                                        status: '',
                                    }),
                                    phone: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                </div>

                <div className="text-right mt-6">
                    <Button
                        className="mr-2" // Espaciado entre botones
                        variant="default"
                    >
                        Cerrar
                    </Button>
                    <Button variant="solid" onClick={handleSaveChanges}>
                        Guardar Cambios
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default Users
