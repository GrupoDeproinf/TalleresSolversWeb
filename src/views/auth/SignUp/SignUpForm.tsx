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
    cedula: string
    phone: string
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
    cedula: Yup.string().required('Por favor ingrese su cédula'),
    phone: Yup.string()
        .matches(/^\d{10,14}$/, 'Invalid phone number')
        .required('Por favor ingrese su número teléfonico'),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props
    const { signUp } = useAuth()
    const [message, setMessage] = useTimeOutMessage()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        setSubmitting(true)

        const newUser = {
            nombre: values.nombre,
            email: values.email,
            password: values.password,
            cedula: values.cedula,
            phone: values.phone,
            typeUser: 'Cliente', // Agregar el campo typeUser aquí
        }

        signUp(newUser)
            .then((resp) => {
                console.log(resp)
            })
            .catch((error) => {
                console.log(error)
                switch (error) {
                    case 'FirebaseError: Firebase: Password should be at least 6 characters (auth/weak-password).':
                        showToast(
                            'La contraseña debe tener al menos 6 caracteres.',
                        )
                        break
                    case 'Firebase: Error (auth/email-already-in-use).':
                        showToast(
                            'La dirección de correo electrónico ya está en uso por otra cuenta',
                        )
                        break
                    case 'Firebase: Error (auth/invalid-email).':
                        showToast(
                            'La dirección de correo electrónico no es valida',
                        )
                        break
                    default:
                        showToast(error)
                        break
                }
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
                    cedula: '',
                    phone: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
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
                                    label="Cédula"
                                    invalid={errors.cedula && touched.cedula}
                                    errorMessage={errors.cedula}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="cedula"
                                        placeholder="Ingrese su cédula"
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
