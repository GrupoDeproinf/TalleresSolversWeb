import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import { getAuth } from 'firebase/auth';
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
import { FaEdit, FaTrash, FaCamera, FaFolder, FaEye, FaEyeSlash, FaUserCircle, FaUserShield } from 'react-icons/fa'
import { z } from "zod";
import {
    collection,
    getDocs,
    getDoc,
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
import { Avatar, Drawer } from '@/components/ui'
import Password from '@/views/account/Settings/components/Password';
import Description from '@/views/ui-components/navigation/Steps/Description'
import { Timestamp } from 'firebase/firestore'; // Importa Timestamp
import { px } from 'framer-motion';

type Category = {
    nombre?: string;
    descripcion?: string;
    fechaCreacion?: Timestamp; // Fecha de creación de la categoría
    logoUrl?: string; // URL de la imagen que funcione como logo de la categoría
    nombreUser?: string; // Nombre del creador
    
    uid: string; // ID del usuario que creó la categoría
    id: string; // ID único de la categoría
};


const Users = () => {
    const [dataUsers, setDataUsers] = useState<Category[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([]) // Cambiar a ColumnFiltersState
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        const q = query(collection(db, 'Categorias'))
        const querySnapshot = await getDocs(q)
        const usuarios: Category[] = []

        querySnapshot.forEach((doc) => {
            const userData = doc.data() as Category
            // Filtrar por typeUser "Cliente" o "Certificador"
            if (userData) {
                usuarios.push({
                    ...userData,
                    id: doc.id, // Guarda el id generado por Firebase
                })
            }
        })
        

        setDataUsers(usuarios)
    }

    useEffect(() => {
        getData()
    }, [])

    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [newCategory, setnewCategory] = useState<Category | null>({
        nombre: '',
        descripcion: '',
        fechaCreacion: Timestamp.fromDate(new Date()),
        logoUrl: '',
        nombreUser: '',
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
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    // descripcion: 
    })

    const handleCreateUser = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
    
        if (!newCategory || !currentUser) {
            toast.push(
                <Notification title="Error">
                    { !currentUser ? "Usuario no autenticado." : "Los datos de la categoría son nulos. Por favor, verifica." }
                </Notification>
            );
            return;
        }
    
        try {
            // Obtener el documento del usuario en la colección "Usuarios"
            const userDocRef = doc(db, 'Usuarios', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
    
            // Si el documento no existe, asignar "Administrador" como nombre
            const userName = userDoc.exists() && userDoc.data()?.nombre ? userDoc.data().nombre : "Administrador";
    
            // Crear los datos de la categoría con el nombre del usuario
            const categoryData = {
                ...newCategory,
                nombreUser: userName,
                uid: currentUser.uid,
                fechaCreacion: Timestamp.fromDate(new Date()), // Fecha actual
            };
    
            // Guardar la categoría en Firestore
            const userRef = collection(db, 'Categorias');
            await addDoc(userRef, categoryData);
    
            toast.push(
                <Notification title="Éxito">
                    Categoría creada con éxito.
                </Notification>
            );
    
            setDrawerCreateIsOpen(false); // Cerrar el Drawer después de crear la Categoría
            getData(); // Refrescar la lista de categorías
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.errors.map(err => err.message).join(", ");
                toast.push(
                    <Notification title="Error">
                        {errorMessages}
                    </Notification>
                );
            } else {
                console.error('Error creando Categoría:', error);
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear la Categoría.
                    </Notification>
                );
            }
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
        if (selectedCategory && selectedCategory.id) {
            try {
                const userDoc = doc(db, 'Categorias', selectedCategory.id);
                await updateDoc(userDoc, {
                    nombre: selectedCategory.nombre || '',
                    descripcion: selectedCategory.descripcion || '',
                    logoUrl: selectedCategory.logoUrl || '',
                });
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Categoría actualizada con éxito.
                    </Notification>,
                );
                // Cerrar el drawer
                setDrawerIsOpen(false);

                // Recargar la página
                window.location.reload();
                getData(); // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando la categoría:', error);
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar la Categoría.
                    </Notification>,
                );
            }
        } else {
            console.error("selectedCategory o uid no están definidos.");
            console.error();
        }
    };
    
    
    // Obtener iniciales de los nombres
