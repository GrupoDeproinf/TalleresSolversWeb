import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import Select from '@/components/ui/Select';
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
    puntuacion: string
    uid_servicio: string
    
    // Campos para categoría
    uid_categoria: string
    nombre_categoria: string
    // Campos para subcategoría
    subcategoria: []


    id: string
}

type Category = {
    nombre: string;
    uid_categoria: string;
    id: string;
};

type Subcategory = {
    nombre: string;
    descripcion: string;
    estatus: string;
    uid: string;
};





const Services = () => {

    // Obtener Categorías
    const [dataCategories, setDataCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

const getCategories = async () => {
    try {
        const q = query(collection(db, 'Categorias')); // Llamado a categorías
        const querySnapshot = await getDocs(q);
        const categorias: Category[] = [];

        querySnapshot.forEach((doc) => {
            const categoryData = doc.data() as Category;
            // Asignar el id del documento al objeto de categoría
            categorias.push({ ...categoryData, uid_categoria: doc.id });
        });

        console.log('Categorias obtenidas:', categorias); // Verifica los datos obtenidos
        setDataCategories(categorias);
    } catch (error) {
        console.error('Error obteniendo categorias:', error);
    }
};

useEffect(() => {
    getCategories();
}, []);

    // Obtener Subcategorías de las categorías
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

    const getSubcategories = async (uid: string) => {
        try {
            const subcategoriesRef = collection(db, 'Categorias', uid, 'Subcategorias');
            const querySnapshot = await getDocs(subcategoriesRef);
            const subcategorias: Subcategory[] = [];
    
            querySnapshot.forEach((doc) => {
                const subcategoryData = doc.data() as Subcategory;
                subcategorias.push({ ...subcategoryData, uid: doc.id });
            });
    
            console.log('Subcategorias obtenidas:', subcategorias); // Verifica las subcategorías obtenidas
            setDataSubcategories(subcategorias);
        } catch (error) {
            console.error('Error obteniendo subcategorias:', error);
        }
    };
    

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

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newService, setNewService] = useState<Service | null>({
        nombre_servicio: '',
        descripcion: '',
        precio: '',
        uid_servicio: '',
        puntuacion: '',
        uid_categoria: '',
        nombre_categoria: '',
        subcategoria: [],

        id: '',
    })

    const openDialog = (service: Service) => {
        setSelectedService(service)
        setIsOpen(true)
    }
    const openDrawer = (service: Service) => {
        setSelectedService(service)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    const handleCreateService = async () => {
        if (
            newService &&
            newService.nombre_servicio &&
            newService.descripcion
        ) {
            try {
                const userRef = collection(db, 'Servicios');
                const docRef = await addDoc(userRef, {
                    nombre_servicio: newService.nombre_servicio,
                    descripcion: newService.descripcion,
                    precio: newService.precio,
                    puntuacion: newService.puntuacion,
                    nombre_categoria: newService.nombre_categoria,
                    uid_categoria: newService.uid_categoria,
                    subcategoria: newService.subcategoria, // Guarda el array de subcategorías seleccionadas
                    uid_servicio: '', // Inicialmente vacío
                });
    
                // Actualiza el uid_servicio generado
                await updateDoc(docRef, {
                    uid_servicio: docRef.id, // Establece el uid_servicio al ID del documento generado
                });
    
                // Notificación de éxito
                toast.push(
                    <Notification title="Éxito">
                        Servicio creado con éxito.
                    </Notification>,
                );
    
                // Limpia los campos después de crear el servicio
                setNewService({
                    nombre_servicio: '',
                    descripcion: '',
                    precio: '',
                    puntuacion: '',
                    uid_servicio: '',
                    uid_categoria: '',
                    nombre_categoria: '',
                    subcategoria: [],
                    id: '',
                });
    
                setDrawerCreateIsOpen(false); // Cierra el Drawer después de crear el servicio
                getData(); // Refresca la lista de servicios
            } catch (error) {
                console.error('Error creando Servicio:', error);
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el Servicio.
                    </Notification>,
                );
            }
        } else {
            toast.push(
                <Notification title="Error">
                    Por favor, complete todos los campos requeridos.
                </Notification>,
            );
        }
    };
    

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
            header: 'Nombre del Servicio',
            accessorKey: 'nombre_servicio',
        },
        {
            header: 'Descripción',
            accessorKey: 'descripcion',
        },
        {
            header: 'Categoría',
            accessorKey: 'nombre_categoria',
        },
        {
            header: 'Subcategorías',
            accessorKey: 'subcategoria', // Asegúrate de que coincida con el campo de subcategorías en el objeto `Service`
            cell: ({ row }) => {
                const subcategories = row.original.subcategoria;
        
                // Verificar si el servicio tiene subcategorías
                if (!subcategories || subcategories.length === 0) {
                    return <span>No posee</span>; // Si no tiene subcategorías, muestra "No posee"
                }
        
                return (
                    <ul>
                        {subcategories.map((sub: any) => (
                            <li key={sub.uid_subcategoria}>{sub.nombre_subcategoria}</li>
                        ))}
                    </ul>
                );
            },
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
                            className="text-blue-900"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => openDialog(person)}
                            className="text-red-700"
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

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e);
        setDrawerCreateIsOpen(false); // Cierra el Drawer
        setNewService({ // Limpia los campos de usuario
            nombre_servicio: '',
            descripcion: '',
            precio: '',
            puntuacion: '',
            id: '',
            uid_servicio: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
        });
        setSelectedService(null); // Limpia la selección (si es necesario)
    }
    
    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e);
        setDrawerIsOpen(false); // Usar el estado correcto para cerrar el Drawer
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
                    <h1 className="mb-6 flex justify-start">
                        Lista de Servicios
                    </h1>
                    <div className="flex justify-end">
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                        >
                            Crear Servicio
                        </Button>
                    </div>
                </div>
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
                            .rows.slice(
                                (currentPage - 1) * rowsPerPage,
                                currentPage * rowsPerPage,
                            )
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
                    <Button
                        style={{ backgroundColor: '#B91C1C' }}
                        className="text-white hover:opacity-80"
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerCloseEdit}
                className="rounded-md" // Añadir estilo al Drawer
            >
                <h2 className="text-xl font-bold">Editar Servicio</h2>
                <div className="flex flex-col space-y-4">
                    {' '}
                    {/* Aumentar el espacio entre campos */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre Servicio:
                        </span>
                        <input
                            type="text"
                            value={selectedService?.nombre_servicio || ''}
                            onChange={(e) =>
                                setSelectedService((prev: any) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                        id: '',
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
                                setSelectedService((prev: any) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                        id: '',
                                    }),
                                    descripcion: e.target.value,
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
                                setSelectedService((prev: any) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                        id: '',
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
                                setSelectedService((prev: any) => ({
                                    ...(prev ?? {
                                        nombre_servicio: '',
                                        descripcion: '',
                                        taller: '',
                                        precio: '',
                                        uid_servicio: '',
                                        puntuacion: '',
                                        id: '',
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
                        onClick={handleDrawerCloseEdit}
                    >
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className="text-white hover:opacity-80"
                        onClick={handleSaveChanges}
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </Drawer>
            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={handleDrawerClose}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Servicio</h2>
                <div className="flex flex-col space-y-6">
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre Servicio:
                        </span>
                        <input
                            type="text"
                            value={newService?.nombre_servicio || ''}
                            onChange={(e) =>
                                setNewService((prev: any) => ({
                                    ...(prev ?? {}),
                                    nombre_servicio: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
    <span className="font-semibold text-gray-700">Categoría:</span>
    <select
        value={newService?.uid_categoria || ''}
        onChange={(e) => {
            const selectedId = e.target.value;
            const selectedCat = dataCategories.find(cat => cat.uid_categoria === selectedId);
            setNewService((prev: any) => ({
                ...prev,
                uid_categoria: selectedCat?.uid_categoria,
                nombre_categoria: selectedCat?.nombre,
            }));
            if (selectedCat?.uid_categoria) {
                getSubcategories(selectedCat.uid_categoria); // Obtener subcategorías
            }
        }}
        className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
    >
        <option value="">Seleccione una categoría</option>
        {dataCategories.map((category) => (
            <option key={category.uid_categoria} value={category.uid_categoria}>
                {category.nombre}
            </option>
        ))}
    </select>
</label>
<label className="font-semibold text-gray-700">Subcategorías:</label>
<Select
    isMulti
    placeholder="Selecciona subcategorías"
    options={dataSubcategories.map((subcategory) => ({
        value: subcategory.uid,
        label: subcategory.nombre,
    }))}
    onChange={(selectedOptions) => {
        const selectedSubcategories = selectedOptions.map(option => ({
            uid_subcategoria: option.value,
            nombre_subcategoria: option.label,
        }));

        setNewService((prev: any) => ({
            ...prev,
            subcategoria: selectedSubcategories, // Actualiza el estado con las subcategorías seleccionadas
        }));
    }}
    className="mt-1"
/>


                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Descripcion:
                        </span>
                        <input
                            type="text"
                            value={newService?.descripcion || ''}
                            onChange={(e) =>
                                setNewService((prev: any) => ({
                                    ...(prev ?? {}),
                                    descripcion: e.target.value,
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
                            value={newService?.precio || ''}
                            onChange={(e) =>
                                setNewService((prev: any) => ({
                                    ...(prev ?? {}),
                                    precio: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Puntuacion:
                        </span>
                        <input
                            type="text"
                            value={newService?.puntuacion || ''}
                            onChange={(e) =>
                                setNewService((prev: any) => ({
                                    ...(prev ?? {}),
                                    puntuacion: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="default"
                            onClick={handleDrawerClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={handleCreateService} // Llamar a la función para crear usuario
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Services
