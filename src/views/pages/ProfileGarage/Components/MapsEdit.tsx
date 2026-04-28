import { GoogleMap, Marker } from '@react-google-maps/api'
import { useEffect, useState } from 'react'

interface MapsProfileProps {
    initialLocation: {
        lat: number
        lng: number
    }
    onLocationChange: (newLocation: { lat: number; lng: number }) => void
}

const LocationEditor: React.FC<MapsProfileProps> = ({
    initialLocation,
    onLocationChange,
}) => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
        null,
    )
    const [zoom] = useState(17)

    // Sincroniza initialLocation con el estado local
    useEffect(() => {
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
            setLocation(initialLocation)
        }
    }, [initialLocation])

    // Manejo del clic en el mapa
    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return
        const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        }
        setLocation(newLocation)
        onLocationChange(newLocation)
    }

    // Manejo del fin del arrastre del marcador
    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            }
            setLocation(newLocation)
            onLocationChange(newLocation)
        }
    }

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <GoogleMap
                center={location || { lat: 0, lng: 0 }}
                zoom={zoom}
                mapContainerStyle={{
                    height: '400px',
                    width: '100%',
                    borderRadius: '0.75rem',
                }}
                onClick={handleMapClick}
            >
                {location && (
                    <Marker
                        position={location}
                        draggable
                        onDragEnd={handleMarkerDragEnd}
                    />
                )}
            </GoogleMap>
        </div>
    )
}

export default LocationEditor
