import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { getAuth } from 'firebase/auth'
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
import {
    FaEdit,
    FaTrash,
    FaCamera,
    FaFolder,
    FaEye,
    FaEyeSlash,
    FaUserCircle,
    FaUserShield,
} from 'react-icons/fa'
import { z } from 'zod'
import {
    collection,
    getDocs,
    getDoc,
    query,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    
    writeBatch,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Avatar, Drawer } from '@/components/ui'
import Password from '@/views/account/Settings/components/Password'
import Description from '@/views/ui-components/navigation/Steps/Description'
import { Timestamp } from 'firebase/firestore' // Importa Timestamp
import { px } from 'framer-motion'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import * as Yup from 'yup'
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from 'formik'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/configs/firebaseAssets.config';

type Category = {
    nombre?: string
    descripcion?: string
    fechaCreacion?: Timestamp 
    logoUrl?: string 
    nombreUser?: string
    estatus?: boolean
    imageUrl?: string

    id: string 
    subcategorias?: any[]
}

const Users = () => {
    const [dataCategorys, setdataCategorys] = useState<Category[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([]) // Cambiar a ColumnFiltersState
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedColumn, setSelectedColumn] = useState<string>('nombre')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        const categoriasRef = collection(db, 'Categorias')
        const querySnapshot = await getDocs(categoriasRef)
        const categorias = []

        // Carga las categorías y subcategorías de manera más eficiente
        const allPromises = querySnapshot.docs.map(async (doc) => {
            const categoriaData = doc.data()
            const subcategoriesRef = collection(
                db,
                'Categorias',
                doc.id,
                'Subcategorias',
            )
            const subcategoriesSnapshot = await getDocs(subcategoriesRef)
            const subcategoriesData = subcategoriesSnapshot.docs.map(
                (subDoc) => ({
                    ...subDoc.data(),
                    uid: subDoc.id, // ID único de subcategoría
                }),
            )
            return {
                ...categoriaData,
                id: doc.id,
                subcategorias: subcategoriesData,
            }
        })

        const resolvedCategorias = await Promise.all(allPromises)
        categorias.push(...resolvedCategorias)
        setdataCategorys(categorias)
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

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)

    const [newCategory, setnewCategory] = useState<Category | null>({
        nombre: '',
        descripcion: '',
        fechaCreacion: Timestamp.fromDate(new Date()),
        imageUrl: '',
        nombreUser: '',
        estatus: true,
        //uid: '', // Asignar valor vacío si no quieres que sea undefined
        id: '', // También puedes asignar un valor vacío si no quieres undefined
    })

    const openDialog = (Category: Category) => {
        setSelectedCategory(Category)
        setIsOpen(true)
    }

    const handleDrawerOpenEdit = (category: any) => {
        setSelectedCategory(category)
        setSubcategories(category.subcategorias || [])
        setDrawerIsOpen(true)
    }

    // Define el esquema de validación
    const createUserSchema = z.object({
        nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        // descripcion:
    })

    type Subcategory = {
        nombre: string
        descripcion: string
        estatus: boolean
        uid: string
    }

    const [subcategories, setSubcategories] = useState<Subcategory[]>([
        { nombre: '', descripcion: '', estatus: true, uid: '' },
    ])



    const handleSubcategoryChange = (
        index: number,
        field: 'nombre' | 'descripcion',
        value: string,
    ) => {
        setSubcategories((prevSubcategories) => {
            const updatedSubcategories = [...prevSubcategories]
            updatedSubcategories[index] = {
                ...updatedSubcategories[index],
                [field]: value,
            }
            return updatedSubcategories
        })
    }

    // Esquema de validación
    const validationSchema = Yup.object().shape({
        nombre: Yup.string()
            .required('El nombre es obligatorio.')
            .min(3, 'El nombre debe tener al menos 3 caracteres.'),
        descripcion: Yup.string()
            .required('La descripción es obligatoria.')
            .min(10, 'La descripción debe tener al menos 10 caracteres.'),
        subcategorias: Yup.array()
            .of(
                Yup.object().shape({
                    nombre: Yup.string()
                        .required(
                            'El nombre de la subcategoría es obligatorio.',
                        )
                        .min(3, 'El nombre debe tener al menos 3 caracteres.'),
                    descripcion: Yup.string()
                        .required('La descripción es obligatoria.')
                        .min(
                            10,
                            'La descripción debe tener al menos 10 caracteres.',
                        ),
                }),
            )
            .min(1, 'Debe agregar al menos una subcategoría.'),
    })

    const handleCreateCategory = async (values: any) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
    
        if (!values || !currentUser) {
            toast.push(
                <Notification title="Error">
                    {!currentUser
                        ? 'Usuario no autenticado.'
                        : 'Los datos de la categoría son inválidos. Por favor, verifica.'}
                </Notification>
            );
            return;
        }
    
        try {
            // Obtener información del usuario actual
            const userDocRef = doc(db, 'Usuarios', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const userName =
                userDoc.exists() && userDoc.data()?.nombre
                    ? userDoc.data().nombre
                    : 'Administrador';
    
            // Extraer subcategorías e imagen de los valores
            const { subcategorias, image_file, ...categoryData } = values;
    
            // Preparar datos de la categoría
            const categoryPayload = {
                ...categoryData,
                nombreUser: userName,
                fechaCreacion: Timestamp.fromDate(new Date()),
                imageUrl: '', // Inicialmente vacío, se actualizará después si se sube una imagen
                estatus: true,
            };
    
            // Guardar categoría principal
            const categoryRef = await addDoc(
                collection(db, 'Categorias'),
                categoryPayload
            );
    
            let imageDownloadUrl = '';
    
            // Subir imagen si se proporciona
            if (image_file) {
                // Obtener la extensión del archivo
                const fileType = image_file.name.split('.').pop()?.toLowerCase();
    
                // Validar si el archivo es una imagen válida
                if (!fileType || !['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                    toast.push(
                        <Notification title="Error">
                            Tipo de archivo no soportado. Solo se permiten imágenes.
                        </Notification>
                    );
                    return;
                }
    
                // Generar nombre de archivo basado en el ID del documento
                const newImageName = `${categoryRef.id}_1.${fileType}`; // Formato: uid_1.extension
                const storageRef = ref(storage, `categoriesImages/${newImageName}`);
                await uploadBytes(storageRef, image_file);
    
                // Obtener la URL de la imagen subida
                imageDownloadUrl = await getDownloadURL(storageRef);
    
                // Actualizar la URL de la imagen en Firestore
                await updateDoc(categoryRef, { imageUrl: imageDownloadUrl });
            }
    
            // Crear subcategorías si existen
            if (subcategorias && subcategorias.length > 0) {
                const subcategoriesRef = collection(
                    db,
                    'Categorias',
                    categoryRef.id,
                    'Subcategorias'
                );
    
                const batch = writeBatch(db);
    
                subcategorias.forEach((subcategory: any) => {
                    if (subcategory.nombre && subcategory.descripcion) {
                        const subcategoryRef = doc(subcategoriesRef);
                        batch.set(subcategoryRef, subcategory);
                    }
                });
    
                await batch.commit();
            }
    
            // Notificar éxito
            toast.push(
                <Notification title="Éxito">
                    Categoría y subcategorías creadas con éxito.
                </Notification>
            );
    
            // Limpiar estados o datos
            setDrawerCreateIsOpen(false);
            getData(); // Refrescar datos si es necesario
        } catch (error) {
            console.error('Error al crear categoría:', error);
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al crear la categoría. Inténtalo nuevamente.
                </Notification>
            );
        }
    };    
    

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
        if (!values) return;
    
        if (!selectedCategory) {
            console.error('selectedCategory es null o undefined');
            return;
        }
    
        try {
            const categoryRef = doc(db, 'Categorias', selectedCategory.id);
    
            let newImageUrl = selectedCategory.imageUrl; // Mantener la URL actual si no se sube una nueva
    
            // Subir una nueva imagen si se proporciona
            if (values.image_file) {
                const file = values.image_file;
    
                // Determinar el sufijo para evitar conflictos de nombre
                let currentSuffix = 0; // Inicialmente, el sufijo será 0
                if (selectedCategory.imageUrl) {
                    // Extraer el sufijo actual si hay una imagen previa
                    const currentFileName =
                        selectedCategory.imageUrl.split('/').pop()?.split('?')[0] || '';
                    const currentSuffixMatch = currentFileName.match(/_(\d+)\./);
                    currentSuffix = currentSuffixMatch ? parseInt(currentSuffixMatch[1], 10) : 0;
                }
    
                // Incrementar el sufijo para la nueva imagen
                const nextSuffix = currentSuffix + 1;
    
                // Determinar extensión del archivo
                const fileType = file.name.split('.').pop()?.toLowerCase();
                if (!fileType || !['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                    toast.push(
                        <Notification title="Error">
                            Tipo de archivo no soportado. Solo se permiten imágenes.
                        </Notification>
                    );
                    return;
                }
    
                // Generar nuevo nombre de archivo
                const newImageName = `${selectedCategory.id}_${nextSuffix}.${fileType}`;
                const storageRef = ref(storage, `categoriesImages/${newImageName}`);
    
                // Eliminar la imagen anterior si existe
                if (selectedCategory.imageUrl) {
                    const decodedUrl = decodeURIComponent(selectedCategory.imageUrl);
                    const lastImageName = decodedUrl.split('/').pop()?.split('?')[0];
                    if (lastImageName) {
                        const oldImageRef = ref(storage, `categoriesImages/${lastImageName}`);
                        try {
                            await deleteObject(oldImageRef); // Elimina la imagen anterior
                        } catch (error) {
                            console.error('Error al eliminar la imagen anterior:', error);
                        }
                    }
                }
    
                // Subir nueva imagen al storage
                await uploadBytes(storageRef, file);
    
                // Obtener la nueva URL de descarga
                newImageUrl = await getDownloadURL(storageRef);
            }
    
            // Actualizar la categoría en Firestore
            await updateDoc(categoryRef, {
                nombre: values.nombre,
                descripcion: values.descripcion,
                imageUrl: newImageUrl, // Actualizar la URL de la imagen
            });
    
            // Actualizar subcategorías
            const subcategoriesCollection = collection(
                db,
                `Categorias/${selectedCategory.id}/Subcategorias`
            );
    
            const batch = writeBatch(db);
    
            values.subcategorias.forEach((sub: any) => {
                if (sub.uid) {
                    const subRef = doc(subcategoriesCollection, sub.uid);
                    batch.set(subRef, sub, { merge: true });
                } else {
                    const newSubRef = doc(subcategoriesCollection);
                    batch.set(newSubRef, sub);
                }
            });
    
            await batch.commit();
    
            // Notificación de éxito
            toast.push(
                <Notification title="Éxito">
                    Categoría y subcategorías actualizadas con éxito.
                </Notification>
            );
    
            setDrawerIsOpen(false);
            getData(); // Refrescar datos
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            toast.push(
                <Notification title="Error">
                    Ocurrió un error al guardar los cambios.
                </Notification>
            );
        }
    };
      

    const columns: ColumnDef<Category>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue, row }) => {
                const imageUrl = row.original.imageUrl as string | undefined // Obtener el logo de la fila
                return (
                    <div className="flex items-center">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Logo"
                                className="h-10 w-10 object-cover rounded-full mr-4" // Espaciado a la derecha del logo
                            />
                        ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                                <FaFolder
                                    className="h-6 w-6 text-gray-400"
                                    aria-hidden="true"
                                />{' '}
                                {/* Icono por defecto */}
                            </div>
                        )}
                        {getValue() as string}{' '}
                        {/* Mostrar el nombre de la categoría */}
                    </div>
                )
            },
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },

        {
            header: 'Descripción',
            accessorKey: 'descripcion',
            cell: ({ getValue }) => getValue(),
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'Subcategorías',
            accessorKey: 'subcategorias',
            cell: ({ getValue }) => {
                const subcategorias = getValue() // Obtiene las subcategorías
                if (Array.isArray(subcategorias) && subcategorias.length > 0) {
                    return (
                        <ul className="list-disc pl-5">
                            {subcategorias.map((subcategory) => (
                                <li key={subcategory.uid}>
                                    {subcategory.nombre}
                                </li> // Muestra el nombre de cada subcategoría
                            ))}
                        </ul>
                    )
                }
                return <span>No hay subcategorías</span> // Mensaje si no hay subcategorías
            },
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'Creador',
            accessorKey: 'nombreUser',
            cell: ({ getValue }) => getValue(),
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: ' ',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDrawerOpenEdit(person)} // Cambiar aquí
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
        setSelectedCategory(null) // Limpiar selección
    }

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerCreateIsOpen(false)
        setnewCategory({
            nombre: '',
            descripcion: '',
            logoUrl: '',
            //uid: '',
            id: '',
        }) // Limpia los campos de la categoría
        setSubcategories([]) // Limpia las subcategorías
        setSelectedCategory(null) // Limpia la selección
    }

    const handleDelete = async () => {
        if (selectedCategory) {
            console.log('Eliminando a:', selectedCategory)

            try {
                // Usar el id del documento en lugar de uid
                const userDoc = doc(db, 'Categorias', selectedCategory.id)

                // Obtener la referencia a la colección de subcategorías
                const subcategoriesRef = collection(
                    db,
                    'Categorias',
                    selectedCategory.id,
                    'Subcategorias',
                )
                const subcategoriesSnapshot = await getDocs(subcategoriesRef)

                // Eliminar cada subcategoría
                const batch = writeBatch(db) // Usar batch para eliminar todas las subcategorías en una sola operación
                subcategoriesSnapshot.docs.forEach((subDoc) => {
                    const subcategoryDocRef = doc(subcategoriesRef, subDoc.id)
                    batch.delete(subcategoryDocRef) // Prepara la eliminación de la subcategoría
                })

                // Ejecutar el batch para eliminar subcategorías
                await batch.commit() // Elimina todas las subcategorías

                // Ahora eliminar la categoría principal
                await deleteDoc(userDoc)

                // Usar toast para mostrar el mensaje de éxito
                const toastNotification = (
                    <Notification title="Éxito">
                        Categoría {selectedCategory.nombre} y sus subcategorías
                        eliminadas con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando la categoría:', error)

                // Usar toast para mostrar el mensaje de error
                const errorNotification = (
                    <Notification title="Error">
                        Hubo un error eliminando la categoría.
                    </Notification>
                )
                toast.push(errorNotification)
            } finally {
                setIsOpen(false) // Cerrar diálogo después de la operación
                setSelectedCategory(null) // Limpiar selección
            }
        }
    }

    const handleRemoveSubcategory = (
        index: number,
        values: any,
        setFieldValue: any,
    ) => {
        // Actualizar el estado de Formik eliminando la subcategoría en el índice dado
        setFieldValue(
            'subcategorias',
            values.subcategorias.filter((_: any, i: number) => i !== index),
        )
    }

    const handleDeleteSubcategory = async (
        index: number,
        values: any,
        setFieldValue: any,
    ) => {
        // Eliminar subcategoría del estado de Formik
        setFieldValue(
            'subcategorias',
            values.subcategorias.filter((_: any, i: any) => i !== index),
        )

        try {
            // Si la subcategoría tiene un ID (o UID), la eliminamos de la base de datos
            const subcategoryId = values.subcategorias[index].uid
            if (!subcategoryId) return // Si no hay UID, no hace falta eliminar de la base de datos

            console.log('Eliminando subcategoría con ID:', subcategoryId)

            // Verificar que selectedCategory no es null
            if (!selectedCategory) {
                console.error('No se ha seleccionado una categoría')
                return
            }

            const subcategoryDocRef = doc(
                db,
                'Categorias',
                selectedCategory.id,
                'Subcategorias',
                subcategoryId,
            )

            // Eliminar la subcategoría de la base de datos
            await deleteDoc(subcategoryDocRef)

            // Usar toast para mostrar el mensaje de éxito
            const toastNotification = (
                <Notification title="Éxito">
                    Subcategoría eliminada con éxito.
                </Notification>
            )
            toast.push(toastNotification)

            // Llamar a tu función para obtener los datos actualizados si es necesario
            //getData() // Refrescar datos después de eliminar
        } catch (error) {
            console.error('Error eliminando la subcategoría:', error)

            // Usar toast para mostrar el mensaje de error
            const errorNotification = (
                <Notification title="Error">
                    Hubo un error eliminando la subcategoría.
                </Notification>
            )
            toast.push(errorNotification)
        }
    }

    const table = useReactTable({
        data: dataCategorys,
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

    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 6 // Puedes cambiar esto si deseas un número diferente

    const [showPassword, setShowPassword] = useState(false)
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

    const handleDrawerCloseEdit = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false) // Cierra el Drawer

        // Reiniciar los inputs (por ejemplo, estableciendo el estado de subcategorías a los valores iniciales)
        setSubcategories([
            { nombre: '', descripcion: '', estatus: true, uid: '' },
        ])
        setSelectedCategory(null) // Si tienes un estado de categoría seleccionada, también puedes limpiarlo
    }

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    {' '}
                    <span className="text-[#000B7E]">Lista de Categorias</span>
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
                                <option value="nombre">Nombre</option>
                                <option value="descripcion">Descripcion</option>
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
                            Crear Categoría
                        </Button>
                    </div>
                </div>
            </div>
            <div className="p-3 rounded-lg shadow">
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
                        {data.slice(startIndex, endIndex).map((row) => {
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
                    {selectedCategory?.nombre}?
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
    <h2 className="mb-4 text-xl font-bold">Editar Categoría</h2>
    <Formik
    initialValues={{
        nombre: selectedCategory?.nombre || '',
        descripcion: selectedCategory?.descripcion || '',
        subcategorias: selectedCategory?.subcategorias || [],
        imageUrl: selectedCategory?.imageUrl || '',
        image_file: null, // Campo para el archivo del logo
    }}
    validationSchema={validationSchema}
    onSubmit={(values) => {
        console.log('Valores enviados:', values);
        handleSaveChanges(values); // Llamar la función para guardar los cambios
    }}
>
    {({ isSubmitting, setFieldValue, values }) => (
        <Form className="flex flex-col space-y-6">
            {/* Logo */}
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 gap-2">
                <div className="text-center">
                    {/* Mostrar previsualización del logo o icono si no hay imagen */}
                    {!values.image_file && !selectedCategory?.imageUrl ? (
                        <FaCamera className="mx-auto h-12 w-12 text-gray-300" />
                    ) : (
                        <div>
                            {values.image_file ? (
                                <img
                                    src={URL.createObjectURL(values.image_file)} // Previsualizar la imagen seleccionada
                                    alt="Preview Logo"
                                    className="mx-auto h-32 w-32 object-cover"
                                />
                            ) : (
                                <img
                                    src={selectedCategory?.imageUrl} // Mostrar la imagen actual si no hay una nueva
                                    alt="Preview Logo"
                                    className="mx-auto h-32 w-32 object-cover"
                                />
                            )}
                            {/* Botón para quitar la imagen */}
                            <button
                                type="button"
                                onClick={() => {
                                    setFieldValue('image_file', null); // Limpiar archivo seleccionado
                                }}
                                className="mt-2 text-red-500 hover:text-red-700"
                            >
                                Quitar Logo
                            </button>
                        </div>
                    )}

                    {/* Botón para seleccionar o cambiar el logo */}
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <label
                            htmlFor="logo-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
                        >
                            <span>
                                {values.image_file || selectedCategory?.imageUrl
                                    ? 'Cambiar Logo'
                                    : 'Seleccionar Logo'}
                            </span>
                            <input
                                id="logo-upload"
                                name="logo-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFieldValue('image_file', file); // Guardar el archivo seleccionado
                                    }
                                }}
                            />
                        </label>
                        </div>
                                </div>
                            </div>

                            {/* Nombre */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre:
                                </label>
                                <Field
                                    type="text"
                                    name="nombre"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="nombre"
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

                            {/* Subcategorías */}
                            <h3 className="mt-6 text-lg font-semibold">
                                Subcategorías
                            </h3>
                            {values.subcategorias.map(
                                (sub: any, index: any) => (
                                    <div
                                        key={sub.uid || index}
                                        className="flex flex-col space-y-2"
                                    >
                                        <label className="flex flex-col">
                                            <span className="font-semibold text-gray-700">
                                                Nombre:
                                            </span>
                                            <Field
                                                type="text"
                                                name={`subcategorias[${index}].nombre`}
                                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <ErrorMessage
                                                name={`subcategorias[${index}].nombre`}
                                                component="div"
                                                className="text-red-600 text-sm mt-1"
                                            />
                                        </label>

                                        <label className="flex flex-col">
                                            <span className="font-semibold text-gray-700">
                                                Descripción:
                                            </span>
                                            <Field
                                                as="textarea"
                                                name={`subcategorias[${index}].descripcion`}
                                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                rows={1}
                                                style={{
                                                    maxHeight: '150px',
                                                    overflowY: 'auto',
                                                }}
                                                onInput={(e: any) => {
                                                    e.target.style.height =
                                                        'auto'
                                                    e.target.style.height = `${e.target.scrollHeight}px`
                                                }}
                                            />
                                            <ErrorMessage
                                                name={`subcategorias[${index}].descripcion`}
                                                component="div"
                                                className="text-red-600 text-sm mt-1"
                                            />
                                        </label>
                                        {/* Botón para eliminar subcategoría (Deshabilitado si es la primera subcategoría) */}
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteSubcategory(
                                                        index,
                                                        values,
                                                        setFieldValue,
                                                    )
                                                } // Pasar el índice a la función de eliminación
                                                className={`text-white hover:opacity-80 focus:ring-2 mt-2 ${
                                                    values.subcategorias.length === 1
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "focus:ring-red-500"
                                                }`}
                                                style={{
                                                    backgroundColor: values.subcategorias.length === 1 ? '#A0A0A0' : '#B91C1C',
                                                }}
                                                disabled={values.subcategorias.length === 1}
                                            >
                                                Eliminar Subcategoría
                                            </Button>
                                    </div>
                                ),
                            )}
                            <Button
                                onClick={() => {
                                    const newSubcategory = {
                                        nombre: '',
                                        descripcion: '',
                                    }
                                    setFieldValue('subcategorias', [
                                        ...values.subcategorias,
                                        newSubcategory,
                                    ])
                                }}
                                style={{ backgroundColor: '#000B7E' }}
                                className="text-white hover:opacity-80"
                            >
                                Agregar Subcategoría
                            </Button>

                            <div className="text-right mt-6">
                                <Button
                                    variant="default"
                                    onClick={handleDrawerCloseEdit}
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
                                    Guardar Cambios
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Drawer>
            <Drawer
    isOpen={drawerCreateIsOpen}
    onClose={handleDrawerClose}
    className="rounded-md shadow"
>
    <h2 className="mb-4 text-xl font-bold">Crear Categoría</h2>
    <Formik
        initialValues={{
            nombre: '',
            descripcion: '',
            image_file: null, // Campo para el archivo del logo
            subcategorias: [
                {
                    nombre: '',
                    descripcion: '',
                    uid: '',
                    estatus: true,
                },
            ],
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
            handleCreateCategory(values); // Lógica de creación
            setSubmitting(false);
        }}
    >
        {({ values, setFieldValue }) => (
            <Form className="flex flex-col space-y-6">
                {/* Campo para el logo */}
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        {!values.image_file ? (
                            <FaCamera
                                className="mx-auto h-12 w-12 text-gray-300"
                                aria-hidden="true"
                            />
                        ) : (
                            <img
                                src={URL.createObjectURL(values.image_file)}
                                alt="Preview Logo"
                                className="mx-auto h-32 w-32 object-cover"
                            />
                        )}
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                            <label
                                htmlFor="logo-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
                            >
                                <span>
                                    {values.image_file
                                        ? 'Cambiar Logo'
                                        : 'Seleccionar Logo'}
                                </span>
                                <input
                                    id="logo-upload"
                                    name="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFieldValue('image_file', file); // Vincula el archivo al formulario
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                            {/* Campos de Categoría */}
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre:
                                </label>
                                <Field
                                    type="text"
                                    name="nombre"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                    name="nombre"
                                    component="div"
                                    className="text-red-600 text-sm mt-1"
                                />
                            </div>

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

                            {/* Campos de Subcategorías */}
                            <h3 className="text-lg font-semibold">
                                Subcategorías
                            </h3>
                            {values.subcategorias.map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex flex-col">
                                        <label className="font-semibold text-gray-700">
                                            Nombre:
                                        </label>
                                        <Field
                                            name={`subcategorias[${index}].nombre`}
                                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <ErrorMessage
                                            name={`subcategorias[${index}].nombre`}
                                            component="div"
                                            className="text-red-600 text-sm mt-1"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-semibold text-gray-700">
                                            Descripción:
                                        </label>
                                        <Field
                                            as="textarea"
                                            name={`subcategorias[${index}].descripcion`}
                                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
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
                                            name={`subcategorias[${index}].descripcion`}
                                            component="div"
                                            className="text-red-600 text-sm mt-1"
                                        />
                                    </div>
                                    {/* Botón para eliminar subcategoría (Deshabilitado si es la primera subcategoría) */}
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSubcategory(
                                                    index,
                                                    values,
                                                    setFieldValue,
                                                )
                                            } // Pasar el índice a la función de eliminación
                                            className={`text-white hover:opacity-80 focus:ring-2 mt-2 w-full sm:w-64${
                                                values.subcategorias.length === 1
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "focus:ring-red-500"
                                            }`}
                                            style={{
                                                backgroundColor: values.subcategorias.length === 1 ? '#A0A0A0' : '#B91C1C',
                                            }}
                                            disabled={values.subcategorias.length === 1}
                                        >
                                            Eliminar Subcategoría
                                        </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() =>
                                    setFieldValue('subcategorias', [
                                        ...values.subcategorias,
                                        { nombre: '', descripcion: '' },
                                    ])
                                }
                                className="text-white hover:opacity-80"
                                style={{ backgroundColor: '#000B7E' }}
                            >
                                Agregar Subcategoría
                            </Button>

                            {/* Botones de acción */}
                            <div className="text-right mt-6">
                                <Button
                                    type="button"
                                    className="ltr:mr-2 rtl:ml-2"
                                    variant="default"
                                    onClick={handleDrawerClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="text-white hover:opacity-80"
                                    style={{ backgroundColor: '#000B7E' }}
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

export default Users
