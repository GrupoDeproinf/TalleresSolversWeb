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

type ServiceTemplate = {
    nombre_servicio?: string
    descripcion?: string
    uid_servicio: string

    // Campos para categoría
    uid_categoria?: string
    nombre_categoria?: string
    // Campos para subcategoría
    subcategoria?: []
    garantia?: string
    precio?: number

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

const Services = () => {
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedServiceTemplate, setSelectedServiceTemplate] =
        useState<ServiceTemplate | null>(null)
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre_servicio')
    const [searchTerm, setSearchTerm] = useState('')
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const [dataCategories, setDataCategories] = useState<Category[]>([])
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>(
        [],
    )
    const [dataServicesTemplate, setDataServicesTemplate] = useState<
        ServiceTemplate[]
    >([])

    const getAllData = async () => {
        try {
            const categoriesQuery = query(collection(db, 'Categorias'))
            const servicesQuery = query(collection(db, 'ServiciosTemplate'))
            const [categoriesSnapshot, servicesSnapshot] = await Promise.all([
                getDocs(categoriesQuery),
                getDocs(servicesQuery),
            ])
            const categories: Category[] = categoriesSnapshot.docs.map(
                (doc) => ({
                    ...doc.data(),
                    uid_categoria: doc.id,
                }),
            ) as Category[]

            const services: ServiceTemplate[] = servicesSnapshot.docs.map(
                (doc) => ({
                    ...doc.data(),
                    uid_servicio: doc.id,
                }),
            ) as ServiceTemplate[]

            setDataCategories(categories)
            setDataServicesTemplate(services)
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

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null,
    ) // Estado para la categoría seleccionada

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

    const openDialog = (serviceTemplate: ServiceTemplate) => {
        setSelectedServiceTemplate(serviceTemplate)
        setIsOpen(true)
    }
    const openDrawer = (serviceTemplate: ServiceTemplate) => {
        setSelectedServiceTemplate(serviceTemplate)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newServiceTemplate, setNewServiceTemplate] =
        useState<ServiceTemplate>({
            nombre_servicio: '',
            descripcion: '',
            uid_servicio: '',
            uid_categoria: '',
            nombre_categoria: '',
            subcategoria: [],
            id: '',
            garantia: '',
            precio: 0,
        })

        const validationSchema = Yup.object().shape({
            nombre_servicio: Yup.string()
                .required('El nombre del servicio es obligatorio')
                .min(3, 'El nombre debe tener al menos 3 caracteres'),
            descripcion: Yup.string()
                .required('La descripción es obligatoria')
                .min(5, 'La descripción debe tener al menos 5 caracteres'),
            uid_categoria: Yup.string().required('Debe seleccionar una categoría válida'),
            garantia: Yup.string().required('La garantía es obligatoria'),
        });
        

    const handleCreateServiceTemplate = async (values: any) => {
        try {
            // Validación de los valores usando Yup
            await validationSchema.validate(values, { abortEarly: false })

            // Referencia a la colección 'ServiciosTemplate' en la base de datos
            const serviceRef = collection(db, 'ServiciosTemplate')

            // Creación del documento con los datos proporcionados
            const docRef = await addDoc(serviceRef, {
                nombre_servicio: values.nombre_servicio,
                descripcion: values.descripcion,
                nombre_categoria: values.nombre_categoria,
                uid_categoria: values.uid_categoria,
                subcategoria: values.subcategoria,
                uid_servicio: '', // Inicialmente vacío, se actualizará con docRef.id
                garantia: values.garantia,
                precio: values.precio,
            })

            // Actualización del campo uid_servicio con el ID del documento recién creado
            await updateDoc(docRef, { uid_servicio: docRef.id })

            // Notificación de éxito
            toast.push(
                <Notification title="Éxito">
                    Servicio creado con éxito.
                </Notification>,
            )

            // Reseteo del formulario a su estado inicial
            setNewServiceTemplate({
                nombre_servicio: '',
                descripcion: '',
                uid_servicio: '',
                uid_categoria: '',
                nombre_categoria: '',
                subcategoria: [],
                garantia: '',
                precio: 0,
            })

            // Cierre del Drawer y actualización de la lista de datos
            setDrawerCreateIsOpen(false)
            getAllData() // Actualiza la lista de servicios o plantilla de servicios
        } catch (error) {
            // Manejo de errores de validación Yup
            if (error instanceof Yup.ValidationError) {
                const errorMessages = error.errors.join(', ')
                toast.push(
                    <Notification title="Error">{errorMessages}</Notification>,
                )
            } else {
                // Manejo de errores inesperados
                console.error('Error creando Servicio:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el Servicio.
                    </Notification>,
                )
            }
        }
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

    const handleSaveChanges = async (values: any) => {
        if (selectedServiceTemplate) {
            try {
                const userDoc = doc(
                    db,
                    'ServiciosTemplate',
                    selectedServiceTemplate?.uid_servicio,
                );
    
                await updateDoc(userDoc, {
                    nombre_servicio: values.nombre_servicio,
                    descripcion: values.descripcion,
                    uid_categoria: values.uid_categoria,
                    nombre_categoria: values.nombre_categoria,
                    subcategoria: values.subcategoria || [], // Array vacío si no hay subcategorías
                    garantia: values.garantia,
                    precio: values.precio,
                });
    
                toast.push(
                    <Notification title="Éxito">
                        Servicio actualizado con éxito.
                    </Notification>,
                );
    
                setDrawerIsOpen(false);
                getAllData();
            } catch (error) {
                console.error('Error actualizando el servicio:', error);
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el servicio.
                    </Notification>,
                );
            }
        }
    };
    
    

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
            header: 'precio',
            accessorKey: 'precio',
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

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedServiceTemplate(null) // Limpiar selección
    }

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false) // Usar el estado correcto para cerrar el Drawer
    }

    const handleDelete = async () => {
        if (selectedServiceTemplate) {
            console.log('Eliminando el servicio:', selectedServiceTemplate)

            try {
                // Ahora estamos usando el id generado automáticamente por Firebase
                const serviceDoc = doc(
                    db,
                    'ServiciosTemplate',
                    selectedServiceTemplate.uid_servicio,
                )
                await deleteDoc(serviceDoc)

                const toastNotification = (
                    <Notification title="Éxito">
                        Servicio {selectedServiceTemplate.nombre_servicio} eliminado con
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

    return (
        <>
            <div>
                <div className="grid grid-cols-2">
                    <h1 className="mb-6 flex justify-start items-center space-x-4">
                        {' '}
                        <span className="text-[#000B7E]">
                            Planilla de Servicios
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
                                onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                            >
                                Crear Plantilla
                            </Button>
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
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p>
                    ¿Estás seguro de que deseas eliminar el servicio{' '}
                    {selectedServiceTemplate?.nombre_servicio}?
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
                <Formik
                    initialValues={{
                        nombre_servicio: selectedServiceTemplate?.nombre_servicio || '',
                        descripcion: selectedServiceTemplate?.descripcion || '',
                        nombre_categoria: selectedServiceTemplate?.nombre_categoria || '',
                        uid_categoria:
                            selectedServiceTemplate?.uid_categoria || '',
                        subcategoria:
                            selectedServiceTemplate?.subcategoria || [],
                        garantia: selectedServiceTemplate?.garantia || '',
                        precio: selectedServiceTemplate?.precio || '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        console.log('Valores enviados:', values);
                        handleSaveChanges(values);
                    }}
                >
                    {({ isSubmitting, setFieldValue, values }) => (
                            <Form
                            className="flex flex-col space-y-6"    
                            >
                            {/* Nombre */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre Servicio:
                                </label>
                                <Field
                                    type="text"
                                    name="nombre_servicio"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="nombre_servicio"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Categoría */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Categoría:
                                </label>
                                <Field
                                    as="select"
                                    name="uid_categoria"
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
                                            selectedCat?.nombre,
                                        )
                                        setFieldValue('subcategoria', []) // Reset subcategorías
                                        handleCategoryChange(selectedId)
                                    }}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Subcategorías */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Subcategorías:
                                </label>
                                <Select
                                    placeholder="Seleccione una o más subcategorías"
                                    isMulti
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
                                    onChange={(selectedOptions) => {
                                        const selectedSubcategories =
                                            selectedOptions.map((option) => ({
                                                uid_subcategoria: option.value,
                                                nombre_subcategoria:
                                                    option.label,
                                            }))
                                        setFieldValue(
                                            'subcategoria',
                                            selectedSubcategories,
                                        )
                                    }}
                                    className="mt-1"
                                />
                                <ErrorMessage
                                    name="subcategoria"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Descripción */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Descripción:
                                </label>
                                <Field
                                    as="textarea"
                                    name="descripcion"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={1}
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
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Garantía */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Garantía:
                                </label>
                                <Field
                                    type="text"
                                    name="garantia"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="garantia"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>
                            {/* precio */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Precio:
                                </label>
                                <Field
                                    type="text"
                                    name="precio"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="precio"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            <div className="text-right mt-6">
                                <Button
                                    variant="default"
                                    onClick={() => setDrawerIsOpen(false)}
                                    className="mr-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Drawer>

            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Plantilla</h2>
                <Formik
                    initialValues={{
                        nombre_servicio: '',
                        descripcion: '',
                        uid_categoria: '',
                        subcategoria: [],
                        garantia: '',
                        precio: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleCreateServiceTemplate(values)
                        setSubmitting(false)
                    }}
                >
                    {({ isSubmitting, setFieldValue, values }) => (
                        <Form className="flex flex-col space-y-6">
                            {/* Nombre */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre Servicio:
                                </label>
                                <Field
                                    type="text"
                                    name="nombre_servicio"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="nombre_servicio"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Categoría */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Categoría:
                                </label>
                                <Field
                                    as="select"
                                    name="uid_categoria"
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
                                        )
                                        setFieldValue('subcategoria', []) // Reset subcategorías
                                        handleCategoryChange(selectedId)
                                    }}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Subcategorías */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Subcategorías:
                                </label>
                                <Select
                                    placeholder="Seleccione una o más subcategorías"
                                    isMulti
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
                                    onChange={(selectedOptions) => {
                                        const selectedSubcategories =
                                            selectedOptions.map((option) => ({
                                                uid_subcategoria: option.value,
                                                nombre_subcategoria:
                                                    option.label,
                                            }))
                                        setFieldValue(
                                            'subcategoria',
                                            selectedSubcategories,
                                        )
                                    }}
                                    className="mt-1"
                                />
                                <ErrorMessage
                                    name="subcategoria"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Descripción */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Descripción:
                                </label>
                                <Field
                                    as="textarea"
                                    name="descripcion"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={1}
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
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Garantía */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Garantía:
                                </label>
                                <Field
                                    type="text"
                                    name="garantia"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="garantia"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>
                            {/* precio */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Precio:
                                </label>
                                <Field
                                    type="text"
                                    name="precio"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="precio"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

                            {/* Botones */}
                            <div className="text-right mt-6">
                                <Button
                                    variant="default"
                                    onClick={() => setDrawerCreateIsOpen(false)}
                                    className="mr-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    style={{ backgroundColor: '#000B7E' }}
                                    className="text-white hover:opacity-80"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Drawer>
        </>
    )
}

export default Services
