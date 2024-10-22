import { useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { Notification, toast } from '@/components/ui'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    nombre: string
    password: string
    email: string
    cedulaOrif: string
    phone: string
    typeUser: string
}

const validationSchema = Yup.object().shape({
    nombre: Yup.string().required('Por favor ingrese su nombre'),
    email: Yup.string()
        .email('email invalido')
        .required('Por favor ingrese su email'),
    password: Yup.string().required('Por favor ingrese una contraseña'),
    confirmPassword: Yup.string().oneOf(
        [Yup.ref('password')],
        'Las contraseñas no coinciden',
    ),
    cedulaOrif: Yup.string().required(
        'Por favor ingrese su cédula o RIF según corresponda',
    ),
    phone: Yup.string()
        .matches(/^\d{10,14}$/, 'Número de teléfono inválido')
        .required('Por favor ingrese su número teléfonico'),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props
    const { signUp } = useAuth()
    const [message, setMessage] = useTimeOutMessage()

    const [userType, setUserType] = useState<'Cliente' | 'Taller'>('Cliente') // Estado para gestionar el tipo de usuario

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        setSubmitting(true)

        // Asignar el valor de cedula o rif basado en el tipo de usuario seleccionado
        const newUser = {
            nombre: values.nombre,
            email: values.email,
            password: values.password,
            phone: values.phone,
            typeUser: userType, // Guardar el tipo de usuario seleccionado
            // Separar el valor en 'cedula' o 'rif' según el tipo de usuario
            ...(userType === 'Cliente'
                ? { cedula: values.cedulaOrif }
                : { rif: values.cedulaOrif }),
        }

        signUp(newUser)
            .then((resp) => {
                console.log(resp)
            })
            .catch((error) => {
                console.error(error)

                // Define un tipo para los códigos de error que manejas
                type AuthErrorCodes =
                    | 'auth/weak-password'
                    | 'auth/email-already-in-use'
                    | 'auth/invalid-email'

                // Define el objeto de mensajes de error con un índice seguro
                const errorMessages: Record<AuthErrorCodes, string> = {
                    'auth/weak-password':
                        'La contraseña debe tener al menos 6 caracteres.',
                    'auth/email-already-in-use':
                        'La dirección de correo electrónico ya está en uso por otra cuenta',
                    'auth/invalid-email':
                        'La dirección de correo electrónico no es válida',
                }

                // Asegúrate de que error.code sea un AuthErrorCodes antes de acceder al objeto
                const message =
                    error.code in errorMessages
                        ? errorMessages[error.code as AuthErrorCodes]
                        : 'Ocurrió un error inesperado.'

                showToast(message)
            })

        setSubmitting(false)
    }

    const showToast = (message: any = '') => {
        toast.push(
            <Notification title={'Atención'} type="warning" duration={2500}>
                {message}
            </Notification>,
            { placement: 'top-center' },
        )
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    nombre: '',
                    password: '',
                    confirmPassword: '',
                    email: '',
                    cedulaOrif: '',
                    phone: '',
                    typeUser: 'Cliente',
                }}
                validationSchema={validationSchema}
                validateOnChange={false}
                validateOnBlur={false}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            {/* Botones para seleccionar el tipo de usuario */}
                            <div className="mb-4">
                                <label>Tipo de usuario:</label>
                                <div className="flex space-x-4 mt-2">
                                    <Button
                                        variant={
                                            values.typeUser === 'Cliente'
                                                ? 'solid'
                                                : 'default'
                                        } // Cambiado 'outline' a 'default'
                                        onClick={() =>
                                            setFieldValue('typeUser', 'Cliente')
                                        }
                                        type="button"
                                    >
                                        Cliente
                                    </Button>
                                    <Button
                                        variant={
                                            values.typeUser === 'Taller'
                                                ? 'solid'
                                                : 'default'
                                        } // Cambiado 'outline' a 'default'
                                        onClick={() =>
                                            setFieldValue('typeUser', 'Taller')
                                        }
                                        type="button"
                                    >
                                        Taller
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormItem
                                    label="Nombre y Apellido"
                                    invalid={errors.nombre && touched.nombre}
                                    errorMessage={errors.nombre}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="nombre"
                                        placeholder="Ingrese su nombre"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label={
                                        values.typeUser === 'Cliente'
                                            ? 'Cédula'
                                            : 'Rif'
                                    }
                                    invalid={
                                        errors.cedulaOrif && touched.cedulaOrif
                                    }
                                    errorMessage={errors.cedulaOrif}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="cedulaOrif"
                                        placeholder={
                                            values.typeUser === 'Cliente'
                                                ? 'Ingrese su cédula'
                                                : 'Ingrese su Rif'
                                        }
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Email"
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder="Ingrese su email"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Número Teléfonico"
                                    invalid={errors.phone && touched.phone}
                                    errorMessage={errors.phone}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="phone"
                                        placeholder="Ingrese su número de teléfono"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Contraseña"
                                    invalid={
                                        errors.password && touched.password
                                    }
                                    errorMessage={errors.password}
                                >
                                    <Field
                                        autoComplete="off"
                                        name="password"
                                        placeholder="Ingrese su contraseña"
                                        component={PasswordInput}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Confirmar Contraseña"
                                    invalid={
                                        errors.confirmPassword &&
                                        touched.confirmPassword
                                    }
                                    errorMessage={errors.confirmPassword}
                                >
                                    <Field
                                        autoComplete="off"
                                        name="confirmPassword"
                                        placeholder="Ingresa otra vez la contraseña"
                                        component={PasswordInput}
                                    />
                                </FormItem>
                            </div>

                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? 'Creando cuenta...'
                                    : 'Registrarse'}
                            </Button>

                            <div className="mt-4 text-center">
                                <span>¿Ya tienes una cuenta? </span>
                                <ActionLink to={signInUrl}>
                                    Iniciar Sesión
                                </ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
