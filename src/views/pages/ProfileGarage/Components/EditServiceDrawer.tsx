import React, { useState, useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FaCamera } from 'react-icons/fa'
import Select from 'react-select'
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
                    service_image: service?.service_image || service?.imagenes || [],
                    service_image_files: [],
                    uid_taller: service?.uid_taller || '',
                    taller: service?.taller || '',
                    precio: service?.precio?.toString() || '',
                    garantia: service?.garantia || '',
                    typeService: service?.typeService || 'local',
                    subcategoria: service?.subcategoria || [],
                }
                console.log('Service data:', service)
                console.log('Initial values:', initialVals)
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
            console.log('Subcategories loaded:', subcategories)
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
                    errors,
                    touched,
                }) => (
                    <Form className="flex flex-col space-y-6">
                        {/* Imágenes del servicio */}
                        <div className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                            <div className="text-center">
                                {Array.isArray(values.service_image) && values.service_image.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {values.service_image.map((img: string, index: number) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={img}
                                                    alt={`Imagen del servicio ${index + 1}`}
                                                    className="h-32 w-full object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = values.service_image.filter((_: any, i: number) => i !== index)
                                                        setFieldValue("service_image", newImages)
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
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
                                        (cat) => cat.id === selectedId,
                                    )
                                    setFieldValue('uid_categoria', selectedId)
                                    setFieldValue('nombre_categoria', selectedCat?.nombre || '')
                                    setFieldValue('subcategoria', [])
                                    handleCategoryChange(selectedId)
                                }}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                <option value="">Seleccione una categoría</option>
                                {dataCategories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
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
                            noOptionsMessage={() => 'No hay Subcategorías disponibles'}
                            options={
                                values.uid_categoria
                                    ? dataSubcategories.map((subcategory) => ({
                                          value: subcategory.id,
                                          label: subcategory.nombre,
                                      }))
                                    : []
                            }
                            value={
                                Array.isArray(values.subcategoria) 
                                    ? values.subcategoria.map((subcat: any) => ({
                                          value: subcat.uid_subcategoria || subcat.id,
                                          label: subcat.nombre_subcategoria || subcat.nombre,
                                      }))
                                    : []
                            }
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
                                onClick={onClose}
                                className="mr-2"
                                disabled={uploadingImages}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                style={{ backgroundColor: '#000B7E' }}
                                className="text-white hover:opacity-80"
                                disabled={uploadingImages}
                            >
                                {uploadingImages ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </div>
                                ) : (
                                    'Guardar'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default EditServiceDrawer
