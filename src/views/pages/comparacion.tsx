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
import { FaRegEye, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    updateDoc,
    Timestamp,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer, Switcher } from '@/components/ui'

type Subscriptions = {
    plan?: string
    taller_subscrito?: string
    status?: string
    cantidad_servicios?: string
    fecha_inicio: Timestamp
    fecha_fin: Timestamp
    monto?: string
    uid: string
    id: string
}

const Subscriptions = () => {
    const [dataSubs, setDataSubs] = useState<Subscriptions[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([]) // Cambiar a ColumnFiltersState
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Subscriptions | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        const q = query(collection(db, 'Subscripciones'))
        const querySnapshot = await getDocs(q)
        const subcripciones: Subscriptions[] = []

        querySnapshot.forEach((doc) => {
            const subsData = doc.data() as Subscriptions
            subcripciones.push({ ...subsData, uid: doc.id })
        })

        setDataSubs(subcripciones)
    }

    useEffect(() => {
        getData()
    }, [])

    const openDialog = (person: Subscriptions) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Subscriptions) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    // Define el esquema de validación

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
                const userDoc = doc(db, 'Subscripciones', selectedPerson.uid)
                await updateDoc(userDoc, {
                    plan: selectedPerson.plan,
                    taller_subscrito: selectedPerson.taller_subscrito,
                    status: selectedPerson.status,
                    cantidad_servicios: selectedPerson.cantidad_servicios,
                    monto: selectedPerson.monto,
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Subscripcion actualizada con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData() // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando la subscripcion:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar la subscripcion.
                    </Notification>,
                )
            }
        }
    }

    const columns: ColumnDef<Subscriptions>[] = [
        {
            header: 'Plan',
            accessorKey: 'plan',
            cell: ({ getValue }) => getValue(),
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'Taller Subscrito',
            accessorKey: 'taller_subscrito',
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
        setSelectedPerson(null) // Limpiar la selección
    }

    const table = useReactTable({
        data: dataSubs,
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
                <h1 className="mb-6 flex justify-start">Subscripciones</h1>
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
                                                            placeholder="buscar"
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
                    <h2 className="flex mb-4 text-xl font-bold">
                        Revisión Subscripción
                    </h2>
                    <div className="flex items-center">
                        <Switcher
                            defaultChecked={
                                selectedPerson?.status === 'Aprobado'
                            } // Determina si el Switcher debe estar activado o no
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
                                    status: e ? 'Aprobado' : 'Por Aprobar', // Cambia el estado según la posición del Switcher
                                }))
                            }
                            color={
                                selectedPerson?.status === 'Aprobado'
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
                            Plan:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.plan || ''}
                            readOnly // Aquí se agrega el atributo readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Taller Subscrito:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.taller_subscrito || ''}
                            readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
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
        </>
    )
}

export default Subscriptions
