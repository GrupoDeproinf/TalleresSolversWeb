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
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import {
    FaRegEye,
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    updateDoc,
    Timestamp,
    getDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer, Switcher } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'

type Subscriptions = {
    nombre?: string
    taller_uid?: string
    status?: string
    cantidad_servicios?: string
    fecha_inicio: Timestamp
    fecha_fin: Timestamp
    vigencia: string
    monto?: number
    uid: string
    id: string
    nombre_taller: string
    comprobante_pago: {
        monto?: number
        metodo?: string
        banco?: string
        cedula?: number
        receiptFile?: string
        numReferencia?: string
        telefono?: number
        fechaPago?: Timestamp
        correo?: string
        bancoOrigen?: string
        bancoDestino?: string
    }
}

const Subscriptions = () => {
    const [dataSubs, setDataSubs] = useState<Subscriptions[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre') // Establecer 'nombre' como valor por defecto
    const [searchTerm, setSearchTerm] = useState('') // Estado para el término de búsqueda
    const [selectedPerson, setSelectedPerson] = useState<Subscriptions | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        const q = query(collection(db, 'Subscripciones'))
        const querySnapshot = await getDocs(q)
        const subcripciones: Subscriptions[] = []

        const promises = querySnapshot.docs.map(async (docSnap) => {
            const subsData = docSnap.data() as Subscriptions

            return { ...subsData, uid: docSnap.id }
        })

        const resolvedSubcripciones = await Promise.all(promises)
        setDataSubs(resolvedSubcripciones)
        console.log(resolvedSubcripciones)
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

    const openDialog = (person: Subscriptions) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Subscriptions) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true)
    }

    const handleSaveChanges = async () => {
        if (selectedPerson) {
            try {
                let updateData
                if (selectedPerson.status === 'Por Aprobar') {
                    // Datos para limpiar fechas
                    updateData = {
                        status: selectedPerson.status,
                        fecha_inicio: null,
                        fecha_fin: null,
                        monto: selectedPerson.monto ?? '',
                        nombre: selectedPerson.nombre,
                        vigencia: selectedPerson.vigencia,
                    }
                    await updateDoc(
                        doc(db, 'Subscripciones', selectedPerson.uid),
                        updateData,
                    )
                    if (selectedPerson.taller_uid) {
                        await updateDoc(
                            doc(db, 'Usuarios', selectedPerson.taller_uid),
                            { subscripcion_actual: updateData },
                        )
                    }

                    // Notificación de éxito
                    toast.push(
                        <Notification title="Éxito">
                            Subscripción actualizada con éxito.
                        </Notification>,
                    )

                    setDrawerIsOpen(false)
                    getData()
                    return
                }

                const fechaInicio = new Date()
                const vigenciaDias = parseInt(selectedPerson.vigencia, 10)

                if (isNaN(vigenciaDias)) {
                    toast.push(
                        <Notification title="Error">
                            La vigencia proporcionada no es válida.
                        </Notification>,
                    )
                    return
                }

                const fechaFin = new Date(fechaInicio)
                fechaFin.setDate(fechaInicio.getDate() + vigenciaDias)

                // Datos de actualización
                updateData = {
                    nombre: selectedPerson.nombre,
                    vigencia: selectedPerson.vigencia,
                    fecha_inicio: Timestamp.fromDate(fechaInicio),
                    fecha_fin: Timestamp.fromDate(fechaFin),
                    status: selectedPerson.status,
                    cantidad_servicios: selectedPerson.cantidad_servicios,
                    monto: selectedPerson.monto,
                }
                // Actualizar documento en Firestore - Subscripciones
                await updateDoc(
                    doc(db, 'Subscripciones', selectedPerson.uid),
                    updateData,
                )

                // Actualizar documento en Firestore - Usuarios (subscripcion_actual)
                if (selectedPerson.taller_uid) {
                    await updateDoc(
                        doc(db, 'Usuarios', selectedPerson.taller_uid),
                        { subscripcion_actual: updateData },
                    )
                }

                // Notificación de éxito
                toast.push(
                    <Notification title="Éxito">
                        Subscripción actualizada con éxito.
                    </Notification>,
                )

                setDrawerIsOpen(false)
                getData()
            } catch (error) {
                console.error('Error actualizando la subscripción:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar la subscripción.
                    </Notification>,
                )
            }
        }
    }

    const formatDate = (timestamp: unknown): string => {
        if (timestamp instanceof Timestamp) {
            const dateObj = timestamp.toDate()
            return dateObj.toLocaleDateString('es-ES')
        }
        return '-'
    }

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false)
        setSelectedPerson(null) // Limpiar la selección
    }

    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 6 // Puedes cambiar esto si deseas un número diferente

    const onPaginationChange = (page: number) => {
        console.log('onPaginationChange', page)
        setCurrentPage(page) // Actualiza la página actual
    }

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)

        const newFilters = [
            {
                id: selectedColumn,
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

        if (searchTerm !== '') {
            const newFilters = [
                {
                    id: value,
                    value: searchTerm,
                },
            ]
            setFiltering(newFilters)
        }
    }

    const options = [
        { value: 'Aprobado', label: 'Aprobado', color: '#28a745' },
        { value: 'Vencido', label: 'Vencido', color: '#dc3545' },
        { value: 'Por Aprobar', label: 'Por Aprobar', color: '#ffc107' },
    ]

    const columns: ColumnDef<Subscriptions>[] = [
        {
            header: 'Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Taller Subscrito',
            accessorKey: 'nombre_taller',
        },
        {
            header: 'Cantidad de Servicios',
            accessorKey: 'cantidad_servicios',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
        },
        {
            header: 'Fecha de Aprobacion',
            accessorKey: 'fecha_inicio',
            cell: ({ row }) => {
                const fechaInicio = row.original.fecha_inicio
                return fechaInicio ? formatDate(fechaInicio) : '-'
            },
        },
        {
            header: 'Vigente Hasta',
            accessorKey: 'fecha_fin',
            cell: ({ row }) => {
                const fechaFin = row.original.fecha_fin
                return fechaFin ? formatDate(fechaFin) : '-'
            },
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string
                let icon
                let color

                switch (status) {
                    case 'Aprobado':
                        icon = <FaCheckCircle className="text-green-500 mr-1" />
                        color = 'text-green-500'
                        break
                    case 'Vencido':
                        icon = <FaTimesCircle className="text-red-500 mr-1" />
                        color = 'text-red-500'
                        break
                    case 'Por Aprobar':
                        icon = (
                            <FaExclamationCircle className="text-yellow-500 mr-1" />
                        )
                        color = 'text-yellow-500'
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
                return person.status !== 'Vencido' &&
                    person.comprobante_pago ? (
                    <div className="gap-2">
                        <button
                            onClick={() => openDrawer(person)}
                            className="text-blue-900"
                        >
                            <FaRegEye />
                        </button>
                    </div>
                ) : null
            },
        },
    ]

    const table = useReactTable({
        data: dataSubs,
        columns,
        state: {
            columnFilters: filtering, // Usar el array de filtros
        },
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const data = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = data.length

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    <span className="text-[#000B7E]">Subscripciones</span>
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="relative w-24">
                            <select
                                className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleSelectChange}
                                value={selectedColumn}
                            >
                                <option value="" disabled>
                                    Seleccionar columna...
                                </option>
                                <option value="nombre">Plan</option>
                                <option value="nombre_taller">Taller</option>
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
                    </div>
                </div>
            </div>
            <div className="p-1 rounded-lg shadow">
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
                        Revisión de Pago
                    </h2>
                    <div className="flex items-center">
                        <Switcher
                            defaultChecked={
                                selectedPerson?.status === 'Aprobado'
                            } // Determina si el Switcher debe estar activado o no
                            onChange={(e) =>
                                setSelectedPerson((prev: any) => ({
                                    ...(prev ?? {
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
                            }
                        />
                        <span className="ml-2 text-gray-700">
                            {selectedPerson?.status}
                        </span>{' '}
                    </div>
                </div>
                <div className="flex flex-col space-y-6">
                    {' '}
                    {selectedPerson?.comprobante_pago.metodo && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Metodo de Pago:
                            </span>
                            <input
                                type="text"
                                value={selectedPerson.comprobante_pago.metodo}
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.fechaPago && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Fecha de Pago:
                            </span>
                            <input
                                type="text"
                                value={new Date(
                                    selectedPerson.comprobante_pago.fechaPago
                                        .seconds * 1000,
                                ).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.bancoOrigen && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Banco Origen:
                            </span>
                            <input
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.bancoOrigen
                                }
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.bancoDestino && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Banco Destino:
                            </span>
                            <input
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.bancoDestino
                                }
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.correo && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Correo:
                            </span>
                            <input
                                type="text"
                                value={selectedPerson.comprobante_pago.correo}
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.cedula !== undefined &&
                        selectedPerson.comprobante_pago.cedula !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Cédula:
                                </span>
                                <input
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.cedula
                                    }
                                    readOnly
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.telefono !== undefined &&
                        selectedPerson.comprobante_pago.telefono !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Telefono:
                                </span>
                                <input
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.telefono
                                    }
                                    readOnly
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.monto !== undefined &&
                        selectedPerson.comprobante_pago.monto !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Monto:
                                </span>
                                <input
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.monto
                                    }
                                    readOnly
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.numReferencia && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Numero de referencia:
                            </span>
                            <input
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago
                                        .numReferencia
                                }
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.receiptFile && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Comprobante de pago:
                            </span>
                            <input
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.receiptFile
                                }
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
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
