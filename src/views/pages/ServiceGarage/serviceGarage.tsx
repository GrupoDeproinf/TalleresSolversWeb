import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { Drawer } from '@/components/ui'
import Selec from '@/components/ui/Select'
import Select from 'react-select';
import Checkbox from '@/components/ui/Checkbox'
import type { SyntheticEvent } from 'react'
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
    FaCamera,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    getDoc,
    doc,
    updateDoc,
    Timestamp,
    addDoc,
    where,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Avatar } from '@/components/ui'
import * as Yup from 'yup'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from 'formik'
import { useAppSelector } from '@/store'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/configs/firebaseAssets.config';

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
    nombre_servicio?: string
    descripcion?: string
    precio?: number
    uid_taller?: string
    taller?: string
    uid_servicio: string
    estatus?: boolean
    garantia?: string
    puntuacion?: number
    id?: string
    // Campos para categoría
    uid_categoria?: string
    nombre_categoria?: string
    // Campos para subcategoría
    subcategoria?: []
    typeService?: string
    service_image?: []
    service_image_files?: []
}

type ServiceTemplate = {
    nombre_servicio?: string
    descripcion?: string
    uid_servicio?: string

    // Campos para categoría
    uid_categoria?: string
    nombre_categoria?: string
    // Campos para subcategoría
    subcategoria?: []
    garantia?: string
    precio?: number

    id?: string
}

function serviceTemplateGarageSearchableText(
    s: ServiceTemplate & { typeService?: string },
): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        s.nombre_servicio,
        s.descripcion,
        s.uid_servicio,
        s.uid_categoria,
        s.nombre_categoria,
        s.garantia,
        s.id,
        s.typeService,
    )
    if (s.precio !== undefined && s.precio !== null) {
        parts.push(String(s.precio))
    }
    const subs = s.subcategoria
    if (Array.isArray(subs)) {
        for (const sub of subs) {
            if (sub == null) continue
            if (typeof sub === 'object') {
                const o = sub as Record<string, unknown>
                push(
                    String(o.nombre_subcategoria ?? ''),
                    String(o.nombre ?? ''),
                    String(o.uid_subcategoria ?? ''),
                )
            } else {
                parts.push(String(sub))
            }
        }
    }
    return parts.join(' ').toLowerCase()
}

type Category = {
    nombre?: string
    uid_categoria?: string
    id?: string
}

type Subcategory = {
    nombre?: string
    descripcion?: string
    estatus?: string
    uid_subcategoria?: string
}

