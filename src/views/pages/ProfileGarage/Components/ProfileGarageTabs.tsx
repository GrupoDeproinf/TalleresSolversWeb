import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Table as ReactTable } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Table from '@/components/ui/Table'
import { Button, Pagination, Tabs } from '@/components/ui'
import Checkbox from '@/components/ui/Checkbox'
import { FaFilePdf, FaFileUpload, FaRegEye } from 'react-icons/fa'
import {
    HiFire,
    HiOutlineSearch,
    HiChevronDown,
    HiChevronRight,
    HiPlus,
} from 'react-icons/hi'
import PaymentDrawer from './PaymentForm'
import type { DocumentData } from 'firebase/firestore'
import type { ReactNode } from 'react'

const { TabNav, TabList, TabContent } = Tabs
const { Tr, Th, Td, THead, TBody } = Table
const HISTORICO_ROWS_PER_PAGE = 5

export type ClienteHistorico = {
    id: string
    tipo: 'emergencia' | 'normal'
    nombre: string
    vehiculo: string
    contacto: string
    servicio: string
    fecha: string
    fechaTs?: number
    descripcion?: string
}

export type SubscriptionTab = {
    nombre?: string
    status?: string
    vigencia?: string
    monto?: number
    fecha_fin?: unknown
    uid?: string
}

export type PaymentMethodOption = {
    name: string
    icon: ReactNode
    dbKey: string
}

export interface ProfileGarageTabsProps {
    table: ReactTable<unknown>
    table3: ReactTable<unknown>
    tablePromociones: ReactTable<unknown>
    currentPage: number
    rowsPerPage: number
    totalRows: number
    onPaginationChange: (page: number) => void
    onRowsPerPageChange: (rowsPerPage: number) => void
    currentPagePromo?: number
    rowsPerPagePromo?: number
    totalRowsPromo?: number
    onPaginationChangePromo?: (page: number) => void
    onRowsPerPageChangePromo?: (rowsPerPage: number) => void
    onEditPromotion?: (promotion: unknown) => void
    onOpenCreatePromotion?: () => void
    onOpenCreateService?: () => void
    subscription: SubscriptionTab | null
    isSuscrito: boolean
    onOpenPlansDialog: () => void
    tallerUid: string
    formatDate: (value: unknown) => string
    diasRestantes: number | null
    paymentMethods: PaymentMethodOption[]
    paymentMethodsState: Record<string, boolean>
    setPaymentMethodsState: React.Dispatch<
        React.SetStateAction<Record<string, boolean>>
    >
    onSavePaymentMethods: () => void
    data: DocumentData | null
    historicoClientes: ClienteHistorico[]
    openDocumentModal: (
        url: string,
        name: string,
        type: 'image' | 'pdf',
    ) => void
}

