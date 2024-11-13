import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { Drawer } from '@/components/ui'
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
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
    FaStar,
    FaStarHalfAlt,
    FaTrash,
    FaEdit,
} from 'react-icons/fa'
import { collection, getDocs, query, getDoc, doc, updateDoc, Timestamp, addDoc, where } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Avatar } from '@/components/ui'

type Garage = {
    nombre?: string
    email?: string
    rif?: string
    phone?: string
    uid: string
    typeUser?: string
    servicios?: string[]
    id?: string
    status?: string
    subscripcion_actual?: subscricion
}

type subscricion = {
    cantidad_servicios?: string
    monto?: string
    nombre?: string
    status?: string
    fecha_fin?: Timestamp
    fecha_inicio?: Timestamp
    vigencia?: string
    uid?: string
}

type Service = {
    nombre?: string
    descripcion?: string
    precio?: string
    uid_taller?: string,
    taller?: string,
    uid_servicio: string
    estatus?: boolean,
    garantia?: string,
    puntuacion?: number,
    id?: string
    // Campos para categoría
    uid_categoria?: string
    nombre_categoria?: string
    // Campos para subcategoría
    subcategoria?: []
}

type ServiceTemplate = {
    nombre?: string
    descripcion?: string
    uid_servicio?: string
    
    // Campos para categoría
    uid_categoria?: string
    nombre_categoria?: string
    // Campos para subcategoría
    subcategoria?: []
    garantia?: string,


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

const ServiceGarages = () => {

    const [dataGarages, setDataGarages] = useState<Garage[]>([]);
  const [dataCategories, setDataCategories] = useState<Category[]>([]);
  const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); // Estado para la categoría seleccionada
  const [dataServices, setDataServices] = useState<Service[]>([]);
  const [dataServicesTemplate, setDataServicesTemplate] = useState<ServiceTemplate[]>([]);

  const fetchData = async () => {
    try {
      // Consultas para obtener datos
      const garagesQuery = query(collection(db, 'Usuarios'));
      const categoriesQuery = query(collection(db, 'Categorias'));
      const servicesQuery = query(collection(db, 'Servicios'));
      const servicesTemplateQuery = query(collection(db, 'ServiciosTemplate'));

      // Ejecutar todas las consultas en paralelo
      const [garagesSnapshot, categoriesSnapshot, servicesSnapshot, servicesTemplateSnapshot] = await Promise.all([
        getDocs(garagesQuery),
        getDocs(categoriesQuery),
        getDocs(servicesQuery),
        getDocs(servicesTemplateQuery),
      ]);

      // Procesar los datos obtenidos de las colecciones
      const talleres = garagesSnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id } as Garage))
        .filter((garage) => garage.typeUser === 'Taller');

      const categorias = categoriesSnapshot.docs.map((doc) => ({ ...doc.data(), uid_categoria: doc.id } as Category));
      const servicios = servicesSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Service));
      const serviciosTemplate = servicesTemplateSnapshot.docs.map((doc) => ({ ...doc.data(), uid_servicio: doc.id } as ServiceTemplate));

      // Asignar datos a los estados correspondientes
      setDataGarages(talleres);
      setDataCategories(categorias);
      setDataServices(servicios);
      setDataServicesTemplate(serviciosTemplate);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Se ejecuta solo una vez cuando el componente se monta

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


    const [selectedServiceTemplate, setSelectedServiceTemplate] = useState<ServiceTemplate | null>(null);
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const [newService, setNewService] = useState<Service | null>({
        nombre: '',
        descripcion: '',
        uid_categoria: '',
        nombre_categoria: '',
        subcategoria: [],
        precio: '',
        uid_servicio: '',

        estatus: true,
        garantia: '',
        puntuacion: 0,
    });
    
    const handleCreateService = async () => {
        if (
            newService &&
            newService.nombre &&
            newService.descripcion &&
            newService.nombre_categoria &&
            newService.uid_categoria
        ) {
            try {
                const userRef = collection(db, 'Servicios');
                
                // Añadir el documento y guardar su referencia
                const docRef = await addDoc(userRef, {
                    nombre: newService.nombre,
                    descripcion: newService.descripcion,
                    nombre_categoria: newService.nombre_categoria,
                    uid_categoria: newService.uid_categoria,
                    subcategoria: newService.subcategoria,
                    precio: newService.precio,
                    uid_taller: newService.uid_taller,
                    taller: newService.taller,
                    uid_servicio: '', // Inicialmente vacío
                    garantia: newService.garantia,
                    estatus: true,
                    puntuacion: newService.puntuacion || 0,
                });
                
                // Actualizar el campo uid_servicio con el ID del documento recién creado
                await updateDoc(docRef, {
                    uid_servicio: docRef.id,
                });

                toast.push(
                    <Notification title="Éxito">
                        Servicio creado con éxito.
                    </Notification>
                );

                setNewService({
                    nombre: '',
                    descripcion: '',
                    uid_servicio: '',
                    uid_categoria: '',
                    nombre_categoria: '',
                    subcategoria: [],
                    precio: '',
                    uid_taller: '',
                    taller: '',
                    garantia: '',
                    estatus: true,
                    puntuacion: 0,
                });

                setDrawerCreateIsOpen(false);
                setDrawerIsOpen(false);
                fetchData(); // Llamada a fetchData para refrescar los servicios
            } catch (error) {
                console.error('Error creando Servicio:', error);
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el Servicio.
                    </Notification>
                );
            }
        } else {
            toast.push(
                <Notification title="Error">
                    Por favor, complete todos los campos requeridos.
                </Notification>
            );
        }
    };

    const openCreateDrawer = () => {
        setSelectedServiceTemplate(null); // No selecciona ningún template
        setNewService({
            nombre: '',
            descripcion: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            precio: '',
            uid_servicio: '',
            garantia: '',
        });
        setDrawerIsOpen(true);
    };
    
    const openEditDrawer = (serviceTemplate: ServiceTemplate) => {
        setSelectedServiceTemplate(serviceTemplate);
        setNewService({
            nombre: serviceTemplate.nombre || '',
            descripcion: serviceTemplate.descripcion || '',
            uid_categoria: serviceTemplate.uid_categoria || '',
            nombre_categoria: serviceTemplate.nombre_categoria || '',
            subcategoria: serviceTemplate.subcategoria || [],
            precio: '',
            uid_servicio: serviceTemplate.uid_servicio || '',
            garantia: serviceTemplate.garantia || '',
            puntuacion: 0,
        });
        setDrawerIsOpen(true);
    };
    
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])

    const handleFilterChange = (columnId: string, value: string) => {
        setFiltering((prev) => {
            const newFilters = prev.filter((filter) => filter.id !== columnId)
            if (value !== '') {
                newFilters.push({ id: columnId, value })
            }
            return newFilters
        })
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
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="text-white hover:opacity-80"
                            onClick={() => openEditDrawer(person)} // Usando la función openEditDrawer
                        >
                            Usar Plantilla
                        </Button>
                    </div>
                )
            },
        },
    ]

    const { Tr, Th, Td, THead, TBody, Sorter } = Table


    /*const [maxServices, setMaxServices] = useState(0); // Límite de servicios del taller
    const [assignedServices, setAssignedServices] = useState<string[]>([]); // Servicios ya asignados
    const [remainingServices, setRemainingServices] = useState(0); // Servicios restantes

     // Carga el límite de servicios y servicios actuales cuando se selecciona el taller
    useEffect(() => {
        const loadServiceLimits = async () => {
            if (selectedPerson) {
                const personRef = doc(db, 'Usuarios', selectedPerson.uid);
                const docSnap = await getDoc(personRef);
                const personData = docSnap.data() as Garage;

                const fetchedMaxServices = Number(personData.subscripcion_actual?.cantidad_servicios) || 0;
                const currentServices = personData.servicios || [];

                setMaxServices(fetchedMaxServices);
                setAssignedServices(currentServices);
                setRemainingServices(fetchedMaxServices - currentServices.length);
            }
        };

        loadServiceLimits();
    }, [selectedPerson]);

    const handleAssignServices = async () => {
        if (!selectedPerson) {
            const warningNotification = (
                <Notification title="Advertencia">
                    Selecciona un taller antes de asignar servicios.
                </Notification>
            );
            toast.push(warningNotification);
            return;
        }

        if (selectedServiceIds.length > maxServices) {
            const warningNotification = (
                <Notification title="Advertencia">
                    Has seleccionado más servicios de los permitidos por la suscripción actual
                    (Máximo: {maxServices} servicios).
                </Notification>
            );
            toast.push(warningNotification);
            return;
        }

        const personRef = doc(db, 'Usuarios', selectedPerson.uid);

        try {
            await updateDoc(personRef, {
                servicios: selectedServiceIds,
            });

            setDrawerIsOpen(false);

            const toastNotification = (
                <Notification title="Éxito">
                    Servicios asignados correctamente al taller {selectedPerson.nombre}.
                </Notification>
            );
            toast.push(toastNotification);

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
            toast.push(errorNotification);
        }
    };

    // Actualizar remainingServices al seleccionar o deseleccionar servicios
    useEffect(() => {
        setRemainingServices(Math.max(0, maxServices - selectedServiceIds.length));
    }, [selectedServiceIds, maxServices]);



    const handleServiceSelection = (serviceId: string) => {
        setSelectedServiceIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(serviceId)) {
                // Si el servicio ya está seleccionado, lo deselecciona
                return prevSelectedIds.filter((id) => id !== serviceId)
            } else {
                // Si no está seleccionado, lo agrega
                return [...prevSelectedIds, serviceId]
            }
        })
    } */

    const [sorting, setSorting] = useState<ColumnSort[]>([])
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


    // Paginación tabla Servicios Template
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

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)

    const handleDrawerClose = (e: MouseEvent) => {
        // console.log('Drawer cerrado', e);
        setDrawerCreateIsOpen(false); // Cierra el Drawer
        setNewService({ // Limpia los campos de usuario
            nombre: '',
            descripcion: '',
            id: '',
            uid_servicio: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            taller: '',
            precio: '',
            puntuacion: 0,
            garantia: '',
        });
        setSelectedServiceTemplate(null); // Limpia la selección (si es necesario)
    }

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e);
        setDrawerIsOpen(false); // Usar el estado correcto para cerrar el Drawer
    }
    

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start">
                    Asignar Servicios a Talleres
                </h1>
                <div className="flex justify-end">
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className="text-white hover:opacity-80"
                        onClick={openCreateDrawer} // Abre el Drawer de creación
                    >
                        Crear Servicio
                    </Button>
                </div>
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
            {/* Drawer para crear un servicio en base a la plantilla */}
            <Drawer
    isOpen={drawerIsOpen}
    onClose={handleDrawerCloseEdit}
    className="rounded-md shadow"
