import React, { useState } from 'react'
import { Button, Drawer, Input, Upload } from '@/components/ui'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

type PaymentMethod = 'efectivo' | 'transferencia' | 'pagoMovil'

const PaymentForm: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
    const [receiptFile, setReceiptFile] = useState<File | null>(null)

    const handlePaymentMethodChange = (method: PaymentMethod) => {
        setPaymentMethod(method)
    }

    const handleFileChange = (fileList: FileList | null) => {
        if (fileList && fileList.length > 0) {
            setReceiptFile(fileList[0])
        } else {
            setReceiptFile(null)
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
        transactionNumber: paymentMethod === 'transferencia' ? Yup.string().required('Por favor, ingrese el número de transacción') : Yup.string(),
        phoneNumber: paymentMethod === 'pagoMovil' ? Yup.string().required('Por favor, ingrese el número de teléfono') : Yup.string(),
        bankName: Yup.string(),
    })

    const handleSubmit = (values: any) => {
        const paymentData = {
            paymentMethod,
            ...values,
            receiptFile,
        }
        console.log('Datos del Pago:', paymentData)
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ setFieldValue }) => (
                <Form className="flex flex-col gap-4">
                    <h4 className="font-semibold text-lg">Selecciona el Método de Pago</h4>
                    <div className="flex gap-4 mb-4">
                        <Button
                            variant={paymentMethod === 'efectivo' ? 'solid' : 'default'}
                            onClick={() => handlePaymentMethodChange('efectivo')}
                            className="text-sm py-2 px-4"
                        >
                            Efectivo
                        </Button>
                        <Button
                            variant={paymentMethod === 'transferencia' ? 'solid' : 'default'}
                            onClick={() => handlePaymentMethodChange('transferencia')}
                            className="text-sm py-2 px-4"
                        >
                            Transferencia
                        </Button>
                        <Button
                            variant={paymentMethod === 'pagoMovil' ? 'solid' : 'default'}
                            onClick={() => handlePaymentMethodChange('pagoMovil')}
                            className="text-sm py-2 px-4"
                        >
                            Pago Móvil
                        </Button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Monto</label>
                        <Field name="amount" as={Input} className="w-full" />
                        <div className="text-red-500">
                            <ErrorMessage name="amount" component="span" />
                        </div>
                    </div>

                    {paymentMethod === 'transferencia' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium">Número de Transacción</label>
                                <Field name="transactionNumber" as={Input} className="w-full" />
                                <div className="text-red-500">
                                    <ErrorMessage name="transactionNumber" component="span" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Banco</label>
                                <Field name="bankName" as={Input} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Subir Comprobante de Pago</label>
                                <Upload
                                    accept=".png,.jpg"
                                    beforeUpload={(fileList) => {
                                        handleFileChange(fileList)
                                        return false
                                    }}
                                    disabled={paymentMethod !== 'transferencia'}
                                    multiple={false}
                                    showList={true}
                                    tip="Arrastra y suelta archivos aquí"
                                />
                            </div>
                        </>
                    )}

                    {paymentMethod === 'pagoMovil' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium">Número de Teléfono</label>
                                <Field name="phoneNumber" as={Input} className="w-full" />
                                <div className="text-red-500">
                                    <ErrorMessage name="phoneNumber" component="span" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Banco</label>
                                <Field name="bankName" as={Input} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Subir Comprobante de Pago</label>
                                <Upload
                                    accept=".png,.jpg"
                                    beforeUpload={(fileList) => {
                                        handleFileChange(fileList)
                                        return false
                                    }}
                                    disabled={paymentMethod !== 'pagoMovil'}
                                    multiple={false}
                                    showList={true}
                                    tip="Arrastra y suelta archivos aquí"
                                />
                            </div>
                        </>
                    )}

                    <Button type="submit" variant="solid" className="w-full py-2 text-sm">
                        Registrar Pago
                    </Button>
                </Form>
            )}
        </Formik>
    )
}

const PaymentDrawer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='flex justify-end'>
            <button onClick={() => setIsOpen(true)} className=" p-2 text-center w-32 h-8 bg-blue-600 text-white hover:bg-blue-500 rounded-md ">
                Reportar Pago
            </button>
            <Drawer
                title="Registro de Pago"
                isOpen={isOpen}
                width={400}
                onClose={() => setIsOpen(false)}
            >
                <PaymentForm />
            </Drawer>
        </div>
    )
}

export default PaymentDrawer