export default function ProfileGarageTabs({
    table,
    table3,
    tablePromociones,
    currentPage,
    rowsPerPage,
    totalRows,
    onPaginationChange,
    onRowsPerPageChange,
    currentPagePromo = 1,
    rowsPerPagePromo = 10,
    totalRowsPromo = 0,
    onPaginationChangePromo,
    onRowsPerPageChangePromo,
    onEditPromotion,
    onOpenCreatePromotion,
    onOpenCreateService,
    subscription,
    isSuscrito,
    onOpenPlansDialog,
    tallerUid,
    formatDate,
    diasRestantes,
    paymentMethods,
    paymentMethodsState,
    setPaymentMethodsState,
    onSavePaymentMethods,
    data,
    historicoClientes,
    openDocumentModal,
}: ProfileGarageTabsProps) {
    const [historicoSearch, setHistoricoSearch] = useState('')
    const [historicoExpandedId, setHistoricoExpandedId] = useState<
        string | null
    >(null)
    const [historicoTipo, setHistoricoTipo] = useState<
        'ambos' | 'emergencia' | 'normal'
    >('ambos')
    const [historicoDesde, setHistoricoDesde] = useState('')
    const [historicoHasta, setHistoricoHasta] = useState('')
    const [historicoPage, setHistoricoPage] = useState(1)

    const clientesHistoricoFiltrados = useMemo(() => {
        let list =
            historicoTipo === 'ambos'
                ? historicoClientes
                : historicoClientes.filter((c) => c.tipo === historicoTipo)
        if (historicoDesde) {
            const start = new Date(`${historicoDesde}T00:00:00`).getTime()
            list = list.filter((c) => (c.fechaTs ?? 0) >= start)
        }
        if (historicoHasta) {
            const end = new Date(`${historicoHasta}T23:59:59`).getTime()
            list = list.filter((c) => (c.fechaTs ?? 0) <= end)
        }
        if (!historicoSearch.trim()) return list
        const q = historicoSearch.toLowerCase().trim()
        return list.filter(
            (c) =>
                c.nombre.toLowerCase().includes(q) ||
                c.vehiculo.toLowerCase().includes(q) ||
                c.contacto.toLowerCase().includes(q) ||
                c.servicio.toLowerCase().includes(q),
        )
    }, [
        historicoClientes,
        historicoSearch,
        historicoTipo,
        historicoDesde,
        historicoHasta,
    ])

    const historicoTotalRows = clientesHistoricoFiltrados.length
    const historicoTotalPages = Math.max(
        1,
        Math.ceil(historicoTotalRows / HISTORICO_ROWS_PER_PAGE),
    )

    const clientesHistoricoPaginados = useMemo(() => {
        const start = (historicoPage - 1) * HISTORICO_ROWS_PER_PAGE
        const end = start + HISTORICO_ROWS_PER_PAGE
        return clientesHistoricoFiltrados.slice(start, end)
    }, [clientesHistoricoFiltrados, historicoPage])

    useEffect(() => {
        setHistoricoPage(1)
        setHistoricoExpandedId(null)
    }, [historicoSearch, historicoTipo, historicoDesde, historicoHasta])

    useEffect(() => {
        if (historicoPage > historicoTotalPages) {
            setHistoricoPage(historicoTotalPages)
            setHistoricoExpandedId(null)
        }
    }, [historicoPage, historicoTotalPages])

    return (
        <div className="flex-1 min-w-0">
            <Tabs defaultValue="tab1">
                <TabList className="mb-4 flex w-full flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                    <TabNav value="tab1">Planes</TabNav>
                    <TabNav value="tab2">Servicios</TabNav>
                    <TabNav value="tab3">Documentos</TabNav>
                    {/* <TabNav value="tab4">Promociones</TabNav> */}
                    <TabNav value="tab5">Histórico de clientes</TabNav>
                    <TabNav value="tab6">Métodos de pago</TabNav>
                </TabList>
                <div className="w-full">
                    <TabContent value="tab1">
                        <div className="mb-8 mt-2 space-y-5">
                            <h6 className="text-gray-900">Subscripción</h6>
                            <Card bordered className="mb-4 rounded-xl border-gray-200 shadow-sm">
                                {!isSuscrito ? (
                                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-gray-600">
                                            Puede visualizar y suscribirse a un
                                            plan para su negocio...
                                        </p>
                                        <button
                                            onClick={onOpenPlansDialog}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                                        >
                                            Ver Planes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                className="bg-transparent"
                                                shape="circle"
                                                icon={
                                                    <HiFire className="text-blue-600" />
                                                }
                                            />
                                            <div>
                                                <div className="flex items-center">
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {subscription?.nombre ||
                                                            'Cargando...'}
                                                    </h3>
                                                    <Tag
                                                        className={`rounded-md border-0 mx-2 ${
                                                            subscription?.status ===
                                                            'Aprobado'
                                                                ? 'bg-green-100 text-green-400'
                                                                : subscription?.status ===
                                                                    'Vencido'
                                                                  ? 'bg-red-100 text-red-400'
                                                                  : 'bg-yellow-100 text-yellow-400'
                                                        }`}
                                                    >
                                                        {subscription?.status ||
                                                            'Pendiente'}
                                                    </Tag>
                                                </div>
                                                <div className="grid gap-2 text-xs text-gray-600 md:grid-cols-2 xl:grid-cols-4">
                                                    <p>
                                                        Vigencia:{' '}
                                                        {subscription?.vigencia ??
                                                            '---'}{' '}
                                                        días
                                                    </p>
                                                    <p>
                                                        Monto mensual:{' '}
                                                        <span className="font-bold text-gray-800">
                                                            {subscription?.monto !==
                                                                undefined &&
                                                            subscription?.monto !==
                                                                null
                                                                ? subscription.monto ===
                                                                      0 ||
                                                                  (subscription.monto <
                                                                      0.01 &&
                                                                      subscription.monto >
                                                                          -0.01)
                                                                    ? 'Gratis'
                                                                    : `$${subscription.monto}`
                                                                : '---'}
                                                        </span>
                                                    </p>
                                                    {subscription?.status ===
                                                        'Aprobado' && (
                                                        <>
                                                            <p>
                                                                {diasRestantes ??
                                                                    '---'}{' '}
                                                                días restantes
                                                            </p>
                                                            <p>
                                                                Fecha de
                                                                vencimiento:{' '}
                                                                <span className="text-xs text-gray-600">
                                                                    {subscription.fecha_fin
                                                                        ? formatDate(
                                                                              subscription.fecha_fin,
                                                                          )
                                                                        : 'Fecha no disponible'}
                                                                </span>
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {subscription?.status === 'Vencido' && (
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={onOpenPlansDialog}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                                                >
                                                    Elegir Plan
                                                </button>
                                                {subscription?.uid && (
                                                    <PaymentDrawer
                                                        talleruid={tallerUid}
                                                        subscriptionId={
                                                            subscription?.uid ||
                                                            ''
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {subscription?.status ===
                                            'Aprobado' && (
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={onOpenPlansDialog}
                                                    className="bg-blue-900 rounded-md p-2 text-white hover:bg-blue-700"
                                                >
                                                    Renovar Pago
                                                </button>
                                            </div>
                                        )}
                                        {subscription?.status ===
                                            'Por Aprobar' && (
                                            <div className="flex justify-end mt-2">
                                                <PaymentDrawer
                                                    talleruid={tallerUid}
                                                    subscriptionId={
                                                        subscription?.uid || ''
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                            <div>
                                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <h6 className="mb-6 flex justify-start mt-4">
                                        Historial de Subscripciones
                                    </h6>
                                    <Table className="w-full rounded-lg">
                                        <THead>
                                            {table3
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <Tr key={headerGroup.id}>
                                                        {headerGroup.headers.map(
                                                            (header) => {
                                                                return (
                                                                    <Th
                                                                        key={
                                                                            header.id
                                                                        }
                                                                        colSpan={
                                                                            header.colSpan
                                                                        }
                                                                    >
                                                                        {header.isPlaceholder ? null : (
                                                                            <div
                                                                                {...{
                                                                                    className:
                                                                                        header.column.getCanSort()
                                                                                            ? 'cursor-pointer select-none'
                                                                                            : '',
                                                                                    onClick:
                                                                                        header.column.getToggleSortingHandler(),
                                                                                }}
                                                                            >
                                                                                {flexRender(
                                                                                    header
                                                                                        .column
                                                                                        .columnDef
                                                                                        .header,
                                                                                    header.getContext(),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Th>
                                                                )
                                                            },
                                                        )}
                                                    </Tr>
                                                ))}
                                        </THead>
                                        <TBody>
                                            {table3
                                                .getRowModel()
                                                .rows.slice(
                                                    (currentPage - 1) *
                                                        rowsPerPage,
                                                    currentPage * rowsPerPage,
                                                )
                                                .map((row) => {
                                                    return (
                                                        <Tr key={row.id}>
                                                            {row
                                                                .getVisibleCells()
                                                                .map((cell) => {
                                                                    return (
                                                                        <Td
                                                                            key={
                                                                                cell.id
                                                                            }
                                                                        >
                                                                            {flexRender(
                                                                                cell
                                                                                    .column
                                                                                    .columnDef
                                                                                    .cell,
                                                                                cell.getContext(),
                                                                            )}
                                                                        </Td>
                                                                    )
                                                                })}
                                                        </Tr>
                                                    )
                                                })}
                                        </TBody>
                                    </Table>
                                    <Pagination
                                        onChange={onPaginationChange}
                                        currentPage={currentPage}
                                        totalRows={totalRows}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={
                                            onRowsPerPageChange
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </TabContent>
                </div>
                <TabContent value="tab2">
                    <div className="w-full h-full">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-6 mt-4 flex items-center justify-between">
                                <h6 className="flex justify-start">
                                    Lista de Servicios
                                </h6>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    icon={<HiPlus />}
                                    onClick={onOpenCreateService}
                                >
                                    Crear servicio
                                </Button>
                            </div>
                            <Table className="w-full rounded-lg">
                                <THead>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <Tr key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => {
                                                        return (
                                                            <Th
                                                                key={header.id}
                                                                colSpan={
                                                                    header.colSpan
                                                                }
                                                            >
                                                                {header.isPlaceholder ? null : (
                                                                    <div
                                                                        {...{
                                                                            className:
                                                                                header.column.getCanSort()
                                                                                    ? 'cursor-pointer select-none'
                                                                                    : '',
                                                                            onClick:
                                                                                header.column.getToggleSortingHandler(),
                                                                        }}
                                                                    >
                                                                        {flexRender(
                                                                            header
                                                                                .column
                                                                                .columnDef
                                                                                .header,
                                                                            header.getContext(),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </Th>
                                                        )
                                                    },
                                                )}
                                            </Tr>
                                        ))}
                                </THead>
                                <TBody>
                                    {table
                                        .getRowModel()
                                        .rows.slice(
                                            (currentPage - 1) * rowsPerPage,
                                            currentPage * rowsPerPage,
                                        )
                                        .map((row) => {
                                            return (
                                                <Tr key={row.id}>
                                                    {row
                                                        .getVisibleCells()
                                                        .map((cell) => {
                                                            return (
                                                                <Td
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                >
                                                                    {flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,
                                                                        cell.getContext(),
                                                                    )}
                                                                </Td>
                                                            )
                                                        })}
                                                </Tr>
                                            )
                                        })}
                                </TBody>
                            </Table>
                            <Pagination
                                onChange={onPaginationChange}
                                currentPage={currentPage}
                                totalRows={totalRows}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={onRowsPerPageChange}
                            />
                        </div>
                    </div>
                </TabContent>
                <TabContent value="tab3">
                    <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h6 className="mb-6 flex justify-start mt-4">
                            Documentos del Negocio
                        </h6>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {data?.rifIdFiscal && (
                                <div
                                    className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() =>
                                        openDocumentModal(
                                            data.rifIdFiscal,
                                            'RIF ID Fiscal',
                                            data.rifIdFiscal.includes('.pdf')
                                                ? 'pdf'
                                                : 'image',
                                        )
                                    }
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        {data.rifIdFiscal.includes('.pdf') ? (
                                            <div className="text-center">
                                                <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-gray-700">
                                                    RIF ID Fiscal
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PDF
                                                </p>
                                            </div>
                                        ) : (
                                            <img
                                                src={data.rifIdFiscal}
                                                alt="RIF ID Fiscal"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    ;(
                                                        e.target as HTMLImageElement
                                                    ).style.display = 'none'
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                    </div>
                                </div>
                            )}
                            {data?.permisoOperacion && (
                                <div
                                    className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() =>
                                        openDocumentModal(
                                            data.permisoOperacion,
                                            'Permiso de Operación',
                                            data.permisoOperacion.includes(
                                                '.pdf',
                                            )
                                                ? 'pdf'
                                                : 'image',
                                        )
                                    }
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        {data.permisoOperacion.includes(
                                            '.pdf',
                                        ) ? (
                                            <div className="text-center">
                                                <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-gray-700">
                                                    Permiso de Operación
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PDF
                                                </p>
                                            </div>
                                        ) : (
                                            <img
                                                src={data.permisoOperacion}
                                                alt="Permiso de Operación"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    ;(
                                                        e.target as HTMLImageElement
                                                    ).style.display = 'none'
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                    </div>
                                </div>
                            )}
                            {data?.logotipoNegocio && (
                                <div
                                    className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() =>
                                        openDocumentModal(
                                            data.logotipoNegocio,
                                            'Logotipo Negocio',
                                            'image',
                                        )
                                    }
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={data.logotipoNegocio}
                                            alt="Logotipo Negocio"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                ;(
                                                    e.target as HTMLImageElement
                                                ).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                    </div>
                                </div>
                            )}
                            {data?.fotoFrenteTaller && (
                                <div
                                    className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() =>
                                        openDocumentModal(
                                            data.fotoFrenteTaller,
                                            'Foto Frente Negocio',
                                            'image',
                                        )
                                    }
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={data.fotoFrenteTaller}
                                            alt="Foto Frente Negocio"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                ;(
                                                    e.target as HTMLImageElement
                                                ).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                    </div>
                                </div>
                            )}
                            {data?.fotoInternaTaller && (
                                <div
                                    className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() =>
                                        openDocumentModal(
                                            data.fotoInternaTaller,
                                            'Foto Interna Negocio',
                                            'image',
                                        )
                                    }
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={data.fotoInternaTaller}
                                            alt="Foto Interna Negocio"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                ;(
                                                    e.target as HTMLImageElement
                                                ).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {!data?.rifIdFiscal &&
                            !data?.permisoOperacion &&
                            !data?.logotipoNegocio &&
                            !data?.fotoFrenteTaller &&
                            !data?.fotoInternaTaller && (
                                <div className="text-center py-12 text-gray-500">
                                    <FaFileUpload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-semibold">
                                        No hay documentos disponibles
                                    </p>
                                    <p className="text-sm">
                                        Los documentos aparecerán aquí una vez
                                        que se suban
                                    </p>
                                </div>
                            )}
                    </div>
                </TabContent>
                <TabContent value="tab4">
                    <div className="w-full h-full">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 mt-4">
                                <h6 className="m-0">
                                    Tablero digital para publicar promociones
                                </h6>
                                {onOpenCreatePromotion && (
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        onClick={onOpenCreatePromotion}
                                        className="text-white bg-blue-900 hover:bg-blue-700"
                                    >
                                        Crear promoción
                                    </Button>
                                )}
                            </div>
                            <Table className="w-full rounded-lg">
                                <THead>
                                    {tablePromociones
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <Tr key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <Th
                                                            key={header.id}
                                                            colSpan={
                                                                header.colSpan
                                                            }
                                                        >
                                                            {header.isPlaceholder ? null : (
                                                                <div
                                                                    {...{
                                                                        className:
                                                                            header.column.getCanSort()
                                                                                ? 'cursor-pointer select-none'
                                                                                : '',
                                                                        onClick:
                                                                            header.column.getToggleSortingHandler(),
                                                                    }}
                                                                >
                                                                    {flexRender(
                                                                        header
                                                                            .column
                                                                            .columnDef
                                                                            .header,
                                                                        header.getContext(),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Th>
                                                    ),
                                                )}
                                            </Tr>
                                        ))}
                                </THead>
                                <TBody>
                                    {tablePromociones
                                        .getRowModel()
                                        .rows.slice(
                                            (currentPagePromo - 1) *
                                                rowsPerPagePromo,
                                            currentPagePromo * rowsPerPagePromo,
                                        )
                                        .map((row) => (
                                            <Tr key={row.id}>
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <Td key={cell.id}>
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </Td>
                                                    ))}
                                            </Tr>
                                        ))}
                                </TBody>
                            </Table>
                            <Pagination
                                onChange={onPaginationChangePromo ?? (() => {})}
                                currentPage={currentPagePromo}
                                totalRows={totalRowsPromo}
                                rowsPerPage={rowsPerPagePromo}
                                onRowsPerPageChange={
                                    onRowsPerPageChangePromo ?? (() => {})
                                }
                            />
                        </div>
                    </div>
                </TabContent>
                <TabContent value="tab5">
                    <div className="mb-8 mt-2">
                        <h6 className="mb-4">
                            Histórico de clientes atendidos
                        </h6>
                        <Card bordered className="mb-4 overflow-hidden rounded-xl border-gray-200 shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="relative w-full md:max-w-xs">
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, vehículo, contacto o servicio..."
                                            className="w-full py-2.5 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            value={historicoSearch}
                                            onChange={(e) =>
                                                setHistoricoSearch(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant={
                                                historicoTipo === 'ambos'
                                                    ? 'solid'
                                                    : 'default'
                                            }
                                            onClick={() =>
                                                setHistoricoTipo('ambos')
                                            }
                                        >
                                            Ambos
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={
                                                historicoTipo === 'emergencia'
                                                    ? 'solid'
                                                    : 'default'
                                            }
                                            onClick={() =>
                                                setHistoricoTipo('emergencia')
                                            }
                                        >
                                            Emergencia
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={
                                                historicoTipo === 'normal'
                                                    ? 'solid'
                                                    : 'default'
                                            }
                                            onClick={() =>
                                                setHistoricoTipo('normal')
                                            }
                                        >
                                            Base
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 flex-nowrap">
                                        <input
                                            type="date"
                                            className="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={historicoDesde}
                                            onChange={(e) =>
                                                setHistoricoDesde(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <input
                                            type="date"
                                            className="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={historicoHasta}
                                            onChange={(e) =>
                                                setHistoricoHasta(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="whitespace-nowrap"
                                            onClick={() => {
                                                setHistoricoDesde('')
                                                setHistoricoHasta('')
                                            }}
                                        >
                                            Limpiar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {clientesHistoricoFiltrados.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">
                                        <p className="text-sm">
                                            No se encontraron clientes con ese
                                            criterio.
                                        </p>
                                    </div>
                                ) : (
                                    clientesHistoricoPaginados.map(
                                        (cliente) => {
                                            const isOpen =
                                                historicoExpandedId ===
                                                cliente.id
                                            return (
                                                <div key={cliente.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setHistoricoExpandedId(
                                                                isOpen
                                                                    ? null
                                                                    : cliente.id,
                                                            )
                                                        }
                                                        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/30"
                                                    >
                                                        <span className="flex-shrink-0 text-gray-500">
                                                            {isOpen ? (
                                                                <HiChevronDown className="w-5 h-5" />
                                                            ) : (
                                                                <HiChevronRight className="w-5 h-5" />
                                                            )}
                                                        </span>
                                                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                    Nombre
                                                                </span>
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {
                                                                        cliente.nombre
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                    Vehículo
                                                                </span>
                                                                <p className="text-sm text-gray-700 truncate">
                                                                    {
                                                                        cliente.vehiculo
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                    Contacto
                                                                </span>
                                                                <p className="text-sm text-gray-600 truncate">
                                                                    {
                                                                        cliente.contacto
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                    Tipo
                                                                </span>
                                                                <p className="text-sm text-gray-700">
                                                                    {cliente.tipo ===
                                                                    'emergencia'
                                                                        ? 'Emergencia'
                                                                        : 'Normal'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    {isOpen && (
                                                        <div className="bg-gray-50/70 border-t border-gray-100 px-4 pb-4 pt-2">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                                Detalles del
                                                                servicio
                                                            </p>
                                                            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm space-y-2">
                                                                <p className="text-sm text-gray-800">
                                                                    <span className="font-medium">
                                                                        Fecha:
                                                                    </span>{' '}
                                                                    {
                                                                        cliente.fecha
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-gray-800">
                                                                    <span className="font-medium">
                                                                        Servicio:
                                                                    </span>{' '}
                                                                    {
                                                                        cliente.servicio
                                                                    }
                                                                </p>
                                                                {cliente.descripcion && (
                                                                    <p className="text-sm text-gray-700">
                                                                        <span className="font-medium">
                                                                            Descripción:
                                                                        </span>{' '}
                                                                        {
                                                                            cliente.descripcion
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        },
                                    )
                                )}
                            </div>
                            {historicoTotalRows > HISTORICO_ROWS_PER_PAGE && (
                                <div className="border-t border-gray-200 px-4 py-3">
                                    <Pagination
                                        onChange={(page) => {
                                            setHistoricoPage(page)
                                            setHistoricoExpandedId(null)
                                        }}
                                        currentPage={historicoPage}
                                        totalRows={historicoTotalRows}
                                        rowsPerPage={HISTORICO_ROWS_PER_PAGE}
                                        onRowsPerPageChange={() => {}}
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                </TabContent>
                <TabContent value="tab6">
                    <div className="mb-8 mt-2">
                        <h6 className="mb-4">Métodos de pago</h6>
                        <Card
                            bordered
                            className="mb-4 overflow-hidden rounded-xl border-gray-200 shadow-sm"
                        >
                            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.name}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            checked={
                                                paymentMethodsState[
                                                    method.dbKey
                                                ] || false
                                            }
                                            onChange={(checked: boolean) => {
                                                setPaymentMethodsState(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        [method.dbKey]: checked,
                                                    }),
                                                )
                                            }}
                                        />
                                        <span>{method.icon}</span>
                                        <span>{method.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 px-4 py-3">
                                <div className="flex justify-end">
                                    <button
                                        onClick={onSavePaymentMethods}
                                        className="rounded-lg bg-[#1d1e56] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-900 focus:outline-none"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabContent>
            </Tabs>
        </div>
    )
}
