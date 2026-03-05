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
import { FaEdit, FaTrash } from 'react-icons/fa'
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'

type TipoVehiculo = {
    id: string
    nombre: string
}

const validationSchema = Yup.object().shape({
    nombre: Yup.string()
        .required('El nombre es obligatorio.')
        .min(2, 'El nombre debe tener al menos 2 caracteres.'),
})

const VehicleTypes = () => {
    const [data, setData] = useState<TipoVehiculo[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedItem, setSelectedItem] = useState<TipoVehiculo | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)

    const COLLECTION = 'Tipo_Vehiculo'

    const getData = async () => {
        const ref = collection(db, COLLECTION)
        const snapshot = await getDocs(ref)
        const items: TipoVehiculo[] = snapshot.docs.map((d) => ({
            id: d.id,
            nombre: (d.data().nombre as string) ?? '',
        }))
        setData(items)
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

    const openDeleteDialog = (item: TipoVehiculo) => {
        setSelectedItem(item)
        setIsOpen(true)
    }

    const openEditDrawer = (item: TipoVehiculo) => {
        setSelectedItem(item)
        setDrawerIsOpen(true)
    }

    const openCreateDrawer = () => {
        setSelectedItem(null)
        setDrawerCreateIsOpen(true)
    }

    const handleCreate = async (values: { nombre: string }) => {
        try {
            await addDoc(collection(db, COLLECTION), { nombre: values.nombre })
            toast.push(
                <Notification title="Éxito">
                    Tipo de vehículo creado correctamente.
                </Notification>,
            )
            setDrawerCreateIsOpen(false)
            getData()
        } catch (error) {
            console.error('Error al crear:', error)
            toast.push(
                <Notification title="Error">
                    No se pudo crear el tipo de vehículo.
                </Notification>,
            )
        }
    }

    const handleSaveEdit = async (values: { nombre: string }) => {
        if (!selectedItem) return
        try {
            const ref = doc(db, COLLECTION, selectedItem.id)
            await updateDoc(ref, { nombre: values.nombre })
            toast.push(
                <Notification title="Éxito">
                    Tipo de vehículo actualizado correctamente.
                </Notification>,
            )
            setDrawerIsOpen(false)
            setSelectedItem(null)
            getData()
        } catch (error) {
            console.error('Error al actualizar:', error)
            toast.push(
                <Notification title="Error">
                    No se pudo actualizar el tipo de vehículo.
                </Notification>,
            )
        }
    }

    const handleDelete = async () => {
        if (!selectedItem) return
        try {
            await deleteDoc(doc(db, COLLECTION, selectedItem.id))
            toast.push(
                <Notification title="Éxito">
                    Tipo de vehículo eliminado correctamente.
                </Notification>,
            )
            setIsOpen(false)
            setSelectedItem(null)
            getData()
        } catch (error) {
            console.error('Error al eliminar:', error)
            toast.push(
                <Notification title="Error">
                    No se pudo eliminar el tipo de vehículo.
                </Notification>,
            )
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const onDialogClose = (_e: MouseEvent) => {
        setIsOpen(false)
        setSelectedItem(null)
    }

    const onDrawerEditClose = (_e: MouseEvent) => {
        setDrawerIsOpen(false)
        setSelectedItem(null)
    }

    const onDrawerCreateClose = (_e: MouseEvent) => {
        setDrawerCreateIsOpen(false)
    }

    const columns: ColumnDef<TipoVehiculo>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue }) => getValue() as string,
            filterFn: 'includesString',
        },
        {
            header: ' ',
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEditDrawer(item)}
                            className="text-blue-900 hover:opacity-80"
                            title="Editar"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => openDeleteDialog(item)}
                            className="text-red-700 hover:opacity-80"
                            title="Eliminar"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )
            },
        },
    ]

    const { Tr, Th, Td, THead, TBody } = Table

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters: filtering,
            globalFilter: searchTerm,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        onGlobalFilterChange: (updater) => {
            const next = typeof updater === 'function' ? updater(searchTerm) : updater
            setSearchTerm(next ?? '')
        },
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            const nombre = (row.original.nombre ?? '').toLowerCase()
            return nombre.includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const rows = table.getRowModel().rows
    const totalRows = rows.length
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedRows = rows.slice(startIndex, endIndex)

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    <span className="text-[#000B7E]">Tipos de vehículo</span>
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                        title="Actualizar"
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-blue-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex justify-end items-center gap-4 flex-nowrap">
                    <div className="relative w-80 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <HiOutlineSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className="w-40 text-white hover:opacity-80 flex-shrink-0 flex items-center justify-center gap-2"
                        onClick={openCreateDrawer}
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                        Nuevo tipo
                    </Button>
                </div>
            </div>

            <div className="p-3 rounded-lg shadow">
                <Table className="w-full rounded-lg">
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? 'cursor-pointer select-none'
                                                        : ''
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                            </div>
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>
                    <TBody>
                        {paginatedRows.map((row) => (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <Td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </TBody>
                </Table>
                <Pagination
                    onChange={setCurrentPage}
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(n) => {
                        setRowsPerPage(n)
                        setCurrentPage(1)
                    }}
                />
            </div>

            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Confirmar eliminación</h5>
                <p>
                    ¿Estás seguro de que deseas eliminar el tipo de vehículo &quot;{selectedItem?.nombre}&quot;?
                </p>
                <div className="text-right mt-6">
                    <Button variant="plain" onClick={onDialogClose} className="ltr:mr-2 rtl:ml-2">
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: '#B91C1C' }}
                        className="text-white hover:opacity-80"
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>

            {/* Drawer Editar */}
            <Drawer
                isOpen={drawerIsOpen}
                onClose={onDrawerEditClose}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Editar tipo de vehículo</h2>
                <Formik
                    initialValues={{ nombre: selectedItem?.nombre ?? '' }}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSaveEdit}
                >
                    {({ isSubmitting }) => (
                        <Form className="flex flex-col space-y-6">
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">Nombre</label>
                                <Field
                                    type="text"
                                    name="nombre"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Camión"
                                />
                                <ErrorMessage
                                    name="nombre"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>
                            <div className="text-right mt-6">
                                <Button
                                    variant="default"
                                    onClick={onDrawerEditClose}
                                    className="mr-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Drawer>

            {/* Drawer Crear */}
            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={onDrawerCreateClose}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Nuevo tipo de vehículo</h2>
                <Formik
                    initialValues={{ nombre: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleCreate}
                >
                    {({ isSubmitting }) => (
                        <Form className="flex flex-col space-y-6">
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">Nombre</label>
                                <Field
                                    type="text"
                                    name="nombre"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Camión"
                                />
                                <ErrorMessage
                                    name="nombre"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>
                            <div className="text-right mt-6">
                                <Button
                                    variant="default"
                                    onClick={onDrawerCreateClose}
                                    className="mr-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Drawer>
        </>
    )
}

export default VehicleTypes
