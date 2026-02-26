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
import { FaRegEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    doc,
    Timestamp,
    getDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { Dialog, Drawer } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import * as XLSX from 'xlsx'

type Subscriptions = {
    nombre?: string
    taller_uid?: string
    status?: string
    cantidad_servicios?: string
    fecha_inicio: Timestamp
    fecha_fin: Timestamp
    vigencia: string
    monto?: string
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
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [selectedPerson, setSelectedPerson] = useState<Subscriptions | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const getData = async () => {
        const q = query(collection(db, 'Subscripciones'))
        const querySnapshot = await getDocs(q)
        const subcripciones: Subscriptions[] = []

        const promises = querySnapshot.docs.map(async (docSnap) => {
            const subsData = docSnap.data() as Subscriptions

            let nombre_taller = 'Taller no encontrado'
            let correo_taller = 'Correo no encontrado'
            if (subsData.taller_uid) {
                const tallerDoc = await getDoc(
                    doc(db, 'Usuarios', subsData.taller_uid),
                )
                if (tallerDoc.exists()) {
                    const tallerData = tallerDoc.data()
                    nombre_taller = tallerData.nombre || 'Taller no encontrado'
                    correo_taller = tallerData.email || 'Correo no encontrado'
                }
            }

            return { ...subsData, uid: docSnap.id, nombre_taller, correo_taller }
        })

        const resolvedSubcripciones = await Promise.all(promises)
        //console.log('Data de suscripciones:', resolvedSubcripciones) // Agrega este console.log
        setDataSubs(resolvedSubcripciones)
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

    const handleOpenDialog = () => {
        setIsOpen(true)
    }

    const handleCloseDialog = () => {
        setIsOpen(false)
        setStartDate('')
        setEndDate('')
    }

    const openDrawer = (person: Subscriptions) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true)
    }

    const formatDate = (timestamp: unknown): string => {
        if (timestamp instanceof Timestamp) {
            const dateObj = timestamp.toDate()
            return dateObj.toLocaleDateString('es-ES')
        }
        return '-'
    }

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const handleDrawerClose = () => {
        setDrawerIsOpen(false)
        setSelectedPerson(null)
    }

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const handleStatusChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value
        setSelectedStatus(value)
        setFiltering(value === '' ? [] : [{ id: 'status', value }])
    }
    const handleExportToExcel = () => {
        if (!startDate || !endDate) {
            toast.push(
                <Notification title="Fechas incompletas">
                    Por favor, selecciona ambas fechas para continuar.
                </Notification>,
            )
            return
        }

        // Ajustar fecha de inicio al principio del día en UTC
        const adjustedStartDate = new Date(startDate)
        adjustedStartDate.setUTCHours(0, 0, 0, 0)

        // Ajustar fecha de fin al final del día en UTC
        const adjustedEndDate = new Date(endDate)
        adjustedEndDate.setUTCHours(23, 59, 59, 999)

        console.log({
            startDate: adjustedStartDate,
            endDate: adjustedEndDate,
        })

        const camposDeseados = [
            'nombre',
            'nombre_taller',
            'cantidad_servicios',
            'monto',
            'fecha_inicio',
            'fecha_fin',
            'status',
        ]

        const encabezados: Record<string, string> = {
            nombre: 'Nombre Cliente',
            nombre_taller: 'Nombre Taller',
            cantidad_servicios: 'Cantidad de Servicios',
            monto: 'Monto Total',
            fecha_inicio: 'Fecha de Inicio',
            fecha_fin: 'Fecha de Fin',
            status: 'Estado',
        }

        // Filtrar los datos para las fechas dentro del rango
        const filteredData = dataSubs.filter((row) => {
            // Convertir `fecha_inicio` a Date si es un Timestamp
            const fechaInicio =
                row.fecha_inicio instanceof Timestamp
                    ? row.fecha_inicio.toDate() // Si es Timestamp, convertir a Date
                    : new Date(row.fecha_inicio) // Si ya es Date, dejarlo como está

            // Asegurarse de que `fechaInicio` sea una fecha válida
            if (
                !(fechaInicio instanceof Date) ||
                isNaN(fechaInicio.getTime())
            ) {
                return false // Si no es una fecha válida, no lo incluimos
            }

            console.log(
                'Fecha Inicio:',
                fechaInicio,
                'Inicio Range:',
                adjustedStartDate,
                'End Range:',
                adjustedEndDate,
            )

            // Comparar las fechas
            return (
                fechaInicio.getTime() >= adjustedStartDate.getTime() && // Fecha dentro del rango de inicio
                fechaInicio.getTime() <= adjustedEndDate.getTime() // Fecha dentro del rango de fin
            )
        })

        if (filteredData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles en el rango de fechas seleccionado.
                </Notification>,
            )
            return
        }

        const tableData = filteredData.map((row) => {
            const rowData: Record<string, any> = {}
            camposDeseados.forEach((campo) => {
                const value = row[campo as keyof Subscriptions]
                const header = encabezados[campo] || campo
                
                // Si es el campo monto, verificar si es gratuito
                if (campo === 'monto') {
                    const montoNum = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0)
                    if (isNaN(montoNum) || montoNum < 0.0001) {
                        rowData[header] = 'GRATIS'
                    } else {
                        rowData[header] = value instanceof Timestamp
                            ? value.toDate().toISOString().split('T')[0]
                            : value ?? ''
                    }
                } else {
                    rowData[header] =
                        value instanceof Timestamp
                            ? value.toDate().toISOString().split('T')[0]
                            : value ?? ''
                }
            })

            if (row.comprobante_pago) {
                rowData['Método Comprobante'] =
                    row.comprobante_pago.metodo || ''
                rowData['Banco Origen'] = row.comprobante_pago.bancoOrigen || ''
                rowData['Banco Destino'] =
                    row.comprobante_pago.bancoDestino || ''
                rowData['Cédula'] = row.comprobante_pago.cedula || ''
                rowData['Teléfono Comprobante'] =
                    row.comprobante_pago.telefono || ''
                rowData['Monto'] = row.comprobante_pago.monto || ''
                rowData['Recibo'] = row.comprobante_pago.receiptFile || ''
                rowData['Número Referencia'] =
                    row.comprobante_pago.numReferencia || ''
                rowData['Fecha Pago'] = row.comprobante_pago.fechaPago
                    ? formatDate(row.comprobante_pago.fechaPago)
                    : '-'
                rowData['Correo Comprobante'] =
                    row.comprobante_pago.correo || ''
            }

            return rowData
        })

        const worksheet = XLSX.utils.json_to_sheet(tableData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscripciones')
        XLSX.writeFile(workbook, 'subscripciones.xlsx')

        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        )
        handleCloseDialog()
    }

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
            header: 'Correo Taller',
            accessorKey: 'correo_taller',
        },
        {
            header: 'Cantidad de Servicios',
            accessorKey: 'cantidad_servicios',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
            cell: ({ row }) => {
                const monto = row.getValue('monto') as string | number | undefined
                
                if (!monto) {
                    return <span>-</span>
                }
                
                // Convertir a número si es string
                const montoNum = typeof monto === 'string' ? parseFloat(monto) : monto
                
                // Verificar si es un plan gratuito (monto muy pequeño, como 1e-16 o 0)
                if (isNaN(montoNum) || montoNum < 0.0001) {
                    return <span className="font-semibold text-green-600">GRATIS</span>
                }
                
                // Formatear el monto con separador de miles
                return <span>${montoNum.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            },
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
            header: 'Estado Subscripción',
            accessorKey: 'status',
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true
                return row.getValue(columnId) === filterValue
            },
            cell: ({ row }) => {
                const fechaFin = row.original.fecha_fin
                
                // Verificar si la fecha de vigencia ya pasó
                let isVencido = false
                if (fechaFin) {
                    const fechaFinDate = fechaFin instanceof Timestamp 
                        ? fechaFin.toDate() 
                        : new Date(fechaFin as any)
                    const fechaActual = new Date()
                    // Comparar solo fechas (sin horas)
                    fechaActual.setHours(0, 0, 0, 0)
                    fechaFinDate.setHours(0, 0, 0, 0)
                    isVencido = fechaFinDate < fechaActual
                }

                // Si está vencido, mostrar "Vencido" en rojo
                if (isVencido) {
                    return (
                        <div className="flex items-center text-red-500">
                            <FaTimesCircle className="text-red-500 mr-1" />
                            <span>Vencido</span>
                        </div>
                    )
                }

                // Si no está vencido, mostrar "Vigente" en verde
                return (
                    <div className="flex items-center text-green-500">
                        <FaCheckCircle className="text-green-500 mr-1" />
                        <span>Vigente</span>
                    </div>
                )
            },
        },
        {
            header: 'Acciones',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        {person.comprobante_pago && (
                            <button
                                onClick={() => openDrawer(person)}
                                className="text-blue-900 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                                title="Ver detalles del pago (solo consulta)"
                            >
                                <FaRegEye />
                            </button>
                        )}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: dataSubs,
        columns,
        state: {
            columnFilters: filtering,
            globalFilter: searchTerm,
        },
        onColumnFiltersChange: setFiltering,
        onGlobalFilterChange: (updater) => {
            const next = typeof updater === 'function' ? updater(searchTerm) : updater
            setSearchTerm(next ?? '')
        },
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            const nombre = (row.original.nombre ?? '').toLowerCase()
            const nombre_taller = (row.original.nombre_taller ?? '').toLowerCase()
            return nombre.includes(term) || nombre_taller.includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const data = table.getRowModel().rows
    const totalRows = data.length

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    <span className="text-[#000B7E]">Histórico de Subscripciones</span>
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end items-center gap-4 flex-nowrap">
                    <div className="relative w-48 flex-shrink-0">
                        <select
                            className="h-11 w-full py-2.5 px-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 cursor-pointer text-sm font-medium text-gray-700"
                            onChange={handleStatusChange}
                            value={selectedStatus}
                        >
                            <option value="" className="text-gray-700">
                                Todos los estados
                            </option>
                            <option value="Aprobado" className="text-green-700 font-semibold">Aprobados</option>
                            <option value="Por Aprobar" className="text-yellow-500 font-semibold">Por Aprobar</option>
                        </select>
                    </div>
                    <div className="relative w-80 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Buscar por plan o taller..."
                            className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <HiOutlineSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>
                    <button
                        style={{ backgroundColor: '#000B7E' }}
                        className="p-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 active:bg-blue-700 transition duration-200 hover:opacity-80 flex-shrink-0"
                        onClick={handleOpenDialog}
                    >
                        Exportar a Excel
                    </button>
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
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            </div>
            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerClose}
                className="rounded-md shadow"
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Detalles del pago
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Solo consulta — no se pueden aprobar ni rechazar pagos desde aquí.
                    </p>
                    {selectedPerson?.status && (
                        <p className="text-sm font-medium text-gray-700 mt-2">
                            Estado: <span className="capitalize">{selectedPerson.status}</span>
                        </p>
                    )}
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
                                value={
                                    selectedPerson.comprobante_pago
                                        .fechaPago instanceof Timestamp
                                        ? // Si es un Timestamp de Firebase, usar .toDate() para convertirlo a un objeto Date
                                        new Date(
                                            selectedPerson.comprobante_pago.fechaPago.toDate(),
                                        ).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : // Si es un string ISO, lo convertimos a Date y usamos toLocaleDateString
                                        new Date(
                                            selectedPerson.comprobante_pago.fechaPago,
                                        ).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                }
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
            </Drawer>
            <Dialog isOpen={dialogIsOpen} onClose={handleCloseDialog}>
                <div className="p-4">
                    <h3 className="text-lg font-bold">
                        Seleccionar Rango de Fechas
                    </h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label
                                htmlFor="startDate"
                                className="block text-sm"
                            >
                                Desde:
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm">
                                Hasta:
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button
                            onClick={handleExportToExcel}
                            className="text-white hover:opacity-80"
                            style={{ backgroundColor: '#000B7E' }}
                        >
                            Exportar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default Subscriptions
