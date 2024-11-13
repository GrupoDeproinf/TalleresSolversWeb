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
import { z } from 'zod'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Drawer } from '@/components/ui'

type ServiceTemplate = {
    nombre?: string
    descripcion?: string
    uid_servicio: string
    
    // Campos para categoría
    uid_categoria?: string
    nombre_categoria?: string
    // Campos para subcategoría
    subcategoria?: []
    garantia?: string


    id?: string
}

type Category = {
    nombre?: string;
    uid_categoria?: string;
    id?: string;
};

type Subcategory = {
    nombre?: string;
    descripcion?: string;
    estatus?: string;
    uid_subcategoria?: string;
};





const Services = () => {

    const [sorting, setSorting] = useState<ColumnSort[]>([]);
const [filtering, setFiltering] = useState<ColumnFiltersState>([]);
const [dialogIsOpen, setIsOpen] = useState(false);
const [selectedServiceTemplate, setSelectedServiceTemplate] = useState<ServiceTemplate | null>(null);
const [drawerIsOpen, setDrawerIsOpen] = useState(false);

const [dataCategories, setDataCategories] = useState<Category[]>([]);
const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>([]);
const [dataServicesTemplate, setDataServicesTemplate] = useState<ServiceTemplate[]>([]);

const getAllData = async () => {
    try {
        // Definir consultas
        const categoriesQuery = query(collection(db, 'Categorias'));
        const servicesQuery = query(collection(db, 'ServiciosTemplate'));

        // Ejecutar consultas en paralelo
        const [categoriesSnapshot, servicesSnapshot] = await Promise.all([
            getDocs(categoriesQuery),
            getDocs(servicesQuery),
        ]);

        // Procesar categorías
        const categories: Category[] = categoriesSnapshot.docs.map((doc) => ({
            ...doc.data(),
            uid_categoria: doc.id,
        })) as Category[];

        // Procesar servicios
        const services: ServiceTemplate[] = servicesSnapshot.docs.map((doc) => ({
            ...doc.data(),
            uid_servicio: doc.id,
        })) as ServiceTemplate[];

        // Actualizar el estado con los datos obtenidos
        setDataCategories(categories);
        setDataServicesTemplate(services);
    } catch (error) {
        console.error('Error obteniendo los datos:', error);
    }
};

useEffect(() => {
    getAllData();
}, []);

const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); // Estado para la categoría seleccionada

