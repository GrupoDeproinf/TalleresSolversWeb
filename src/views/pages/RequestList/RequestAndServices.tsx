import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Tabs from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import RequestHistory from './RequestHistory'
import ServiceContactHistory from '@/views/pages/ServiceContact/ServiceContactHistory'

const { TabNav, TabList, TabContent } = Tabs

const TAB_REQUESTS = 'requests'
const TAB_SERVICES = 'services'

const RequestAndServices = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [refreshRequestsSignal, setRefreshRequestsSignal] = useState(0)
    const [refreshServicesSignal, setRefreshServicesSignal] = useState(0)
    const [exportRequestsSignal, setExportRequestsSignal] = useState(0)
    const [exportServicesSignal, setExportServicesSignal] = useState(0)
    const [requestSearchTerm, setRequestSearchTerm] = useState('')
    const [serviceSearchTerm, setServiceSearchTerm] = useState('')

    const tabValue = useMemo(() => {
        return searchParams.get('tab') === TAB_SERVICES
            ? TAB_SERVICES
            : TAB_REQUESTS
    }, [searchParams])

    const handleTabChange = (val: string) => {
        const next = new URLSearchParams(searchParams)
        if (val === TAB_SERVICES) {
            next.set('tab', TAB_SERVICES)
        } else {
            next.delete('tab')
        }
        setSearchParams(next, { replace: true })
    }

    const handleRefresh = () => {
        if (tabValue === TAB_REQUESTS) {
            setRefreshRequestsSignal((prev) => prev + 1)
            return
        }
        setRefreshServicesSignal((prev) => prev + 1)
    }

    const handleExport = () => {
        if (tabValue === TAB_REQUESTS) {
            setExportRequestsSignal((prev) => prev + 1)
            return
        }
        setExportServicesSignal((prev) => prev + 1)
    }

    const activeSearchTerm =
        tabValue === TAB_REQUESTS ? requestSearchTerm : serviceSearchTerm

    const handleSearchChange = (value: string) => {
        if (tabValue === TAB_REQUESTS) {
            setRequestSearchTerm(value)
            return
        }
        setServiceSearchTerm(value)
    }

    return (
        <div>
            <div className="mb-6 flex items-center gap-3">
                <h1 className="text-4xl font-bold text-[#000B7E]">
                    Solicitudes y servicios solicitados
                </h1>
                <button
                    type="button"
                    title="Actualizar datos desde el servidor"
                    aria-label="Actualizar datos desde el servidor"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[#000B7E] shadow-sm transition hover:border-[#000B7E]/35 hover:bg-[#000B7E]/5 active:scale-[0.98]"
                    onClick={handleRefresh}
                >
                    <HiOutlineRefresh className="h-5 w-5" />
                </button>
                <div className="ml-auto flex items-end gap-3">
                    <div className="w-[20rem] shrink-0">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                            Buscar en la tabla
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={
                                    tabValue === TAB_REQUESTS
                                        ? 'Solicitud, usuario, categoría, ciudad, urgencia…'
                                        : 'Servicio, negocio, precio, usuario, correo, ids…'
                                }
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#000B7E] focus:outline-none focus:ring-2 focus:ring-[#000B7E]/20"
                                value={activeSearchTerm}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                            />
                            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                    <Button
                        style={{ backgroundColor: '#10B981' }}
                        className="h-10 shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white shadow-md transition duration-200 hover:opacity-90"
                        onClick={handleExport}
                    >
                        Exportar a Excel
                    </Button>
                </div>
            </div>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <TabList>
                    <TabNav value={TAB_REQUESTS}>Histórico de solicitudes</TabNav>
                    <TabNav value={TAB_SERVICES}>Servicios solicitados</TabNav>
                </TabList>
                <div className="mt-4">
                    <TabContent value={TAB_REQUESTS}>
                        <RequestHistory
                            exportSignal={exportRequestsSignal}
                            refreshSignal={refreshRequestsSignal}
                            searchTerm={requestSearchTerm}
                        />
                    </TabContent>
                    <TabContent value={TAB_SERVICES}>
                        <ServiceContactHistory
                            exportSignal={exportServicesSignal}
                            refreshSignal={refreshServicesSignal}
                            searchTerm={serviceSearchTerm}
                        />
                    </TabContent>
                </div>
            </Tabs>
        </div>
    )
}

export default RequestAndServices
