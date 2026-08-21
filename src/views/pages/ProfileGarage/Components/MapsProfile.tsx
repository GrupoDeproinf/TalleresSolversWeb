import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import useGoogleMapsReady from '@/utils/hooks/useGoogleMapsReady'

interface MarkerData {
    lat: number
    lng: number
}

interface MapsProfileProps {
    markers: MarkerData[] // Prop de marcadores
    center: { lat: number; lng: number } // Prop para el centro dinámico
}

const MapsProfile: React.FC<MapsProfileProps> = ({ markers, center }) => {
    const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([])
    const mapsReady = useGoogleMapsReady()

    // useEffect para actualizar los marcadores cuando cambian las props
    useEffect(() => {
        setMapMarkers(markers)
    }, [markers]) // El efecto se ejecuta cuando `markers` cambie

    if (!mapsReady) {
        return (
            <div className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-sm text-gray-400 shadow-sm" style={{ height: '260px' }}>
                Cargando mapa…
            </div>
        )
    }

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <GoogleMap
                center={center}
                zoom={10}
                mapContainerStyle={{
                    height: '260px',
                    width: '100%',
                    borderRadius: '0.75rem',
                }}
            >
                {mapMarkers.map((marker, index) => (
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
