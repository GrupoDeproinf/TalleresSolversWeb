import { GoogleMap, Marker } from '@react-google-maps/api'

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
