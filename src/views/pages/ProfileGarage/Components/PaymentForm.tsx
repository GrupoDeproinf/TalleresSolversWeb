import React, { useState, useEffect } from 'react'
import { Button, Drawer, Input, Notification, toast, Dialog } from '@/components/ui'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { db } from '@/configs/firebaseAssets.config'
import { doc, updateDoc, collection, getDocs, Timestamp, getDoc } from 'firebase/firestore'
import { FaCamera } from 'react-icons/fa'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


type MetodoPago = 'Transferencia' | 'Pago Móvil' | 'Zelle' | 'Efectivo'

interface MetodoPagoInfo {
    tipo_pago: MetodoPago
    status: boolean
    email?: string
    num_ref?: string
    banco?: string
    cedula_rif?: string
    cuenta?: string
    status_pago?: boolean
    tipo_cuenta?: string
    telefono?: string
    titular?: string
    newLogoFile?: File | null;
}

const bancos = [
    { codigo: "0102", nombre: "BANCO DE VENEZUELA" },
    { codigo: "0156", nombre: "100% BANCO" },
    { codigo: "0172", nombre: "BANCAMIGA BANCO MICROFINANCIERO C A" },
    { codigo: "0114", nombre: "BANCARIBE" },
    { codigo: "0171", nombre: "BANCO ACTIVO" },
    { codigo: "0166", nombre: "BANCO AGRICOLA DE VENEZUELA" },
    { codigo: "0175", nombre: "BANCO BICENTENARIO DEL PUEBLO" },
    { codigo: "0128", nombre: "BANCO CARONI" },
    { codigo: "0163", nombre: "BANCO DEL TESORO" },
    { codigo: "0115", nombre: "BANCO EXTERIOR" },
    { codigo: "0151", nombre: "BANCO FONDO COMUN" },
    { codigo: "0173", nombre: "BANCO INTERNACIONAL DE DESARROLLO" },
    { codigo: "0105", nombre: "BANCO MERCANTIL" },
    { codigo: "0191", nombre: "BANCO NACIONAL DE CREDITO" },
    { codigo: "0138", nombre: "BANCO PLAZA" },
    { codigo: "0137", nombre: "BANCO SOFITASA" },
    { codigo: "0104", nombre: "BANCO VENEZOLANO DE CREDITO" },
    { codigo: "0168", nombre: "BANCRECER" },
    { codigo: "0134", nombre: "BANESCO" },
    { codigo: "0177", nombre: "BANFANB" },
    { codigo: "0146", nombre: "BANGENTE" },
    { codigo: "0174", nombre: "BANPLUS" },
    { codigo: "0108", nombre: "BBVA PROVINCIAL" },
    { codigo: "0157", nombre: "DELSUR BANCO UNIVERSAL" },
    { codigo: "0169", nombre: "MI BANCO" },
    { codigo: "0178", nombre: "N58 BANCO DIGITAL BANCO MICROFINANCIERO S A" },
];

