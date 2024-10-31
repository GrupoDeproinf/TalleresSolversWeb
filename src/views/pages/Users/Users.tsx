import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
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
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaUserCircle, FaUserShield } from 'react-icons/fa'
import { z } from "zod";
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
import { Avatar, Drawer } from '@/components/ui'
import Password from '@/views/account/Settings/components/Password';

type Person = {
    nombre?: string
    email?: string
    cedula?: string
    phone?: string
    password?: string
    confirmPassword?: string
    uid: string
    typeUser?: string
    id: string
}

const Users = () => {
    const [dataUsers, setDataUsers] = useState<Person[]>([])
    const [sorting, setSorting] = useState<ColumnSort[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([]) // Cambiar a ColumnFiltersState
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)

    const getData = async () => {
        const q = query(collection(db, 'Usuarios'))
        const querySnapshot = await getDocs(q)
        const usuarios: Person[] = []

        querySnapshot.forEach((doc) => {
            const userData = doc.data() as Person
            // Filtrar por typeUser "Cliente" o "Certificador"
            if (userData.typeUser === 'Cliente' || userData.typeUser === 'Certificador') {
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
    const [newUser, setNewUser] = useState<Person | null>({
        nombre: '',
        email: '',
        cedula: '',
        phone: '',
        typeUser: 'Cliente',
        password: '',
        uid: '', // Asignar valor vacío si no quieres que sea undefined
        id: '', // También puedes asignar un valor vacío si no quieres undefined
    })

    const openDialog = (person: Person) => {
        setSelectedPerson(person)
        setIsOpen(true)
    }
    const openDrawer = (person: Person) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true) // Abre el Drawer
    }

    // Define el esquema de validación
    const createUserSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Ingrese un correo válido"),
    //cedula: z.string()
    //    .regex(/^\d{7,8}$/, "La cédula debe tener entre 7 y 8 caracteres y contener solo números"), // Solo números y longitud de 7 o 8
    phone: z.string()
        .regex(/^\d{9,10}$/, "El teléfono debe tener entre 9 y 10 caracteres y contener solo números"),
    //typeUser
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmar contraseñas"),
    }).refine((data: any) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
    });

    const handleCreateUser = async () => {
        if (!newUser) {
            toast.push(
                <Notification title="Error">
                    Los datos del usuario son nulos. Por favor, verifica.
                </Notification>
            );
            return;
        }
    
        try {
            // Validación de Zod
            createUserSchema.parse(newUser);

            
    
            // Creación del usuario en la base de datos
            const userRef = collection(db, 'Usuarios');
            const docRef = await addDoc(userRef, {
                nombre: newUser.nombre,
                email: newUser.email,
                cedula: newUser.cedula,
                phone: newUser.phone,
                Password: newUser.password,
                typeUser: newUser.typeUser, // Ahora siempre tiene valor
                uid: '', // Inicialmente vacío, se actualizará después
            });

            // Si el campo typeUser es indefinido, asigna 'Cliente' por defecto
            if (!newUser?.typeUser) {
                setNewUser((prev: any) => ({
                    ...prev,
                    typeUser: 'Cliente',
                }));
            }
    
            // Verificación de contraseñas
            if (newUser.password !== newUser.confirmPassword) {
                toast.push(
                    <Notification title="Error">
                        Las contraseñas no coinciden. Por favor, verifica los campos.
                    </Notification>
                );
                return;
            }
    
            // Actualización del uid
            await updateDoc(docRef, {
                uid: docRef.id,
            });
    
            toast.push(
                <Notification title="Éxito">
                    Usuario creado con éxito.
                </Notification>
            );
    
            setDrawerCreateIsOpen(false); // Cerrar el Drawer
            // getData(); // Refrescar la lista de usuarios
            // Recargar la pantalla
            window.location.reload();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.errors.map((err) => err.message).join(', ');
                toast.push(
                    <Notification title="Error">
                        {errorMessages}
                    </Notification>
                );
            } else {
                console.error('Error creando usuario:', error);
                toast.push(
                    <Notification title="Error">
                        Hubo un error al crear el usuario.
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
        if (selectedPerson) {
            try {
                const userDoc = doc(db, 'Usuarios', selectedPerson.uid)
                await updateDoc(userDoc, {
                    nombre: selectedPerson.nombre,
                    email: selectedPerson.email,
                    cedula: selectedPerson.cedula,
                    phone: selectedPerson.phone,
                    typeUser: selectedPerson.typeUser,
                })
                // Mensaje de éxito
                toast.push(
                    <Notification title="Éxito">
                        Usuario actualizado con éxito.
                    </Notification>,
                )
                setDrawerIsOpen(false)
                getData() // Refrescar datos después de guardar
            } catch (error) {
                console.error('Error actualizando el usuario:', error)
                // Mensaje de error
                toast.push(
                    <Notification title="Error">
                        Hubo un error al actualizar el usuario.
                    </Notification>,
                )
            }
        }

    }
    
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

    const columns: ColumnDef<Person>[] = [
        {
            header: 'Nombre',
            accessorKey: 'nombre',
            cell: ({ getValue }) => getValue(),
            filterFn: 'includesString',
            footer: (props) => props.column.id,
        },
        {
            header: 'Cedula',
            accessorKey: 'cedula',
            filterFn: 'includesString',
        },
        {
            header: 'Email',
            accessorKey: 'email',
            filterFn: 'includesString',
        },

        {
            header: 'Numero Telefonico',
            accessorKey: 'phone',
            filterFn: 'includesString',
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
            header: 'Tipo de Usuario',
            accessorKey: 'typeUser',
            cell: ({ row }) => {
                const typeUser = row.getValue('typeUser') as string; // Aserción de tipo
                let icon;
                let color;
        
                switch (typeUser) {
                    case 'Cliente':
                        icon = <FaUserCircle className="text-green-500 mr-1" />;
                        color = 'text-green-500'; // Color para el texto
                        break;
                    case 'Certificador':
                        icon = <FaUserShield className="text-yellow-500 mr-1" />;
                        color = 'text-yellow-500'; // Color para el texto
                        break;
                    default:
                        icon = null;
                        color = 'text-gray-500'; // Color predeterminado
                }
        
                return (
                    <div className={`flex items-center ${color}`}>
                        {icon}
                        <span>{typeUser}</span>
                    </div>
                );
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

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
        setSelectedPerson(null) // Limpiar selección
    }

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e);
        setDrawerIsOpen(false);
        setSelectedPerson(null); // Limpiar la selección
    };
    

    const handleDelete = async () => {
        if (selectedPerson) {
            console.log('Eliminando a:', selectedPerson)

            try {
                // Usa el id del documento en lugar de uid
                const userDoc = doc(db, 'Usuarios', selectedPerson.id)
                await deleteDoc(userDoc)

                // Usar toast para mostrar el mensaje de éxito
                const toastNotification = (
                    <Notification title="Éxito">
                        Usuario {selectedPerson.nombre} eliminado con éxito.
                    </Notification>
                )
                toast.push(toastNotification)

                getData() // Refrescar datos después de eliminar
            } catch (error) {
                console.error('Error eliminando el usuario:', error)

                // Usar toast para mostrar el mensaje de error
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
                <h1 className="mb-6 flex justify-start">Lista de Usuarios</h1>
                <div className="flex justify-end">
                    <Button
                        className="w-40 text-white hover:opacity-80"
                        style={{ backgroundColor: '#000B7E' }}
                        onClick={() => setDrawerCreateIsOpen(true)} // Abre el Drawer de creación
                    >
                        Crear Usuario
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
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
            <Drawer
    isOpen={drawerIsOpen}
    onClose={handleDrawerClose}
    className="rounded-md shadow"
>
    <h2 className="mb-4 text-xl font-bold">Editar Usuario</h2>
    <div className="flex flex-col space-y-6">
        {/* Campo para Nombre */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Nombre:</span>
            <input
                type="text"
                value={selectedPerson?.nombre || ''}
                onChange={(e) =>
                    setSelectedPerson((prev: any) => ({
                        ...prev,
                        nombre: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        {/* Campo para Email */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Email:</span>
            <input
                type="email"
                value={selectedPerson?.email || ''}
                onChange={(e) =>
                    setSelectedPerson((prev: any) => ({
                        ...prev,
                        email: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        {/* Campo para Cédula */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Cédula:</span>
            <div className="flex items-center mt-1">
                <select
                    value={selectedPerson?.cedula?.split('-')[0] || 'V'}
                    onChange={(e) =>
                        setSelectedPerson((prev: any) => ({
                            ...prev,
                            cedula: `${e.target.value}-${(prev?.cedula?.split('-')[1] || '')}`,
                        }))
                    }
                    className="mx-2 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                    <option value="V">V-</option>
                    <option value="E">E-</option>
                    <option value="C">C-</option>
                    <option value="G">G-</option>
                    <option value="J">J-</option>
                    <option value="P">P-</option>
                </select>
                <input
                    type="text"
                    value={selectedPerson?.cedula?.split('-')[1] || ''}
                    onChange={(e) =>
                        setSelectedPerson((prev: any) => ({
                            ...prev,
                            cedula: `${(prev?.cedula?.split('-')[0] || 'V')}-${e.target.value}`,
                        }))
                    }
                    className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
                />
            </div>
        </label>

        {/* Campo para Teléfono */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Teléfono:</span>
            <input
                type="text"
                value={selectedPerson?.phone || ''}
                onChange={(e) =>
                    setSelectedPerson((prev: any) => ({
                        ...prev,
                        phone: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
        </label>

        {/* Campo para Tipo de Usuario */}
        <label className="flex flex-col">
            <span className="font-semibold text-gray-700">Tipo de Usuario:</span>
            <select
                value={selectedPerson?.typeUser || 'Cliente'}
                onChange={(e) =>
                    setSelectedPerson((prev: any) => ({
                        ...prev,
                        typeUser: e.target.value,
                    }))
                }
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
                <option value="Cliente">Cliente</option>
                <option value="Certificador">Certificador</option>
            </select>
        </label>
    </div>

    <div className="text-right mt-6">
        <Button
            className="mr-2"
            variant="default"
            onClick={handleDrawerClose}
        >
            Cancelar
        </Button>
        <Button
            onClick={handleSaveChanges}
            style={{ backgroundColor: '#000B7E' }}
            className="text-white hover:opacity-80"
        >
            Guardar Cambios
        </Button>
    </div>
</Drawer>
<Drawer
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                className="rounded-md shadow"
            >
                <h2 className="mb-4 text-xl font-bold">Crear Usuario</h2>
                <div className="flex flex-col space-y-6">
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Nombre:
                        </span>
                        <input
                            type="text"
                            value={newUser?.nombre || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...prev, // Esto preserva los valores existentes
                                    nombre: e.target.value, // Solo actualiza el campo necesario
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Email:
                        </span>
                        <input
                            type="email"
                            value={newUser?.email || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...(prev ?? {}),
                                    email: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
    <span className="font-semibold text-gray-700">Cédula:</span>
    <div className="flex items-center mt-1">
        <select
            value={newUser?.cedula?.split('-')[0] || 'V'}
            onChange={(e) =>
                setNewUser((prev: any) => ({
                    ...(prev ?? {}),
                    cedula: `${e.target.value}-${(prev?.cedula?.split('-')[1] || '')}`,
                }))
            }
            className="mx-2 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
            <option value="V">V-</option>
            <option value="E">E-</option>
            <option value="C">C-</option>
            <option value="G">G-</option>
            <option value="J">J-</option>
            <option value="P">P-</option>
        </select>
        <input
            type="text"
            value={newUser?.cedula?.split('-')[1] || ''}
            onChange={(e) =>
                setNewUser((prev: any) => ({
                    ...(prev ?? {}),
                    cedula: `${(prev?.cedula?.split('-')[0] || 'V')}-${e.target.value}`,
                }))
            }
            className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
        />
    </div>
</label>

                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Teléfono:
                        </span>
                        <input
                            placeholder='Ejem (4142611966)'
                            type="text"
                            value={newUser?.phone || ''}
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...(prev ?? {}),
                                    phone: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </label>
                    <label className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                            Tipo de Usuario:
                        </span>
                        <select
                            value={newUser?.typeUser || 'Cliente'} // Valor por defecto 'Cliente'
                            onChange={(e) =>
                                setNewUser((prev: any) => ({
                                    ...(prev ?? {}),
                                    typeUser: e.target.value,
                                }))
                            }
                            className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        >
                            <option value="Cliente">Cliente</option>
                            <option value="Certificador">Certificador</option>
                        </select>
                    </label>
                    <label className="flex flex-col relative">
                <span className="font-semibold text-gray-700">Contraseña:</span>
                <input
                    type={showPassword ? "text" : "password"}
                    value={newUser?.password || ''}
                    onChange={(e) =>
                        setNewUser((prev: any) => ({
                            ...prev,
                            password: e.target.value,
                        }))
                    }
                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-10 text-gray-600"
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </label>

            <label className="flex flex-col relative mt-4">
                <span className="font-semibold text-gray-700">Confirmar Contraseña:</span>
                <input
                    type={showPassword ? "text" : "password"}
                    value={newUser?.confirmPassword || ''}
                    onChange={(e) =>
                        setNewUser((prev: any) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                        }))
                    }
                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-10 text-gray-600"
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </label>
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
