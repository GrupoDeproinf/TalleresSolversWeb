import React, { useState, useEffect } from 'react'
import { Button, Drawer, Input } from '@/components/ui'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { db } from '@/configs/firebaseAssets.config'
import { doc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore'

type MetodoPago = 'Transferencia' | 'Pago Móvil' | 'Zelle' | 'Efectivo'

interface MetodoPagoInfo {
    tipo_pago: MetodoPago
    status: boolean
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

    // Validación completa basada en el método de pago
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
            // Convertir fechaPago a un timestamp
            const fechaPagoTimestamp = values.fechaPago ? Timestamp.fromDate(new Date(values.fechaPago)) : null

            // Construir el objeto `comprobantePago`
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

            // Limpiar datos nulos o vacíos
            Object.keys(comprobantePago).forEach(key => {
                if (comprobantePago[key] === null || comprobantePago[key] === '') {
                    delete comprobantePago[key]
                }
            })

            // Actualizar documento en Firestore
            const subscriptionRef = doc(db, 'Subscripciones', subscriptionId)
            console.log(subscriptionId)
            await updateDoc(subscriptionRef, {
                comprobante_pago: comprobantePago,
            })

            console.log('Pago registrado exitosamente')
        } catch (error) {
            console.error('Error al registrar el pago:', error)
        } finally {
            setCargando(false)
            setOpenDrawer(false)
        }
    }

    return (
        <>
            <Button onClick={() => setOpenDrawer(true)} variant="solid">
                Reportar Pago
            </Button>

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

                            <Field name="monto" as={Input} placeholder="Monto" />
                            <Field name="fechaPago" as={Input} type="date" placeholder="Fecha de pago" />

                            {metodoPago === 'Pago Móvil' && <Field name="telefono" as={Input} placeholder="Teléfono" />}
                            {metodoPago === 'Zelle' && <Field name="correo" as={Input} placeholder="Correo Zelle" />}
                            {['Transferencia', 'Pago Móvil'].includes(metodoPago!) && (
                                <>
                                    <Field name="numReferencia" as={Input} placeholder="Número de referencia" />
                                </>
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
