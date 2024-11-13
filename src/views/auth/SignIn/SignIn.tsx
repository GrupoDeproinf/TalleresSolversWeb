import SignInForm from './SignInForm'

const SignIn = () => {
    return (
        <>
            <div className="mb-8 text-center">
                <h3 className="mb-1">Bienvenido a Solvers!</h3>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
