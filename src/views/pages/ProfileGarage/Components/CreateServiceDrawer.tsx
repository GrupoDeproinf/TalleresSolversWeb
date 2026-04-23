import React, { useEffect, useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/configs/firebaseAssets.config'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { FaCamera } from 'react-icons/fa'

interface CreateServiceDrawerProps {
    isOpen: boolean
    onClose: () => void
    tallerUid: string
    tallerName: string
    onServiceCreated?: () => void
}

interface Category {
    id: string
    nombre: string
}

interface Subcategory {
    id: string
    nombre: string
}

type FormValues = {
    nombre_servicio: string
    descripcion: string
    uid_categoria: string
    uid_subcategoria: string
    precio: string
    garantia: string
    typeService: string
    service_image: string[]
    service_image_files: File[]
}

const validationSchema = Yup.object().shape({
    nombre_servicio: Yup.string()
        .required('El nombre del servicio es requerido')
        .min(3, 'Debe tener al menos 3 caracteres'),
    descripcion: Yup.string()
        .required('La descripción es requerida')
        .min(10, 'Debe tener al menos 10 caracteres'),
    uid_categoria: Yup.string().required('La categoría es requerida'),
    uid_subcategoria: Yup.string().required('La subcategoría es requerida'),
    precio: Yup.string().required('El precio es requerido'),
    garantia: Yup.string().required('La garantía es requerida'),
    typeService: Yup.string().required('El tipo de servicio es requerido'),
})

const CreateServiceDrawer: React.FC<CreateServiceDrawerProps> = ({
    isOpen,
    onClose,
    tallerUid,
    tallerName,
    onServiceCreated,
}) => {
    const [dataCategories, setDataCategories] = useState<Category[]>([])
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>([])
    const [loading, setLoading] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)

    useEffect(() => {
        const loadCategories = async () => {
            if (!isOpen) return
            setLoading(true)
            try {
                const categoriesQuery = query(
                    collection(db, 'Categorias'),
                    where('estatus', '==', true),
                )
                const categoriesSnapshot = await getDocs(categoriesQuery)
                const categories = categoriesSnapshot.docs.map((docSnap) => {
                    const data = docSnap.data() as { nombre?: string }
                    return {
                        id: docSnap.id,
                        nombre: data.nombre || 'Sin nombre',
                    }
                })
                setDataCategories(categories)
            } catch (error) {
                console.error('Error loading categories:', error)
                toast.push(
                    <Notification title="Error">
                        Error al cargar las categorías.
                    </Notification>,
                )
            } finally {
                setLoading(false)
            }
        }

        loadCategories()
    }, [isOpen])

    const handleCategoryChange = async (categoryId: string) => {
        if (!categoryId) {
            setDataSubcategories([])
            return
        }
        try {
            const subcategoriesQuery = query(
                collection(db, 'Categorias', categoryId, 'Subcategorias'),
                where('estatus', '==', true),
            )
            const subcategoriesSnapshot = await getDocs(subcategoriesQuery)
            const subcategories = subcategoriesSnapshot.docs.map((docSnap) => {
                const data = docSnap.data() as { nombre?: string }
                return {
                    id: docSnap.id,
                    nombre: data.nombre || 'Sin nombre',
                }
            })
            setDataSubcategories(subcategories)
        } catch (error) {
            console.error('Error loading subcategories:', error)
            setDataSubcategories([])
        }
    }

    const initialValues: FormValues = {
        nombre_servicio: '',
        descripcion: '',
        uid_categoria: '',
        uid_subcategoria: '',
        precio: '',
        garantia: '',
        typeService: 'local',
        service_image: [],
        service_image_files: [],
    }

    const uploadServiceImages = async (
        files: File[],
        serviceId: string,
    ): Promise<string[]> => {
        const uploadedUrls: string[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fileType = file.name.split('.').pop()?.toLowerCase()

            if (!fileType || !['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                throw new Error('Tipo de archivo no soportado')
            }

            const storageRef = ref(
                storage,
                `service_images/${serviceId}_${Date.now()}_${i}.${fileType}`,
            )
            await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(storageRef)
            uploadedUrls.push(downloadURL)
        }

        return uploadedUrls
    }

    const handleCreateService = async (values: FormValues) => {
        try {
            if (!values.service_image_files || values.service_image_files.length === 0) {
                toast.push(
                    <Notification title="Error">
                        Debes seleccionar al menos una imagen.
                    </Notification>,
                )
                return
            }

            const selectedCategory = dataCategories.find(
                (category) => category.id === values.uid_categoria,
            )
            const selectedSubcategory = dataSubcategories.find(
                (subcategory) => subcategory.id === values.uid_subcategoria,
            )

            const newServiceRef = await addDoc(collection(db, 'Servicios'), {
                categoria: selectedCategory?.nombre || '',
                nombre_categoria: selectedCategory?.nombre || '',
                descripcion: values.descripcion,
                estatus: false,
                garantia: values.garantia,
                nombre_servicio: values.nombre_servicio,
                precio: values.precio,
                puntuacion: 4,
                service_image: [],
                subcategoria: selectedSubcategory?.nombre || '',
                taller: tallerName || '',
                typeService: values.typeService,
                uid_categoria: values.uid_categoria,
                uid_servicio: '',
                uid_subcategoria: values.uid_subcategoria,
                uid_taller: tallerUid,
            })

            setUploadingImages(true)
            const imageUrls = await uploadServiceImages(
                values.service_image_files,
                newServiceRef.id,
            )

            await updateDoc(doc(db, 'Servicios', newServiceRef.id), {
                uid_servicio: newServiceRef.id,
                service_image: imageUrls,
            })

            toast.push(
                <Notification title="Éxito">
                    Servicio creado correctamente en estado apagado.
                </Notification>,
            )
            onServiceCreated?.()
            onClose()
        } catch (error) {
            console.error('Error creating service:', error)
            toast.push(
                <Notification title="Error">
                    No se pudo crear el servicio.
                </Notification>,
            )
        } finally {
            setUploadingImages(false)
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            className="rounded-md shadow w-full max-w-2xl"
        >
            <h2 className="mb-4 text-xl font-bold">Crear servicio</h2>
            {loading ? (
                <div className="py-4 text-sm text-gray-500">Cargando datos...</div>
            ) : (
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleCreateService}
                    enableReinitialize
                >
                    {({ values, handleChange, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Nombre del servicio
                                </label>
                                <Field
                                    name="nombre_servicio"
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <ErrorMessage
                                    name="nombre_servicio"
                                    component="div"
                                    className="text-red-500 text-xs mt-1"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Descripción
                                </label>
                                <Field
                                    as="textarea"
                                    name="descripcion"
                                    rows={3}
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <ErrorMessage
                                    name="descripcion"
                                    component="div"
                                    className="text-red-500 text-xs mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Categoría
                                    </label>
                                    <select
                                        name="uid_categoria"
                                        value={values.uid_categoria}
                                        onChange={(e) => {
                                            handleChange(e)
                                            setFieldValue('uid_subcategoria', '')
                                            void handleCategoryChange(
                                                e.target.value,
                                            )
                                        }}
                                        className="w-full rounded-md border px-3 py-2"
                                    >
                                        <option value="">Seleccione</option>
                                        {dataCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMessage
                                        name="uid_categoria"
                                        component="div"
                                        className="text-red-500 text-xs mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Subcategoría
                                    </label>
                                    <select
                                        name="uid_subcategoria"
                                        value={values.uid_subcategoria}
                                        onChange={handleChange}
                                        className="w-full rounded-md border px-3 py-2"
                                    >
                                        <option value="">Seleccione</option>
                                        {dataSubcategories.map((subcategory) => (
                                            <option
                                                key={subcategory.id}
                                                value={subcategory.id}
                                            >
                                                {subcategory.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMessage
                                        name="uid_subcategoria"
                                        component="div"
                                        className="text-red-500 text-xs mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Precio
                                    </label>
                                    <Field
                                        name="precio"
                                        className="w-full rounded-md border px-3 py-2"
                                    />
                                    <ErrorMessage
                                        name="precio"
                                        component="div"
                                        className="text-red-500 text-xs mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Garantía
                                    </label>
                                    <Field
                                        name="garantia"
                                        className="w-full rounded-md border px-3 py-2"
                                    />
                                    <ErrorMessage
                                        name="garantia"
                                        component="div"
                                        className="text-red-500 text-xs mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Tipo de servicio
                                    </label>
                                    <select
                                        name="typeService"
                                        value={values.typeService}
                                        onChange={handleChange}
                                        className="w-full rounded-md border px-3 py-2"
                                    >
                                        <option value="local">Local</option>
                                        <option value="domicilio">
                                            A domicilio
                                        </option>
                                    </select>
                                    <ErrorMessage
                                        name="typeService"
                                        component="div"
                                        className="text-red-500 text-xs mt-1"
                                    />
                                </div>
                            </div>

                            <div className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-gray-300 px-6 py-6">
                                <div className="text-center w-full">
                                    {Array.isArray(values.service_image) &&
                                    values.service_image.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {values.service_image.map(
                                                (img: string, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="relative"
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`Imagen del servicio ${index + 1}`}
                                                            className="h-24 w-full object-cover rounded-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages =
                                                                    values.service_image.filter(
                                                                        (_: string, i: number) =>
                                                                            i !== index,
                                                                    )
                                                                const newFiles =
                                                                    values.service_image_files.filter(
                                                                        (_: File, i: number) =>
                                                                            i !== index,
                                                                    )
                                                                setFieldValue(
                                                                    'service_image',
                                                                    newImages,
                                                                )
                                                                setFieldValue(
                                                                    'service_image_files',
                                                                    newFiles,
                                                                )
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                                                        >
                                                            x
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <FaCamera
                                            className="mx-auto h-10 w-10 text-gray-300"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div className="mt-3 text-sm text-gray-600">
                                        <label
                                            htmlFor="create-images-upload"
                                            className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                            Agregar imagenes
                                        </label>
                                        <input
                                            id="create-images-upload"
                                            name="create-images-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="sr-only"
                                            onChange={(e) => {
                                                const files = Array.from(
                                                    e.target.files || [],
                                                )
                                                const previews = files.map((file) =>
                                                    URL.createObjectURL(file),
                                                )
                                                setFieldValue('service_image', [
                                                    ...(values.service_image || []),
                                                    ...previews,
                                                ])
                                                setFieldValue('service_image_files', [
                                                    ...(values.service_image_files ||
                                                        []),
                                                    ...files,
                                                ])
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                                Este servicio se creará apagado por defecto.
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="plain"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    loading={isSubmitting || uploadingImages}
                                >
                                    Guardar servicio
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </Drawer>
    )
}

export default CreateServiceDrawer
