import React, { useState, useEffect } from 'react'
import { Button, Drawer, Input, Notification, toast } from '@/components/ui'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { db } from '@/configs/firebaseAssets.config'
import { doc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore'

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

const PaymentForm: React.FC<{ subscriptionId: string }> = ({ subscriptionId }) => {
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo')
    const [metodosPago, setMetodosPago] = useState<MetodoPagoInfo[]>([])
    const [cargando, setCargando] = useState(false)
    const [openDrawer, setOpenDrawer] = useState(false)


    useEffect(() => {
        const fetchMetodosPago = async () => {
            const metodosRef = collection(db, 'MetodosPago')
            const querySnapshot = await getDocs(metodosRef)
            const data = querySnapshot.docs.map(doc => doc.data() as MetodoPagoInfo)
            setMetodosPago(data.filter(m => m.status))
        }
        fetchMetodosPago()
    }, [])

    const handleMetodoPagoChange = (metodo: MetodoPago) => {
        setMetodoPago(metodo)
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
        telefono: Yup.string().required('El teléfono es obligatorio'),
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
        metodoPago: '', // Agregar metodoPago aquí
        monto: '',
        numReferencia: '',
        telefono: '',
        correo: '',
        cedula: '',
        bancoOrigen: '',
        bancoDestino: '',
        fechaPago: '',
    }

    const handleSubmit = async (values: any) => {
        if (!subscriptionId) {
            console.error('Error: subscriptionId no está definido')
            return
        }

        setCargando(true)

        try {
            const fechaPagoTimestamp = values.fechaPago ? Timestamp.fromDate(new Date(values.fechaPago)) : null

            const comprobantePago: any = {
                metodo: metodoPago,
                monto: values.monto,
                fechaPago: fechaPagoTimestamp,
            }

            // if (metodoPago === 'Transferencia') {
                comprobantePago.numReferencia = values.numReferencia == undefined ? '' : values.numReferencia
                comprobantePago.cedula = values.cedula == undefined ? '' : values.cedula
                comprobantePago.bancoOrigen = values.bancoOrigen == undefined ? '' : values.bancoOrigen
                comprobantePago.bancoDestino = values.bancoDestino == undefined ? '' : values.bancoDestino
            // }

            // if (metodoPago === 'Pago Móvil') {
                comprobantePago.cedula = values.cedula
                comprobantePago.telefono = values.telefono
                comprobantePago.bancoOrigen = values.bancoOrigen
                comprobantePago.bancoDestino = values.bancoDestino
            // }

            // if (metodoPago === 'Zelle') {
                comprobantePago.correo = values.correo == undefined ? '' : values.correo
                comprobantePago.numReferencia = values.numReferencia
            // }

           console.log(comprobantePago)
            const subscriptionRef = doc(db, 'Subscripciones', subscriptionId)
            await updateDoc(subscriptionRef, {
                comprobante_pago: comprobantePago,
            })

            console.log('Pago registrado exitosamente')
            toast.push(
                <Notification title="Éxito" type="success">
                    Se ha registrado el pago correctamente.
                </Notification>
            );
        } catch (error) {
            console.error('Error al registrar el pago:', error)
            toast.push(
                <Notification title="Error">
                    Ocurrió un problema al registrar el pago.
                </Notification>
            );
        } finally {
            setCargando(false)
            setOpenDrawer(false)
        }
    }

    // Filtra los detalles del método de pago seleccionado
    const metodoPagoInfo = metodosPago.find(m => m.tipo_pago === metodoPago)

    return (
        <>
            <button onClick={() => setOpenDrawer(true)} className='bg-blue-900 rounded-md p-2 text-white hover:bg-blue-700'>
                Reportar Pago
            </button>

            <Drawer isOpen={openDrawer} onClose={() => setOpenDrawer(false)} title="Registrar Pago">
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    validateOnChange={false}
                >
                    {({ setFieldValue }) => (
                        <Form className="flex flex-col gap-4">
                            <h4 className="font-semibold text-lg">Selecciona el Método de Pago</h4>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {metodosPago.map((metodo) => (
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
                                    <Field id="telefono" name="telefono" as={Input} placeholder="Teléfono" />
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

                            <button type="submit"  className="w-full py-2 mt-4 bg-blue-900 rounded-md hover:bg-blue-700 text-white">
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