const PaymentForm: React.FC<{ subscriptionId: string, talleruid: string }> = ({ subscriptionId, talleruid }) => {
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo')
    const [metodosPago, setMetodosPago] = useState<MetodoPagoInfo[]>([])
    const [cargando, setCargando] = useState(false)
    const [openDrawer, setOpenDrawer] = useState(false)
    const [pagoReportado, setPagoReportado] = useState(false)
    const [showModal, setShowModal] = useState(false)


    useEffect(() => {
        const fetchMetodosPago = async () => {
            const metodosRef = collection(db, 'MetodosPago')
            const querySnapshot = await getDocs(metodosRef)
            const data = querySnapshot.docs.map(doc => doc.data() as MetodoPagoInfo)
            setMetodosPago(data.filter(m => m.status))
        }
        fetchMetodosPago()
    }, [])

    useEffect(() => {
        const verificarPagoReportado = async () => {
            if (talleruid) {
                try {
                    const tallerRef = doc(db, 'Usuarios', talleruid)
                    const tallerDoc = await getDoc(tallerRef)
                    
                    if (tallerDoc.exists()) {
                        const tallerData = tallerDoc.data()
                        const subscripcionActual = tallerData.subscripcion_actual
                        
                        if (subscripcionActual && subscripcionActual.pago_reportado === true) {
                            setPagoReportado(true)
                        }
                    }
                } catch (error) {
                    console.error('Error al verificar si ya se reportó el pago:', error)
                }
            }
        }
        
        verificarPagoReportado()
    }, [talleruid])

    const handleMetodoPagoChange = (metodo: MetodoPago) => {
        setMetodoPago(metodo)
    }

    const handleReportarPago = () => {
        if (pagoReportado) {
            setShowModal(true)
        } else {
            setOpenDrawer(true)
        }
    }

    const EfectivoValidationSchema = Yup.object().shape({
        monto: Yup.number().required('El monto es obligatorio').positive('El monto debe ser positivo').min(1, 'El monto debe ser mayor a cero'),
        fechaPago: Yup.date().max(new Date(), 'La fecha no puede ser futura').required('La fecha es obligatoria'),
    })

    const TransferenciaValidationSchema = Yup.object().shape({
        monto: Yup.number().required('El monto es obligatorio').positive('El monto debe ser positivo').min(1, 'El monto debe ser mayor a cero'),
        numReferencia: Yup.string().required('El número de referencia es obligatorio'),
        bancoDestino: Yup.string().required('Selecciona un banco de destino'),
        bancoOrigen: Yup.string().required('Selecciona un banco de origen'),
        fechaPago: Yup.date().max(new Date(), 'La fecha no puede ser futura').required('La fecha es obligatoria'),
    })

    const PagoMovilValidationSchema = Yup.object().shape({
        monto: Yup.number().required('El monto es obligatorio').positive('El monto debe ser positivo').min(1, 'El monto debe ser mayor a cero'),
        numReferencia: Yup.string().required('El número de referencia es obligatorio'),
        telefono: Yup.string()
            .required('El teléfono es obligatorio')
            .matches(/^[1-9]\d*$/, 'El teléfono no puede comenzar con 0 y debe contener solo números'),
        bancoDestino: Yup.string().required('Selecciona un banco de destino'),
        bancoOrigen: Yup.string().required('Selecciona un banco de origen'),
        fechaPago: Yup.date().max(new Date(), 'La fecha no puede ser futura').required('La fecha es obligatoria'),
    })

    const ZelleValidationSchema = Yup.object().shape({
        monto: Yup.number().required('El monto es obligatorio').positive('El monto debe ser positivo').min(1, 'El monto debe ser mayor a cero'),
        correo: Yup.string().email('El correo no es válido').required('El correo Zelle es obligatorio'),
        fechaPago: Yup.date().max(new Date(), 'La fecha no puede ser futura').required('La fecha es obligatoria'),
    })

    const validationSchema = Yup.object().shape({
        ...(metodoPago === 'Efectivo' && EfectivoValidationSchema.fields),
        ...(metodoPago === 'Transferencia' && TransferenciaValidationSchema.fields),
        ...(metodoPago === 'Pago Móvil' && PagoMovilValidationSchema.fields),
        ...(metodoPago === 'Zelle' && ZelleValidationSchema.fields),
    })


    const initialValues = {
        metodoPago: '',
        monto: '',
        numReferencia: '',
        telefono: '',
        correo: '',
        cedula: '',
        bancoOrigen: '',
        bancoDestino: '',
        fechaPago: '',
        newLogoFile: null
    }

    const validateDuplicatePayment = async (values: any, metodoPago: string) => {
        try {
            // Obtener todas las subscripciones para verificar duplicados
            const subscripcionesRef = collection(db, 'Subscripciones')
            const querySnapshot = await getDocs(subscripcionesRef)
            
            const fechaPago = new Date(values.fechaPago)
            const fechaPagoFormateada = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}-${String(fechaPago.getDate()).padStart(2, '0')}`
            
            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data()
                const comprobantePago = data.comprobante_pago
                
                if (!comprobantePago) continue
                
                // Verificar si la fecha coincide (solo día, mes, año)
                if (comprobantePago.fechaPago) {
                    const fechaExistente = comprobantePago.fechaPago.toDate()
                    const fechaExistenteFormateada = `${fechaExistente.getFullYear()}-${String(fechaExistente.getMonth() + 1).padStart(2, '0')}-${String(fechaExistente.getDate()).padStart(2, '0')}`
                    
                    if (fechaExistenteFormateada === fechaPagoFormateada) {
                        // Verificar duplicidad por número de referencia para Pago Móvil y Transferencia
                        if ((metodoPago === 'Pago Móvil' || metodoPago === 'Transferencia') && 
                            comprobantePago.numReferencia === values.numReferencia) {
                            return {
                                isDuplicate: true,
                                message: `Ya existe un pago con el número de referencia ${values.numReferencia} en la fecha ${fechaPagoFormateada}`
                            }
                        }
                        
                        // Verificar duplicidad por correo para Zelle
                        if (metodoPago === 'Zelle' && 
                            comprobantePago.correo === values.correo) {
                            return {
                                isDuplicate: true,
                                message: `Ya existe un pago con el correo ${values.correo} en la fecha ${fechaPagoFormateada}`
                            }
                        }
                        
                        // Verificar duplicidad por monto para Efectivo
                        if (metodoPago === 'Efectivo' && 
                            comprobantePago.monto === parseFloat(values.monto)) {
                            return {
                                isDuplicate: true,
                                message: `Ya existe un pago en efectivo por el monto $${values.monto} en la fecha ${fechaPagoFormateada}`
                            }
                        }
                    }
                }
            }
            
            return { isDuplicate: false, message: '' }
        } catch (error) {
            console.error('Error al validar duplicidad:', error)
            return { isDuplicate: false, message: '' }
        }
    }

    const handleSubmit = async (values: any) => {
        if (!subscriptionId) {
            console.error('Error: subscriptionId no está definido')
            return
        }

        setCargando(true)

        try {
            // Validar duplicidad antes de proceder
            const validationResult = await validateDuplicatePayment(values, metodoPago)
            if (validationResult.isDuplicate) {
                toast.push(
                    <Notification title="Error" type="danger">
                        {validationResult.message}
                    </Notification>
                )
                setCargando(false)
                return
            }
            let imageUrl = '';
            if (values.newLogoFile && metodoPago && talleruid) {
                // Configura Firebase Storage
                const storage = getStorage();
                const fechaActual = new Date().toISOString(); // Fecha en formato ISO
                const nombreArchivo = `${metodoPago}_${talleruid}_${fechaActual}.jpg`; // Nombre del archivo
                const file = values.newLogoFile;

                // Usamos el nombre correcto para la referencia
                const storageRef = ref(storage, `paymentcommitment/${nombreArchivo}`);

                // Sube la imagen a Firebase Storage
                const snapshot = await uploadBytes(storageRef, file);

                // Obtén la URL pública de la imagen
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const fechaPagoTimestamp = values.fechaPago ? Timestamp.fromDate(new Date(values.fechaPago)) : null;

            const comprobantePago: any = {
                metodo: metodoPago,
                monto: values.monto,
                fechaPago: fechaPagoTimestamp,
                comprobante: imageUrl,
            };

            // Personalización según el método de pago
            if (metodoPago === 'Transferencia') {
                comprobantePago.numReferencia = values.numReferencia ?? '';
                comprobantePago.cedula = values.cedula ?? '';
                comprobantePago.bancoOrigen = values.bancoOrigen ?? '';
                comprobantePago.bancoDestino = values.bancoDestino ?? '';
            }

            if (metodoPago === 'Pago Móvil') {
                comprobantePago.cedula = values.cedula;
                comprobantePago.telefono = values.telefono;
                comprobantePago.bancoOrigen = values.bancoOrigen;
                comprobantePago.bancoDestino = values.bancoDestino;
            }

            if (metodoPago === 'Zelle') {
                comprobantePago.correo = values.correo ?? '';
                comprobantePago.numReferencia = values.numReferencia;
            }

            console.log(comprobantePago);
            const subscriptionRef = doc(db, 'Subscripciones', subscriptionId);
            await updateDoc(subscriptionRef, {
                comprobante_pago: comprobantePago,
            });

            // Actualizar el campo pago_reportado en la subscripción actual del taller
            if (talleruid) {
                const tallerRef = doc(db, 'Usuarios', talleruid);
                await updateDoc(tallerRef, {
                    'subscripcion_actual.pago_reportado': true,
                });
                setPagoReportado(true);
            }

            console.log('Pago registrado exitosamente');
            toast.push(
                <Notification title="Éxito" type="success">
                    Se ha registrado el pago correctamente.
                </Notification>
            );
        } catch (error) {
            console.error('Error al registrar el pago:', error);
            toast.push(
                <Notification title="Error">
                    Ocurrió un problema al registrar el pago.
                </Notification>
            );
        } finally {
            setCargando(false);
            setOpenDrawer(false);
        }
    }



    const metodoPagoInfo = metodosPago.find(m => m.tipo_pago === metodoPago)

    return (
        <>
            <button 
                onClick={handleReportarPago} 
                className='bg-blue-900 rounded-md p-2 text-white hover:bg-blue-700'
            >
                Reportar Pago
            </button>

            {/* Modal para pago ya reportado */}
            <Dialog isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Pago Ya Reportado</h4>
                    <p className="text-gray-600 mb-6">
                        Ya se ha reportado un pago para esta suscripción. No se puede reportar otro pago.
                    </p>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="bg-blue-900 rounded-md p-2 text-white hover:bg-blue-700"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </Dialog>

            <Drawer isOpen={openDrawer} onClose={() => setOpenDrawer(false)} title="Registrar Pago">
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    validateOnChange={false}
                >
                    {({ setFieldValue, values }) => (
                        <Form className="flex flex-col gap-4">
                            <h4 className="font-semibold text-lg">Selecciona el Método de Pago</h4>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {metodosPago?.map((metodo) => (
                                    <button
                                        key={metodo.tipo_pago}
                                        type="button"
                                        onClick={() => handleMetodoPagoChange(metodo.tipo_pago)}
                                        className={`text-sm py-2 px-4 rounded-md ${metodoPago === metodo.tipo_pago ? 'bg-[#1d1e56] text-white' : 'bg-gray-200'}`}
                                    >
                                        {metodo.tipo_pago}
                                    </button>
                                ))}
                            </div>

                            {metodoPago !== 'Efectivo' && metodoPagoInfo && (
                                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                    <h5 className="font-semibold text-lg">Detalles de la Empresa</h5>
                                    {metodoPagoInfo.email && <p><strong>Email:</strong> {metodoPagoInfo.email}</p>}
                                    {metodoPagoInfo.num_ref && <p><strong>Número de Referencia:</strong> {metodoPagoInfo.num_ref}</p>}
                                    {metodoPagoInfo.banco && <p><strong>Banco:</strong> {metodoPagoInfo.banco}</p>}
                                    {metodoPagoInfo.cedula_rif && <p><strong>Cédula/RIF:</strong> {metodoPagoInfo.cedula_rif}</p>}
                                    {metodoPagoInfo.cuenta && <p><strong>Cuenta:</strong> {metodoPagoInfo.cuenta}</p>}
                                    {metodoPagoInfo.status_pago !== undefined && <p><strong>Status:</strong> {metodoPagoInfo.status_pago ? 'Activo' : 'Inactivo'}</p>}
                                    {metodoPagoInfo.tipo_cuenta && <p><strong>Tipo de Cuenta:</strong> {metodoPagoInfo.tipo_cuenta}</p>}
                                    {metodoPagoInfo.telefono && <p><strong>Teléfono:</strong> {metodoPagoInfo.telefono}</p>}
                                    {metodoPagoInfo.titular && <p><strong>Titular:</strong> {metodoPagoInfo.titular}</p>}
                                </div>
                            )}

                            <Field id="monto" name="monto" as={Input} placeholder="Ingresa el monto en $" />
                            <ErrorMessage name="monto" component="div" className="text-red-500" />

                            <Field id="fechaPago" name="fechaPago" as={Input} type="date" placeholder="Fecha de pago" />
                            <ErrorMessage name="fechaPago" component="div" className="text-red-500" />

                            {metodoPago === 'Pago Móvil' &&
                                <>
                                    <Field 
                                        id="telefono" 
                                        name="telefono" 
                                        as={Input} 
                                        placeholder="Teléfono" 
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            // Prevenir escribir 0 al principio
                                            if (e.currentTarget.value === '' && e.key === '0') {
                                                e.preventDefault()
                                            }
                                        }}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            // Remover 0 al principio si se pega texto
                                            const value = e.target.value.replace(/^0+/, '')
                                            setFieldValue('telefono', value)
                                        }}
                                    />
                                    <ErrorMessage name="telefono" component="div" className="text-red-500" />
                                </>
                            }
                            {metodoPago === 'Zelle' && <Field id="correo" name="correo" as={Input} placeholder="Correo Zelle" />}
                            {['Transferencia', 'Pago Móvil'].includes(metodoPago!) && (
                                <>
                                    <Field id="numReferencia" name="numReferencia" as={Input} placeholder="Número de referencia" />
                                    <ErrorMessage name="numReferencia" component="div" className="text-red-500" />
                                </>
                            )}
                            {['Transferencia', 'Pago Móvil'].includes(metodoPago!) && (
                                <>
                                    <Field id="bancoDestino" as="select" name="bancoDestino" className="p-2 rounded-md border border-slate-300">
                                        <option value="">Selecciona Banco de Destino</option>
                                        {bancos.map((banco) => (
                                            <option key={banco.codigo} value={banco.nombre}>
                                                {banco.nombre}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="bancoDestino" component="div" className="text-red-500" />
                                    <Field id="bancoOrigen" as="select" name="bancoOrigen" className="p-2 rounded-md border border-slate-300">
                                        <option value="">Selecciona Banco de Origen</option>
                                        {bancos.map((banco) => (
                                            <option key={banco.codigo} value={banco.nombre}>
                                                {banco.nombre}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="bancoOrigen" component="div" className="text-red-500" />

                                </>
                            )}
                            {['Transferencia', 'Pago Móvil', 'Zelle'].includes(metodoPago!) && (
                                <>
                                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 gap-2">
                                        <div className="text-center">
                                            {!values.newLogoFile ? (
                                                <FaCamera className="text-gray-500 text-center text-3xl" />
                                            ) : (
                                                <img
                                                    src={URL.createObjectURL(values.newLogoFile)}
                                                    alt="Logo"
                                                    className="w-32 h-32 object-cover rounded-md"
                                                />
                                            )}
                                            <div className="mt-2">
                                                <label
                                                    htmlFor="fileInput"
                                                    className="text-sm font-medium text-blue-600 cursor-pointer"
                                                >
                                                    Subir Comprobante de Pago
                                                </label>
                                                <input
                                                    id="fileInput"
                                                    name="newLogoFile"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setFieldValue('newLogoFile', e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="w-full py-2 mt-4 bg-blue-900 rounded-md hover:bg-blue-700 text-white">
                                Registrar Pago
                            </button>
                        </Form>
                    )}
                </Formik>
            </Drawer>
        </>
    )
}

export default PaymentForm