const getInitials = (nombre: string | undefined): string => {
    if (!nombre) return ''
    const words = nombre.split(' ').filter(Boolean) // Filtrar elementos vacíos
    return words.map((word) => {
        if (typeof word === 'string' && word.length > 0) {
            return word[0].toUpperCase()
        }
        return '' // Retorna una cadena vacía si la palabra no es válida
    }).join('')
}

    const columns: ColumnDef<Category>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue, row }) => {
                const logoUrl = row.original.logoUrl as string | undefined; // Obtener el logo de la fila
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
                                <FaFolder className="h-6 w-6 text-gray-400" aria-hidden="true" /> {/* Icono por defecto */}
                            </div>
                        )}
                        {getValue() as string} {/* Mostrar el nombre de la categoría */}
                    </div>
                );
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
            header: 'Fecha de Creación',
            accessorKey: 'fechaCreacion',
            cell: ({ getValue }) => {
                const fechaCreacion = getValue() as Timestamp | undefined; // Cambia a Timestamp
                return (
                    <div className="text-sm text-gray-700">
                        {fechaCreacion ? new Date(fechaCreacion.seconds * 1000).toLocaleDateString() : 'No disponible'}
                    </div>
                );
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
        console.log('Drawer cerrado', e);
        setDrawerIsOpen(false);
        setSelectedCategory(null); // Limpiar la selección
    };

    const handleDelete = async () => {
        if (selectedCategory) {
            console.log('Eliminando a:', selectedCategory)

            try {
                // Usa el id del documento en lugar de uid
                const userDoc = doc(db, 'Categorias', selectedCategory.id)
                await deleteDoc(userDoc)

                // Usar toast para mostrar el mensaje de éxito
                const toastNotification = (
                    <Notification title="Éxito">
                        Categoría {selectedCategory.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el usuario:', error)

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
        data: dataUsers,
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
        

        const [showPassword, setShowPassword] = useState(false);
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
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start">Lista de Categorías</h1>
                <div className="flex justify-end">
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className='text-white hover:opacity-80'
                        onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                    >
                        Crear Categoría
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
                    className='text-white hover:opacity-80'
                    onClick={handleDelete}>
                        Eliminar
                    </Button>
                </div>
            </Dialog>
            <Drawer
                isOpen={drawerIsOpen}
                onClose={handleDrawerClose}
                className="rounded-md shadow" // Añadir estilo al Drawer
            >
                <h2 className="mb-4 text-xl font-bold">Editar Categoría</h2>
                <div className="flex flex-col space-y-6">
                    {/* Aumentar el espacio entre campos */}
                    
                    {/* Campo para Nombre */}
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">Nombre:</span>
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
                        <span className="font-semibold text-gray-700">Descripción:</span>
                        <textarea
                            value={selectedCategory?.descripcion || ''}
                            onChange={(e) => {
                                setSelectedCategory((prev: any) => ({
                                    ...prev,
                                    descripcion: e.target.value,
                                }));
                                e.target.style.height = "auto"; // Resetea la altura
                                e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta la altura según el contenido
                            }}
                            rows={1} // Altura inicial
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                            style={{
                                maxHeight: '150px', // Límite máximo de altura
                                overflowY: 'auto',   // Scroll vertical cuando se excede el límite
                            }}
                        />
                    </label>

                    {/* Campo para Logo */}
<div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
    <div className="text-center">
        {!selectedCategory?.logoUrl ? (
            <FaCamera className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        ) : (
            <div>
                <img
                    src={selectedCategory.logoUrl}
                    alt="Preview Logo"
                    className="mx-auto h-32 w-32 object-cover"
                />
                {/* Botón para quitar la imagen */}
                <button
                    onClick={() => {
                        setSelectedCategory((prev: any) => ({
                            ...prev,
                            logoUrl: '', // Restablece la URL del logo a una cadena vacía
                        }));
                    }}
                    className="mt-2 text-red-500 hover:text-red-700"
                >
                    Quitar Logo
                </button>
            </div>
        )}
        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
            <label
                htmlFor="logo-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
            >
                <span>{selectedCategory?.logoUrl ? "Cambiar Logo" : "Seleccionar Logo"}</span>
                <input
                    id="logo-upload"
                    name="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setSelectedCategory((prev: any) => ({
                                    ...prev,
                                    logoUrl: reader.result, // Almacena la URL del logo
                                }));
                            };
                            reader.readAsDataURL(file); // Leer el archivo como una URL de datos
                        }
                    }}
                />
            </label>        </div>
                        </div>
                    </div>
                </div>

                <div className="text-right mt-6">
                    <Button
                        className="mr-2" // Espaciado entre botones
                        variant="default"
                        onClick={handleDrawerClose}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        style={{ backgroundColor: '#000B7E' }}
                        className='text-white hover:opacity-80'
                        onClick={handleSaveChanges}>
                        Guardar Cambios
                    </Button>
                </div>
            </Drawer>

            <Drawer
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Categoría</h2>
                <div className="flex flex-col space-y-6">
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={newCategory?.nombre || ''}
                            onChange={(e) =>
                                setnewCategory((prev: any) => ({
                                    ...prev, // Esto preserva los valores existentes
                                    nombre: e.target.value, // Solo actualiza el campo necesario
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
                                }));
                                e.target.style.height = "auto"; // Resetea la altura
                                e.target.style.height = `${e.target.scrollHeight}px`; // Ajusta la altura según el contenido
                            }}
                            rows={1} // Altura inicial
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                            style={{
                                maxHeight: '150px', // Límite máximo de altura
                                overflowY: 'auto',   // Scroll vertical cuando se excede el límite
                            }}
                        />
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                            {!newCategory?.logoUrl ? (
                                <FaCamera className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
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
                                <span>{newCategory?.logoUrl ? "Cambiar Logo" : "Seleccionar Logo"}</span>
                                <input
                                    id="logo-upload"
                                    name="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setnewCategory((prev: any) => ({
                                                    ...prev,
                                                    logoUrl: reader.result, // Almacena la URL del logo
                                                }));
                                            };
                                            reader.readAsDataURL(file); // Leer el archivo como una URL de datos
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>


                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="default"
                            onClick={() => setDrawerCreateIsOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            style={{ backgroundColor: '#000B7E' }}
                            className='text-white hover:opacity-80'
                            onClick={handleCreateUser} // Llamar a la función para crear usuario
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
