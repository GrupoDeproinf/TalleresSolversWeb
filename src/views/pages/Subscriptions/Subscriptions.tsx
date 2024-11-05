import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
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

interface Subscripcion {
    nombre?: string
    status?: string
    monto: string
    fecha_inicio?: string
    fecha_fin?: string
    proximo_pago?: string
}

interface Usuario {
    id: string
    nombre: string
    subscripcion_actual?: Subscripcion
}

const UsuariosComponent = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<any[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
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

                // Filtrar solo usuarios con subscripción actual
                const usuariosConSubscripcion = usuariosData.filter(
                    (usuario) => usuario.subscripcion_actual,
                )
                setUsuarios(usuariosConSubscripcion)
            } catch (error) {
                console.error('Error fetching usuarios:', error)
                setError('Error al cargar los usuarios')
            } finally {
                setLoading(false)
            }
        }

        fetchUsuarios()
    }, [])

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
            header: 'Status',
            accessorKey: 'subscripcion_actual.status',
        },
        {
            header: 'Monto',
            accessorKey: 'subscripcion_actual.monto',
            filterFn: (row, columnId, value) => {
                const monto = row.getValue(columnId)
                return monto?.toString().includes(value) || false // Asegúrate de devolver siempre true o false
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
        },
        {
            header: 'Vigente hasta',
            accessorKey: 'subscripcion_actual.fecha_fin',
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

    const handlePaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const renderContent = () => {
        if (loading) return <p>Cargando usuarios...</p>
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
                <div className="pagination">
                    {Array.from(
                        { length: Math.ceil(totalRows / rowsPerPage) },
                        (_, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    handlePaginationChange(index + 1)
                                }
                                className={
                                    currentPage === index + 1 ? 'active' : ''
                                }
                            >
                                {index + 1}
                            </button>
                        ),
                    )}
                </div>
            </>
        )
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Suscripciones Actuales</h2>
            {renderContent()}
        </div>
    )
}

export default UsuariosComponent
