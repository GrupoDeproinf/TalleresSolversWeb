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
import { useNavigate } from 'react-router-dom'

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
    status: string
    createdAt?: number
}

const validationSchema = Yup.object().shape({
    nombre: Yup.string().required('Por favor ingrese su nombre'),
    email: Yup.string()
        .email('Email inválido')
        .required('Por favor ingrese su email')
        .test(
            'termina-en-com',
            'El email debe terminar en ".com"',
            (value) => value?.endsWith('.com') ?? false,
        ),
    password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('Por favor ingrese una contraseña'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('Por favor confirme su contraseña'),

    cedulaOrif: Yup.string().when('typeUser', {
        is: 'Taller',
        then: () =>
            Yup.string()
                .matches(/^[V,E,C,G,J,P]-\d+$/, 'Solo se permiten números')
                .min(3, 'No puede tener menos de 3 dígitos')
                .max(12, 'No puede tener más de 10 dígitos')
                .required('Este campo es obligatorio'),
        otherwise: () =>
            Yup.string()
                .matches(/^[V,E,C,G,J,P]-\d+$/, 'Solo se permiten números')
                .min(3, 'No puede tener menos de 3 dígitos')
                .max(12, 'No puede tener más de 10 dígitos')
                .required('Este campo es obligatorio'),
    }),
    phone: Yup.string()
        .matches(/^[1-9]\d{10}$/, 'El teléfono debe tener 11 dígitos y no puede comenzar con 0')
        .required('Por favor ingrese su número telefónico'),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props
    const { signUp } = useAuth()
    const [message, setMessage] = useTimeOutMessage()
    const navigate = useNavigate()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        setSubmitting(true);
    
        const newUser = {
            nombre: values.nombre,
            email: values.email.toLowerCase(), // Convierte el email a minúsculas
            password: values.password,
            phone: values.phone,
            typeUser: values.typeUser,
            status: 'Pendiente',
            createdAt: Date.now(), // Timestamp en milisegundos
            ...(values.typeUser === 'Cliente'
                ? { cedula: values.cedulaOrif }
                : { rif: values.cedulaOrif }),
        };
    
        signUp(newUser)
            .then((resp) => {
                console.log(resp);
            })
            .catch((error) => {
                console.error(error);
    
                type AuthErrorCodes = 'auth/email-already-in-use';
    
                const errorMessages: Record<AuthErrorCodes, string> = {
                    'auth/email-already-in-use':
                        'La dirección de correo electrónico ya está en uso por otra cuenta',
                };
    
                const message =
                    error.code in errorMessages
                        ? errorMessages[error.code as AuthErrorCodes]
                        : 'Este correo ya esta registrado.';
    
                showToast(message);
            });
    
        setSubmitting(false);
    };

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
                    status: 'Pendiente', // Inicializamos status como 'Pendiente'
                }}
                validationSchema={validationSchema}
                validateOnChange={false}
                validateOnBlur={true}
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
                            <div className="mb-4">
                                <label>Tipo de usuario:</label>
                                <div className="flex space-x-4 mt-2">
                                    <Button
                                        variant={
                                            values.typeUser === 'Cliente'
                                                ? 'solid'
                                                : 'default'
                                        }
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
                                        }
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
                                    label={
                                        values.typeUser === 'Taller'
                                            ? 'Nombre del Taller'
                                            : 'Nombre y Apellido'
                                    }
                                    invalid={errors.nombre && touched.nombre}
                                    errorMessage={errors.nombre}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="nombre"
                                        placeholder={
                                            values.typeUser === 'Taller'
                                                ? 'Ingrese el nombre del taller'
                                                : 'Ingrese su nombre'
                                        }
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
                                    <div className="flex items-center">
                                        <select
                                            value={
                                                values.cedulaOrif
                                                    ? values.cedulaOrif.split(
                                                          '-',
                                                      )[0]
                                                    : values.typeUser ===
                                                        'Cliente'
                                                      ? 'V'
                                                      : 'J'
                                            }
                                            onChange={(e) => {
                                                const suffix =
                                                    values.cedulaOrif?.split(
                                                        '-',
                                                    )[1] || ''
                                                setFieldValue(
                                                    'cedulaOrif',
                                                    `${e.target.value}-${suffix}`,
                                                )
                                            }}
                                            className=" p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="V">V-</option>
                                            <option value="E">E-</option>
                                            <option value="C">C-</option>
                                            <option value="G">G-</option>
                                            <option value="J">J-</option>
                                            <option value="P">P-</option>
                                        </select>
                                        <Field
                                            type="text" // Cambiado a texto para permitir la validación de Yup
                                            autoComplete="off"
                                            name="cedulaOrif"
                                            placeholder={
                                                values.typeUser === 'Cliente'
                                                    ? 'Ingrese su cédula'
                                                    : 'Ingrese su Rif'
                                            }
                                            value={
                                                values.cedulaOrif?.split(
                                                    '-',
                                                )[1] || ''
                                            }
                                            onChange={(e: any) => {
                                                const prefix =
                                                    values.cedulaOrif?.split(
                                                        '-',
                                                    )[0] || 'V'
                                                const newSuffix =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ) // Asegura que solo haya números
                                                setFieldValue(
                                                    'cedulaOrif',
                                                    `${prefix}-${newSuffix}`,
                                                )
                                            }}
                                            component={Input}
                                            className="p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mx-2 w-full"
                                        />
                                    </div>
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
                                        placeholder="Ejem (4141234567)"
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
                                        name="password"
                                        component={PasswordInput}
                                        placeholder="Ingrese su contraseña"
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
                                        name="confirmPassword"
                                        component={PasswordInput}
                                        placeholder="Confirme su contraseña"
                                    />
                                </FormItem>
                            </div>
                            <Button
                                type="submit"
                                variant={disableSubmit ? 'default' : 'solid'}
                                disabled={isSubmitting || disableSubmit}
                                className="w-full mt-4"
                            >
                                Registrarse
                            </Button>
                        </FormContainer>
                        <div className="mt-4 text-center">
                            <ActionLink href={signInUrl}>
                                ¿Ya tienes una cuenta? Inicia sesión
                            </ActionLink>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
