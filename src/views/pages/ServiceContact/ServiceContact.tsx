import { useState } from 'react'
import useEstadoRecordado from '@/utils/hooks/useEstadoRecordado'
import EncabezadoLista from './EncabezadoLista'
import ServiceContactHistory from './ServiceContactHistory'

/** Contactos de conductores a talleres: página propia (/app/ServiceContact). */
const ServiceContact = () => {
    const [refreshSignal, setRefreshSignal] = useState(0)
    const [exportSignal, setExportSignal] = useState(0)
    const [busqueda, setBusqueda] = useEstadoRecordado(
        'ServiceContact/ServiceContact:busqueda',
        '',
    )

    return (
        <div>
            <EncabezadoLista
                titulo="Contactos a talleres"
                busqueda={busqueda}
                placeholder="Servicio, negocio, precio, usuario, correo, ids…"
                onBusqueda={setBusqueda}
                onActualizar={() => setRefreshSignal((n) => n + 1)}
                onExportar={() => setExportSignal((n) => n + 1)}
            />
            <div className="mt-2">
                <ServiceContactHistory
                    exportSignal={exportSignal}
                    refreshSignal={refreshSignal}
                    searchTerm={busqueda}
                />
            </div>
        </div>
    )
}

export default ServiceContact
