import { GoogleMap, Marker } from '@react-google-maps/api'

const MapsProfile = () => {
    const center = { lat: 10.47915, lng: -66.90618 } // Centro predeterminado del mapa
    const zoom = 10 // Nivel de zoom predeterminado

    // Ejemplo de marcadores predeterminados
    const markers = [
        { id: 1, lat: 10.47915, lng: -66.90618, title: 'Marcador 1' },
        { id: 2, lat: 10.48015, lng: -66.90518, title: 'Marcador 2' },
    ]

    return (
        <div style={{ height: '450px', width: '100%' }}>
            <GoogleMap
                center={center}
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
                        position={{ lat: marker.lat, lng: marker.lng }}
                        title={marker.title}
                    />
                ))}
            </GoogleMap>
        </div>
    )
}

export default MapsProfile
