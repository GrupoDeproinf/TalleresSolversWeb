import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api'
import useGoogleMapsReady from '@/utils/hooks/useGoogleMapsReady'

export interface MarkerData {
    id: string
    lat: number
    lng: number
    title: string
    nombre?: string
    approvalLabel?: string
    actividadLabel?: string
    ciudad: string
    approvalStatus: 'Aprobado' | 'En espera por aprobación' | 'Rechazado' | null
    actividad: 'activo' | 'suspendido'
    categoryIds: string[]
}

interface MapsGaragesProps {
    markers: MarkerData[]
    center: { lat: number; lng: number }
}

const MapsGarages: React.FC<MapsGaragesProps> = ({ markers, center }) => {
    const zoom =
        markers.length === 0 ? 6 : markers.length <= 1 ? 11 : 8
    const mapsReady = useGoogleMapsReady()
    const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
    // Si un filtro oculta el negocio abierto, la ventana se cierra sola.
    const seleccionado =
        markers.find((marker) => marker.id === seleccionadoId) || null

    if (!mapsReady) {
        return (
            <div className="flex w-full min-h-[420px] items-center justify-center rounded-xl border border-gray-200 overflow-hidden bg-gray-50 text-sm text-gray-400 shadow-inner">
                Cargando mapa…
            </div>
        )
    }

    return (
        <div className="w-full min-h-[420px] rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner">
            <GoogleMap
                center={center}
                zoom={zoom}
                mapContainerStyle={{
                    height: 'min(70vh, 520px)',
                    width: '100%',
                }}
                onClick={() => setSeleccionadoId(null)}
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={{
                            lat: marker.lat,
                            lng: marker.lng,
                        }}
                        title={marker.title}
                        onClick={() => setSeleccionadoId(marker.id)}
                    />
                ))}
                {seleccionado && (
                    <InfoWindow
                        position={{
                            lat: seleccionado.lat,
                            lng: seleccionado.lng,
                        }}
                        onCloseClick={() => setSeleccionadoId(null)}
                    >
                        <div className="min-w-[180px] space-y-1 text-sm text-gray-700">
                            <p className="font-semibold text-[#151D61]">
                                {seleccionado.nombre || seleccionado.title}
                            </p>
                            {seleccionado.approvalLabel ? (
                                <p>{seleccionado.approvalLabel}</p>
                            ) : null}
                            {seleccionado.actividadLabel ? (
                                <p className="text-gray-500">
                                    {seleccionado.actividadLabel}
                                </p>
                            ) : null}
                            <p className="text-gray-500">{seleccionado.ciudad}</p>
                            <Link
                                to={`/profilegarage/${seleccionado.id}`}
                                className="inline-block pt-1 font-medium text-blue-700 hover:underline"
                            >
                                Ver perfil
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    )
}

export default MapsGarages
