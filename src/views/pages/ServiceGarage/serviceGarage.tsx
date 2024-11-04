import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
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
import {
    FaCheckCircle,
    FaEdit,
    FaExclamationCircle,
    FaRegEye,
    FaTimesCircle,
    FaTrash,
    FaStar,
    FaStarHalfAlt,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
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
import Drawer from '@/components/ui/Drawer' // Asegúrate de que esta ruta sea correcta
import Shape from '@/views/ui-components/common/Button/Shape'
import { Avatar } from '@/components/ui'
import { HiOutlineUser } from 'react-icons/hi'

type Person = {
    nombre?: string
    email?: string
    rif?: string
    phone?: string
    uid: string
    typeUser?: string
    servicios?: string[]
    id?: string
    status?: string
}

type Service = {
    nombre_servicio: string
    descripcion: string
    precio: string
    taller: string
    puntuacion: string
    uid_servicio: string
    id: string
}

const Garages = () => {
    const [dataUsers, setDataUsers] = useState<Person[]>([])
    const [dataServices, setDataServices] = useState<Service[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false) // Estado para el Drawer

    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

    const toggleServiceSelection = (serviceId: string) => {
        setSelectedServiceIds((prev) =>
            prev.includes(serviceId)
                ? prev.filter((id) => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const getData = async () => {
        const q = query(collection(db, 'Usuarios'))
        const querySnapshot = await getDocs(q)
        const usuarios: Person[] = []

        querySnapshot.forEach((doc) => {
            const userData = doc.data() as Person
            if (userData.typeUser === 'Taller' && userData.status === 'Aprobado') {
                usuarios.push({ ...userData, id: doc.id }) // Guardar el ID del documento
            }
        })

        setDataUsers(usuarios)
    }

    // Nueva función para obtener los datos de la colección de servicios
    const getDataServices = async () => {
        const q = query(collection(db, 'Servicios'))
        const querySnapshot = await getDocs(q)
        const servicios: Service[] = []

        querySnapshot.forEach((doc) => {
            const serviceData = doc.data() as Service
            servicios.push({ ...serviceData, id: doc.id }) // Guardar el ID del documento
        })

        setDataServices(servicios)
    }

    useEffect(() => {
        getData()         // Obtén los datos de usuarios
        getDataServices()  // Obtén los datos de servicios
    }, [])

    useEffect(() => {
        getData()
    }, [])

    const openDrawer = (person: Person) => {
        setSelectedPerson(person); // Establece el taller seleccionado
    
        // Aquí asumiendo que `person.servicios` contiene los IDs de los servicios asignados
        setSelectedServiceIds(person.servicios || []); // Establece los servicios seleccionados
    
        setDrawerIsOpen(true); // Abre el drawer
    };
    

    const handleFilterChange = (columnId: string, value: string) => {
        setFiltering((prev) => {
            const newFilters = prev.filter((filter) => filter.id !== columnId)
            if (value !== '') {
                newFilters.push({ id: columnId, value })
            }
            return newFilters
        })
    }

    const getInitials = (nombre: string | undefined): string => {
        if (!nombre) return ''
        const words = nombre.split(' ')
        return words.map((word: string) => word[0].toUpperCase()).join('')
    }

    const columns: ColumnDef<Person>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
        },
        {
            header: 'RIF',
            accessorKey: 'rif',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Numero Telefonico',
            accessorKey: 'phone',
            cell: ({ row }) => {
                const nombre = row.original.nombre // Accede al nombre del cliente
                return (
                    <div className="flex items-center">
                        <Avatar
                            style={{ backgroundColor: '#FFCC29' }} // Establecer el color directamente
                            className="mr-2 w-6 h-6 flex items-center justify-center rounded-full"
                        >
                            <span className="text-white font-bold">
                                {getInitials(nombre)}
                            </span>
                        </Avatar>
                        {row.original.phone}{' '}
                        {/* Muestra el número telefónico */}
                    </div>
                )
            },
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string // Aserción de tipo
                let icon
                let color

                switch (status) {
                    case 'Aprobado':
                        icon = <FaCheckCircle className="text-green-500 mr-1" />
                        color = 'text-green-500' // Color para el texto
                        break
                    case 'Rechazado':
                        icon = <FaTimesCircle className="text-red-500 mr-1" />
                        color = 'text-red-500' // Color para el texto
                        break
                    case 'Pendiente':
                        icon = (
                            <FaExclamationCircle className="text-yellow-500 mr-1" />
                        )
                        color = 'text-yellow-500' // Color para el texto
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
                const person = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={() => openDrawer(person)} // Usando la función openDrawer
                        >
                            Asignar Servicio
                        </Button>
                    </div>
                );
            },
        }
        
    ]

    const columnsTable2 : ColumnDef<Service>[] = [
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
    ]

    const { Tr, Th, Td, THead, TBody, Sorter } = Table

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedPerson(null) // Limpiar selección
    }

    const handleAssignServices = async () => {
        if (selectedPerson && selectedServiceIds.length > 0) {
            const personRef = doc(db, 'Usuarios', selectedPerson.uid);
    
            try {
                await updateDoc(personRef, {
                    servicios: selectedServiceIds, // Actualiza el campo "servicios" en el taller seleccionado
                });
    
                setDrawerIsOpen(false); // Cierra el drawer después de la asignación
                
                const toastNotification = (
                    <Notification title="Éxito">
                        Servicios asignados correctamente al taller {selectedPerson.nombre}.
                    </Notification>
                );
                toast.push(toastNotification); // Muestra la notificación
    
                // Establece un temporizador para recargar la página después de 3 segundos (3000 ms)
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
    
            } catch (error) {
                console.error('Error al asignar servicios:', error);
    
                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error asignando los servicios.
                    </Notification>
                );
                toast.push(errorNotification); // Muestra la notificación de error
            }
        } else {
            const warningNotification = (
                <Notification title="Advertencia">
                    Seleccione al menos un servicio.
                </Notification>
            );
            toast.push(warningNotification); // Muestra la notificación de advertencia
        }
    };    

    const handleServiceSelection = (serviceId: string) => {
        setSelectedServiceIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(serviceId)) {
                // Si el servicio ya está seleccionado, lo deselecciona
                return prevSelectedIds.filter(id => id !== serviceId);
            } else {
                // Si no está seleccionado, lo agrega
                return [...prevSelectedIds, serviceId];
            }
        });
    };
    

    const handleDelete = async () => {
        if (selectedPerson) {
            console.log('Eliminando a:', selectedPerson)

            try {
                const userDoc = doc(db, 'Usuarios', selectedPerson.uid)
                await deleteDoc(userDoc)

                const toastNotification = (
                    <Notification title="Éxito">
                        Usuario {selectedPerson.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el usuario:', error)

                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando el usuario.
                    </Notification>
                )
                toast.push(errorNotification)
            } finally {
                setIsOpen(false) // Cerrar diálogo después de la operación
                setSelectedPerson(null) // Limpiar selección
            }
        }
    }

    const table = useReactTable({
        data: dataUsers,
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

    const tableServices = useReactTable({
        data: dataServices,
        columns: columnsTable2,
        state: {
            sorting,
            columnFilters: filtering,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });
    

    // Paginación tabla Talleres
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

    // Paginacióno tabla Servicios

    const [currentPageServices, setCurrentPageServices] = useState(1);
    const rowsPerPageServices = 4; // Número de filas por página para la tabla de servicios

    const startIndexServices = (currentPageServices - 1) * rowsPerPageServices;
    const endIndexServices = startIndexServices + rowsPerPageServices;
    const totalRowsServices = tableServices.getRowModel().rows.length;

    const onPaginationChangeServices = (page: number) => {
        setCurrentPageServices(page);
    };
    

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start">Asignar Servicios a Talleres</h1>
            </div>
            <div>
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
                                                                        (
                                                                            filter,
                                                                        ) =>
                                                                            filter.id ===
                                                                            header.id,
                                                                    )
                                                                    ?.value?.toString() ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleFilterChange(
                                                                    header.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={`Buscar`}
                                                            className="mt-2 p-1 border rounded"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
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
                            .rows.slice(startIndex, endIndex)
                            .map((row) => {
                                return (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <Td key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef
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
                {/* Agregar la paginación */}
                <Pagination
                    onChange={onPaginationChange}
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                />
            </div>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p>
                    ¿Estás seguro de que deseas eliminar a{' '}
                    {selectedPerson?.nombre}?
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Cancelar
                    </Button>
                    <Button 
                    style={{ backgroundColor: '#B91C1C' }}
                    className='text-white hover:opacity-80'
                    onClick={handleDelete}>
                        Eliminar
                    </Button>
                </div>
            </Dialog>

            {/* Drawer para listado de servicios */}
            <Dialog
            width={1000}
            isOpen={drawerIsOpen}
            onClose={() => setDrawerIsOpen(false)}
            className="rounded-md shadow"
        >
            <h2 className="text-xl font-bold p-2">
                Asignar Servicio al Taller: {selectedPerson?.nombre || 'No especificado'}
            </h2>
            <div className="mt-6 overflow-x-auto">
                <Table>
                    <THead>
                        {tableServices.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                <Th>
                                    {/* Columna para el checkbox */}
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            const allServiceIds = tableServices
                                                .getRowModel()
                                                .rows.map((row) => row.original.id);
                                            setSelectedServiceIds(
                                                e.target.checked ? allServiceIds : []
                                            );
                                        }}
                                        checked={
                                            selectedServiceIds.length ===
                                            tableServices.getRowModel().rows.length
                                        }
                                        className={`h-5 w-5 rounded border-2 focus:outline-none appearance-none
                                            ${selectedServiceIds.length === tableServices.getRowModel().rows.length 
                                                ? 'bg-blue-500 border-blue-500' 
                                                : 'bg-white border-gray-300'}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    />
                                    <style>{`
                                        input[type="checkbox"]:checked::before {
                                            content: "✓";
                                            color: white;
                                            font-weight: bold;
                                            position: absolute;
                                            top: 50%;
                                            left: 50%;
                                            transform: translate(-50%, -50%);
                                            font-size: 14px;
                                        }
                                    `}</style>
                                </Th>
                                {headerGroup.headers.map((header) => (
                                    <Th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className: header.column.getCanSort()
                                                        ? 'cursor-pointer select-none'
                                                        : '',
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                <Sorter sort={header.column.getIsSorted()} />
                                                {header.column.getCanFilter() ? (
                                                    <input
                                                        type="text"
                                                        value={
                                                            filtering.find(
                                                                (filter) => filter.id === header.id
                                                            )?.value?.toString() || ''
                                                        }
                                                        onChange={(e) =>
                                                            handleFilterChange(
                                                                header.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={`Buscar`}
                                                        className="mt-2 p-1 border rounded"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : null}
                                            </div>
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>
                    <TBody>
                        {tableServices.getRowModel().rows.slice(startIndexServices, endIndexServices).map((row) => (
                            <Tr key={row.id}>
                                <Td>
                                    <input
                                        type="checkbox"
                                        checked={selectedServiceIds.includes(row.original.id)}
                                        onChange={() => handleServiceSelection(row.original.id)}
                                        className={`h-5 w-5 rounded border-2 focus:outline-none appearance-none
                                            ${selectedServiceIds.includes(row.original.id) 
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    />
                                    <style>{`
                                        input[type="checkbox"]:checked::before {
                                            content: "✓";
                                            color: white;
                                            font-weight: bold;
                                            position: absolute;
                                            top: 50%;
                                            left: 50%;
                                            transform: translate(-50%, -50%);
                                            font-size: 14px;
                                        }
                                    `}</style>
                                </Td>
                                {row.getVisibleCells().map((cell) => (
                                    <Td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </TBody>
                </Table>
                <Pagination
                    onChange={onPaginationChangeServices}
                    currentPage={currentPageServices}
                    totalRows={totalRowsServices}
                    rowsPerPage={rowsPerPageServices}
                />
            </div>

            {/* Botones de acción */}
            <div className="text-right mt-6">
                <Button
                    className="mr-2"
                    variant="default"
                    onClick={() => setDrawerIsOpen(false)}
                >
                    Cancelar
                </Button>
                <Button
                    style={{ backgroundColor: '#000B7E' }}
                    className="text-white hover:opacity-80"
                    onClick={handleAssignServices}
                >
                    Asignar Servicios
                </Button>
            </div>
        </Dialog>

        </>
    )
}

export default Garages
