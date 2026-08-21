import { GoogleMap, Marker } from '@react-google-maps/api'
import { useState } from 'react'
import useGoogleMapsReady from '@/utils/hooks/useGoogleMapsReady'

const Maps = (props: any) => {
    const { data, save } = props
    const [center] = useState({ lat: 10.47915, lng: -66.90618 })
    const [zoom] = useState(10)
    const mapsReady = useGoogleMapsReady()

    const handleMapClick = async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return // Asegúrate de que latLng no sea nulo
        const latLng = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        }
        console.log(latLng)

        // Aquí puedes implementar geocodeByLatLng si es necesario
        save({
            latiLng: latLng,
            zoom: 17,
        })
    }

    if (!mapsReady) {
        return (
            <div className="flex items-center justify-center text-sm text-gray-400" style={{ height: '450px', width: '100%' }}>
                Cargando mapa…
            </div>
        )
    }

    return (
        <div style={{ height: '450px', width: '100%' }}>
            <GoogleMap
                center={data ? data.latiLng : center}
                zoom={data ? data.zoom : zoom}
                mapContainerStyle={{
                    height: '400px',
                    width: '100%',
                    marginTop: '10px',
                }}
                onClick={handleMapClick}
            >
                {data && <Marker position={data.latiLng} />}
            </GoogleMap>
        </div>
    )
}

export default Maps
