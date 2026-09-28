import { GoogleMap, Marker } from '@react-google-maps/api'
import useGoogleMapsReady from '@/utils/hooks/useGoogleMapsReady'

export interface MarkerData {
    id: string
    lat: number
    lng: number
    title: string
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
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={{
                            lat: marker.lat,
                            lng: marker.lng,
                        }}
                        title={marker.title}
                    />
                ))}
            </GoogleMap>
        </div>
    )
}

export default MapsGarages
