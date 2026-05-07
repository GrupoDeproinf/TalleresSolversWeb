import { useEffect, useMemo, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
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
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { exportStyledExcel } from '@/utils/excelExport'
import { HiOutlineX } from 'react-icons/hi'

type ServicesContact = {
    nombre_servicio?: string
    uid_servicio: string
    taller?: string
    uid_taller?: string
    fecha_creacion?: Timestamp
    precio?: number
    usuario?: {
        email?: string
        id?: string
        nombre?: string
    }
    ciudad_taller?: string
    categoria_label?: string
    id?: string
}

type SimpleSelectOpt = { value: string; label: string }

function formatFechaCreacionContact(
    ts: Timestamp | Date | undefined,
): string {
    if (!ts) return ''
    try {
        if (typeof (ts as Timestamp).toDate === 'function') {
            return (ts as Timestamp).toDate().toLocaleString('es-ES')
        }
        if (ts instanceof Date) return ts.toLocaleString('es-ES')
    } catch {
        /* ignorar */
    }
    return ''
}

function serviceContactSearchableText(r: ServicesContact): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        r.nombre_servicio,
        r.taller,
        r.uid_taller,
        r.uid_servicio,
        r.id,
    )
    if (r.precio !== undefined && r.precio !== null) {
        parts.push(String(r.precio))
    }
    parts.push(formatFechaCreacionContact(r.fecha_creacion))
    const u = r.usuario
    if (u) {
        push(u.nombre, u.email, u.id)
    }
    return parts.join(' ').toLowerCase()
}

type ServiceContactHistoryProps = {
    exportSignal?: number
    refreshSignal?: number
    searchTerm?: string
}

