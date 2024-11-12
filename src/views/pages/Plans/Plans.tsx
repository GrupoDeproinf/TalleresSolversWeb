import { useEffect, useState } from 'react'
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
import { FaRegEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { z } from 'zod'
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
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer, Switcher } from '@/components/ui'

type Plans = {
    nombre?: string
    descripcion?: string
    cantidad_servicios?: string
    monto: string
    status?: string
    vigencia?: string
    uid: string
    id: string
}

const Plans = () => {
    const [dataPlans, setDataPlans] = useState<Plans[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([]) // Cambiar a ColumnFiltersState
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Plans | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        const q = query(collection(db, 'Planes'))
        const querySnapshot = await getDocs(q)
        const planes: Plans[] = []

        querySnapshot.forEach((doc) => {
            const plansData = doc.data() as Plans
            planes.push({ ...plansData, uid: doc.id })
        })

        setDataPlans(planes)
    }

    useEffect(() => {
        getData()
    }, [])

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newPlan, setNewPlan] = useState<Plans | null>({
        nombre: '',
        descripcion: '',
        cantidad_servicios: '',
        monto: '',
        status: '',
        vigencia: '',
        uid: '', // Asignar valor vacío si no quieres que sea undefined
        id: '', // También puedes asignar un valor vacío si no quieres undefined
    })

    const openDialog = (person: Plans) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Plans) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    // Define el esquema de validación
    const createUserSchema = z.object({
        nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        status: z.string().default('Activo'), // Añadir status, valor por defecto "Activo"
        cantidad_servicios: z.string().optional(), // Ajusta según sea necesario
        monto: z.string().optional(), // Ajusta según sea necesario
        vigencia: z.string().optional(), // Ajusta según sea necesario
    })

    const handleCreatePlans = async () => {
        if (!newPlan) {
            toast.push(
                <Notification title="Error">
                    Hubo un error inesperado. Por favor, verifica.
                </Notification>,
            )
            return
        }

        try {
            // Validación de Zod
            createUserSchema.parse(newPlan)

            // Creación del usuario en la base de datos
            const userRef = collection(db, 'Planes')
            const docRef = await addDoc(userRef, {
                nombre: newPlan.nombre,
                descripcion: newPlan.descripcion,
                cantidad_servicios: newPlan.cantidad_servicios,
                monto: newPlan.monto,
                status: 'Activo',
                vigencia: newPlan.vigencia, // Ahora siempre tiene valor
                uid: '', // Inicialmente vacío, se actualizará después
            })

            // Actualización del uid
            await updateDoc(docRef, {
                uid: docRef.id,
            })

            toast.push(
                <Notification title="Éxito">
                    Plan creado con éxito.
                </Notification>,
            )

            setDrawerCreateIsOpen(false) // Cerrar el Drawer
            getData() // Refrescar la lista de usuarios
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.errors
                    .map((err) => err.message)
                    .join(', ')
                toast.push(
                    <Notification title="Error">{errorMessages}</Notification>,
                )
            } else {
                console.error('Error creando plan:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el plan.
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
                const userDoc = doc(db, 'Planes', selectedPerson.uid)
                await updateDoc(userDoc, {
                    nombre: selectedPerson.nombre,
                    descripcion: selectedPerson.descripcion,
                    cantidad_servicios: selectedPerson.cantidad_servicios,
                    monto: selectedPerson.monto,
                    status: selectedPerson.status,
                    vigencia: selectedPerson.vigencia,
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Plan actualizado con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData() // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando el plan:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el plan.
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

    const columns: ColumnDef<Plans>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue }) => getValue(),
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'Descripcion',
            accessorKey: 'descripcion',
            filterFn: 'includesString',
        },
        {
            header: 'Cantidad de Servicios',
            accessorKey: 'cantidad_servicios',
            filterFn: 'includesString',
        },

        {
            header: 'Monto',
            accessorKey: 'monto',
            filterFn: 'includesString',
            cell: ({ row }) => {
                const monto = parseFloat(row.original.monto) // Asegúrate de que sea un número
                return `$${monto.toFixed(2)}`
            },
        },
        {
            header: 'Vigencia',
            accessorKey: 'vigencia',
            filterFn: 'includesString',
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string // Aserción de tipo
                let icon
                let color

                switch (status) {
                    case 'Activo':
                        icon = <FaCheckCircle className="text-green-500 mr-1" />
                        color = 'text-green-500' // Color para el texto
                        break
                    case 'Inactivo':
                        icon = <FaTimesCircle className="text-red-500 mr-1" />
                        color = 'text-red-500' // Color para el texto
                        break
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
                    <div className="gap-2">
                        <button
                            onClick={() => openDrawer(person)} // Cambiar aquí
                            className="text-blue-900"
                        >
                            <FaRegEye />
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
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false)
        setDrawerCreateIsOpen(false)
        setSelectedPerson(null) // Limpiar la selección
        setNewPlan({ nombre: '', descripcion: '', cantidad_servicios: '', monto: '', vigencia: '', id: '', uid: '', }) // Limpiar inputs
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
        data: dataPlans,
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
                <h1 className="mb-6 flex justify-start">Lista de Planes</h1>
                <div className="flex justify-end">
                    <Button
                        className="w-40 text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                    >
                        Crear Plan
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
            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerClose}
                className="rounded-md shadow" // Añadir estilo al Drawer
            >
                <div className="grid grid-cols-2">
                    <h2 className="flex mb-4 text-xl font-bold">Ver Plan</h2>
                    <div className="flex items-center">
                        <Switcher
                            defaultChecked={selectedPerson?.status === 'Activo'} // Determina si el Switcher debe estar activado o no
                            onChange={(e) =>
                                setSelectedPerson((prev) => ({
                                    ...(prev ?? {
                                        descripcion: '',
                                        nombre: '',
                                        cantidad_servicios: '',
                                        monto: '',
                                        uid: '',
                                        vigencia: '',
                                        id: '',
                                        status: '',
                                    }),
                                    status: e ? 'Activo' : 'Inactivo', // Cambia el estado según la posición del Switcher
                                }))
                            }
                            color={
                                selectedPerson?.status === 'Activo'
                                    ? 'green-500'
                                    : 'red-500'
                            } // Cambia el color según el estado
                        />
                        <span className="ml-2 text-gray-700">
                            {selectedPerson?.status}
                        </span>{' '}
                        {/* Muestra el estado actual */}
                    </div>
                </div>

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
                            readOnly // Aquí se agrega el atributo readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Descripcion:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.descripcion || ''}
                            readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    {/* Campo para cedula */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Cantidad de Servicios:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.cantidad_servicios || ''}
                            readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    {/* Campo para Teléfono */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Monto:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.monto || ''}
                            readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Vigencia:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.vigencia || ''}
                            readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                </div>

                <div className="text-center mt-6 ">
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
                onClose={handleDrawerClose}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Plan</h2>
                <div className="flex flex-col space-y-6">
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={newPlan?.nombre || ''}
                            onChange={(e) =>
                                setNewPlan((prev: any) => ({
                                    ...prev, // Esto preserva los valores existentes
                                    nombre: e.target.value, // Solo actualiza el campo necesario
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Descripcion:
                        </span>
                        <input
                            type="text"
                            value={newPlan?.descripcion || ''}
                            onChange={(e) =>
                                setNewPlan((prev: any) => ({
                                    ...(prev ?? {}),
                                    descripcion: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Cantidad de Servicios:
                        </span>
                        <input
                            type="text"
                            value={newPlan?.cantidad_servicios || ''}
                            onChange={(e) =>
                                setNewPlan((prev: any) => ({
                                    ...(prev ?? {}),
                                    cantidad_servicios: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Monto:
                        </span>
                        <input
                            type="text"
                            value={newPlan?.monto || ''}
                            onChange={(e) =>
                                setNewPlan((prev: any) => ({
                                    ...(prev ?? {}),
                                    monto: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Vigencia:
                        </span>
                        <input
                            type="text"
                            value={newPlan?.vigencia || ''}
                            onChange={(e) =>
                                setNewPlan((prev: any) => ({
                                    ...(prev ?? {}),
                                    vigencia: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="default"
                            onClick={handleDrawerClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={handleCreatePlans} // Llamar a la función para crear usuario
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Plans