>
    <h2 className="mb-4 text-xl font-bold">Crear Servicio</h2>
    <div className="flex flex-col space-y-6">
        {/* Nombre del Servicio */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Nombre Servicio:</span>
            <input
                type="text"
                value={newService?.nombre || ''}
                onChange={(e) =>
                    setNewService((prev: any) => ({
                        ...(prev ?? {}),
                        nombre: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>
        {/* Taller */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Taller:</span>
            <select
                value={newService?.uid_taller || ''}
                onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedCat = dataGarages.find(cat => cat.uid === selectedId);
                    setNewService((prev: any) => ({
                        ...prev,
                        uid_taller: selectedCat?.uid,
                        taller: selectedCat?.nombre,
                    }));
                }}
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
                <option value="">Seleccione un Taller</option>
                {dataGarages.map((garage) => (
                    <option key={garage.uid} value={garage.uid}>
                        {garage.nombre}
                    </option>
                ))}
            </select>
        </label>

        {/* Categoría */}
<label className="flex flex-col">
    <span className="font-semibold text-gray-700">Categoría:</span>
    <select
        value={newService?.uid_categoria || ''}
        onChange={(e) => {
            const selectedId = e.target.value;
            const selectedCat = dataCategories.find(cat => cat.uid_categoria === selectedId);
            
            // Actualizar el estado con la categoría seleccionada
            setNewService((prev: any) => ({
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
        newService?.uid_categoria
            ? dataSubcategories.map((subcategory) => ({
                  value: subcategory.uid_subcategoria,
                  label: subcategory.nombre, // Asegúrate de que el nombre de la subcategoría se muestra aquí
              }))
            : []
    }
    value={newService?.subcategoria?.map((subcat: any) => ({
        value: subcat.uid_subcategoria,
        label: subcat.nombre_subcategoria,
    })) || []} // Asegúrate de que el valor esté correctamente inicializado
    onChange={(selectedOptions) => {
        const selectedSubcategories = selectedOptions.map(option => ({
            uid_subcategoria: option.value,
            nombre_subcategoria: option.label,
        }));

        setNewService((prev: any) => ({
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
                value={newService?.descripcion || ''}
                onChange={(e) => {
                    setNewService((prev: any) => ({
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

        {/* Precio */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Precio:</span>
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
                {/* Garantía del Servicio */}
                <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Garantía:</span>
            <input
                type="text"
                value={newService?.garantia || ''}
                onChange={(e) =>
                    setNewService((prev: any) => ({
                        ...(prev ?? {}),
                        garantia: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>
                {/* Puntuación del Servicio */}
                <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Puntuación:</span>
            <input
                type="text"
                value={newService?.puntuacion || ''}
                onChange={(e) =>
                    setNewService((prev: any) => ({
                        ...(prev ?? {}),
                        puntuacion: parseFloat(e.target.value),
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        <div className="text-right mt-6">
            <Button className="mr-2" variant="default" onClick={handleDrawerCloseEdit}>
                Cancelar
            </Button>
            <Button
                style={{ backgroundColor: '#000B7E' }}
                className="text-white hover:opacity-80"
                onClick={handleCreateService}
            >
                Guardar
            </Button>
        </div>
    </div>
</Drawer>
        </>
    )
}

export default ServiceGarages
