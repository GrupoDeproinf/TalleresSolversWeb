import { useState } from 'react'
import Button from '@/components/ui/Button'
import SignUpForm from './SignUpForm'
import SignUpTaller from './SignUpTaller'

type Tipo = 'Cliente' | 'Taller'

const SignUp = () => {
    const [tipo, setTipo] = useState<Tipo>('Cliente')

    return (
        <>
            <div className="mb-6">
                <h3 className="mb-1">Registrate ahora</h3>
            </div>
            <div className="mb-6">
                <label>Tipo de usuario:</label>
                <div className="flex space-x-4 mt-2">
                    <Button
                        type="button"
                        variant={tipo === 'Cliente' ? 'solid' : 'default'}
                        onClick={() => setTipo('Cliente')}
                    >
                        Cliente
                    </Button>
                    <Button
                        type="button"
                        variant={tipo === 'Taller' ? 'solid' : 'default'}
                        onClick={() => setTipo('Taller')}
                    >
                        Negocio
                    </Button>
                </div>
            </div>
            {tipo === 'Taller' ? (
                <SignUpTaller />
            ) : (
                <SignUpForm disableSubmit={false} />
            )}
        </>
    )
}

export default SignUp
