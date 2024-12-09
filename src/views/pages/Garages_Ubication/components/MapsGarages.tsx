import { GoogleMap, Marker } from '@react-google-maps/api'
import { useEffect, useState, useCallback } from 'react'
import { query, where, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

interface Garage {
    id: string
    typeUser: string
    direccion?: {
        lat: number
        lng: number
    }
    nombre: string
    estado: string
}

const MapsGarages = () => {
    const [dataGarages, setDataGarages] = useState<Garage[]>([])
    const center = { lat: 10.47915, lng: -66.90618 } // Centro predeterminado del mapa
    const zoom = 10 // Nivel de zoom predeterminado

    // Función para obtener datos de talleres desde Firestore
    const getData = useCallback(async () => {
        try {
            const q = query(
                collection(db, 'Usuarios'),
                where('typeUser', '==', 'Taller'),
            )
            const querySnapshot = await getDocs(q)
            const talleres: Garage[] = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            })) as Garage[]

            setDataGarages(talleres)
        } catch (error) {
            console.error('Error fetching garages:', error)
        }
    }, [])

    useEffect(() => {
        getData()
    }, [getData])

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
                {dataGarages
                    .filter(
                        (garage) =>
                            garage.direccion?.lat && garage.direccion?.lng,
                    )
                    .map((garage) => (
                        <Marker
                            key={garage.id}
                            position={{
                                lat: garage.direccion!.lat,
                                lng: garage.direccion!.lng,
                            }}
                            title={`Taller: ${garage.nombre}`}
                        />
                    ))}
            </GoogleMap>
        </div>
    )
}

export default MapsGarages