const ServiceGarages = () => {
    const [typeService, setTypeService] = useState<string>('local') // Valor predeterminado

    const handleCheckboxChange = (value: string) => {
        setTypeService(value) // Actualiza la selección al valor seleccionado
    }

    const userAuthority = useAppSelector((state) => state.auth.user.authority)
    const loggedInUserId = useAppSelector((state) => state.auth.user.key);
    const loggedInUserName = useAppSelector((state) => state.auth.user.userName);


    const canGoBack = userAuthority?.includes("Admin")

    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [dataCategories, setDataCategories] = useState<Category[]>([])
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>(
        [],
    )
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null,
    ) // Estado para la categoría seleccionada
    const [dataServices, setDataServices] = useState<Service[]>([])
    const [dataServicesTemplate, setDataServicesTemplate] = useState<
        ServiceTemplate[]
    >([])

    const fetchData = async () => {
        try {
            // Consultas para obtener datos
            const garagesQuery = query(collection(db, 'Usuarios'))
            const categoriesQuery = query(collection(db, 'Categorias'))
            const servicesQuery = query(collection(db, 'Servicios'))
            const servicesTemplateQuery = query(
                collection(db, 'ServiciosTemplate'),
            )

            // Ejecutar todas las consultas en paralelo
            const [
                garagesSnapshot,
                categoriesSnapshot,
                servicesSnapshot,
                servicesTemplateSnapshot,
            ] = await Promise.all([
                getDocs(garagesQuery),
                getDocs(categoriesQuery),
                getDocs(servicesQuery),
                getDocs(servicesTemplateQuery),
            ])

            // Procesar los datos obtenidos de las colecciones
            const talleres = garagesSnapshot.docs
                .map((doc) => ({ ...doc.data(), id: doc.id }) as Garage)
                .filter(
                    (garage) =>
                        garage.typeUser === 'Taller' &&
                        garage.subscripcion_actual?.status === 'Aprobado', // Aseguramos que "subscripcion_actual.status" sea "aprobado"
                )
            .sort((a: any, b: any) => {
                // Ordena alfabéticamente por el nombre del taller (puedes ajustar esto según el campo que estés utilizando)
                return a.nombre.localeCompare(b.nombre);
            });


            const categorias = categoriesSnapshot.docs.map(
                (doc) => ({ ...doc.data(), uid_categoria: doc.id }) as Category,
            )
            const servicios = servicesSnapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id }) as Service,
            )
            const serviciosTemplate = servicesTemplateSnapshot.docs.map(
                (doc) =>
                    ({
                        ...doc.data(),
                        uid_servicio: doc.id,
                    }) as ServiceTemplate,
            )

            // Asignar datos a los estados correspondientes
            setDataGarages(talleres)
            setDataCategories(categorias)
            setDataServices(servicios)
            setDataServicesTemplate(serviciosTemplate)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRefresh = async () => {
        await fetchData()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }

    // Función para manejar el cambio de categoría seleccionada
    const handleCategoryChange = async (categoryId: string) => {
        setSelectedCategoryId(categoryId) // Actualiza el estado con el ID de la categoría seleccionada

        if (!categoryId) {
            setDataSubcategories([]) // Limpiar subcategorías si no se selecciona ninguna categoría
            return
        }

        try {
            // Realiza la consulta para obtener las subcategorías de la categoría seleccionada
            const subcategoriesQuery = query(
                collection(db, 'Categorias', categoryId, 'Subcategorias'),
            )
            const subcategoriesSnapshot = await getDocs(subcategoriesQuery)

            // Procesar los documentos de subcategorías
            const subcategorias = subcategoriesSnapshot.docs.map((doc) => ({
                ...doc.data(),
                uid_subcategoria: doc.id,
                nombre_subcategoria: doc.data().nombre,
            }))

            // Asignar las subcategorías al estado correspondiente
            setDataSubcategories(subcategorias)
        } catch (error) {
            console.error('Error fetching subcategorias:', error)
            setDataSubcategories([]) // Limpiar subcategorías en caso de error
        }
    }

    const [selectedServiceTemplate, setSelectedServiceTemplate] =
        useState<ServiceTemplate | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [newService, setNewService] = useState<Service | null>({
        nombre_servicio: '',
        descripcion: '',
        uid_categoria: '',
        nombre_categoria: '',
        subcategoria: [],
        precio: 0,
        uid_servicio: '',
        typeService: '',

        estatus: true,
        garantia: '',
        service_image: [], // Asegúrate de que sea un array vacío
        service_image_files: [],
    })

    // Esquema de validación con Yup
    const validationSchema = Yup.object({
        nombre_servicio: Yup.string()
            .required('El nombre del servicio es obligatorio.')
            .min(3, 'El nombre del servicio debe tener al menos 3 caracteres.'),
        descripcion: Yup.string()
            .required('La descripción es obligatoria.')
            .min(10, 'La descripción debe tener al menos 10 caracteres.'),
        uid_categoria: Yup.string().required('La categoría es obligatoria.'),
        subcategoria: Yup.array()
            .min(1, 'Debes elegir al menos una subcategoría') // Asegura que haya al menos una subcategoría seleccionada
            .required('Las subcategorías son obligatorias.'),
        uid_taller: Yup.string().required('El negocio es obligatorio.'),
        precio: Yup.number()
            .required('El precio es obligatorio.')
            .positive('El precio debe ser un valor positivo.')
            .typeError('El precio debe ser un número.'),
        garantia: Yup.string().required('La garantía es obligatoria.'),
        typeService: Yup.string().required(
            'Debe seleccionar un tipo de servicio',
        ),
    })

    const handleCreateService = async (values: any) => {
        console.log('Valores enviados a handleCreateService: ', values); // Verifica aquí
        try {
            // Obtener referencia al taller
            const tallerRef = doc(db, 'Usuarios', values.uid_taller);
            const tallerSnapshot = await getDoc(tallerRef);
    
            if (!tallerSnapshot.exists()) {
                toast.push(
                    <Notification title="Error">
                        El negocio seleccionado no existe.
                    </Notification>
                );
                return;
            }
    
            const tallerData = tallerSnapshot.data();
            const cantidadServicios = tallerData.subscripcion_actual?.cantidad_servicios;
    
            if (cantidadServicios <= 0) {
                toast.push(
                    <Notification title="Error">
                        Este negocio no tiene más servicios disponibles para crear.
                    </Notification>
                );
                return;
            }
    
            // Crear el servicio inicialmente sin service_image (array vacío)
            const userRef = collection(db, 'Servicios');
            const docRef = await addDoc(userRef, {
                nombre_servicio: values.nombre_servicio,
                descripcion: values.descripcion,
                nombre_categoria: values.nombre_categoria,
                uid_categoria: values.uid_categoria,
                subcategoria: values.subcategoria,
                precio: values.precio,
                uid_taller: values.uid_taller,
                taller: values.taller,
                uid_servicio: '', // Inicialmente vacío
                garantia: values.garantia,
                typeService: values.typeService,
                estatus: true,
                service_image: [], // Guardar como un array vacío para las imágenes
            });
    
            const serviceId = docRef.id;
    
            // Obtener las imágenes seleccionadas (array de archivos)
            const serviceImages = values.service_image_files;
            console.log('Aquí están las imagenes: ',serviceImages)
    
            if (!serviceImages || serviceImages.length === 0) {
                toast.push(
                    <Notification title="Error">
                        Debes seleccionar al menos una imagen.
                    </Notification>
                );
                return;
            }
    
            // Subir todas las imágenes al Storage y obtener las URLs
            const imageUrls: string[] = [];
            for (let i = 0; i < serviceImages.length; i++) {
                const file = serviceImages[i];
                const fileType = file.name.split('.').pop()?.toLowerCase();
    
                // Validar tipo de archivo
                if (!fileType || !['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                    toast.push(
                        <Notification title="Error">
                            Tipo de archivo no soportado. Solo se permiten imágenes.
                        </Notification>
                    );
                    return;
                }
    
                // Subir la imagen al Storage
                const storageRef = ref(storage, `service_images/${serviceId}_${i + 1}.${fileType}`);
                await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(storageRef);
    
                // Guardar la URL en el array
                imageUrls.push(downloadUrl);
            }
    
            // Actualizar Firestore con las URLs de las imágenes
            await updateDoc(docRef, {
                uid_servicio: serviceId,
                service_image: imageUrls, // Guardar todas las URLs de las imágenes
            });
    
            // Reducir cantidad de servicios del taller
            await updateDoc(tallerRef, {
                'subscripcion_actual.cantidad_servicios': cantidadServicios - 1,
            });
    
            // Notificar éxito
            toast.push(
                <Notification title="Éxito">
                    Servicio creado con éxito.
                </Notification>
            );
    
            // Resetear el formulario
            setNewService({
                nombre_servicio: '',
                descripcion: '',
                uid_servicio: '',
                uid_categoria: '',
                nombre_categoria: '',
                subcategoria: [],
                precio: 0,
                uid_taller: '',
                taller: '',
                garantia: '',
                typeService: '',
                estatus: true,
                service_image: [], // Reiniciar imágenes
                service_image_files: [], // Reiniciar archivos
            });
    
            setDrawerCreateIsOpen(false);
            setDrawerIsOpen(false);
            fetchData(); // Actualizar la lista de servicios
    
        } catch (error) {
            console.error('Error creando Servicio:', error);
            toast.push(
                <Notification title="Error">
                    Hubo un error al crear el Servicio.
                </Notification>
            );
        }
    };
        

    const openCreateDrawer = () => {
        setSelectedServiceTemplate(null) // No selecciona ningún template
        setNewService({
            nombre_servicio: '',
            descripcion: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            precio: 0,
            uid_servicio: '',
            garantia: '',
            typeService: '',
        })
        setDrawerIsOpen(true)
    }

    const openEditDrawer = (serviceTemplate: ServiceTemplate) => {
        setSelectedServiceTemplate(serviceTemplate)
        setNewService({
            nombre_servicio: serviceTemplate.nombre_servicio || '',
            descripcion: serviceTemplate.descripcion || '',
            uid_categoria: serviceTemplate.uid_categoria || '',
            nombre_categoria: serviceTemplate.nombre_categoria || '',
            subcategoria: serviceTemplate.subcategoria || [],
            precio: serviceTemplate.precio || 0,
            uid_servicio: serviceTemplate.uid_servicio || '',
            garantia: serviceTemplate.garantia || '',
        })
        setDrawerIsOpen(true)
    }

    const [filtering, setFiltering] = useState<ColumnFiltersState>([])

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const columns: ColumnDef<ServiceTemplate>[] = [
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
                const subcategories = row.original.subcategoria

                // Asegurarse de que subcategories sea un arreglo
                if (
                    !Array.isArray(subcategories) ||
                    subcategories.length === 0
                ) {
                    return <span>No posee</span> // Si no tiene subcategorías, muestra "No posee"
                }

                return (
                    <ul>
                        {subcategories.map((sub: any) => (
                            <li key={sub.uid_subcategoria}>
                                {sub.nombre_subcategoria}
                            </li>
                        ))}
                    </ul>
                )
            },
        },
        {
            header: 'Garantía',
            accessorKey: 'garantia',
        },
        {
            header: 'Precio',
            accessorKey: 'precio',
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

    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const table = useReactTable({
        data: dataServicesTemplate,
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
            return serviceTemplateGarageSearchableText(
                row.original as ServiceTemplate & { typeService?: string },
            ).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // console.log('Datos de servicios antes de renderizar:', dataServicesTemplate) // Verifica el estado de los datos

    // Paginación tabla Servicios Template
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

    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false) // Usar el estado correcto para cerrar el Drawer
    }

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-[#000B7E]">
                        Asignar Servicios a Negocios
                    </h1>
                    <button
                        type="button"
                        title="Actualizar datos desde el servidor"
                        aria-label="Actualizar datos desde el servidor"
                        onClick={handleRefresh}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#000B7E] shadow-sm transition hover:border-[#000B7E]/35 hover:bg-[#000B7E]/5 active:scale-[0.98]"
                    >
                        <HiOutlineRefresh className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex flex-wrap items-end justify-end gap-3">
                    <div className="w-full min-w-[12rem] max-w-sm shrink-0 sm:w-80">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            Buscar en la tabla
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nombre, descripción, categoría, subcategorías, garantía, precio…"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className="h-10 w-40 shrink-0 text-sm text-white hover:opacity-80"
                        onClick={openCreateDrawer}
                    >
                        Crear Servicio
                    </Button>
                </div>
            </div>
            <div className="p-3 rounded-lg shadow">
                <Table className="w-full  rounded-lg">
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
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            </div>
            {/* Drawer para crear un servicio en base a la plantilla */}
            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerCloseEdit}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Servicio</h2>
                <Formik
                    initialValues={{
                        nombre_servicio: newService?.nombre_servicio || '',
                        descripcion: newService?.descripcion || '',
                        uid_categoria: newService?.uid_categoria || '',
                        nombre_categoria: newService?.nombre_categoria || '',
                        service_image: [],
                        service_image_files: [],
                        uid_taller:
                        userAuthority === 'Admin'
                            ? newService?.uid_taller || ''
                            : loggedInUserId,
                        taller:
                            userAuthority === 'Admin'
                                ? newService?.taller || ''
                                : loggedInUserName, // Usa el nombre del usuario logueado
                        precio: newService?.precio || '',
                        garantia: newService?.garantia || '',
                        typeService: 'local',

                        subcategoria: newService?.subcategoria || [],
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleCreateService}
                >
                    {({
                        values,
                        handleChange,
                        setFieldValue,
                        errors,
                        touched,
                    }) => (
                        <Form className="flex flex-col space-y-6">
                                <div className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
    <div className="text-center">
        {Array.isArray(values.service_image) && values.service_image.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
                {values.service_image.map((img: string, index: number) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-32 object-cover rounded-md"
                    />
                ))}
            </div>
        ) : (
            <FaCamera className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        )}
        <div className="mt-4 flex flex-col text-sm leading-6 text-gray-600 justify-center">
            <label
                htmlFor="images-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
            >
                <span>Agregar otra imagen</span>
                <input
                    id="images-upload"
                    name="images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newImages = files.map((file) => URL.createObjectURL(file));

                        // Actualizamos los valores en Formik
                        setFieldValue("service_image", [
                            ...(values.service_image || []),
                            ...newImages,
                        ]);
                        setFieldValue("service_image_files", [
                            ...(values.service_image_files || []),
                            ...files,
                        ]);
                    }}
                />
            </label>
            {values.service_image_files?.length === 0 && (
                <p className="text-red-600 mt-2">Debes seleccionar al menos una imagen.</p>
            )}
        </div>
    </div>
