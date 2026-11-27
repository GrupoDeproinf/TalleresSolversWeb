import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import useEstadoRecordado from '@/utils/hooks/useEstadoRecordado'
import EncabezadoLista from '@/views/pages/ServiceContact/EncabezadoLista'
import RequestHistory from './RequestHistory'

// Req. 006: una sola vista por página. Aquí van las solicitudes; los contactos
// a talleres tienen su propia página (/app/ServiceContact). Los enlaces viejos
// a ?tab=services se mandan allá, conservando los demás parámetros.
const RequestAndServices = () => {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const [refreshSignal, setRefreshSignal] = useState(0)
    const [exportSignal, setExportSignal] = useState(0)
    const [busqueda, setBusqueda] = useEstadoRecordado(
        'RequestList/RequestAndServices:busqueda',
        '',
    )

    if (params.get('tab') === 'services') {
        params.delete('tab')
        const resto = params.toString()
        return (
            <Navigate
                replace
                to={`${APP_PREFIX_PATH}/ServiceContact${resto ? `?${resto}` : ''}`}
            />
        )
    }

    return (
        <div>
            <EncabezadoLista
                titulo="Solicitudes"
                busqueda={busqueda}
                placeholder="Solicitud, usuario, categoría, ciudad, urgencia…"
                onBusqueda={setBusqueda}
                onActualizar={() => setRefreshSignal((n) => n + 1)}
                onExportar={() => setExportSignal((n) => n + 1)}
            />
            <div className="mt-2">
                <RequestHistory
                    exportSignal={exportSignal}
                    refreshSignal={refreshSignal}
                    searchTerm={busqueda}
                />
            </div>
        </div>
    )
}

export default RequestAndServices
