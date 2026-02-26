import React, { useState, useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FaCamera } from 'react-icons/fa'
import Select from 'react-select'
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/configs/firebaseAssets.config'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface EditPromotionDrawerProps {
    isOpen: boolean
    onClose: () => void
    promotion?: any
    onPromotionUpdated?: () => void
    /** Modo crear: se usa cuando promotion es null. Nueva promoción se agrega vía callback (data estática). */
    tallerUid?: string
    tallerName?: string
    onPromotionCreated?: (promotion: any) => void
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
    nombre_servicio: Yup.string().required('El nombre de la promoción es requerido'),
    descripcion: Yup.string().required('La descripción es requerida'),
    uid_categoria: Yup.string().required('La categoría es requerida'),
    precio: Yup.string().required('El precio es requerido'),
    garantia: Yup.string().required('La garantía es requerida'),
    typeService: Yup.string().required('El tipo de servicio es requerido'),
})

const emptyInitialValues = {
    nombre_servicio: '',
    descripcion: '',
    uid_categoria: '',
    nombre_categoria: '',
    service_image: [] as string[],
    service_image_files: [] as File[],
    uid_taller: '',
    taller: '',
    precio: '',
    garantia: '',
    typeService: 'local',
    subcategoria: [],
}

const EditPromotionDrawer: React.FC<EditPromotionDrawerProps> = ({
    isOpen,
    onClose,
    promotion,
    onPromotionUpdated,
    tallerUid = '',
    tallerName = '',
    onPromotionCreated,
}) => {
    const [dataCategories, setDataCategories] = useState<Category[]>([])
    const [dataSubcategories, setDataSubcategories] = useState<Subcategory[]>([])
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const [loading, setLoading] = useState(false)
    const [initialValues, setInitialValues] = useState<any>(null)
    const [uploadingImages, setUploadingImages] = useState(false)

    const handleCategoryChange = async (categoryId: string) => {
        if (!categoryId) {
            setDataSubcategories([])
            return
        }
        try {
            const subcategoriesQuery = query(
                collection(db, 'Categorias', categoryId, 'Subcategorias'),
                where('estatus', '==', true)
            )
            const subcategoriesSnapshot = await getDocs(subcategoriesQuery)
            const subcategories = subcategoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Subcategory[]
            setDataSubcategories(subcategories)
        } catch (error) {
            console.error('Error loading subcategories:', error)
            setDataSubcategories([])
        }
    }

    const isCreateMode = !promotion

    useEffect(() => {
        const loadData = async () => {
            if (!isOpen) return

            setLoading(true)
            try {
                const categoriesQuery = query(collection(db, 'Categorias'), where('estatus', '==', true))
                const categoriesSnapshot = await getDocs(categoriesQuery)
                const categories = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Category[]
                setDataCategories(categories)

                const garagesDoc = await getDoc(doc(db, 'talleres', 'talleres'))
                if (garagesDoc.exists()) {
                    setDataGarages(garagesDoc.data().talleres || [])
                }

                if (isCreateMode) {
                    setInitialValues({ ...emptyInitialValues, uid_taller: tallerUid, taller: tallerName })
                } else {
                    const initialVals = {
                        nombre_servicio: promotion?.nombre_servicio || '',
                        descripcion: promotion?.descripcion || '',
                        uid_categoria: promotion?.uid_categoria || '',
                        nombre_categoria: promotion?.nombre_categoria || '',
                        service_image: promotion?.service_image || promotion?.imagenes || [],
                        service_image_files: [],
                        uid_taller: promotion?.uid_taller || '',
                        taller: promotion?.taller || '',
                        precio: promotion?.precio?.toString() || '',
                        garantia: promotion?.garantia || '',
                        typeService: promotion?.typeService || 'local',
                        subcategoria: promotion?.subcategoria || [],
                    }
                    setInitialValues(initialVals)
                    if (promotion?.uid_categoria) {
                        await handleCategoryChange(promotion.uid_categoria)
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error)
                toast.push(<Notification title="Error">Error al cargar los datos</Notification>)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [isOpen, promotion, isCreateMode, tallerUid, tallerName])

    useEffect(() => {
        if (initialValues?.uid_categoria && dataCategories.length > 0) {
            handleCategoryChange(initialValues.uid_categoria)
        }
    }, [initialValues?.uid_categoria, dataCategories.length])

    const uploadPromotionImages = async (files: File[], promotionId: string): Promise<string[]> => {
        const uploadedUrls: string[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const timestamp = Date.now()
            const fileName = `promo_${promotionId}_${timestamp}_${i}.jpg`
            const storageRef = ref(storage, `promotion_images/${fileName}`)
            await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(storageRef)
            uploadedUrls.push(downloadURL)
        }
        return uploadedUrls
    }

    const handleSubmit = async (values: any) => {
        try {
            if (isCreateMode) {
                const newPromo = {
                    uid_promocion: `promo-${Date.now()}`,
                    nombre_servicio: values.nombre_servicio,
                    descripcion: values.descripcion,
                    precio: values.precio || '0',
                    taller: tallerName,
                    uid_taller: tallerUid,
                    estatus: true,
                    uid_categoria: values.uid_categoria || '',
                    nombre_categoria: values.nombre_categoria || '',
                    subcategoria: values.subcategoria || [],
                    garantia: values.garantia || '',
                    typeService: values.typeService || 'local',
                    service_image: Array.isArray(values.service_image) ? values.service_image.filter((img: string) => !img.startsWith('blob:')) : [],
                }
                onPromotionCreated?.(newPromo)
                toast.push(<Notification title="Éxito">Promoción creada correctamente</Notification>)
                onClose()
                return
            }

            if (!promotion?.uid_promocion) {
                toast.push(<Notification title="Error">No se pudo identificar la promoción a editar</Notification>)
                return
            }

            setUploadingImages(true)
            let finalImages = [...(values.service_image || [])]

            if (values.service_image_files && values.service_image_files.length > 0) {
                try {
                    const newImageUrls = await uploadPromotionImages(values.service_image_files, promotion.uid_promocion)
                    const existingImages = finalImages.filter((img: string) => !img.startsWith('blob:'))
                    finalImages = [...existingImages, ...newImageUrls]
                } catch (error) {
                    console.error('Error uploading images:', error)
                    toast.push(<Notification title="Error">Error al subir las imágenes</Notification>)
                    setUploadingImages(false)
                    return
                }
            } else {
                finalImages = finalImages.filter((img: string) => !img.startsWith('blob:'))
            }

            const promoRef = doc(db, 'Promociones', promotion.uid_promocion)
            await updateDoc(promoRef, {
                nombre_servicio: values.nombre_servicio,
                descripcion: values.descripcion,
                uid_categoria: values.uid_categoria,
                nombre_categoria: values.nombre_categoria,
                precio: values.precio,
                garantia: values.garantia,
                typeService: values.typeService,
                subcategoria: values.subcategoria,
                service_image: finalImages,
                uid_taller: promotion.uid_taller,
                taller: promotion.taller,
                updatedAt: new Date(),
            })

            toast.push(<Notification title="Éxito">Promoción actualizada correctamente</Notification>)
            onPromotionUpdated?.()
            onClose()
        } catch (error) {
            console.error('Error updating promotion:', error)
            toast.push(<Notification title="Error">No se pudo actualizar la promoción</Notification>)
        } finally {
            setUploadingImages(false)
        }
    }

    const formInitialValues = initialValues ?? (isCreateMode ? { ...emptyInitialValues, uid_taller: tallerUid, taller: tallerName } : null)
    if (!isOpen || formInitialValues === null) return null

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            className="rounded-md shadow w-full max-w-2xl"
        >
            <h2 className="mb-4 text-xl font-bold">{isCreateMode ? 'Crear promoción' : 'Editar Promoción'}</h2>
            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            <Formik
                initialValues={formInitialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
                key={isCreateMode ? 'create' : promotion?.uid_promocion}
            >
                {({ values, handleChange, setFieldValue }) => (
                    <Form className="flex flex-col space-y-6">
                        <div className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                            <div className="text-center">
                                {Array.isArray(values.service_image) && values.service_image.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {values.service_image.map((img: string, index: number) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={img}
                                                    alt={`Imagen promoción ${index + 1}`}
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
                                        htmlFor="images-upload-promo"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 flex justify-center items-center"
                                    >
                                        <span>Agregar otra imagen</span>
                                        <input
                                            id="images-upload-promo"
                                            name="images-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="sr-only"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || [])
                                                const newImages = files.map((file) => URL.createObjectURL(file))
                                                setFieldValue("service_image", [...(values.service_image || []), ...newImages])
                                                setFieldValue("service_image_files", [...(values.service_image_files || []), ...files])
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">Nombre de la promoción:</span>
                            <Field
                                type="text"
                                name="nombre_servicio"
                                value={values.nombre_servicio}
                                onChange={handleChange}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                            <ErrorMessage name="nombre_servicio" component="div" className="text-red-600 text-sm" />
                        </label>

                        <div className="flex flex-col space-y-4">
                            <span className="font-semibold text-gray-700">Tipo de servicio:</span>
                            <div className="flex items-center space-x-10">
                                <label className="flex items-center space-x-2">
                                    <Field type="radio" name="typeService" value="local" className="form-radio" />
                                    <span>En el Local</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <Field type="radio" name="typeService" value="domicilio" className="form-radio" />
                                    <span>A Domicilio</span>
                                </label>
                            </div>
                            <ErrorMessage name="typeService" component="div" className="text-red-600 text-sm" />
                        </div>

                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">Categoría:</span>
                            <Field
                                as="select"
                                name="uid_categoria"
                                value={values.uid_categoria}
                                onChange={(e: any) => {
                                    const selectedId = e.target.value
                                    const selectedCat = dataCategories.find((cat) => cat.id === selectedId)
                                    setFieldValue('uid_categoria', selectedId)
                                    setFieldValue('nombre_categoria', selectedCat?.nombre || '')
                                    setFieldValue('subcategoria', [])
                                    handleCategoryChange(selectedId)
                                }}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                <option value="">Seleccione una categoría</option>
                                {dataCategories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.nombre}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="uid_categoria" component="div" className="text-red-600 text-sm" />
                        </label>

                        <label className="font-semibold text-gray-700">Subcategorías:</label>
                        <Select
                            isMulti
                            placeholder="Selecciona subcategorías"
                            noOptionsMessage={() => 'No hay Subcategorías disponibles'}
                            options={values.uid_categoria ? dataSubcategories.map((subcategory) => ({ value: subcategory.id, label: subcategory.nombre })) : []}
                            value={Array.isArray(values.subcategoria) ? values.subcategoria.map((subcat: any) => ({ value: subcat.uid_subcategoria || subcat.id, label: subcat.nombre_subcategoria || subcat.nombre })) : []}
                            onChange={(selectedOptions) =>
                                setFieldValue('subcategoria', selectedOptions.map((option) => ({ uid_subcategoria: option.value, nombre_subcategoria: option.label })))
                            }
                            className="mt-1"
                        />

                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">Descripción:</span>
                            <Field
                                as="textarea"
                                name="descripcion"
                                value={values.descripcion}
                                onChange={handleChange}
                                rows={1}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none overflow-hidden"
                                style={{ maxHeight: '150px', overflowY: 'auto' }}
                                onInput={(e: any) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = `${e.target.scrollHeight}px`
                                }}
                            />
                            <ErrorMessage name="descripcion" component="div" className="text-red-600 text-sm" />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">Precio:</span>
                            <Field
                                type="text"
                                name="precio"
                                value={values.precio}
                                onChange={handleChange}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                            <ErrorMessage name="precio" component="div" className="text-red-600 text-sm" />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">Garantía:</span>
                            <Field
                                type="text"
                                name="garantia"
                                value={values.garantia}
                                onChange={handleChange}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                            <ErrorMessage name="garantia" component="div" className="text-red-600 text-sm" />
                        </label>

                        <div className="text-right mt-6">
                            <Button variant="default" onClick={onClose} className="mr-2" disabled={uploadingImages}>
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

export default EditPromotionDrawer