// Función para manejar el cambio de categoría seleccionada
const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategoryId(categoryId); // Actualiza el estado con el ID de la categoría seleccionada

    if (!categoryId) {
        setDataSubcategories([]); // Limpiar subcategorías si no se selecciona ninguna categoría
        return;
    }

    try {
        // Realiza la consulta para obtener las subcategorías de la categoría seleccionada
        const subcategoriesQuery = query(collection(db, 'Categorias', categoryId, 'Subcategorias'));
        const subcategoriesSnapshot = await getDocs(subcategoriesQuery);

        // Procesar los documentos de subcategorías
        const subcategorias = subcategoriesSnapshot.docs.map((doc) => ({
            ...doc.data(),
            uid_subcategoria: doc.id,
            nombre_subcategoria: doc.data().nombre,
        }));

        // Asignar las subcategorías al estado correspondiente
        setDataSubcategories(subcategorias);
    } catch (error) {
        console.error('Error fetching subcategorias:', error);
        setDataSubcategories([]); // Limpiar subcategorías en caso de error
    }
};


    const openDialog = (serviceTemplate: ServiceTemplate) => {
        setSelectedServiceTemplate(serviceTemplate)
        setIsOpen(true)
    }
    const openDrawer = (serviceTemplate: ServiceTemplate) => {
        setSelectedServiceTemplate(serviceTemplate)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newServiceTemplate, setNewServiceTemplate] = useState<ServiceTemplate>({
        nombre: '',
        descripcion: '',
        uid_servicio: '',
        uid_categoria: '',
        nombre_categoria: '',
        subcategoria: [],
        id: '',
        garantia: '',
    });

    const handleCreateServiceTemplate = async () => {
        if (
            newServiceTemplate &&
            newServiceTemplate.nombre &&
            newServiceTemplate.descripcion
        ) {
            try {
                const userRef = collection(db, 'ServiciosTemplate');
                const docRef = await addDoc(userRef, {
                    nombre: newServiceTemplate.nombre,
                    descripcion: newServiceTemplate.descripcion,
                    nombre_categoria: newServiceTemplate.nombre_categoria,
                    uid_categoria: newServiceTemplate.uid_categoria,
                    subcategoria: newServiceTemplate.subcategoria, // Guarda el array de subcategorías seleccionadas
                    uid_servicio: '', // Inicialmente vacío
                    garantia: newServiceTemplate.garantia,
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
                setNewServiceTemplate({
                    nombre: '',
                    descripcion: '',
                    uid_servicio: '',
                    uid_categoria: '',
                    nombre_categoria: '',
                    subcategoria: [],
                    id: '',
                    garantia: '',
                });
    
                setDrawerCreateIsOpen(false); // Cierra el Drawer después de crear el servicio
                getAllData(); // Refresca la lista de servicios
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
    if (selectedServiceTemplate) {
        try {
            // Obtiene el documento del servicio para actualizar
            const userDoc = doc(db, 'ServiciosTemplate', selectedServiceTemplate?.uid_servicio);
            
            // Actualiza el servicio con los nuevos datos, incluyendo la categoría y subcategorías
            await updateDoc(userDoc, {
                nombre: selectedServiceTemplate?.nombre,
                descripcion: selectedServiceTemplate?.descripcion,
                uid_categoria: selectedServiceTemplate?.uid_categoria, // Asegura que se guarde la categoría seleccionada
                nombre_categoria: selectedServiceTemplate?.nombre_categoria, // Nombre de la categoría
                subcategoria: selectedServiceTemplate?.subcategoria || [], // Subcategorías seleccionadas
                garantia: selectedServiceTemplate?.garantia,
            });

            // Notificación de éxito
            toast.push(
                <Notification title="Éxito">
                    Servicio actualizado con éxito.
                </Notification>,
            );

            setDrawerIsOpen(false); // Cierra el Drawer
            getAllData(); // Refresca los datos

        } catch (error) {
            console.error('Error actualizando el servicio:', error);

            // Notificación de error
            toast.push(
                <Notification title="Error">
                    Hubo un error al actualizar el servicio.
                </Notification>,
            );
        }
    }
}


    const columns: ColumnDef<ServiceTemplate>[] = [
        {
            header: 'Nombre del Servicio',
            accessorKey: 'nombre',
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
        
                // Asegurarse de que subcategories sea un arreglo
                if (!Array.isArray(subcategories) || subcategories.length === 0) {
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
            header: 'Garantía',
            accessorKey: 'garantia',
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

    const handleEdit = (service: ServiceTemplate) => {
        console.log('Editando el servicio:', service)
        // Lógica de edición
    }

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedServiceTemplate(null) // Limpiar selección
    }

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e);
        setDrawerCreateIsOpen(false); // Cierra el Drawer
        setNewServiceTemplate({ // Limpia los campos de usuario
            nombre: '',
            descripcion: '',
            id: '',
            uid_servicio: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            garantia: '',
        });
        setSelectedServiceTemplate(null); // Limpia la selección (si es necesario)
    }

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e);
        setDrawerIsOpen(false); // Usar el estado correcto para cerrar el Drawer
    }
    
    const handleDelete = async () => {
        if (selectedServiceTemplate) {
            console.log('Eliminando el servicio:', selectedServiceTemplate)

            try {
                // Ahora estamos usando el id generado automáticamente por Firebase
                const serviceDoc = doc(db, 'ServiciosTemplate', selectedServiceTemplate.uid_servicio)
                await deleteDoc(serviceDoc)

                const toastNotification = (
                    <Notification title="Éxito">
                        Servicio {selectedServiceTemplate.nombre} eliminado con
                        éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getAllData() // Refrescar datos después de eliminar
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
                setSelectedServiceTemplate(null) // Limpiar selección
            }
        }
    }

    const table = useReactTable({
        data: dataServicesTemplate,
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

    // console.log('Datos de servicios antes de renderizar:', dataServicesTemplate) // Verifica el estado de los datos

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

    {/* useEffect para cargar subcategories en base a la categoria seleccionada (para editar) */}
    {/*useEffect(() => {
        if (selectedServiceTemplate?.uid_categoria) {
            getSubcategories(selectedServiceTemplate.uid_categoria);
        }
    }, [selectedServiceTemplate?.uid_categoria, getSubcategories]);*/}

    {/* useEffect para cargar subcategories en base a la categoria seleccionada (para crear) */}
    {/*useEffect(() => {
        if (newServiceTemplate?.uid_categoria) {
            getSubcategories(newServiceTemplate.uid_categoria);
        }
    }, [newServiceTemplate?.uid_categoria, getSubcategories]);*/}

    return (
        <>
            <div>
                <div className="grid grid-cols-2">
                    <h1 className="mb-6 flex justify-start">
                        Plantilla de Servicios
                    </h1>
                    <div className="flex justify-end">
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                        >
                            Crear Plantilla
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
                    {selectedServiceTemplate?.nombre}?
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
    className="rounded-md shadow"
>
    <h2 className="mb-4 text-xl font-bold">Editar Plantilla</h2>
    <div className="flex flex-col space-y-6">
        {/* Nombre del Servicio */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Nombre Servicio:</span>
            <input
                type="text"
                value={selectedServiceTemplate?.nombre || ''}
                onChange={(e) =>
                    setSelectedServiceTemplate((prev: any) => ({
                        ...(prev ?? {}),
                        nombre: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        {/* Categoría */}
<label className="flex flex-col">
    <span className="font-semibold text-gray-700">Categoría:</span>
    <select
        value={selectedServiceTemplate?.uid_categoria || ''}
        onChange={(e) => {
            const selectedId = e.target.value;
            const selectedCat = dataCategories.find(cat => cat.uid_categoria === selectedId);

            // Actualizar el estado con la categoría seleccionada
            setSelectedServiceTemplate((prev: any) => ({
                ...prev,
                uid_categoria: selectedCat?.uid_categoria,
                nombre_categoria: selectedCat?.nombre,
                subcategoria: [], // Limpiar subcategorías al cambiar de categoría
            }));

            // Filtrar subcategorías según la categoría seleccionada
            handleCategoryChange(selectedId); // Asegúrate de que `handleCategoryChange` actualice `dataSubcategories`
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

{/* Subcategorías */}
<label className="font-semibold text-gray-700">Subcategorías:</label>
<Select
    isMulti
    placeholder="Selecciona subcategorías"
    noOptionsMessage={() => "No hay Subcategorías disponibles"}
    options={
        selectedServiceTemplate?.uid_categoria
        ? dataSubcategories.map((subcategory) => ({
            value: subcategory.uid_subcategoria,
            label: subcategory.nombre, // Asegúrate de que el nombre de la subcategoría se muestra aquí
        }))
      : []
    }
    value={selectedServiceTemplate?.subcategoria?.map((subcat: any) => ({
        value: subcat.uid_subcategoria,
        label: subcat.nombre_subcategoria,
    })) || []} // Asegúrate de que el valor esté correctamente inicializado
    onChange={(selectedOptions) => {
        const selectedSubcategories = selectedOptions.map(option => ({
            uid_subcategoria: option.value,
            nombre_subcategoria: option.label,
        }));

        setSelectedServiceTemplate((prev: any) => ({
            ...prev,
            subcategoria: selectedSubcategories,
        }));
    }}
    className="mt-1"
/>
        {/* Descripción */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Descripción:</span>
            <textarea
                value={selectedServiceTemplate?.descripcion || ''}
                onChange={(e) => {
                    setSelectedServiceTemplate((prev: any) => ({
                        ...(prev ?? {}),
                        descripcion: e.target.value,
                    }))
                    e.target.style.height = 'auto'; // Resetea la altura
                    e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta la altura según el contenido
                    }}
                rows={1} // altura inicial
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                style={{
                    maxHeight: '150px', // Límite máximo de altura
                    overflowY: 'auto', // Scroll vertical cuando se excede el límite
                }}
            />
        </label>
        
        {/* Garantía del Servicio */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Garantía:</span>
            <input
                type="text"
                value={selectedServiceTemplate?.garantia || ''}
                onChange={(e) =>
                    setSelectedServiceTemplate((prev: any) => ({
                        ...(prev ?? {}),
                        garantia: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>
        {/* Botones */}
        <div className="text-right mt-6">
            <Button className="mr-2" variant="default" onClick={handleDrawerCloseEdit}>
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
    </div>
</Drawer>


<Drawer
    isOpen={drawerCreateIsOpen}
    onClose={handleDrawerClose}
    className="rounded-md shadow"
>
    <h2 className="mb-4 text-xl font-bold">Crear Plantilla</h2>
    <div className="flex flex-col space-y-6">
        {/* Nombre del Servicio */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Nombre Servicio:</span>
            <input
                type="text"
                value={newServiceTemplate?.nombre || ''}
                onChange={(e) =>
                    setNewServiceTemplate((prev) => ({
                        ...(prev ?? {}),
                        nombre: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        {/* Categoría */}
<label className="flex flex-col">
    <span className="font-semibold text-gray-700">Categoría:</span>
    <select
        value={newServiceTemplate?.uid_categoria || ''}
        onChange={async (e) => {
            const selectedId = e.target.value;
            const selectedCat = dataCategories.find(cat => cat.uid_categoria === selectedId);

            // Actualizar el estado con la categoría seleccionada
            setNewServiceTemplate((prev: any) => ({
                ...prev,
                uid_categoria: selectedCat?.uid_categoria,
                nombre_categoria: selectedCat?.nombre,
                subcategoria: [], // Limpiar subcategorías al cambiar de categoría
            }));
            // Filtrar subcategorías según la categoría seleccionada
            handleCategoryChange(selectedId); // Asegúrate de que `handleCategoryChange` actualice `dataSubcategories`
        
            
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

{/* Subcategorías */}
<label className="font-semibold text-gray-700">Subcategorías:</label>
<Select
    isMulti
    placeholder="Selecciona subcategorías"
    noOptionsMessage={() => "No hay Subcategorías disponibles"}
    options={
        newServiceTemplate?.uid_categoria
            ? dataSubcategories.map((subcategory) => ({
                  value: subcategory.uid_subcategoria,
                  label: subcategory.nombre,
              }))
            : []
    }
    value={newServiceTemplate?.subcategoria?.map((subcat: any) => ({
        value: subcat.uid_subcategoria,
        label: subcat.nombre_subcategoria,
    }))}
    onChange={(selectedOptions) => {
        const selectedSubcategories = selectedOptions.map(option => ({
            uid_subcategoria: option.value,
            nombre_subcategoria: option.label,
        }));
        setNewServiceTemplate((prev: any) => ({
            ...prev,
            subcategoria: selectedSubcategories,
        }));
    }}
    className="mt-1"
/>


        {/* Descripción */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Descripción:</span>
            <textarea
                value={newServiceTemplate?.descripcion || ''}
                onChange={(e) => {
                    setNewServiceTemplate((prev) => ({
                        ...(prev ?? {}),
                        descripcion: e.target.value,
                    }));
                    e.target.style.height = 'auto'; // Resetea la altura
                    e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta la altura según el contenido
                }}
                rows={1} // Altura inicial
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                style={{
                    maxHeight: '150px', // Límite máximo de altura
                    overflowY: 'auto', // Scroll vertical cuando se excede el límite
                }}
            />
        </label>

        {/* Garantía del Servicio */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Garantía:</span>
            <input
                type="text"
                value={newServiceTemplate?.garantia || ''}
                onChange={(e) =>
                    setNewServiceTemplate((prev) => ({
                        ...(prev ?? {}),
                        garantia: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        {/* Botones */}
        <div className="text-right mt-6">
            <Button className="mr-2" variant="default" onClick={handleDrawerClose}>
                Cancelar
            </Button>
            <Button
                style={{ backgroundColor: '#000B7E' }}
                className="text-white hover:opacity-80"
                onClick={handleCreateServiceTemplate}
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
