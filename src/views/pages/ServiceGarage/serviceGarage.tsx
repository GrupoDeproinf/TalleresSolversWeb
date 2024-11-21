import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import { Drawer } from '@/components/ui'
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
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
    FaStar,
    FaStarHalfAlt,
    FaTrash,
    FaEdit,
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
    precio?: string
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

    id?: string
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
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [dataCategories, setDataCategories] = useState<Category[]>([])
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>(
        [],
    )
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre_servicio')
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
        precio: '',
        uid_servicio: '',

        estatus: true,
        garantia: '',
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
        uid_taller: Yup.string().required('El taller es obligatorio.'),
        precio: Yup.number()
            .required('El precio es obligatorio.')
            .positive('El precio debe ser un valor positivo.')
            .typeError('El precio debe ser un número.'),
        garantia: Yup.string().required('La garantía es obligatoria.'),
    })

    const handleCreateService = async (values: any) => {
        try {
            // Obtener los datos del taller seleccionado
            const tallerRef = doc(db, 'Usuarios', values.uid_taller) // Obtener referencia al taller
            const tallerSnapshot = await getDoc(tallerRef)

            if (!tallerSnapshot.exists()) {
                toast.push(
                    <Notification title="Error">
                        El taller seleccionado no existe.
                    </Notification>,
                )
                return
            }

            const tallerData = tallerSnapshot.data()
            console.log('Datos a guardar: ', values);

            // Verificar si la cantidad de servicios disponibles es mayor que 0
            const cantidadServicios =
                tallerData.subscripcion_actual?.cantidad_servicios

            if (cantidadServicios <= 0) {
                toast.push(
                    <Notification title="Error">
                        Este taller no tiene más servicios disponibles para
                        crear.
                    </Notification>,
                )
                return
            }

            // Crear el servicio en la colección "Servicios"
            const userRef = collection(db, 'Servicios')
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
                estatus: true,
            })

            // Actualizar el campo uid_servicio con el ID del documento recién creado
            await updateDoc(docRef, {
                uid_servicio: docRef.id,
            })

            // Reducir la cantidad de servicios en la subscripción del taller
            await updateDoc(tallerRef, {
                'subscripcion_actual.cantidad_servicios': cantidadServicios - 1,
            })

            toast.push(
                <Notification title="Éxito">
                    Servicio creado con éxito.
                </Notification>,
            )

            // Resetear el formulario después de crear el servicio
            setNewService({
                nombre_servicio: '',
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
            })

            setDrawerCreateIsOpen(false)
            setDrawerIsOpen(false)
            fetchData() // Llamada a fetchData para refrescar los servicios
        } catch (error) {
            console.error('Error creando Servicio:', error)
            toast.push(
                <Notification title="Error">
                    Hubo un error al crear el Servicio.
                </Notification>,
            )
        }
    }

    const openCreateDrawer = () => {
        setSelectedServiceTemplate(null) // No selecciona ningún template
        setNewService({
            nombre_servicio: '',
            descripcion: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            precio: '',
            uid_servicio: '',
            garantia: '',
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
            precio: '',
            uid_servicio: serviceTemplate.uid_servicio || '',
            garantia: serviceTemplate.garantia || '',
        })
        setDrawerIsOpen(true)
    }

    const [filtering, setFiltering] = useState<ColumnFiltersState>([])

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
        setDrawerCreateIsOpen(false) // Cierra el Drawer
        setNewService({
            // Limpia los campos de usuario
            nombre_servicio: '',
            descripcion: '',
            id: '',
            uid_servicio: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            taller: '',
            precio: '',

            garantia: '',
        })
        setSelectedServiceTemplate(null) // Limpia la selección (si es necesario)
    }

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false) // Usar el estado correcto para cerrar el Drawer
    }

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    {' '}
                    <span className="text-[#000B7E]">
                        Asignar Servicios a Talleres
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
                                <option value="" disabled>
                                    Seleccionar columna...
                                </option>
                                <option value="nombre_servicio">Nombre</option>
                                <option value="nombre_categoria">
                                    Categoria
                                </option>
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
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className="w-40 ml-4 text-white hover:opacity-80"
                            onClick={openCreateDrawer} // Abre el Drawer de creación
                        >
                            Crear Servicio
                        </Button>
                    </div>
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
                <Formik
                    initialValues={{
                        nombre_servicio: newService?.nombre_servicio || '',
                        descripcion: newService?.descripcion || '',
                        uid_categoria: newService?.uid_categoria || '',
                        nombre_categoria: newService?.nombre_categoria || '',
                        uid_taller: newService?.uid_taller || '',
                        precio: newService?.precio || '',
                        garantia: newService?.garantia || '',

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

                            {/* Taller */}
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Taller:
                                </span>
                                <Field
                                    as="select"
                                    name="uid_taller"
                                    value={values.uid_taller}
                                    onChange={(e: any) => {
                                        const selectedId = e.target.value
                                        const selectedTaller = dataGarages.find(
                                            (garage) =>
                                                garage.uid === selectedId,
                                        )
                                        setFieldValue('uid_taller', selectedId)
                                        setFieldValue(
                                            'taller',
                                            selectedTaller?.nombre || '',
                                        ) // Almacena el nombre del taller
                                    }}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <option value="">
                                        Seleccione un Taller
                                    </option>
                                    {dataGarages.map((garage) => (
                                        <option
                                            key={garage.uid}
                                            value={garage.uid}
                                        >
                                            {garage.nombre}
                                        </option>
                                    ))}
                                </Field>

                                <ErrorMessage
                                    name="uid_taller"
                                    component="div"
                                    className="text-red-600 text-sm"
                                />
                            </label>

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
