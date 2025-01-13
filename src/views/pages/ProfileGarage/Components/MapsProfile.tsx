import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'

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

    // useEffect para actualizar los marcadores cuando cambian las props
    useEffect(() => {
        setMapMarkers(markers)
    }, [markers]) // El efecto se ejecuta cuando `markers` cambie

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
