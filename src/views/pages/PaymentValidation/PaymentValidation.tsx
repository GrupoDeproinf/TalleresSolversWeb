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
    FaTrash,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp,
    getDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Dialog, Drawer, Switcher } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import * as XLSX from 'xlsx'
import { resolve } from 'path'
import axios from 'axios'

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
    const [selectedPerson, setSelectedPerson] = useState<Subscriptions | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscriptions | null>(null)

    const getData = async () => {
        const q = query(
            collection(db, 'Subscripciones'),
            where('status', '==', 'Por Aprobar'),
        )
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
        // Solo mostrar suscripciones de pago (excluir gratuitas, no requieren validación)
        const soloPago = resolvedSubcripciones.filter((sub) => {
            const monto = sub.monto
            const montoNum =
                typeof monto === 'string'
                    ? parseFloat(monto)
                    : typeof monto === 'number'
                      ? monto
                      : 0
            return !isNaN(montoNum) && montoNum >= 0.0001
        })
        setDataSubs(soloPago)
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

    const handleSaveChanges = async () => {
        if (selectedPerson) {
            try {
                let updateData
                console.log('selectedPerson', selectedPerson)

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

                        // Buscar el documento en Usuarios después de la actualización
                        const userDoc = await getDoc(doc(db, 'Usuarios', selectedPerson.taller_uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data()
                            console.log('userData', userData)

                            try {
                                await axios.post('https://apisolvers.solversapp.com/api/usuarios/sendNotification', {
                                    token: userData?.token,
                                    title: 'Codigo Validado',
                                    body: "Hola, se ha rechazado su pago",
                                    secretCode: "Validar codigo",
                                });
                            } catch (error) {
                                console.error('Error al enviar notificación:', error);
                            }
                        }
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
                } else {
                    if (selectedPerson.taller_uid) {
                        // Buscar el documento en Usuarios después de la actualización
                        const userDoc = await getDoc(doc(db, 'Usuarios', selectedPerson.taller_uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data()
                            console.log('userData', userData)

                            try {
                                await axios.post('https://apisolvers.solversapp.com/api/usuarios/sendNotification', {
                                    token: userData?.token,
                                    title: 'Codigo Validado',
                                    body: "Hola, se ha validado su pago exitosamente",
                                    secretCode: "Validar codigo",
                                });
                            } catch (error) {
                                console.error('Error al enviar notificación:', error);
                            }
                        }
                    }
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

    const handleDeleteSubscription = (subscription: Subscriptions) => {
        setSubscriptionToDelete(subscription)
        setDeleteModalIsOpen(true)
    }

    const confirmDeleteSubscription = async () => {
        if (subscriptionToDelete) {
            try {
                // Eliminar la suscripción de la colección Subscripciones
                await deleteDoc(doc(db, 'Subscripciones', subscriptionToDelete.uid))

                // Si tiene taller_uid, verificar si el usuario existe antes de actualizar
                if (subscriptionToDelete.taller_uid) {
                    const userDocRef = doc(db, 'Usuarios', subscriptionToDelete.taller_uid)
                    const userDoc = await getDoc(userDocRef)

                    if (userDoc.exists()) {
                        await updateDoc(userDocRef, { subscripcion_actual: null })
                    }
                }

                toast.push(
                    <Notification title="Suscripción eliminada">
                        La suscripción ha sido eliminada exitosamente.
                    </Notification>,
                )

                setDeleteModalIsOpen(false)
                setSubscriptionToDelete(null)
                getData() // Recargar los datos
            } catch (error) {
                console.error('Error eliminando la suscripción:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al eliminar la suscripción.
                    </Notification>,
                )
            }
        }
    }

    const cancelDeleteSubscription = () => {
        setDeleteModalIsOpen(false)
        setSubscriptionToDelete(null)
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

        // Filtrar los datos para las fechas dentro del rango (pendientes usan fecha de pago del comprobante)
        const filteredData = dataSubs.filter((row) => {
            const fechaRef =
                row.fecha_inicio instanceof Timestamp
                    ? row.fecha_inicio.toDate()
                    : row.comprobante_pago?.fechaPago instanceof Timestamp
                      ? row.comprobante_pago.fechaPago.toDate()
                      : null
            if (!fechaRef || !(fechaRef instanceof Date) || isNaN(fechaRef.getTime())) {
                return false
            }
            return (
                fechaRef.getTime() >= adjustedStartDate.getTime() &&
                fechaRef.getTime() <= adjustedEndDate.getTime()
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
                        {person.status !== 'Vencido' && person.comprobante_pago && (
                            <button
                                onClick={() => openDrawer(person)}
                                className="text-blue-900 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                            >
                                <FaRegEye />
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteSubscription(person)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                            title="Eliminar suscripción"
                        >
                            <FaTrash />
                        </button>
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
                    <span className="text-[#000B7E]">Validación de pagos</span>
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="relative w-80">
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
                            style={{ backgroundColor: '#10B981' }}
                            className="p-2 ml-4 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 active:bg-blue-700 transition duration-200 hover:opacity-80"
                            onClick={handleOpenDialog}
                        >
                            Exportar a Excel
                        </button>
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
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            </div>
            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerClose}
                className="rounded-md shadow"
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">
                        Revisión de Pago
                    </h2>
                    {selectedPerson?.comprobante_pago && (
                        <p className="text-gray-700">
                            <span className="font-semibold">Tipo de pago: </span>
                            <span>
                                {selectedPerson.comprobante_pago.metodo || 'No especificado'}
                            </span>
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-2 mb-4">
                    <div />
                    <div className="flex items-center">
                        <Switcher
                            defaultChecked={
                                selectedPerson?.status === 'Aprobado'
                            }
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
                                    status: e ? 'Aprobado' : 'Por Aprobar',
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

            {/* Modal de confirmación para eliminar suscripción */}
            <Dialog isOpen={deleteModalIsOpen} onClose={cancelDeleteSubscription}>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                            <FaTrash className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            ¿Eliminar suscripción?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Esta acción no se puede deshacer. Se eliminará permanentemente la suscripción de{' '}
                            <span className="font-semibold text-gray-900">
                                {subscriptionToDelete?.nombre}
                            </span>{' '}
                            para el taller{' '}
                            <span className="font-semibold text-gray-900">
                                {subscriptionToDelete?.nombre_taller}
                            </span>.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button
                                onClick={cancelDeleteSubscription}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmDeleteSubscription}
                                className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                style={{ backgroundColor: '#dc2626' }}
                                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#991b1b'}
                                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default Subscriptions
