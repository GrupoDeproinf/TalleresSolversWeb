import SignInForm from './SignInForm'

const SignIn = () => {
    return (
        <>
            <div className="mb-8 text-center">
                <div className="flex justify-center m-3">
                    <img
                        src="/img/logo/logo-login.png"
                        alt=""
                        className="w-40 h-auto lg:hidden"
                    />
                </div>
                <h3 className="mb-1 mt-2 text-2xl font-bold" style={{ color: '#151D61' }}>
                    Inicia sesión
                </h3>
                <p className="text-sm text-gray-500">
                    Panel administrativo de Solvers
                </p>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
