import { useEffect, useState } from 'react'
import Table from '@/components/ui/Table'
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
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer } from '@/components/ui'

type Service = {
    nombre_servicio: string
    descripcion: string
    precio: string
    taller: string
    puntuacion: string
    uid_servicio: string
}

const Services = () => {
    const [dataServices, setDataServices] = useState<Service[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        try {
            // Obtén la colección 'Servicios'
            const q = query(collection(db, 'Servicios'))
            const querySnapshot = await getDocs(q)
            const servicios: Service[] = []

            querySnapshot.forEach((doc) => {
                const serviceData = doc.data() as Service
                // Asignar el id del documento al objeto de servicio
                servicios.push({ ...serviceData, uid_servicio: doc.id })
            })

            console.log('Servicios obtenidos:', servicios) // Verifica los datos obtenidos
            setDataServices(servicios)
        } catch (error) {
            console.error('Error obteniendo servicios:', error)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const openDialog = (service: Service) => {
        setSelectedService(service)
        setIsOpen(true)
    }
    const openDrawer = (service: Service) => {
        setSelectedService(service)
        setDrawerIsOpen(true) // Abre el Drawer
    }

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
        if (selectedService) {
            try {
                const userDoc = doc(
                    db,
                    'Servicios',
                    selectedService?.uid_servicio,
                )
                await updateDoc(userDoc, {
                    nombre_servicio: selectedService?.nombre_servicio,
                    descripcion: selectedService?.descripcion,
                    precio: selectedService?.precio,
                    taller: selectedService?.taller,
                    puntuacion: selectedService?.puntuacion,
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Servicio actualizado con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData() // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando el servicio:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el servicio.
                    </Notification>,
                )
            }
        }
    }

    const columns: ColumnDef<Service>[] = [
        {
            header: 'Taller Asociado',
            accessorKey: 'taller',
        },
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Descripción',
            accessorKey: 'descripcion',
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
            cell: ({ row }) => {
                const precio = parseFloat(row.original.precio) // Asegúrate de que sea un número
                return `$${precio.toFixed(2)}`
            },
        },
        {
            header: 'Puntuación',
            accessorKey: 'puntuacion',
            cell: ({ row }) => {
                const puntuacion = parseFloat(row.original.puntuacion) // Asegúrate de que sea un número
                const fullStars = Math.floor(puntuacion)
                const hasHalfStar = puntuacion % 1 >= 0.5
                const stars = []

                // Agrega las estrellas llenas
                for (let i = 0; i < fullStars; i++) {
                    stars.push(
                        <FaStar
                            key={`full-${i}`}
                            className="text-yellow-500"
                        />,
                    )
                }
                // Agrega la estrella media si corresponde
                if (hasHalfStar) {
                    stars.push(
                        <FaStarHalfAlt
                            key="half"
                            className="text-yellow-500"
                        />,
                    )
                }
                // Agrega las estrellas vacías (si es necesario, para un total de 5)
                for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
                    stars.push(
                        <FaStar key={`empty-${i}`} className="text-gray-300" />,
                    )
                }

                return <div className="flex">{stars}</div> // Renderiza las estrellas
            },
        },
        {
            header: ' ',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openDrawer(person)} // Cambiar aquí
                            className="hover:text-blue-700"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => openDialog(person)}
                            className="hover:text-red-700"
                        >
                            <FaTrash />
                        </button>
                    </div>
                )
            },
        },
    ]

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const handleEdit = (service: Service) => {
        console.log('Editando el servicio:', service)
        // Lógica de edición
    }

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedService(null) // Limpiar selección
    }

    const handleDelete = async () => {
        if (selectedService) {
            console.log('Eliminando el servicio:', selectedService)

            try {
                // Ahora estamos usando el id generado automáticamente por Firebase
                const serviceDoc = doc(
                    db,
                    'Servicios',
                    selectedService.uid_servicio,
                )
                await deleteDoc(serviceDoc)

                const toastNotification = (
                    <Notification title="Éxito">
                        Servicio {selectedService.nombre_servicio} eliminado con
                        éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el servicio:', error)

                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando el servicio.
                    </Notification>
                )
                toast.push(errorNotification)
            } finally {
                setIsOpen(false) // Cerrar diálogo después de la operación
                setSelectedService(null) // Limpiar selección
            }
        }
    }

    const table = useReactTable({
        data: dataServices,
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

    console.log('Datos de servicios antes de renderizar:', dataServices) // Verifica el estado de los datos

    return (
        <>
            <h1 className="mb-6">Lista de Servicios</h1>
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
                                                                    (filter) =>
                                                                        filter.id ===
                                                                        header.id,
                                                                )
                                                                ?.value?.toString() ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            handleFilterChange(
                                                                header.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Buscar`}
                                                        className="mt-2 p-1 border rounded"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        } // Evita la propagación del evento de clic
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
                    {table
                        .getRowModel()
                        .rows.slice(0, 10)
                        .map((row) => {
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

            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p>
                    ¿Estás seguro de que deseas eliminar el servicio{' '}
                    {selectedService?.nombre_servicio}?
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Cancelar
                    </Button>
                    <Button variant="solid" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </div>
            </Dialog>
            <Drawer
                isOpen={drawerIsOpen}
                onClose={() => setDrawerIsOpen(false)}
                className="rounded-md shadow" // Añadir estilo al Drawer
            >
                <h2 className="mb-4 text-xl font-bold">Editar Servicio</h2>
                <div className="flex flex-col space-y-6">
                    {' '}
                    {/* Aumentar el espacio entre campos */}
                    {/* Campo para Taller */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Taller Asociado:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.taller || ''}
                            onChange={(e) =>
                                setSelectedService((prev) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                    }),
                                    taller: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    {/* Campo para nombre_servicio */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre Servicio:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.nombre_servicio || ''}
                            onChange={(e) =>
                                setSelectedService((prev) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                    }),
                                    nombre_servicio: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    {/* Campo para descripcion */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Descripcion:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.descripcion || ''}
                            onChange={(e) =>
                                setSelectedService((prev) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                    }),
                                    descripcion: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    {/* Campo para Taller */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Taller:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.taller || ''}
                            onChange={(e) =>
                                setSelectedService((prev) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                    }),
                                    taller: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Precio:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.precio || ''}
                            onChange={(e) =>
                                setSelectedService((prev) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                    }),
                                    precio: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Puntuación:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.puntuacion || ''}
                            onChange={(e) =>
                                setSelectedService((prev) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                    }),
                                    puntuacion: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                </div>

                <div className="text-right mt-6">
                    <Button
                        className="mr-2" // Espaciado entre botones
                        variant="default"
                    >
                        Cerrar
                    </Button>
                    <Button variant="solid" onClick={handleSaveChanges}>
                        Guardar Cambios
                    </Button>
                </div>
            </Drawer>
        </>
    )
}

export default Services
