import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import MapsGarages from './components/MapsGarages'

const handleSelectChange = () => {}

const UbicationGarages = () => {
    return (
        <>
            <div className="grid grid-cols-2">
                <h1 className="mb-6 flex justify-start items-center space-x-4">
                    {' '}
                    <span className="text-[#000B7E]">Talleres</span>
                </h1>
                <div className="flex justify-end">
                    <div className="flex items-center">
                        <div className="relative w-80 ml-4">
                            <select
                                className="h-10 w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleSelectChange}
                            >
                                <option value="">Selecciona un estado</option>
                                <option value=""></option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <MapsGarages></MapsGarages>
            </div>
        </>
    )
}

export default UbicationGarages
