import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Select from '@/components/ui/Select'
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
import { FaEdit, FaStar, FaStarHalfAlt, FaTrash } from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    Timestamp,
} from 'firebase/firestore'
import { z } from 'zod'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer } from '@/components/ui'
import * as Yup from 'yup'
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from 'formik'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'

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
    id?: string
}

const Services = () => {
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedServicesContact, setSelectedServicesContact] =
        useState<ServicesContact | null>(null)
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre_servicio')
    const [searchTerm, setSearchTerm] = useState('')
    const [dataServicesContact, setDataServicesContact] = useState<
        ServicesContact[]
    >([])

    const getAllData = async () => {
        try {
            const servicesQuery = query(collection(db, 'servicesContact'))
            const [servicesSnapshot] = await Promise.all([
                getDocs(servicesQuery),
            ])
            const services: ServicesContact[] = servicesSnapshot.docs.map(
                (doc) => ({
                    ...doc.data(),
                    uid_servicio: doc.id,
                }),
            ) as ServicesContact[]

            setDataServicesContact(services)
        } catch (error) {
            console.error('Error obteniendo los datos:', error)
        }
    }

    useEffect(() => {
        getAllData()
    }, [])

    const handleRefresh = async () => {
        await getAllData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }
        
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)

        // Aplica el filtro dinámico según la columna seleccionada
        const newFilters = [
            {
                id: selectedColumn, // Usar la columna seleccionada
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

        // Aplicar filtro vacío cuando se cambia la columna
        if (searchTerm !== '') {
            const newFilters = [
                {
                    id: value, // La columna seleccionada
                    value: searchTerm, // Filtrar por el término de búsqueda actual
                },
            ]
            setFiltering(newFilters)
        }
    }
    

    const columns: ColumnDef<ServicesContact>[] = [
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Taller',
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
                const userName = row.original.usuario?.nombre;
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
            accessorKey: 'usuario.nombre',
        },
        {
            header: 'Correo del Usuario',
            accessorKey: 'usuario.email',
        },
    ];

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const table = useReactTable({
        data: dataServicesContact,
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

    // console.log('Datos de servicios antes de renderizar:', dataServicesContact) // Verifica el estado de los datos

    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 6 // Puedes cambiar esto si deseas un número diferente

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
            <div>
                <div className="grid grid-cols-2">
                    <h1 className="mb-6 flex justify-start items-center space-x-4">
                        {' '}
                        <span className="text-[#000B7E]">
                            Servicios Solicitados
                        </span>
                        <button
                            className="p-2  bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                            onClick={handleRefresh}
                        >
                            <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                        </button>
                    </h1>
                    <div className="flex justify-end">
                        <div className="flex items-center">
                            <div className="relative w-32">
                                {' '}
                                <select
                                    className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={handleSelectChange}
                                    value={selectedColumn} // Se mantiene el valor predeterminado
                                >
                                    <option value="nombre_servicio">Servicio</option>
                                    <option value="taller">Taller</option>
                                    <option value="precio">Precio</option>
                                    <option value="precio">Precio</option>
                                    
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
                                                        <Sorter
                                                            sort={header.column.getIsSorted()}
                                                        />
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
                    />
                </div>
            </div>
        </>
    )
}

export default Services
