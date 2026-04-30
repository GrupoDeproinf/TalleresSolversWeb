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
import Select from '@/components/ui/Select'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { Dialog, Drawer } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import { exportStyledExcel } from '@/utils/excelExport'

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
    /** Se completa al cargar desde Firestore junto con `nombre_taller`. */
    correo_taller?: string
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

type StatusFilterOption = { value: string; label: string }

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'Aprobado', label: 'Aprobados' },
    { value: 'Por Aprobar', label: 'Por aprobar' },
]

function formatTsForSearch(ts: unknown): string {
    if (!ts) return ''
    if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }
    return String(ts)
}

function subscriptionSearchableText(row: Subscriptions): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        row.nombre,
        row.nombre_taller,
        row.correo_taller,
        row.taller_uid,
        row.status,
        row.cantidad_servicios,
        row.monto,
        row.vigencia,
        row.uid,
        row.id,
    )
    parts.push(formatTsForSearch(row.fecha_inicio), formatTsForSearch(row.fecha_fin))
    const c = row.comprobante_pago
    if (c) {
        push(
            c.metodo,
            c.banco,
            c.correo,
            c.numReferencia,
            c.receiptFile,
            c.bancoOrigen,
            c.bancoDestino,
        )
        if (c.monto !== undefined && c.monto !== null) push(String(c.monto))
        if (c.cedula !== undefined && c.cedula !== null) push(String(c.cedula))
        if (c.telefono !== undefined && c.telefono !== null)
            push(String(c.telefono))
        parts.push(formatTsForSearch(c.fechaPago))
    }
    return parts.join(' ').toLowerCase()
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

            let nombre_taller = 'Negocio no encontrado'
            let correo_taller = 'Correo no encontrado'
            if (subsData.taller_uid) {
                const tallerDoc = await getDoc(
                    doc(db, 'Usuarios', subsData.taller_uid),
                )
                if (tallerDoc.exists()) {
                    const tallerData = tallerDoc.data()
                    nombre_taller = tallerData.nombre || 'Negocio no encontrado'
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

    const handleExportToExcel = async () => {
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
            const montoNum = Number(row.monto ?? 0)
            return {
                nombreCliente: row.nombre ?? '',
                nombreNegocio: row.nombre_taller ?? '',
                correoNegocio: row.correo_taller ?? '',
                cantidadServicios: String(row.cantidad_servicios ?? ''),
                montoTotal:
                    Number.isNaN(montoNum) || montoNum < 0.0001
                        ? 'GRATIS'
                        : String(row.monto ?? ''),
                fechaInicio:
                    row.fecha_inicio instanceof Timestamp
                        ? row.fecha_inicio.toDate().toISOString().split('T')[0]
                        : String(row.fecha_inicio ?? ''),
                fechaFin:
                    row.fecha_fin instanceof Timestamp
                        ? row.fecha_fin.toDate().toISOString().split('T')[0]
                        : String(row.fecha_fin ?? ''),
                estado: row.status ?? '',
                metodoComprobante: row.comprobante_pago?.metodo || '',
                bancoOrigen: row.comprobante_pago?.bancoOrigen || '',
                bancoDestino: row.comprobante_pago?.bancoDestino || '',
                cedulaComprobante: String(row.comprobante_pago?.cedula ?? ''),
                telefonoComprobante: String(row.comprobante_pago?.telefono ?? ''),
                montoComprobante: String(row.comprobante_pago?.monto ?? ''),
                recibo: row.comprobante_pago?.receiptFile || '',
                numeroReferencia: row.comprobante_pago?.numReferencia || '',
                fechaPago: row.comprobante_pago?.fechaPago
                    ? formatDate(row.comprobante_pago.fechaPago)
                    : '-',
                correoComprobante: row.comprobante_pago?.correo || '',
            }
        })

        await exportStyledExcel({
            rows: tableData,
            columns: [
                { header: 'Nombre Cliente', key: 'nombreCliente' },
                { header: 'Nombre Negocio', key: 'nombreNegocio' },
                {
                    header: 'Correo Negocio',
                    key: 'correoNegocio',
                    linkType: 'email',
                },
                { header: 'Cantidad de Servicios', key: 'cantidadServicios' },
                { header: 'Monto Total', key: 'montoTotal' },
                { header: 'Fecha de Inicio', key: 'fechaInicio' },
                { header: 'Fecha de Fin', key: 'fechaFin' },
                { header: 'Estado', key: 'estado' },
                { header: 'Método Comprobante', key: 'metodoComprobante' },
                { header: 'Banco Origen', key: 'bancoOrigen' },
                { header: 'Banco Destino', key: 'bancoDestino' },
                { header: 'Cédula', key: 'cedulaComprobante' },
                { header: 'Teléfono Comprobante', key: 'telefonoComprobante' },
                { header: 'Monto', key: 'montoComprobante' },
                { header: 'Recibo', key: 'recibo', linkType: 'url' },
                { header: 'Número Referencia', key: 'numeroReferencia' },
                { header: 'Fecha Pago', key: 'fechaPago' },
                {
                    header: 'Correo Comprobante',
                    key: 'correoComprobante',
                    linkType: 'email',
                },
            ],
            sheetName: 'Subscripciones',
            fileName: 'subscripciones.xlsx',
        })

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
            header: 'Negocio Subscrito',
            accessorKey: 'nombre_taller',
        },
        {
            header: 'Correo Negocio',
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
            return subscriptionSearchableText(row.original).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const data = table.getRowModel().rows
    const totalRows = data.length

    const statusFilterOption =
        STATUS_FILTER_OPTIONS.find((o) => o.value === selectedStatus) ??
        STATUS_FILTER_OPTIONS[0]

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-[#000B7E]">
                        Histórico de Subscripciones
                    </h1>
                    <button
                        type="button"
                        title="Actualizar datos desde el servidor"
                        aria-label="Actualizar datos desde el servidor"
                        onClick={handleRefresh}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#000B7E] shadow-sm transition hover:border-[#000B7E]/35 hover:bg-[#000B7E]/5 active:scale-[0.98]"
                    >
                        <HiOutlineRefresh className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex flex-wrap items-end justify-end gap-3">
                    <div className="flex min-w-[12rem] max-w-[15rem] shrink-0 flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                            Estado de la suscripción
                        </span>
                        <Select<StatusFilterOption, false>
                            size="sm"
                            isSearchable={false}
                            className="min-w-[12rem]"
                            options={STATUS_FILTER_OPTIONS}
                            value={statusFilterOption}
                            onChange={(opt) => {
                                const value = opt?.value ?? ''
                                setSelectedStatus(value)
                                setFiltering(
                                    value === ''
                                        ? []
                                        : [{ id: 'status', value }],
                                )
                            }}
                            placeholder="Estado"
                        />
                    </div>
                    <div className="w-full min-w-[12rem] max-w-sm shrink-0 sm:w-80">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            Buscar en la tabla
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Plan, negocio, correo, monto, fechas, comprobante, ids…"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                    <button
                        type="button"
                        style={{ backgroundColor: '#10B981' }}
                        className="h-10 shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90"
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
                            style={{ backgroundColor: '#10B981' }}
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
