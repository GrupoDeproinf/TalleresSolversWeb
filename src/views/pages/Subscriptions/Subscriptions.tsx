import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Tabs from '@/components/ui/Tabs'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import PaymentValidationPending from '@/views/pages/PaymentValidation/PaymentValidationPending'
import SubscriptionsHistory from './SubscriptionsHistory'

const { TabNav, TabList, TabContent } = Tabs

const TAB_PENDING = 'pending'
const TAB_HISTORY = 'history'

const SubscriptionsUnified = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [refreshPendingSignal, setRefreshPendingSignal] = useState(0)
    const [refreshHistorySignal, setRefreshHistorySignal] = useState(0)
    const [exportPendingSignal, setExportPendingSignal] = useState(0)
    const [exportHistorySignal, setExportHistorySignal] = useState(0)
    const [pendingSearchTerm, setPendingSearchTerm] = useState('')
    const [historySearchTerm, setHistorySearchTerm] = useState('')

    const tabValue = useMemo(() => {
        return searchParams.get('tab') === 'history' ? TAB_HISTORY : TAB_PENDING
    }, [searchParams])

    const handleTabChange = (val: string) => {
        const next = new URLSearchParams(searchParams)
        if (val === TAB_HISTORY) {
            next.set('tab', 'history')
        } else {
            next.delete('tab')
        }
        setSearchParams(next, { replace: true })
    }

    const handleRefresh = () => {
        if (tabValue === TAB_PENDING) {
            setRefreshPendingSignal((prev) => prev + 1)
            return
        }
        setRefreshHistorySignal((prev) => prev + 1)
    }

    const handleExport = () => {
        if (tabValue === TAB_PENDING) {
            setExportPendingSignal((prev) => prev + 1)
            return
        }
        setExportHistorySignal((prev) => prev + 1)
    }

    const activeSearchTerm =
        tabValue === TAB_PENDING ? pendingSearchTerm : historySearchTerm

    const handleSearchChange = (value: string) => {
        if (tabValue === TAB_PENDING) {
            setPendingSearchTerm(value)
            return
        }
        setHistorySearchTerm(value)
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-4xl font-bold text-[#000B7E]">
                        Validación de pagos e histórico de suscripciones
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-snug text-gray-600">
                        Solo se listan suscripciones de negocios activos en la
                        plataforma (se excluyen los marcados como Eliminado en
                        Usuarios), alineado con el dashboard de ventas.
                    </p>
                </div>
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
                                placeholder="Plan, negocio, correo, monto, fechas, comprobante, ids…"
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
                    <TabNav value={TAB_PENDING}>Pagos por validar</TabNav>
                    <TabNav value={TAB_HISTORY}>Histórico de suscripciones</TabNav>
                </TabList>
                <div className="mt-4">
                    <TabContent value={TAB_PENDING}>
                        <PaymentValidationPending
                            exportSignal={exportPendingSignal}
                            refreshSignal={refreshPendingSignal}
                            searchTerm={pendingSearchTerm}
                        />
                    </TabContent>
                    <TabContent value={TAB_HISTORY}>
                        <SubscriptionsHistory
                            exportSignal={exportHistorySignal}
                            refreshSignal={refreshHistorySignal}
                            searchTerm={historySearchTerm}
                        />
                    </TabContent>
                </div>
            </Tabs>
        </div>
    )
}

export default SubscriptionsUnified
