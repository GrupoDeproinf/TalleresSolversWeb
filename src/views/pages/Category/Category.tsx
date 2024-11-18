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

type Category = {
    nombre?: string
    descripcion?: string
    fechaCreacion?: Timestamp // Fecha de creación de la categoría
    logoUrl?: string // URL de la imagen que funcione como logo de la categoría
    nombreUser?: string // Nombre del creador
    estatus?: boolean

    uid?: string // ID del usuario que creó la categoría
    id: string // ID único de la categoría
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
        const q = query(collection(db, 'Categorias'))
        const querySnapshot = await getDocs(q)
        const categorias = []

        for (const doc of querySnapshot.docs) {
            const userData = doc.data()
            if (userData) {
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
                        uid: subDoc.id, // Almacena el ID de la subcategoría
                    }),
                )

                categorias.push({
                    ...userData,
                    id: doc.id,
                    subcategorias: subcategoriesData, // Añade las subcategorías aquí
                })
            }
        }

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
        logoUrl: '',
        nombreUser: '',
        estatus: true,
        uid: '', // Asignar valor vacío si no quieres que sea undefined
        id: '', // También puedes asignar un valor vacío si no quieres undefined
    })

    const openDialog = (Category: Category) => {
        setSelectedCategory(Category)
        setIsOpen(true)
    }
    const openDrawer = (Category: Category) => {
        setSelectedCategory(Category)
        setDrawerIsOpen(true) // Abre el Drawer
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

    const handleAddSubcategory = () => {
        setSubcategories([
            ...subcategories,
            { nombre: '', descripcion: '', estatus: true, uid: '' },
        ])
    }

    const handleRemoveSubcategory = (index: any) => {
        setSubcategories((prevSubcategories) =>
            prevSubcategories.filter((_, i) => i !== index),
        )
    }

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

    const handleCreateUser = async () => {
        const auth = getAuth()
        const currentUser = auth.currentUser

        if (!newCategory || !currentUser) {
            toast.push(
                <Notification title="Error">
                    {!currentUser
                        ? 'Usuario no autenticado.'
                        : 'Los datos de la categoría son nulos. Por favor, verifica.'}
                </Notification>,
            )
            return
        }

        try {
            const userDocRef = doc(db, 'Usuarios', currentUser.uid)
            const userDoc = await getDoc(userDocRef)
            const userName =
                userDoc.exists() && userDoc.data()?.nombre
                    ? userDoc.data().nombre
                    : 'Administrador'

            const categoryData = {
                ...newCategory,
                nombreUser: userName,
                uid: currentUser.uid,
                fechaCreacion: Timestamp.fromDate(new Date()),
            }

            const categoryRef = await addDoc(
                collection(db, 'Categorias'),
                categoryData,
            )

            // Crear subcategorías
            const subcategoriesRef = collection(
                db,
                'Categorias',
                categoryRef.id,
                'Subcategorias',
            )
            const batch = writeBatch(db)
            subcategories.forEach((subcategory) => {
                if (subcategory.nombre && subcategory.descripcion) {
                    const subcategoryRef = doc(subcategoriesRef)
                    batch.set(subcategoryRef, subcategory)
                }
            })

            await batch.commit()

            toast.push(
                <Notification title="Éxito">
                    Categoría y subcategorías creadas con éxito.
                </Notification>,
            )

            // Limpiar los inputs del Drawer
            setnewCategory({
                nombre: '',
                descripcion: '',
                fechaCreacion: Timestamp.fromDate(new Date()),
                logoUrl: '',
                nombreUser: '',
                estatus: true,
                uid: '',
                id: '',
            })

            // Limpiar las subcategorías
            setSubcategories([]) // Esto asume que tienes `subcategories` como estado

            setDrawerCreateIsOpen(false)
            getData()
        } catch (error) {
            // Manejo de errores aquí
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

    const handleSaveChanges = async () => {
        if (selectedCategory && selectedCategory.id) {
            try {
                const userDoc = doc(db, 'Categorias', selectedCategory.id)
                await updateDoc(userDoc, {
                    nombre: selectedCategory.nombre || '',
                    descripcion: selectedCategory.descripcion || '',
                    logoUrl: selectedCategory.logoUrl || '',
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Categoría actualizada con éxito.
                    </Notification>,
                )
                // Cerrar el drawer
                setDrawerIsOpen(false)

                getData() // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando la categoría:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar la Categoría.
                    </Notification>,
                )
            }
        } else {
            console.error('selectedCategory o uid no están definidos.')
            console.error()
        }
    }

    // Obtener iniciales de los nombres
    const getInitials = (nombre: string | undefined): string => {
        if (!nombre) return ''
        const words = nombre.split(' ').filter(Boolean) // Filtrar elementos vacíos
        return words
            .map((word) => {
                if (typeof word === 'string' && word.length > 0) {
                    return word[0].toUpperCase()
                }
                return '' // Retorna una cadena vacía si la palabra no es válida
            })
            .join('')
    }

    const handleSelectCategory = (category: any) => {
        setSelectedCategory(category)
        setSubcategories(category.subcategorias || []) // Cargar subcategorías
        setDrawerIsOpen(true)
    }

    const columns: ColumnDef<Category>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue, row }) => {
                const logoUrl = row.original.logoUrl as string | undefined // Obtener el logo de la fila
                return (
                    <div className="flex items-center">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
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
        setSelectedCategory(null) // Limpiar selección
    }

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerCreateIsOpen(false)
        setnewCategory({
            nombre: '',
            descripcion: '',
            logoUrl: '',
            uid: '',
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
        setDrawerIsOpen(false) // Usar el estado correcto para cerrar el Drawer
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
                <div className="flex flex-col space-y-6">
                    {/* Campo para Nombre */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={selectedCategory?.nombre || ''}
                            onChange={(e) =>
                                setSelectedCategory((prev: any) => ({
                                    ...prev,
                                    nombre: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>

                    {/* Campo para Descripción */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Descripción:
                        </span>
                        <textarea
                            value={selectedCategory?.descripcion || ''}
                            onChange={(e) => {
                                setSelectedCategory((prev: any) => ({
                                    ...prev,
                                    descripcion: e.target.value,
                                }))
                                e.target.style.height = 'auto' // Resetea la altura
                                e.target.style.height = `${e.target.scrollHeight}px` // Ajusta la altura según el contenido
                            }}
                            rows={1} // altura inicial
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                            style={{ maxHeight: '150px', overflowY: 'auto' }}
                        />
                    </label>

                    {/* Campo para Logo */}
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                            {!selectedCategory?.logoUrl ? (
                                <FaCamera
                                    className="mx-auto h-12 w-12 text-gray-300"
                                    aria-hidden="true"
                                />
                            ) : (
                                <div>
                                    <img
                                        src={selectedCategory.logoUrl}
                                        alt="Preview Logo"
                                        className="mx-auto h-32 w-32 object-cover"
                                    />
                                    <button
                                        onClick={() =>
                                            setSelectedCategory(
                                                (prev: any) => ({
                                                    ...prev,
                                                    logoUrl: '',
                                                }),
                                            )
                                        }
                                        className="mt-2 text-red-500 hover:text-red-700"
                                    >
                                        Quitar Logo
                                    </button>
                                </div>
                            )}
                            <label
                                htmlFor="logo-upload"
                                className="relative cursor-pointer bg-white font-semibold text-indigo-600 flex justify-center items-center"
                            >
                                <span>
                                    {selectedCategory?.logoUrl
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
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () =>
                                                setSelectedCategory(
                                                    (prev: any) => ({
                                                        ...prev,
                                                        logoUrl: reader.result,
                                                    }),
                                                )
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

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
                <h2 className="mb-4 text-xl font-bold">Crear Categoría</h2>
                <div className="flex flex-col space-y-6">
                    {/* Campo para el logo */}
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                            {!newCategory?.logoUrl ? (
                                <FaCamera
                                    className="mx-auto h-12 w-12 text-gray-300"
                                    aria-hidden="true"
                                />
                            ) : (
                                <img
                                    src={newCategory.logoUrl}
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
                                        {newCategory?.logoUrl
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
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    setnewCategory(
                                                        (prev: any) => ({
                                                            ...prev,
                                                            logoUrl:
                                                                reader.result, // Almacena la URL del logo
                                                        }),
                                                    )
                                                }
                                                reader.readAsDataURL(file) // Leer el archivo como una URL de datos
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Campos de la categoría */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={newCategory?.nombre || ''}
                            onChange={(e) =>
                                setnewCategory((prev: any) => ({
                                    ...prev,
                                    nombre: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Descripción:
                        </span>
                        <textarea
                            value={newCategory?.descripcion || ''}
                            onChange={(e) => {
                                setnewCategory((prev: any) => ({
                                    ...(prev ?? {}),
                                    descripcion: e.target.value,
                                }))
                                e.target.style.height = 'auto' // Resetea la altura
                                e.target.style.height = `${e.target.scrollHeight}px` // Ajusta la altura según el contenido
                            }}
                            rows={1} // Altura inicial
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                            style={{
                                maxHeight: '150px', // Límite máximo de altura
                                overflowY: 'auto', // Scroll vertical cuando se excede el límite
                            }}
                        />
                    </label>

                    {/* Sección de subcategorías */}
                    <h3 className="mt-6 text-lg font-semibold">
                        Subcategorías
                    </h3>
                    {subcategories.map((subcategory, index) => (
                        <div key={index} className="flex flex-col space-y-2">
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Nombre:
                                </span>
                                <input
                                    type="text"
                                    value={subcategory.nombre}
                                    onChange={(e) =>
                                        handleSubcategoryChange(
                                            index,
                                            'nombre',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                            </label>
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Descripción:
                                </span>
                                <textarea
                                    value={subcategory.descripcion}
                                    onChange={(e) =>
                                        handleSubcategoryChange(
                                            index,
                                            'descripcion',
                                            e.target.value,
                                        )
                                    }
                                    rows={1}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                                    style={{
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                    }}
                                />
                            </label>
                            {/* Botón para eliminar subcategoría */}
                            <Button
                                onClick={() => handleRemoveSubcategory(index)}
                                className="text-white hover:opacity-80 focus:ring-2 focus:ring-red-500 mt-2"
                                style={{ backgroundColor: '#B91C1C' }}
                            >
                                Eliminar Subcategoría
                            </Button>
                        </div>
                    ))}
                    <Button onClick={handleAddSubcategory} variant="default">
                        Agregar Subcategoría
                    </Button>

                    {/* Botones de acción */}
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
                            onClick={handleCreateUser}
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Users
