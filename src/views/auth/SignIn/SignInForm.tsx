import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    forgotPasswordUrl?: string
    signUpUrl?: string
}

type SignInFormSchema = {
    userName: string
    password: string
    rememberMe: boolean
}

const validationSchema = Yup.object().shape({
    userName: Yup.string().required('Por favor ingrese su correo'),
    password: Yup.string().required('Por favor ingrese su contraseña'),
    rememberMe: Yup.bool(),
})

const SignInForm = (props: SignInFormProps) => {
    const {
        disableSubmit = false,
        className,
        forgotPasswordUrl = '/forgot-password',
        signUpUrl = '/sign-up',
    } = props

    const [message, setMessage] = useTimeOutMessage()

    const { signIn } = useAuth()

    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        const { userName, password } = values
        setSubmitting(true)
    
        // Convertir el email a minúsculas antes de enviarlo
        const normalizedEmail = userName.trim().toLowerCase();
    
        const result = await signIn({ userName: normalizedEmail, password })
    
        if (result?.status === 'failed') {
            setMessage(result.message)
        }
    
        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
    initialValues={{
        userName: '',
        password: '',
        rememberMe: true,
    }}
    validationSchema={validationSchema}
    onSubmit={(values, { setSubmitting }) => {
        if (!disableSubmit) {
            // Normalizar el email antes de enviarlo a la función de autenticación
            onSignIn({ ...values, userName: values.userName.trim().toLowerCase() }, setSubmitting)
        } else {
            setSubmitting(false)
        }
    }}
>

                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Email"
                                invalid={
                                    (errors.userName &&
                                        touched.userName) as boolean
                                }
                                errorMessage={errors.userName}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="userName"
                                    placeholder="Ingrese su email"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Contraseña"
                                invalid={
                                    (errors.password &&
                                        touched.password) as boolean
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
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? 'Iniciando sesión...'
                                    : 'Iniciar Sesión'}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>{`¿Aún no tienes una cuenta?`} </span>
                                <ActionLink to={signUpUrl}>
                                    Registrate
                                </ActionLink>
                            </div>
                            <div className="text-center">
                                <ActionLink to={forgotPasswordUrl}>
                                    Recuperar contraseña
                                </ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignInForm
