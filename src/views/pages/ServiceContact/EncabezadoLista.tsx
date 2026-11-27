import Button from '@/components/ui/Button'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'

type EncabezadoListaProps = {
    titulo: string
    busqueda: string
    placeholder: string
    onBusqueda: (valor: string) => void
    onActualizar: () => void
    onExportar: () => void
}

/** Cabecera de las listas de Solicitudes y Contactos a talleres: título, actualizar, buscar y exportar. */
const EncabezadoLista = ({
    titulo,
    busqueda,
    placeholder,
    onBusqueda,
    onActualizar,
    onExportar,
}: EncabezadoListaProps) => (
    <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-bold text-[#151D61]">{titulo}</h1>
        <button
            type="button"
            title="Actualizar datos desde el servidor"
            aria-label="Actualizar datos desde el servidor"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#151D61] shadow-sm transition hover:border-[#151D61]/35 hover:bg-[#151D61]/5 active:scale-[0.98]"
            onClick={onActualizar}
        >
            <HiOutlineRefresh className="h-5 w-5" />
        </button>
        <div className="ml-auto flex items-end gap-3">
            <div className="w-[20rem] max-w-full shrink">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                    Buscar en la tabla
                </span>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#151D61] focus:outline-none focus:ring-2 focus:ring-[#151D61]/20"
                        value={busqueda}
                        onChange={(e) => onBusqueda(e.target.value)}
                    />
                    <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>
            </div>
            <Button
                style={{ backgroundColor: '#10B981' }}
                className="h-10 shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90"
                onClick={onExportar}
            >
                Exportar a Excel
            </Button>
        </div>
    </div>
)

export default EncabezadoLista