</div>



                            {/* Nombre del Servicio */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Nombre Servicio:
                                </span>
                                <Field
                                    type="text"
                                    name="nombre_servicio"
                                    value={values.nombre_servicio}
                                    onChange={handleChange}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                                <ErrorMessage
                                    name="nombre_servicio"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </label>
                            {canGoBack && (
    <div>
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Negocio:</span>
            <div className="relative">
                <Select
                    name="uid_taller"
                    options={dataGarages.map((garage) => ({
                        label: garage.nombre,
                        value: garage.uid,
                    }))}
                    value={
                        dataGarages
                            .map((garage) => ({
                                label: garage.nombre,
                                value: garage.uid,
                            }))
                            .find((option) => option.value === values.uid_taller) || null
                    }
                    onChange={(selectedOption) => {
                        const selectedTaller = dataGarages.find(
                            (garage) => garage.uid === selectedOption?.value
                        );
                        setFieldValue('uid_taller', selectedOption?.value || '');
                        setFieldValue('taller', selectedTaller?.nombre || '');
                    }}
                    placeholder="Buscar negocio..."
                    className="w-full mt-1 p-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    isClearable={true}
                    isSearchable={true}  // Asegúrate de que tu Select soporte búsqueda
                />
            </div>

            <ErrorMessage
                name="uid_taller"
                component="div"
                className="text-red-600 text-sm"
            />
        </label>
    </div>
)}

                            {/* TypeService */}
                            <div className="flex flex-col space-y-4">
                                <span className="font-semibold text-gray-700">
                                    Tipo de Servicio:
                                </span>
                                <div className="flex items-center space-x-10">
                                    <label className="flex items-center space-x-2">
                                        <Field
                                            type="radio"
                                            name="typeService"
                                            value="local"
                                            className="form-radio"
                                        />
                                        <span>En el Local</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <Field
                                            type="radio"
                                            name="typeService"
                                            value="domicilio"
                                            className="form-radio"
                                        />
                                        <span>A Domicilio</span>
                                    </label>
                                </div>
                                <ErrorMessage
                                    name="typeService"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </div>

                            {/* Categoría */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Categoría:
                                </span>
                                <Field
                                    as="select"
                                    name="uid_categoria"
                                    value={values.uid_categoria}
                                    onChange={(e: any) => {
                                        const selectedId = e.target.value
                                        const selectedCat = dataCategories.find(
                                            (cat) =>
                                                cat.uid_categoria ===
                                                selectedId,
                                        )
                                        setFieldValue(
                                            'uid_categoria',
                                            selectedId,
                                        )
                                        setFieldValue(
                                            'nombre_categoria',
                                            selectedCat?.nombre || '',
                                        ) // Almacena el nombre de la categoría
                                        setFieldValue('subcategoria', []) // Reset subcategorías
                                        handleCategoryChange(selectedId)
                                    }}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <option value="">
                                        Seleccione una categoría
                                    </option>
                                    {dataCategories.map((category) => (
                                        <option
                                            key={category.uid_categoria}
                                            value={category.uid_categoria}
                                        >
                                            {category.nombre}
                                        </option>
                                    ))}
                                </Field>

                                <ErrorMessage
                                    name="uid_categoria"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </label>

                            {/* Subcategorías */}
                            <label className="font-semibold text-gray-700">
                                Subcategorías:
                            </label>
                            <Select
                                isMulti
                                placeholder="Selecciona subcategorías"
                                noOptionsMessage={() =>
                                    'No hay Subcategorías disponibles'
                                }
                                options={
                                    values.uid_categoria
                                        ? dataSubcategories.map(
                                              (subcategory) => ({
                                                  value: subcategory.uid_subcategoria,
                                                  label: subcategory.nombre,
                                              }),
                                          )
                                        : []
                                }
                                value={values.subcategoria.map(
                                    (subcat: any) => ({
                                        value: subcat.uid_subcategoria,
                                        label: subcat.nombre_subcategoria,
                                    }),
                                )}
                                onChange={(selectedOptions) =>
                                    setFieldValue(
                                        'subcategoria',
                                        selectedOptions.map((option) => ({
                                            uid_subcategoria: option.value,
                                            nombre_subcategoria: option.label,
                                        })),
                                    )
                                }
                                className="mt-1"
                            />

                            {/* Descripción */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Descripción:
                                </span>
                                <Field
                                    as="textarea"
                                    name="descripcion"
                                    value={values.descripcion}
                                    onChange={handleChange}
                                    rows={1}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                                    style={{
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                    }}
                                    onInput={(e: any) => {
                                        e.target.style.height = 'auto'
                                        e.target.style.height = `${e.target.scrollHeight}px`
                                    }}
                                />
                                <ErrorMessage
                                    name="descripcion"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </label>

                            {/* Precio */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Precio:
                                </span>
                                <Field
                                    type="text"
                                    name="precio"
                                    value={values.precio}
                                    onChange={handleChange}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                                <ErrorMessage
                                    name="precio"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </label>

                            {/* Garantía */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Garantía:
                                </span>
                                <Field
                                    type="text"
                                    name="garantia"
                                    value={values.garantia}
                                    onChange={handleChange}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                                <ErrorMessage
                                    name="garantia"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </label>

                            {/* Botones */}
                            <div className="text-right mt-6">
                                <Button
                                    variant="default"
                                    onClick={handleDrawerCloseEdit}
                                    className="mr-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
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

export default ServiceGarages
