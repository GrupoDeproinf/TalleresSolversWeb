import React, { useCallback, useEffect, useState } from 'react'
import {
    collection,
    doc,
    getDocs,
    Timestamp,
    updateDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    ColumnFiltersState,
    ColumnDef,
} from '@tanstack/react-table'
import { Row } from '@tanstack/react-table'
import {
    Drawer,
    Pagination,
    Button,
    Switcher,
    toast,
    Notification,
} from '@/components/ui'
import { FaCheckCircle, FaExclamationCircle, FaRegEye } from 'react-icons/fa'

interface Subscripcion {
    nombre?: string
    status?: string
    monto: string
    vigencia: string
    fecha_inicio: Timestamp | null
    fecha_fin: Timestamp | null
    proximo_pago?: string
}

interface Usuario {
    id: string
    nombre: string
    subscripcion_actual?: Subscripcion | null
}

const UsuariosComponent = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<any[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<{
        usuario: Usuario | null
        subscripcion: Subscripcion | null
    }>({
        usuario: null,
        subscripcion: null,
    })
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 6

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const usuariosCollection = collection(db, 'Usuarios')
                const usuariosSnapshot = await getDocs(usuariosCollection)
                const usuariosData: Usuario[] = usuariosSnapshot.docs.map(
                    (doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }),
                ) as Usuario[]

                const usuariosConSubscripcion = usuariosData.filter(
                    (usuario) => usuario.subscripcion_actual,
                )
                setUsuarios(usuariosConSubscripcion)
            } catch (error) {
                console.error('Error fetching usuarios:', error)
                setError('Error al cargar las subscripciones')
            } finally {
                setLoading(false)
            }
        }

        fetchUsuarios()
    }, [])

    // Función para abrir el drawer
    const openDrawer = useCallback(
        (usuario: Usuario, subscripcion: Subscripcion) => {
            setSelectedPerson({ usuario, subscripcion })
            setDrawerIsOpen(true)
        },
        [],
    )

    // Función para cerrar el drawer
    const closeDrawer = useCallback(() => {
        setDrawerIsOpen(false)
        setSelectedPerson({ usuario: null, subscripcion: null })
    }, [])

    // Función para guardar cambios en la suscripción
    const handleSaveChanges = async () => {
        if (selectedPerson.usuario?.id && selectedPerson.subscripcion) {
            try {
                // Verificar si la suscripción está cambiando de "Aprobado" a "Por Aprobar"
                if (
                    selectedPerson.subscripcion.status === 'Por Aprobar' &&
                    selectedPerson.usuario.subscripcion_actual?.status ===
                        'Aprobado'
                ) {
                    // Borrar las fechas si se cambia a "Por Aprobar"
                    await updateDoc(
                        doc(db, 'Usuarios', selectedPerson.usuario.id),
                        {
                            'subscripcion_actual.status':
                                selectedPerson.subscripcion.status,
                            'subscripcion_actual.monto':
                                selectedPerson.subscripcion.monto ?? '',
                            'subscripcion_actual.fecha_inicio': null,
                            'subscripcion_actual.fecha_fin': null,
                        },
                    )

                    // Mostrar notificación de éxito
                    toast.push(
                        <Notification title="Éxito">
                            Estado de suscripción actualizado con éxito.
                        </Notification>,
                    )

                    // Actualizar el estado local
                    setUsuarios((prevUsuarios) => {
                        return prevUsuarios.map((usuario) => {
                            if (usuario.id === selectedPerson.usuario?.id) {
                                return {
                                    ...usuario,
                                    subscripcion_actual: {
                                        ...selectedPerson.subscripcion,
                                        fecha_inicio: null,
                                        fecha_fin: null,
                                        monto:
                                            selectedPerson.subscripcion
                                                ?.monto ?? '', // Valor por defecto para 'monto'
                                        vigencia:
                                            selectedPerson.subscripcion
                                                ?.vigencia ?? '', // Valor por defecto para 'vigencia'
                                    },
                                }
                            }
                            return usuario
                        })
                    })

                    setDrawerIsOpen(false)
                    return // Salir de la función, ya que no es necesario continuar
                }

                // Obtener la fecha actual (fecha_inicio)
                const fechaInicio = new Date()

                // Verificar y convertir vigencia a un número
                const vigenciaDias = parseInt(
                    selectedPerson.subscripcion.vigencia,
                    10,
                )
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
                const fechaInicioTimestamp = Timestamp.fromDate(fechaInicio)
                const fechaFinTimestamp = Timestamp.fromDate(fechaFin)

                // Actualizar el documento del usuario en Firestore
                await updateDoc(
                    doc(db, 'Usuarios', selectedPerson.usuario.id),
                    {
                        'subscripcion_actual.status':
                            selectedPerson.subscripcion.status,
                        'subscripcion_actual.monto':
                            selectedPerson.subscripcion.monto ?? '',
                        'subscripcion_actual.vigencia':
                            selectedPerson.subscripcion.vigencia,
                        'subscripcion_actual.fecha_inicio':
                            fechaInicioTimestamp,
                        'subscripcion_actual.fecha_fin': fechaFinTimestamp,
                    },
                )

                toast.push(
                    <Notification title="Éxito">
                        Estado de suscripción actualizado con éxito.
                    </Notification>,
                )

                // Actualizar el estado local
                setUsuarios((prevUsuarios) => {
                    return prevUsuarios.map((usuario) => {
                        if (usuario.id === selectedPerson.usuario?.id) {
                            return {
                                ...usuario,
                                subscripcion_actual: selectedPerson.subscripcion
                                    ? {
                                          ...selectedPerson.subscripcion,
                                          fecha_inicio: fechaInicioTimestamp,
                                          fecha_fin: fechaFinTimestamp,
                                      }
                                    : usuario.subscripcion_actual,
                            }
                        }
                        return usuario
                    })
                })

                setDrawerIsOpen(false)
            } catch (error) {
                console.error(
                    'Error actualizando el estado de la suscripción:',
                    error,
                )
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el estado de la suscripción.
                    </Notification>,
                )
            }
        } else {
            toast.push(
                <Notification title="Error">
                    Información de usuario o suscripción no disponible.
                </Notification>,
            )
        }
    }

    const formatDate = (timestamp: unknown): string => {
        if (timestamp instanceof Timestamp) {
            const dateObj = timestamp.toDate() // Convierte Timestamp a Date
            return dateObj.toLocaleDateString('es-ES') // Formatea la fecha en formato 'DD/MM/YYYY'
        }
        console.warn('Timestamp no válido:', timestamp)
        return '-' // Si no es un Timestamp, muestra un guión
    }

    const columns: ColumnDef<Usuario>[] = [
        {
            header: 'Plan',
            accessorKey: 'subscripcion_actual.nombre',
        },
        {
            header: 'Taller Subscrito',
            accessorKey: 'nombre',
        },
        {
            header: 'Monto',
            accessorKey: 'subscripcion_actual.monto',
            filterFn: (row, columnId, value) => {
                const monto = row.getValue(columnId)
                return monto?.toString().includes(value) || false
            },
            cell: ({ row }: { row: Row<Usuario> }) => {
                const monto = parseFloat(
                    row.original.subscripcion_actual?.monto || '0',
                )
                return `$${monto.toFixed(2)}`
            },
        },
        {
            header: 'Fecha de Aprobacion',
            accessorKey: 'subscripcion_actual.fecha_inicio',
            cell: ({ row }) => {
                const fechaInicio =
                    row.original.subscripcion_actual?.fecha_inicio
                console.log('Fecha inicio:', fechaInicio) // Verifica aquí la salida
                return fechaInicio ? formatDate(fechaInicio) : '-'
            },
        },
        {
            header: 'Vigente hasta',
            accessorKey: 'subscripcion_actual.fecha_fin',
            cell: ({ row }) => {
                console.log(
                    'Fecha de fin:',
                    row.original.subscripcion_actual?.fecha_fin,
                )
                const fechaFin = row.original.subscripcion_actual?.fecha_fin
                return fechaFin ? formatDate(fechaFin) : '-'
            },
        },
        {
            header: 'Status',
            accessorKey: 'subscripcion_actual.status',
            cell: ({ getValue }) => {
                const status = (getValue() as string) || 'N/A' // Asegura que status es un string

                let icon = null
                let color = ''

                if (status === 'Aprobado') {
                    icon = <FaCheckCircle className="mr-1" />
                    color = 'text-green-500'
                } else if (status === 'Por Aprobar') {
                    icon = <FaExclamationCircle className="mr-1" />
                    color = 'text-yellow-500'
                } else if (status === 'Rechazado') {
                    color = 'text-red-500'
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
                const subscription = row.original.subscripcion_actual

                return (
                    <div className="gap-2">
                        {subscription ? ( // Solo muestra el botón si subscription está definido
                            <button
                                onClick={() =>
                                    openDrawer(row.original, subscription)
                                }
                                className="text-blue-900"
                            >
                                <FaRegEye />
                            </button>
                        ) : null}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: usuarios,
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

    const totalRows = table.getRowModel().rows.length
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handlePaginationChange = (page: number) => setCurrentPage(page)

    const renderContent = () => {
        if (error) return <p>{error}</p>

        return (
            <>
                <Table>
                    <Table.THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Th
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
                                                {header.column.getIsSorted()
                                                    ? header.column.getIsSorted() ===
                                                      'asc'
                                                        ? ' 🔼'
                                                        : ' 🔽'
                                                    : null}
                                                {header.column.getCanFilter() && (
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar"
                                                        onChange={(e) =>
                                                            setFiltering(
                                                                (prev) => {
                                                                    const newFilters =
                                                                        prev.filter(
                                                                            (
                                                                                filter,
                                                                            ) =>
                                                                                filter.id !==
                                                                                header.id,
                                                                        )
                                                                    if (
                                                                        e.target
                                                                            .value
                                                                    ) {
                                                                        newFilters.push(
                                                                            {
                                                                                id: header.id,
                                                                                value: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    return newFilters
                                                                },
                                                            )
                                                        }
                                                        className="mt-2 p-1 border rounded"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.THead>
                    <Table.TBody>
                        {table
                            .getRowModel()
                            .rows.slice(startIndex, endIndex)
                            .map((row) => (
                                <Table.Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}
                    </Table.TBody>
                </Table>
                <Pagination
                    onChange={handlePaginationChange}
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                />
            </>
        )
    }

    return (
        <div>
            <h1 className="mb-6">Suscripciones Actuales</h1>
            {renderContent()}
            <Drawer
                isOpen={drawerIsOpen}
                onClose={closeDrawer}
                className="rounded-md shadow"
            >
                <div className="grid grid-cols-2">
                    <h2 className="flex mb-4 text-xl font-bold">
                        Revisión Subscripción
                    </h2>
                    <div className="flex items-center">
                        <Switcher
                            // Compara con el estado actual de la subscripción
                            defaultChecked={
                                selectedPerson?.subscripcion?.status ===
                                'Aprobado'
                            }
                            onChange={(e) => {
                                setSelectedPerson((prev) => ({
                                    ...prev, // Copia el objeto anterior
                                    subscripcion: prev?.subscripcion
                                        ? {
                                              ...prev.subscripcion, // Copia de la subscripción actual
                                              status: e
                                                  ? 'Aprobado'
                                                  : 'Por Aprobar', // Cambia el estado
                                          }
                                        : null, // Si no hay subscripción, se pone null (aunque deberías manejar este caso)
                                }))
                            }}
                            color={
                                selectedPerson?.subscripcion?.status ===
                                'Aprobado'
                                    ? 'green-500'
                                    : 'red-500'
                            }
                        />
                        <span className="ml-2 text-gray-700">
                            {selectedPerson?.subscripcion?.status}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col space-y-6">
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Plan:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.subscripcion?.nombre || ''}
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
                            value={selectedPerson?.usuario?.nombre || ''}
                            readOnly // Aquí se agrega el atributo readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Monto
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.subscripcion?.monto || ''}
                            readOnly // Aquí se agrega el atributo readOnly
                            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Se añade cursor-not-allowed para indicar que no se puede editar
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Vigencia:
                        </span>
                        <input
                            type="text"
                            value={selectedPerson?.subscripcion?.vigencia || ''}
                            readOnly // Aquí se agrega el atributo readOnly
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
        </div>
    )
}

export default UsuariosComponent
