import SignUpForm from './SignUpForm'

const SignUp = () => {
    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">Registrate ahora</h3>
            </div>
            <SignUpForm disableSubmit={false} />
        </>
    )
}

export default SignUp
