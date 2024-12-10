import { GoogleMap, Marker } from '@react-google-maps/api'

export interface MarkerData {
    id: string
    lat: number
    lng: number
    title: string
    taller: string
}

interface MapsGaragesProps {
    markers: MarkerData[]
    center: { lat: number; lng: number } // Prop para el centro dinámico
}

const MapsGarages: React.FC<MapsGaragesProps> = ({ markers, center }) => {
    const zoom = 10 // Nivel de zoom predeterminado

    return (
        <div style={{ height: '450px', width: '100%' }}>
            <GoogleMap
                center={center} // Usamos el centro dinámico
                zoom={zoom}
                mapContainerStyle={{
                    height: '400px',
                    width: '100%',
                    marginTop: '10px',
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
