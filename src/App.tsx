import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { useEffect, useMemo, useState } from 'react'
import store, { persistor } from './store'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import mockServer from './mock'
import appConfig from '@/configs/app.config'
import loadingSolversNew from '@/assets/loading/loadingSolversNew.gif'
import './locales'

const environment = process.env.NODE_ENV

if (appConfig.enableMock) {
    mockServer({ environment })
}

const GLOBAL_LOADING_DELAY_MS = 350

const FullscreenLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#4c5955]/90">
            <img
                src={loadingSolversNew}
                alt="Cargando"
                className="w-56 max-w-[70vw] object-contain"
            />
        </div>
    )
}

const GlobalNetworkLoader = () => {
    const [pendingRequests, setPendingRequests] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!pendingRequests) {
            setVisible(false)
            return
        }

        const timer = window.setTimeout(() => {
            setVisible(true)
        }, GLOBAL_LOADING_DELAY_MS)

        return () => window.clearTimeout(timer)
    }, [pendingRequests])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        let activeRequests = 0

        const increase = () => {
            activeRequests += 1
            setPendingRequests(activeRequests)
        }

        const decrease = () => {
            activeRequests = Math.max(0, activeRequests - 1)
            setPendingRequests(activeRequests)
        }

        const originalFetch = window.fetch.bind(window)
        window.fetch = async (...args: Parameters<typeof window.fetch>) => {
            increase()
            try {
                return await originalFetch(...args)
            } finally {
                decrease()
            }
        }

        const originalSend = XMLHttpRequest.prototype.send

        XMLHttpRequest.prototype.send = function (
            ...args: Parameters<XMLHttpRequest['send']>
        ) {
            increase()
            this.addEventListener('loadend', decrease, { once: true })
            return originalSend.apply(this, args)
        }

        return () => {
            window.fetch = originalFetch
            XMLHttpRequest.prototype.send = originalSend
        }
    }, [])

    const shouldRenderLoader = useMemo(
        () => visible && pendingRequests > 0,
        [visible, pendingRequests],
    )

    return shouldRenderLoader ? <FullscreenLoader /> : null
}

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<FullscreenLoader />} persistor={persistor}>
                <BrowserRouter>
                    <Theme>
                        <GlobalNetworkLoader />
                        <Layout />
                    </Theme>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    )
}

export default App
