import SignInForm from './SignInForm'

const SignIn = () => {
    return (
        <>
            <div className="mb-8 text-center">
                <div className="flex justify-center m-3">
                    <img
                        src="/img/logo/logo-login.png"
                        alt=""
                        className="w-44 h-44"
                    />
                </div>
                {/* <h3 className="mb-1">Bienvenido a Solvers!</h3> */}
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
