import React, { useState, useEffect } from 'react'
import { Button, Drawer, Input, Notification, toast } from '@/components/ui'
import { Formik, Form, Field } from 'formik'
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

const PaymentForm: React.FC<{ subscriptionId: string }> = ({ subscriptionId }) => {
    const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null)
    const [metodosPago, setMetodosPago] = useState<MetodoPagoInfo[]>([])
    const [cargando, setCargando] = useState(false)
    const [openDrawer, setOpenDrawer] = useState(false)

    // Cargar los métodos de pago desde Firestore
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

    const initialValues = {
        monto: '',
        numReferencia: '',
        telefono: '',
        banco: '',
        correo: '',
        cedula: '',
        bancoOrigen: '',
        bancoDestino: '',
        fechaPago: '',
    }

    const validationSchema = Yup.object({
        monto: Yup.string().required('Por favor, ingrese el monto'),
        fechaPago: Yup.date().required('Por favor, ingrese la fecha de pago'),
    })

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

            if (metodoPago === 'Transferencia') {
                comprobantePago.numReferencia = values.numReferencia
                comprobantePago.cedula = values.cedula
                comprobantePago.bancoOrigen = values.bancoOrigen
                comprobantePago.bancoDestino = values.bancoDestino
            }

            if (metodoPago === 'Pago Móvil') {
                comprobantePago.cedula = values.cedula
                comprobantePago.telefono = values.telefono
                comprobantePago.bancoOrigen = values.bancoOrigen
                comprobantePago.bancoDestino = values.bancoDestino
            }

            if (metodoPago === 'Zelle') {
                comprobantePago.correo = values.correo
                comprobantePago.numReferencia = values.numReferencia
            }

            Object.keys(comprobantePago).forEach(key => {
                if (comprobantePago[key] === null || comprobantePago[key] === '') {
                    delete comprobantePago[key]
                }
            })

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
            <button onClick={() => setOpenDrawer(true)} className='bg-blue-500 rounded-md p-2 text-white hover:bg-blue-600'>
                Reportar Pago
            </button>

            <Drawer isOpen={openDrawer} onClose={() => setOpenDrawer(false)} title="Registrar Pago">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form className="flex flex-col gap-4">
                            <h4 className="font-semibold text-lg">Selecciona el Método de Pago</h4>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {metodosPago.map((metodo) => (
                                    <button
                                        key={metodo.tipo_pago}
                                        type="button"
                                        onClick={() => handleMetodoPagoChange(metodo.tipo_pago)}
                                        className={`text-sm py-2 px-4 rounded-md ${metodoPago === metodo.tipo_pago ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
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

                            <Field name="monto" as={Input} placeholder="Monto" />
                            <Field name="fechaPago" as={Input} type="date" placeholder="Fecha de pago" />

                            {metodoPago === 'Pago Móvil' && <Field name="telefono" as={Input} placeholder="Teléfono" />}
                            {metodoPago === 'Zelle' && <Field name="correo" as={Input} placeholder="Correo Zelle" />}
                            {['Transferencia', 'Pago Móvil'].includes(metodoPago!) && (
                                <Field name="numReferencia" as={Input} placeholder="Número de referencia" />
                            )}
                            {['Transferencia', 'Pago Móvil'].includes(metodoPago!) && (
                                <>
                                    <Field name="bancoDestino" as={Input} placeholder="Banco de destino" />
                                    <Field name="bancoOrigen" as={Input} placeholder="Banco de origen" />
                                </>
                            )}

                            <Button type="submit" variant="solid" className="w-full py-2 mt-4" disabled={cargando}>
                                {cargando ? 'Registrando...' : 'Registrar Pago'}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Drawer>
        </>
    )
}

export default PaymentForm
