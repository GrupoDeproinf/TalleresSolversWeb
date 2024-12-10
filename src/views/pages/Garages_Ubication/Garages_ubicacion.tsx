import { useEffect, useState, useCallback } from 'react'
import { query, where, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import MapsGarages, { MarkerData } from './components/MapsGarages'

const UbicationGarages = () => {
    const [markers, setMarkers] = useState<MarkerData[]>([])
    const [estados, setEstados] = useState<string[]>([])
    const [selectedEstado, setSelectedEstado] = useState<string>('')
    const [mapCenter, setMapCenter] = useState({
        lat: 10.47915,
        lng: -66.90618,
    }) // Centro inicial por defecto

    const fetchGarages = useCallback(async () => {
        try {
            const q = query(
                collection(db, 'Usuarios'),
                where('typeUser', '==', 'Taller'),
            )
            const querySnapshot = await getDocs(q)
            const garages: MarkerData[] = []
            const estadosSet = new Set<string>()

            querySnapshot.docs.forEach((doc) => {
                const data = doc.data()
                if (data.ubicacion?.lat && data.ubicacion?.lng) {
                    garages.push({
                        id: doc.id,
                        lat: data.ubicacion.lat,
                        lng: data.ubicacion.lng,
                        title: data.nombre || 'Sin Nombre',
                        taller: data.estado || 'Sin Estado',
                    })
                }

                if (data.estado) {
                    estadosSet.add(data.estado)
                }
            })

            setMarkers(garages)
            setEstados(Array.from(estadosSet))
        } catch (error) {
            console.error('Error fetching garages:', error)
        }
    }, [])

    useEffect(() => {
        fetchGarages()
    }, [fetchGarages])

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const estadoSeleccionado = event.target.value
        setSelectedEstado(estadoSeleccionado)

        if (estadoSeleccionado) {
            const filteredMarkers = markers.filter(
                (marker) => marker.taller === estadoSeleccionado,
            )

            // Si hay marcadores en el estado seleccionado, centra el mapa en el primero
            if (filteredMarkers.length > 0) {
                setMapCenter({
                    lat: filteredMarkers[0].lat,
                    lng: filteredMarkers[0].lng,
                })
            }
        }
    }

    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    <span className="text-[#000B7E]">Ubicación Talleres</span>
                </h1>
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="relative w-80 ml-4">
                            <select
                                className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleSelectChange}
                            >
                                <option value="">Selecciona un estado</option>
                                {estados.map((estado) => (
                                    <option key={estado} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <MapsGarages
                    markers={markers.filter(
                        (marker) =>
                            !selectedEstado || marker.taller === selectedEstado,
                    )}
                    center={mapCenter} // Pasamos el centro dinámico
                />
            </div>
        </>
    )
}

export default UbicationGarages
