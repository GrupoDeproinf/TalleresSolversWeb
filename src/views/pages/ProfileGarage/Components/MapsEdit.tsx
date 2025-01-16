import { GoogleMap, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

interface MapsProfileProps {
    initialLocation: {
        lat: number;
        lng: number;
    };
    onLocationChange: (newLocation: { lat: number; lng: number }) => void;
}

const LocationEditor: React.FC<MapsProfileProps> = ({ initialLocation, onLocationChange }) => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null); // Inicializa como null
    const [zoom] = useState(17);

    // Sincroniza initialLocation con el estado local
    useEffect(() => {
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
            setLocation(initialLocation); // Actualiza el estado local con initialLocation
        }
    }, [initialLocation]);

    // Manejo del clic en el mapa
    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return; // Asegúrate de que latLng no sea nulo
        const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        };
        setLocation(newLocation); // Actualiza la ubicación localmente
        onLocationChange(newLocation); // Llama a la función para actualizar la ubicación en el componente padre
    };

    // Manejo del fin del arrastre del marcador
    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };
            setLocation(newLocation);
            onLocationChange(newLocation);
        }
    };

    return (
        <div style={{ height: '450px', width: '100%' }}>
            <GoogleMap
                center={location || { lat: 0, lng: 0 }} // Centro en la ubicación inicial o valores predeterminados
                zoom={zoom}
                mapContainerStyle={{
                    height: '400px',
                    width: '100%',
                    marginTop: '10px',
                }}
                onClick={handleMapClick} // Permite hacer clic en el mapa para cambiar la ubicación
            >
                {/* Renderiza el marcador si la ubicación es válida */}
                {location && (
                    <Marker
                        position={location} // Coloca el marcador en la ubicación
                        draggable
                        onDragEnd={handleMarkerDragEnd} // Actualiza la ubicación al arrastrar el marcador
                    />
                )}
            </GoogleMap>
        </div>
    );
};

export default LocationEditor;
