import { GoogleMap, Marker } from '@react-google-maps/api'

interface MarkerData {
    lat: number
    lng: number
}

interface MapsProfileProps {
    markers: MarkerData[]
    center: { lat: number; lng: number } // Prop para el centro dinámico
}

const MapsProfile: React.FC<MapsProfileProps> = ({ markers, center }) => {
    return (
        <div style={{ height: '50%', width: '100%' }}>
            <GoogleMap
                center={center}
                zoom={10}
                mapContainerStyle={{
                    height: '400px',
                    width: '100%',
                    marginTop: '10px',
                }}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={{
                            lat: marker.lat,
                            lng: marker.lng,
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    )
}

export default MapsProfile
