import React, { useState } from 'react'
import { Button, Drawer, Input, Upload } from '@/components/ui'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

type PaymentMethod = 'efectivo' | 'transferencia' | 'pagoMovil'

const PaymentForm: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
        null,
    )
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [isOpen, setIsOpen] = useState(true) // Controla la visibilidad del Drawer

    const handlePaymentMethodChange = (method: PaymentMethod) => {
        setPaymentMethod(method)
    }

    const handleFileChange = (fileList: FileList | null) => {
        if (fileList && fileList.length > 0) {
            setReceiptFile(fileList[0]) // Asigna el primer archivo
        } else {
            setReceiptFile(null) // O puedes manejarlo de otra forma si es necesario
        }
    }

    const initialValues = {
        amount: '',
        transactionNumber: '',
        phoneNumber: '',
        bankName: '',
    }

    const validationSchema = Yup.object({
        amount: Yup.string().required('Por favor, ingrese el monto'),
        transactionNumber:
            paymentMethod === 'transferencia'
                ? Yup.string().required(
                      'Por favor, ingrese el número de transacción',
                  )
                : Yup.string(),
        phoneNumber:
            paymentMethod === 'pagoMovil'
                ? Yup.string().required(
                      'Por favor, ingrese el número de teléfono',
                  )
                : Yup.string(),
        bankName: Yup.string(),
    })

    const handleSubmit = (values: any) => {
        const paymentData = {
            paymentMethod,
            ...values,
            receiptFile,
        }
        console.log('Datos del Pago:', paymentData)
        // Lógica para enviar los datos a la base de datos o backend
    }

    return (
        <Drawer
            title="Registro de Pago"
            isOpen={isOpen} // Usamos el estado isOpen
            width={400}
            onClose={() => setIsOpen(false)} // Cambia el estado a false al cerrar
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue }) => (
                    <Form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        <h4>Selecciona el Método de Pago</h4>
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '16px',
                            }}
                        >
                            <Button
                                variant={
                                    paymentMethod === 'efectivo'
                                        ? 'solid'
                                        : 'default'
                                }
                                onClick={() =>
                                    handlePaymentMethodChange('efectivo')
                                }
                            >
                                Efectivo
                            </Button>
                            <Button
                                variant={
                                    paymentMethod === 'transferencia'
                                        ? 'solid'
                                        : 'default'
                                }
                                onClick={() =>
                                    handlePaymentMethodChange('transferencia')
                                }
                            >
                                Transferencia
                            </Button>
                            <Button
                                variant={
                                    paymentMethod === 'pagoMovil'
                                        ? 'solid'
                                        : 'default'
                                }
                                onClick={() =>
                                    handlePaymentMethodChange('pagoMovil')
                                }
                            >
                                Pago Móvil
                            </Button>
                        </div>

                        <div>
                            <label>Monto</label>
                            <Field name="amount" as={Input} />
                            <div style={{ color: 'red' }}>
                                <ErrorMessage name="amount" component="span" />
                            </div>
                        </div>

                        {paymentMethod === 'transferencia' && (
                            <>
                                <div>
                                    <label>Número de Transacción</label>
                                    <Field
                                        name="transactionNumber"
                                        as={Input}
                                    />
                                    <div style={{ color: 'red' }}>
                                        <ErrorMessage
                                            name="transactionNumber"
                                            component="span"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label>Banco</label>
                                    <Field name="bankName" as={Input} />
                                </div>
                                <div>
                                    <label>Subir Comprobante de Pago</label>
                                    <Upload
                                        accept=".png,.jpg"
                                        beforeUpload={(fileList) => {
                                            if (
                                                fileList &&
                                                fileList.length > 0
                                            ) {
                                                // Lógica de validación
                                            }
                                            return true
                                        }}
                                        disabled={false}
                                        multiple={true}
                                        onChange={(files) => {
                                            // Maneja los archivos subidos
                                        }}
                                        showList={true}
                                        tip="Arrastra y suelta archivos aquí"
                                    />
                                </div>
                            </>
                        )}

                        {paymentMethod === 'pagoMovil' && (
                            <>
                                <div>
                                    <label>Número de Teléfono</label>
                                    <Field name="phoneNumber" as={Input} />
                                    <div style={{ color: 'red' }}>
                                        <ErrorMessage
                                            name="phoneNumber"
                                            component="span"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label>Banco</label>
                                    <Field name="bankName" as={Input} />
                                </div>
                                <div>
                                    <label>Subir Comprobante de Pago</label>
                                    <Upload
                                        accept=".png,.jpg"
                                        beforeUpload={(fileList) => {
                                            handleFileChange(fileList)
                                            return false // Previene la subida automática
                                        }}
                                        disabled={false}
                                        multiple={false} // Cambiado a false para aceptar un solo archivo
                                        showList={true}
                                        tip="Arrastra y suelta archivos aquí"
                                    />
                                </div>
                            </>
                        )}

                        <Button
                            type="submit"
                            variant="solid" // Aplicamos el estilo aquí
                            style={{ width: '100%' }}
                        >
                            Registrar Pago
                        </Button>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default PaymentForm
