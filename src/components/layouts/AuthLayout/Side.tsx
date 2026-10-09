import { cloneElement } from 'react'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface SideProps extends CommonProps {
    content?: React.ReactNode
}

const Side = ({ children, content, ...rest }: SideProps) => {
    return (
        <div className="grid lg:grid-cols-5 h-full">
            {/* Panel de marca: línea gráfica "Encuentra a los buenos aquí"
                (Solvers Mesa #2): amarillo, azul marino y huellas de neumático. */}
            <div
                className="relative hidden overflow-hidden lg:col-span-2 lg:flex flex-col justify-between px-12 py-10"
                style={{ backgroundColor: '#FCC800' }}
            >
                <img
                    src="/img/brand/huella-marino.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -top-6 -left-24 w-[640px] max-w-none select-none"
                />
                <img
                    src="/img/brand/huella-marino.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-24 w-[640px] max-w-none rotate-180 select-none"
                />
                <div className="relative mt-24">
                    <img
                        src="/img/logo/logo-light-full.png"
                        alt={`${APP_NAME} logo`}
                        className="w-28"
                    />
                </div>
                <div className="relative">
                    <h1
                        className="uppercase leading-[0.95] tracking-tight"
                        style={{
                            fontFamily: "'Poppins', 'Inter', sans-serif",
                            fontWeight: 900,
                            fontStyle: 'italic',
                            fontSize: 'clamp(2.25rem, 3.6vw, 3.75rem)',
                            color: '#101A3E',
                        }}
                    >
                        Encuentra
                        <br />a los buenos
                        <br />
                        aquí.
                    </h1>
                    <div
                        className="mt-5 h-[3px] w-56"
                        style={{ backgroundColor: '#101A3E' }}
                    />
                    <p
                        className="mt-3 text-lg italic"
                        style={{
                            fontFamily: "'Poppins', 'Inter', sans-serif",
                            color: '#101A3E',
                        }}
                    >
                        Soluciones automotrices de confianza
                    </p>
                </div>
                <span
                    className="relative mb-20 text-sm font-semibold"
                    style={{ color: '#101A3E' }}
                >
                    Panel administrativo &middot; &copy;{' '}
                    {`${new Date().getFullYear()}`} {`${APP_NAME}`}
                </span>
            </div>
            <div className="lg:col-span-3 flex flex-col justify-center items-center bg-white dark:bg-gray-800">
                <div className="xl:min-w-[450px] px-8">
                    <div className="mb-8">{content}</div>
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Side
