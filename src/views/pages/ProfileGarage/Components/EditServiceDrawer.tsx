import React, { useState, useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FaCamera } from 'react-icons/fa'
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/configs/firebaseAssets.config'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface EditServiceDrawerProps {
    isOpen: boolean
    onClose: () => void
    service?: any
    onServiceUpdated?: () => void
}

interface Category {
    id: string
    nombre: string
    descripcion: string
    estatus: boolean
    imageUrl: string
    fechaCreacion: any
    nombreUser: string
}

interface Subcategory {
    id: string
    nombre: string
    descripcion: string
    estatus: boolean
    uid: string
}

interface Garage {
    uid: string
    nombre: string
}

const validationSchema = Yup.object().shape({
    nombre_servicio: Yup.string().required('El nombre del servicio es requerido'),
    descripcion: Yup.string().required('La descripción es requerida'),
    uid_categoria: Yup.string().required('La categoría es requerida'),
    precio: Yup.string().required('El precio es requerido'),
    garantia: Yup.string().required('La garantía es requerida'),
    typeService: Yup.string().required('El tipo de servicio es requerido'),
})

const EditServiceDrawer: React.FC<EditServiceDrawerProps> = ({
    isOpen,
    onClose,
    service,
    onServiceUpdated
}) => {
    const [dataCategories, setDataCategories] = useState<Category[]>([])
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>([])
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [loading, setLoading] = useState(false)
    const [initialValues, setInitialValues] = useState<any>(null)
    const [uploadingImages, setUploadingImages] = useState(false)

    // Cargar datos necesarios cuando se abre el drawer
    useEffect(() => {
        const loadData = async () => {
            if (!isOpen || !service) return
            
            setLoading(true)
            try {
                // Cargar categorías desde la colección "Categorias"
                const categoriesQuery = query(collection(db, 'Categorias'), where('estatus', '==', true))
                const categoriesSnapshot = await getDocs(categoriesQuery)
                const categories = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Category[]
                setDataCategories(categories)

                // Cargar talleres
                const garagesDoc = await getDoc(doc(db, 'talleres', 'talleres'))
                if (garagesDoc.exists()) {
                    setDataGarages(garagesDoc.data().talleres || [])
                }

                // Preparar valores iniciales
                const initialVals = {
                    nombre_servicio: service?.nombre_servicio || '',
                    descripcion: service?.descripcion || '',
                    uid_categoria: service?.uid_categoria || '',
                    nombre_categoria: service?.nombre_categoria || '',
                    uid_subcategoria:
                        service?.subcategoria?.[0]?.uid_subcategoria ||
                        service?.uid_subcategoria ||
                        '',
                    service_image: service?.service_image || service?.imagenes || [],
                    service_image_files: [],
                    uid_taller: service?.uid_taller || '',
                    taller: service?.taller || '',
                    precio: service?.precio?.toString() || '',
                    garantia: service?.garantia || '',
                    typeService: service?.typeService || 'local',
                    subcategoria: service?.subcategoria || [],
                }
                //console.log('Service data:', service)
                //console.log('Initial values:', initialVals)
                setInitialValues(initialVals)

                // Si hay un servicio seleccionado con categoría, cargar sus subcategorías
                if (service?.uid_categoria) {
                    await handleCategoryChange(service.uid_categoria)
                }
            } catch (error) {
                console.error('Error loading data:', error)
                toast.push(<Notification title="Error">Error al cargar los datos</Notification>)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [isOpen, service])

    // Cargar subcategorías cuando cambia la categoría o cuando se cargan los valores iniciales
    useEffect(() => {
        if (initialValues?.uid_categoria && dataCategories.length > 0) {
            handleCategoryChange(initialValues.uid_categoria)
        }
    }, [initialValues?.uid_categoria, dataCategories.length])

    const handleCategoryChange = async (categoryId: string) => {
        if (!categoryId) {
            setDataSubcategories([])
            return
        }

        try {
            // Cargar subcategorías desde la subcolección "Subcategorias" de la categoría seleccionada
            const subcategoriesQuery = query(
                collection(db, 'Categorias', categoryId, 'Subcategorias'),
                where('estatus', '==', true)
            )
            const subcategoriesSnapshot = await getDocs(subcategoriesQuery)
            const subcategories = subcategoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Subcategory[]
            //console.log('Subcategories loaded:', subcategories)
            setDataSubcategories(subcategories)
        } catch (error) {
            console.error('Error loading subcategories:', error)
            setDataSubcategories([])
        }
    }

    const uploadServiceImages = async (files: File[], serviceId: string): Promise<string[]> => {
        const uploadedUrls: string[] = []
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const timestamp = Date.now()
            const fileName = `${serviceId}_${timestamp}_${i}.jpg`
            const storageRef = ref(storage, `service_images/${fileName}`)
            
            try {
                await uploadBytes(storageRef, file)
                const downloadURL = await getDownloadURL(storageRef)
                uploadedUrls.push(downloadURL)
            } catch (error) {
                console.error('Error uploading image:', error)
                throw new Error(`Error al subir la imagen ${i + 1}`)
            }
        }
        
        return uploadedUrls
    }

    const handleUpdateService = async (values: any) => {
        try {
            if (!service?.uid_servicio) {
                toast.push(<Notification title="Error">No se pudo identificar el servicio a editar</Notification>)
                return
            }

            setUploadingImages(true)

            // Procesar nuevas imágenes si las hay
            let finalImages = [...(values.service_image || [])]
            
            if (values.service_image_files && values.service_image_files.length > 0) {
                try {
                    const newImageUrls = await uploadServiceImages(values.service_image_files, service.uid_servicio)
                    // Filtrar solo las URLs que no son de preview (que no empiezan con blob:)
                    const existingImages = finalImages.filter((img: string) => !img.startsWith('blob:'))
                    finalImages = [...existingImages, ...newImageUrls]
                } catch (error) {
                    console.error('Error uploading images:', error)
                    toast.push(<Notification title="Error">Error al subir las imágenes</Notification>)
                    setUploadingImages(false)
                    return
                }
            } else {
                // Si no hay nuevas imágenes, filtrar las URLs de preview existentes
                finalImages = finalImages.filter((img: string) => !img.startsWith('blob:'))
            }

            // Actualizar el servicio en Firestore
            const serviceRef = doc(db, 'Servicios', service.uid_servicio)
            await updateDoc(serviceRef, {
                nombre_servicio: values.nombre_servicio,
                descripcion: values.descripcion,
                uid_categoria: values.uid_categoria,
                nombre_categoria: values.nombre_categoria,
                precio: values.precio,
                garantia: values.garantia,
                typeService: values.typeService,
                subcategoria: values.subcategoria,
                service_image: finalImages,
                // Mantener los valores originales del taller
                uid_taller: service.uid_taller,
                taller: service.taller,
                updatedAt: new Date(),
            })

            toast.push(<Notification title="Éxito">Servicio actualizado correctamente</Notification>)

            onServiceUpdated?.()
            onClose()
        } catch (error) {
            console.error('Error updating service:', error)
            toast.push(<Notification title="Error">No se pudo actualizar el servicio</Notification>)
        } finally {
            setUploadingImages(false)
        }
    }

    if (!service || !initialValues) return null

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            className="rounded-md shadow w-full max-w-2xl"
        >
            <h2 className="mb-4 text-xl font-bold">Editar Servicio</h2>
            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleUpdateService}
                enableReinitialize={true}
            >
                {({
                    values,
                    handleChange,
                    setFieldValue,
                }) => (
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
                                        const selectedId = e.target.value
                                        const selectedCat = dataCategories.find(
                                            (cat) => cat.id === selectedId,
                                        )
                                        setFieldValue('uid_categoria', selectedId)
                                        setFieldValue(
                                            'nombre_categoria',
                                            selectedCat?.nombre || '',
                                        )
                                        setFieldValue('uid_subcategoria', '')
                                        setFieldValue('subcategoria', [])
                                        void handleCategoryChange(selectedId)
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
                                    value={
                                        values.uid_subcategoria ||
                                        values.subcategoria?.[0]?.uid_subcategoria ||
                                        ''
                                    }
                                    onChange={(e) => {
                                        const selectedId = e.target.value
                                        const selectedSubcategory =
                                            dataSubcategories.find(
                                                (sub) => sub.id === selectedId,
                                            )
                                        setFieldValue('uid_subcategoria', selectedId)
                                        setFieldValue(
                                            'subcategoria',
                                            selectedSubcategory
                                                ? [
                                                      {
                                                          uid_subcategoria:
                                                              selectedSubcategory.id,
                                                          nombre_subcategoria:
                                                              selectedSubcategory.nombre,
                                                      },
                                                  ]
                                                : [],
                                        )
                                    }}
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
                                                                    (_: any, i: number) =>
                                                                        i !== index,
                                                                )
                                                            setFieldValue(
                                                                'service_image',
                                                                newImages,
                                                            )
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                                                    >
                                                        ×
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
                                        htmlFor="images-upload"
                                        className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Agregar otra imagen
                                    </label>
                                    <input
                                        id="images-upload"
                                        name="images-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="sr-only"
                                        onChange={(e) => {
                                            const files = Array.from(
                                                e.target.files || [],
                                            )
                                            const newImages = files.map((file) =>
                                                URL.createObjectURL(file),
                                            )
                                            setFieldValue('service_image', [
                                                ...(values.service_image || []),
                                                ...newImages,
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

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="plain"
                                onClick={onClose}
                                disabled={uploadingImages}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                disabled={uploadingImages}
                            >
                                {uploadingImages ? 'Guardando...' : 'Guardar servicio'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default EditServiceDrawer
