import type React from 'react'
import { useState, useMemo } from 'react'
import type { Table as ReactTable } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Table from '@/components/ui/Table'
import { Button, Pagination, Tabs } from '@/components/ui'
import Checkbox from '@/components/ui/Checkbox'
import { FaFilePdf, FaFileUpload, FaRegEye } from 'react-icons/fa'
import { HiFire, HiOutlineSearch, HiChevronDown, HiChevronRight } from 'react-icons/hi'
import PaymentDrawer from './PaymentForm'
import type { DocumentData } from 'firebase/firestore'
import type { ReactNode } from 'react'

const { TabNav, TabList, TabContent } = Tabs
const { Tr, Th, Td, THead, TBody } = Table

// Mock para Histórico de clientes (solo estructura visual, sin BD)
type VisitaCliente = { fecha: string; servicios: string[] }
type ClienteHistorico = {
    id: string
    nombre: string
    vehiculo: string
    contacto: string
    frecuenciaVisitas: string
    visitas: VisitaCliente[]
}
const MOCK_CLIENTES_HISTORICO: ClienteHistorico[] = [
    {
        id: '1',
        nombre: 'Carlos Mendoza',
        vehiculo: 'Toyota Corolla 2020',
        contacto: 'carlos.m@email.com · 0412-1234567',
        frecuenciaVisitas: 'Cada 3 meses',
        visitas: [
            { fecha: '15/01/2025', servicios: ['Cambio de aceite', 'Filtro de aire', 'Revisión frenos'] },
            { fecha: '20/10/2024', servicios: ['Alineación', 'Balanceo'] },
        ],
    },
    {
        id: '2',
        nombre: 'María González',
        vehiculo: 'Honda Civic 2019',
        contacto: 'maria.g@email.com · 0424-7654321',
        frecuenciaVisitas: 'Cada 2 meses',
        visitas: [
            { fecha: '08/02/2025', servicios: ['Cambio de aceite', 'Lavado de inyectores'] },
            { fecha: '12/12/2024', servicios: ['Revisión general', 'Cambio de bujías'] },
            { fecha: '05/10/2024', servicios: ['Cambio de aceite'] },
        ],
    },
    {
        id: '3',
        nombre: 'Luis Pérez',
        vehiculo: 'Ford Explorer 2021',
        contacto: 'luis.p@email.com · 0416-9876543',
        frecuenciaVisitas: 'Cada 4 meses',
        visitas: [
            { fecha: '22/01/2025', servicios: ['Cambio de aceite', 'Filtro de combustible', 'Revisión suspensión'] },
        ],
    },
]

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
    subscription: SubscriptionTab | null
    isSuscrito: boolean
    onOpenPlansDialog: () => void
    tallerUid: string
    formatDate: (value: unknown) => string
    diasRestantes: number | null
    paymentMethods: PaymentMethodOption[]
    paymentMethodsState: Record<string, boolean>
    setPaymentMethodsState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
    onSavePaymentMethods: () => void
    data: DocumentData | null
    openDocumentModal: (url: string, name: string, type: 'image' | 'pdf') => void
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
    openDocumentModal,
}: ProfileGarageTabsProps) {
    const [historicoSearch, setHistoricoSearch] = useState('')
    const [historicoExpandedId, setHistoricoExpandedId] = useState<string | null>(null)

    const clientesHistoricoFiltrados = useMemo(() => {
        if (!historicoSearch.trim()) return MOCK_CLIENTES_HISTORICO
        const q = historicoSearch.toLowerCase().trim()
        return MOCK_CLIENTES_HISTORICO.filter(
            (c) =>
                c.nombre.toLowerCase().includes(q) ||
                c.vehiculo.toLowerCase().includes(q) ||
                c.contacto.toLowerCase().includes(q)
        )
    }, [historicoSearch])

    return (
        <div className="flex-1 min-w-0">
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Planes</TabNav>
                    <TabNav value="tab2">Servicios</TabNav>
                    <TabNav value="tab3">Documentos</TabNav>
                    <TabNav value="tab4">Promociones</TabNav>
                    <TabNav value="tab5">Histórico de clientes</TabNav>
                </TabList>
                <div className="w-full">
                    <TabContent value="tab1">
                        <div className="mb-8 mt-4">
                            <h6 className="mb-4">Subscripción</h6>
                            <Card bordered className="mb-4">
                                {!isSuscrito ? (
                                    <div className="flex justify-end">
                                        <p className="text-xs mr-64 mt-3">
                                            Puede visualizar y suscribirse a
                                            un plan para su taller...
                                        </p>
                                        <button
                                            onClick={onOpenPlansDialog}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                                        >
                                            Ver Planes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border rounded-lg shadow-md bg-white">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                className="bg-transparent"
                                                shape="circle"
                                                icon={<HiFire className="text-blue-600" />}
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
                                                                : subscription?.status === 'Vencido'
                                                                ? 'bg-red-100 text-red-400'
                                                                : 'bg-yellow-100 text-yellow-400'
                                                        }`}
                                                    >
                                                        {subscription?.status ||
                                                            'Pendiente'}
                                                    </Tag>
                                                </div>
                                                <div className="grid grid-cols-4">
                                                    <p className="text-xs text-gray-500">
                                                        Vigencia:{' '}
                                                        {subscription?.vigencia ??
                                                            '---'}{' '}
                                                        días
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Monto mensual:{' '}
                                                        <span className="font-bold text-gray-800">
                                                            {subscription?.monto !== undefined && subscription?.monto !== null
                                                                ? (subscription.monto === 0 || (subscription.monto < 0.01 && subscription.monto > -0.01))
                                                                    ? 'Gratis'
                                                                    : `$${subscription.monto}`
                                                                : '---'}
                                                        </span>
                                                    </p>
                                                    {subscription?.status ===
                                                        'Aprobado' && (
                                                        <>
                                                            <p className="text-xs ml-2 text-gray-600">
                                                                {diasRestantes ??
                                                                    '---'}{' '}
                                                                días
                                                                restantes
                                                            </p>
                                                            <p className="text-xs ml-2 text-gray-600">
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
                                        {subscription?.status ===
                                            'Vencido' && (
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
                                                            subscription?.uid || ''
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
                                <div className="p-4 rounded-lg shadow">
                                    <h6 className="mb-6 flex justify-start mt-4">
                                        Historial de Subscripciones
                                    </h6>
                                    <Table className="w-full rounded-lg">
                                        <THead>
                                            {table3
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <Tr
                                                        key={headerGroup.id}
                                                    >
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
                                                    currentPage *
                                                        rowsPerPage,
                                                )
                                                .map((row) => {
                                                    return (
                                                        <Tr key={row.id}>
                                                            {row
                                                                .getVisibleCells()
                                                                .map(
                                                                    (
                                                                        cell,
                                                                    ) => {
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
                                                                    },
                                                                )}
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
                            <div className="border-t border-gray-300 my-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
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
                                            onChange={(
                                                checked: boolean,
                                            ) => {
                                                setPaymentMethodsState(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        [method.dbKey]:
                                                            checked,
                                                    }),
                                                )
                                            }}
                                        />
                                        <span>{method.icon}</span>
                                        <span>{method.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={onSavePaymentMethods}
                                    className="px-4 py-2 bg-[#1d1e56] text-white rounded-md hover:bg-blue-900 focus:outline-none"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </TabContent>
                </div>
                <TabContent value="tab2">
                    <div className="w-full h-full">
                        <div className="p-4 rounded-lg">
                            <h6 className="mb-6 flex justify-start mt-4">
                                Lista de Servicios
                            </h6>
                            <Table
                                className="w-full rounded-lg"
                            >
                                <THead>
                                    {table
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
                    <div className="w-full h-full p-4">
                        <h6 className="mb-6 flex justify-start mt-4">
                            Documentos del Taller
                        </h6>
                        <div className="grid grid-cols-3 gap-4">
                            {data?.rifIdFiscal && (
                                <div
                                    className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() => openDocumentModal(
                                        data.rifIdFiscal,
                                        'RIF ID Fiscal',
                                        data.rifIdFiscal.includes('.pdf') ? 'pdf' : 'image'
                                    )}
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        {data.rifIdFiscal.includes('.pdf') ? (
                                            <div className="text-center">
                                                <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-gray-700">RIF ID Fiscal</p>
                                                <p className="text-xs text-gray-500">PDF</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={data.rifIdFiscal}
                                                alt="RIF ID Fiscal"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none'
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
                                    onClick={() => openDocumentModal(
                                        data.permisoOperacion,
                                        'Permiso de Operación',
                                        data.permisoOperacion.includes('.pdf') ? 'pdf' : 'image'
                                    )}
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        {data.permisoOperacion.includes('.pdf') ? (
                                            <div className="text-center">
                                                <FaFilePdf className="w-16 h-16 text-red-500 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-gray-700">Permiso de Operación</p>
                                                <p className="text-xs text-gray-500">PDF</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={data.permisoOperacion}
                                                alt="Permiso de Operación"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none'
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
                                    onClick={() => openDocumentModal(
                                        data.logotipoNegocio,
                                        'Logotipo Negocio',
                                        'image'
                                    )}
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={data.logotipoNegocio}
                                            alt="Logotipo Negocio"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
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
                                    onClick={() => openDocumentModal(
                                        data.fotoFrenteTaller,
                                        'Foto Frente Taller',
                                        'image'
                                    )}
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={data.fotoFrenteTaller}
                                            alt="Foto Frente Taller"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
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
                                    onClick={() => openDocumentModal(
                                        data.fotoInternaTaller,
                                        'Foto Interna Taller',
                                        'image'
                                    )}
                                >
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={data.fotoInternaTaller}
                                            alt="Foto Interna Taller"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <FaRegEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {(!data?.rifIdFiscal && !data?.permisoOperacion && !data?.logotipoNegocio && !data?.fotoFrenteTaller && !data?.fotoInternaTaller) && (
                            <div className="text-center py-12 text-gray-500">
                                <FaFileUpload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold">No hay documentos disponibles</p>
                                <p className="text-sm">Los documentos aparecerán aquí una vez que se suban</p>
                            </div>
                        )}
                    </div>
                </TabContent>
                <TabContent value="tab4">
                    <div className="w-full h-full">
                        <div className="p-4 rounded-lg">
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
                                                {headerGroup.headers.map((header) => (
                                                    <Th key={header.id} colSpan={header.colSpan}>
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                {...{
                                                                    className: header.column.getCanSort()
                                                                        ? 'cursor-pointer select-none'
                                                                        : '',
                                                                    onClick: header.column.getToggleSortingHandler(),
                                                                }}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext(),
                                                                )}
                                                            </div>
                                                        )}
                                                    </Th>
                                                ))}
                                            </Tr>
                                        ))}
                                </THead>
                                <TBody>
                                    {tablePromociones
                                        .getRowModel()
                                        .rows.slice(
                                            (currentPagePromo - 1) * rowsPerPagePromo,
                                            currentPagePromo * rowsPerPagePromo,
                                        )
                                        .map((row) => (
                                            <Tr key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <Td key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
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
                                onRowsPerPageChange={onRowsPerPageChangePromo ?? (() => {})}
                            />
                        </div>
                    </div>
                </TabContent>
                <TabContent value="tab5">
                    <div className="mb-8 mt-4">
                        <h6 className="mb-4">Histórico de clientes atendidos</h6>
                        <Card bordered className="mb-4 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                                <div className="relative max-w-sm">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, vehículo o contacto..."
                                        className="w-full py-2.5 px-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        value={historicoSearch}
                                        onChange={(e) => setHistoricoSearch(e.target.value)}
                                    />
                                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {clientesHistoricoFiltrados.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">
                                        <p className="text-sm">No se encontraron clientes con ese criterio.</p>
                                    </div>
                                ) : (
                                    clientesHistoricoFiltrados.map((cliente) => {
                                        const isOpen = historicoExpandedId === cliente.id
                                        return (
                                            <div key={cliente.id}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setHistoricoExpandedId(isOpen ? null : cliente.id)
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
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</span>
                                                            <p className="text-sm font-medium text-gray-900 truncate">{cliente.nombre}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehículo</span>
                                                            <p className="text-sm text-gray-700 truncate">{cliente.vehiculo}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contacto</span>
                                                            <p className="text-sm text-gray-600 truncate">{cliente.contacto}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Frecuencia</span>
                                                            <p className="text-sm text-gray-700">{cliente.frecuenciaVisitas}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                                {isOpen && (
                                                    <div className="bg-gray-50/70 border-t border-gray-100 px-4 pb-4 pt-2">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Visitas y servicios realizados</p>
                                                        <div className="space-y-4">
                                                            {cliente.visitas.map((visita, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-800 mb-2">
                                                                        Fecha: {visita.fecha}
                                                                    </p>
                                                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                                        {visita.servicios.map((s, i) => (
                                                                            <li key={i}>{s}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </Card>
                    </div>
                </TabContent>
            </Tabs>
        </div>
    )
}