const Services = ({
    exportSignal = 0,
    refreshSignal = 0,
    searchTerm = '',
}: ServiceContactHistoryProps) => {
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dataServicesContact, setDataServicesContact] = useState<
        ServicesContact[]
    >([])
    const [filterCity, setFilterCity] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [creationDateRange, setCreationDateRange] =
        useState<DatePickerRangeValue>([null, null])

    const getAllData = async () => {
        try {
            const servicesQuery = query(collection(db, 'servicesContact'))
            const [servicesSnapshot] = await Promise.all([
                getDocs(servicesQuery),
            ])
            const services = await Promise.all(
                servicesSnapshot.docs.map(async (serviceDoc) => {
                    const service = {
                        ...serviceDoc.data(),
                        uid_servicio: serviceDoc.id,
                    } as ServicesContact

                    let ciudad_taller = 'Sin ciudad'
                    if (service.uid_taller) {
                        const tallerDoc = await getDoc(
                            doc(db, 'Usuarios', service.uid_taller),
                        )
                        if (tallerDoc.exists()) {
                            const tallerData = tallerDoc.data()
                            ciudad_taller =
                                tallerData.ciudad ||
                                (Array.isArray(tallerData.estado)
                                    ? tallerData.estado[0]
                                    : tallerData.estado) ||
                                'Sin ciudad'
                        }
                    }

                    return {
                        ...service,
                        ciudad_taller,
                        categoria_label: service.nombre_servicio || 'Sin categoría',
                    }
                }),
            )

            setDataServicesContact(services)
        } catch (error) {
            console.error('Error obteniendo los datos:', error)
        }
    }

    useEffect(() => {
        getAllData()
    }, [])

    useEffect(() => {
        if (refreshSignal > 0) {
            void getAllData()
            toast.push(
                <Notification title="Datos actualizados">
                    La tabla ha sido actualizada con éxito.
                </Notification>,
            )
        }
    }, [refreshSignal])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (exportSignal > 0) {
            void handleExportToExcel()
        }
    }, [exportSignal])

    const cityOptions = useMemo<SimpleSelectOpt[]>(() => {
        const values = new Set<string>()
        dataServicesContact.forEach((s) => {
            const city = s.ciudad_taller?.trim()
            if (city) values.add(city)
        })
        return [
            { value: '', label: 'Todas' },
            ...Array.from(values)
                .sort((a, b) => a.localeCompare(b, 'es'))
                .map((v) => ({ value: v, label: v })),
        ]
    }, [dataServicesContact])

    const categoryOptions = useMemo<SimpleSelectOpt[]>(() => {
        const values = new Set<string>()
        dataServicesContact.forEach((s) => {
            const category = s.categoria_label?.trim()
            if (category) values.add(category)
        })
        return [
            { value: '', label: 'Todas' },
            ...Array.from(values)
                .sort((a, b) => a.localeCompare(b, 'es'))
                .map((v) => ({ value: v, label: v })),
        ]
    }, [dataServicesContact])

    const filteredContacts = useMemo(() => {
        const [fromRaw, toRaw] = creationDateRange
        const from = fromRaw ? new Date(fromRaw) : null
        const to = toRaw ? new Date(toRaw) : null
        if (from) from.setHours(0, 0, 0, 0)
        if (to) to.setHours(23, 59, 59, 999)

        return dataServicesContact.filter((s) => {
            if (filterCity && s.ciudad_taller !== filterCity) return false
            if (filterCategory && s.categoria_label !== filterCategory)
                return false
            if (from || to) {
                const created =
                    s.fecha_creacion instanceof Timestamp
                        ? s.fecha_creacion.toDate()
                        : null
                if (!created) return false
                if (from && created < from) return false
                if (to && created > to) return false
            }
            return true
        })
    }, [dataServicesContact, filterCity, filterCategory, creationDateRange])

    const clearFilters = () => {
        setFilterCity('')
        setFilterCategory('')
        setCreationDateRange([null, null])
    }

    const hasActiveFilters =
        Boolean(filterCity) ||
        Boolean(filterCategory) ||
        Boolean(creationDateRange[0]) ||
        Boolean(creationDateRange[1])

    const columns: ColumnDef<ServicesContact>[] = [
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Negocio',
            accessorKey: 'taller',
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
        },
        {
            header: 'Fecha de Creación',
            cell: ({ row }) => {
                // Asegúrate de acceder correctamente al valor
                const fechaCreacion = row.original.fecha_creacion;
                if (fechaCreacion) {
                    // Si es un Timestamp, conviértelo a Date y formatea
                    if (fechaCreacion.toDate) {
                        return fechaCreacion.toDate().toLocaleString(); // Formato de fecha y hora
                    }
                    // Si ya es un Date, formatea directamente
                    if (fechaCreacion instanceof Date) {
                        return fechaCreacion.toLocaleString();
                    }
                }
                return 'Sin fecha'; // Para valores no válidos
            },
        },
        {
            header: 'Nombre del Usuario',
            accessorKey: 'usuario.nombre', // Acceso directo al campo anidado
        },
        {
            header: 'Correo del Usuario',
            accessorKey: 'usuario.email', // Acceso directo al campo anidado
        },
    ];

    const { Tr, Th, Td, THead, TBody } = Table

    const table = useReactTable({
        data: filteredContacts,
        columns,
        state: {
            sorting,
            columnFilters: filtering,
            globalFilter: searchTerm,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            return serviceContactSearchableText(row.original).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // console.log('Datos de servicios antes de renderizar:', dataServicesContact) // Verifica el estado de los datos

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Suponiendo que tienes un array de datos
    const data = table.getRowModel().rows // O la fuente de datos que estés utilizando
    const totalRows = data.length

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    const handleExportToExcel = async () => {
        const rowsToExport = table.getFilteredRowModel().rows
        const formattedData = rowsToExport.map((row) => {
            const service = row.original
            return {
                nombreServicio: service.nombre_servicio || 'N/A',
                negocio: service.taller || 'N/A',
                ciudad: service.ciudad_taller || 'N/A',
                categoria: service.categoria_label || 'N/A',
                precio: String(service.precio ?? 'N/A'),
                fechaCreacion: service.fecha_creacion
                    ? service.fecha_creacion.toDate().toLocaleString()
                    : 'N/A',
                nombreUsuario: service.usuario?.nombre || 'N/A',
                correoUsuario: service.usuario?.email || 'N/A',
            }
        })
    
        if (formattedData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles en el rango de fechas seleccionado.
                </Notification>,
            );
            return;
        }
    
        await exportStyledExcel({
            rows: formattedData,
            columns: [
                { header: 'Nombre del Servicio', key: 'nombreServicio' },
                { header: 'Negocio', key: 'negocio' },
                { header: 'Ciudad', key: 'ciudad' },
                { header: 'Categoría', key: 'categoria' },
                { header: 'Precio', key: 'precio' },
                { header: 'Fecha de Creación', key: 'fechaCreacion' },
                { header: 'Nombre del Usuario', key: 'nombreUsuario' },
                {
                    header: 'Correo del Usuario',
                    key: 'correoUsuario',
                    linkType: 'email',
                },
            ],
            sheetName: 'Servicios',
            fileName: 'ServiciosSolicitados.xlsx',
        })
    
        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        )
    }
    
    
    
    
    
    return (
        <>
            <div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 flex-nowrap items-end justify-end gap-x-2 overflow-x-auto pb-0.5">
                        <div className="flex w-[11.25rem] shrink-0 flex-col gap-0.5 sm:w-[12rem]">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                                Categoría
                            </span>
                            <Select<SimpleSelectOpt, false>
                                size="sm"
                                isSearchable
                                className="w-full"
                                options={categoryOptions}
                                value={
                                    categoryOptions.find(
                                        (o) => o.value === filterCategory,
                                    ) ?? categoryOptions[0]
                                }
                                onChange={(opt) =>
                                    setFilterCategory(opt?.value ?? '')
                                }
                                placeholder="Todas"
                            />
                        </div>
                        <div className="flex w-[11.25rem] shrink-0 flex-col gap-0.5 sm:w-[12rem]">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                                Ciudad
                            </span>
                            <Select<SimpleSelectOpt, false>
                                size="sm"
                                isSearchable
                                className="w-full"
                                options={cityOptions}
                                value={
                                    cityOptions.find(
                                        (o) => o.value === filterCity,
                                    ) ?? cityOptions[0]
                                }
                                onChange={(opt) =>
                                    setFilterCity(opt?.value ?? '')
                                }
                                placeholder="Todas"
                            />
                        </div>
                        <div className="flex w-[13.75rem] shrink-0 flex-col gap-0.5 sm:w-[15rem]">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs sm:normal-case sm:tracking-normal">
                                Fecha
                            </span>
                            <DatePicker.DatePickerRange
                                clearable
                                className="w-full"
                                inputFormat="DD/MM/YYYY"
                                placeholder="Desde — hasta"
                                separator=" — "
                                size="sm"
                                value={creationDateRange}
                                onChange={setCreationDateRange}
                            />
                        </div>
                        <button
                            type="button"
                            title="Limpiar filtros"
                            aria-label="Limpiar filtros"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:border-[#000B7E]/40 hover:bg-[#000B7E]/5 hover:text-[#000B7E] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <HiOutlineX className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="p-1 rounded-lg shadow">
                    <Table className="w-full rounded-lg">
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
                                                            header.column
                                                                .columnDef
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
                            {table
                                .getRowModel()
                                .rows.slice(
                                    (currentPage - 1) * rowsPerPage,
                                    currentPage * rowsPerPage,
                                )
                                .map((row) => {
                                    return (
                                        <Tr key={row.id}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    return (
                                                        <Td key={cell.id}>
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
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
            </div>
        </>
    )
}

export default Services
