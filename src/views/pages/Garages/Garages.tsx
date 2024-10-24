import { useEffect, useState } from 'react'
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
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import Drawer from '@/components/ui/Drawer' // Asegúrate de que esta ruta sea correcta

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

    return (
        <>
            <h1 className="mb-6">Lista de Talleres</h1>
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

            {/* Drawer para edición */}
            <Drawer
                isOpen={drawerIsOpen}
                onClose={() => setDrawerIsOpen(false)}
                className="rounded-md shadow" // Añadir estilo al Drawer
            >
                <h2 className="mb-4 text-xl font-bold">Editar Taller</h2>
                <div className="flex flex-col space-y-6">
                    {' '}
                    {/* Aumentar el espacio entre campos */}
                    {/* Campo para Nombre */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre Taller:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.nombre || ''}
                            onChange={(e) =>
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        rif: '',
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
                                        rif: '',
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
                    {/* Campo para RIF */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            RIF:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.rif || ''}
                            onChange={(e) =>
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        rif: '',
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
                                        rif: '',
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

export default Garages
