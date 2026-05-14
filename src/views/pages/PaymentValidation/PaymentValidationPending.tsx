import { useEffect, useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import {
    FaRegEye,
    FaCheckCircle,
    FaTimesCircle,
    FaTrash,
} from 'react-icons/fa'
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp,
    getDoc,
    writeBatch,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { MouseEvent } from 'react'
import { Checkbox, Dialog, Drawer, Switcher } from '@/components/ui'
import { exportStyledExcel } from '@/utils/excelExport'
import axios from 'axios'

type Subscriptions = {
    nombre?: string
    taller_uid?: string
    status?: string
    cantidad_servicios?: string
    fecha_inicio: Timestamp
    fecha_fin: Timestamp
    vigencia: string
    monto?: string
    uid: string
    id: string
    nombre_taller: string
    correo_taller?: string
    comprobante_pago: {
        monto?: number
        metodo?: string
        banco?: string
        comprobante?: string
        cedula?: string | number
        receiptFile?: string
        numReferencia?: string
        telefono?: number
        fechaPago?: Timestamp
        correo?: string
        bancoOrigen?: string
        bancoDestino?: string
    }
}

function formatTsForSearchPayment(ts: unknown): string {
    if (!ts) return ''
    if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }
    return String(ts)
}

function paymentValidationSearchableText(
    row: Subscriptions & { correo_taller?: string },
): string {
    const parts: string[] = []
    const push = (...vals: (string | number | undefined | null)[]) => {
        for (const v of vals) {
            if (v === undefined || v === null) continue
            parts.push(String(v))
        }
    }
    push(
        row.nombre,
        row.nombre_taller,
        row.correo_taller,
        row.taller_uid,
        row.status,
        row.cantidad_servicios,
        row.monto,
        row.vigencia,
        row.uid,
        row.id,
    )
    parts.push(
        formatTsForSearchPayment(row.fecha_inicio),
        formatTsForSearchPayment(row.fecha_fin),
    )
    const c = row.comprobante_pago
    if (c) {
        push(
            c.metodo,
            c.banco,
            c.correo,
            c.numReferencia,
            c.receiptFile,
            c.bancoOrigen,
            c.bancoDestino,
        )
        if (c.monto !== undefined && c.monto !== null) push(String(c.monto))
        if (c.cedula !== undefined && c.cedula !== null) push(String(c.cedula))
        if (c.telefono !== undefined && c.telefono !== null)
            push(String(c.telefono))
        parts.push(formatTsForSearchPayment(c.fechaPago))
    }
    return parts.join(' ').toLowerCase()
}

function parseCantidadServicios(raw: unknown): number {
    if (raw === undefined || raw === null) return 0
    if (typeof raw === 'number') {
        return Number.isFinite(raw) ? raw : 0
    }
    if (typeof raw === 'string') {
        const n = Number(String(raw).trim())
        return Number.isFinite(n) ? n : 0
    }
    return 0
}

/**
 * Cupo del plan anterior: última suscripción Aprobada del mismo taller
 * (excluye el doc actual, típicamente aún Por Aprobar). En Firestore el
 * estado sigue siendo Aprobado aunque la UI muestre Vencido por fecha.
 */
async function getPreviousApprovedSubscriptionServiceLimit(
    tallerUid: string,
    currentSubscriptionDocId: string,
): Promise<number> {
    const snap = await getDocs(
        query(
            collection(db, 'Subscripciones'),
            where('taller_uid', '==', tallerUid),
        ),
    )
    type Cand = { fechaFinMs: number; cantidad: number }
    const candidates: Cand[] = []
    snap.docs.forEach((d) => {
        if (d.id === currentSubscriptionDocId) return
        const data = d.data() as {
            status?: string
            cantidad_servicios?: unknown
            fecha_fin?: unknown
        }
        if (data.status !== 'Aprobado') return
        const f = data.fecha_fin
        const fechaFinMs = f instanceof Timestamp ? f.toMillis() : 0
        candidates.push({
            fechaFinMs,
            cantidad: parseCantidadServicios(data.cantidad_servicios),
        })
    })
    if (candidates.length === 0) return 0
    candidates.sort((a, b) => b.fechaFinMs - a.fechaFinMs)
    return candidates[0].cantidad
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

function wasServiceOff(data: { estatus?: unknown }): boolean {
    return data.estatus !== true
}

/** FCM / push guardado en `Usuarios.token` (dispositivo del taller). */
function getUsuarioPushToken(
    userData: Record<string, unknown> | undefined,
): string | null {
    const raw = userData?.token
    if (typeof raw !== 'string') return null
    const t = raw.trim()
    return t.length > 0 ? t : null
}

/**
 * Compara cantidad_servicios del plan anterior (última aprobada) vs el nuevo.
 * - Igual o nuevo mayor: enciende todos los servicios del taller (estatus true,
 *   lastActive true) y calcula `subscripcion_actual.cantidad_servicios`:
 *   - Si las cantidades del plan son iguales: debe quedar en 0.
 *   - Si el plan nuevo trae más cupos: cupo del plan nuevo menos cuántos
 *     servicios pasaron de estatus false a true.
 * - Nuevo menor: no modifica servicios.
 */
async function maybeActivateAllTallerServicesAfterApproval(params: {
    tallerUid: string
    subscriptionDocId: string
    newPlanCantidadServiciosRaw: unknown
}): Promise<{ usuarioCantidadServicios?: string }> {
    const { tallerUid, subscriptionDocId, newPlanCantidadServiciosRaw } =
        params
    const oldLimit = await getPreviousApprovedSubscriptionServiceLimit(
        tallerUid,
        subscriptionDocId,
    )
    const newLimit = parseCantidadServicios(newPlanCantidadServiciosRaw)
    if (newLimit < oldLimit) {
        return {}
    }

    const serviciosSnap = await getDocs(
        query(
            collection(db, 'Servicios'),
            where('uid_taller', '==', tallerUid),
        ),
    )
    if (serviciosSnap.empty) {
        return {}
    }

    const flippedFalseToTrue = serviciosSnap.docs.filter((d) =>
        wasServiceOff(d.data() as { estatus?: unknown }),
    ).length

    for (const chunk of chunkArray(serviciosSnap.docs, 500)) {
        const batch = writeBatch(db)
        for (const d of chunk) {
            batch.update(doc(db, 'Servicios', d.id), {
                estatus: true,
                lastActive: true,
            })
        }
        await batch.commit()
    }

    let usuarioCantidadServicios: string
    if (newLimit === oldLimit) {
        usuarioCantidadServicios = '0'
    } else {
        usuarioCantidadServicios = String(
            Math.max(0, newLimit - flippedFalseToTrue),
        )
    }
    return { usuarioCantidadServicios }
}

async function approveSubscriptionAsApproved(
    sub: Subscriptions,
): Promise<void> {
    if (sub.taller_uid) {
        const userDoc = await getDoc(doc(db, 'Usuarios', sub.taller_uid))
        if (userDoc.exists()) {
            const userData = userDoc.data() as Record<string, unknown>
            const pushToken = getUsuarioPushToken(userData)
            if (pushToken) {
                try {
                    await axios.post(
                        'https://apisolvers.solversapp.com/api/usuarios/sendNotification',
                        {
                            token: pushToken,
                            title: 'Codigo Validado',
                            body: 'Hola, se ha validado su pago exitosamente',
                            secretCode: 'Validar codigo',
                        },
                    )
                } catch (error) {
                    console.error('Error al enviar notificación:', error)
                }
            }
        }
    }

    const fechaInicio = new Date()
    const vigenciaDias = parseInt(sub.vigencia, 10)
    if (isNaN(vigenciaDias)) {
        throw new Error('INVALID_VIGENCIA')
    }
    const fechaFin = new Date(fechaInicio)
    fechaFin.setDate(fechaInicio.getDate() + vigenciaDias)

    const updateData = {
        nombre: sub.nombre,
        vigencia: sub.vigencia,
        fecha_inicio: Timestamp.fromDate(fechaInicio),
        fecha_fin: Timestamp.fromDate(fechaFin),
        status: 'Aprobado',
        cantidad_servicios: sub.cantidad_servicios,
        monto: sub.monto,
    }
    await updateDoc(doc(db, 'Subscripciones', sub.uid), updateData)
    if (sub.taller_uid) {
        const activation = await maybeActivateAllTallerServicesAfterApproval({
            tallerUid: sub.taller_uid,
            subscriptionDocId: sub.uid,
            newPlanCantidadServiciosRaw: sub.cantidad_servicios,
        })
        const usuarioSubscripcion =
            activation.usuarioCantidadServicios !== undefined
                ? {
                      ...updateData,
                      cantidad_servicios: activation.usuarioCantidadServicios,
                  }
                : updateData
        await updateDoc(doc(db, 'Usuarios', sub.taller_uid), {
            subscripcion_actual: usuarioSubscripcion,
        })
    }
}

type PaymentValidationPendingProps = {
    exportSignal?: number
    refreshSignal?: number
    searchTerm?: string
}

const PaymentValidationPending = ({
    exportSignal = 0,
    refreshSignal = 0,
    searchTerm = '',
}: PaymentValidationPendingProps) => {
    const [dataSubs, setDataSubs] = useState<Subscriptions[]>([])
    const [filtering, setFiltering] = useState<ColumnFiltersState>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Subscriptions | null>(
        null,
    )
    const [drawerIsOpen, setDrawerIsOpen] = useState(false)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscriptions | null>(null)
    const [selectedUids, setSelectedUids] = useState<Set<string>>(() => new Set())
    const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false)
    const [bulkApproving, setBulkApproving] = useState(false)
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
    const [imagePreviewUrl, setImagePreviewUrl] = useState('')
    const [imageZoom, setImageZoom] = useState(1)
    const [imageRotation, setImageRotation] = useState(0)
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
    const [isDraggingImage, setIsDraggingImage] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const getData = async () => {
        const q = query(
            collection(db, 'Subscripciones'),
            where('status', '==', 'Por Aprobar'),
        )
        const querySnapshot = await getDocs(q)

        const promises = querySnapshot.docs.map(async (docSnap) => {
            const subsData = docSnap.data() as Subscriptions

            let nombre_taller = 'Negocio no encontrado'
            let correo_taller = 'Correo no encontrado'
            if (subsData.taller_uid) {
                const tallerDoc = await getDoc(
                    doc(db, 'Usuarios', subsData.taller_uid),
                )
                if (tallerDoc.exists()) {
                    const tallerData = tallerDoc.data()
                    nombre_taller = tallerData.nombre || 'Negocio no encontrado'
                    correo_taller = tallerData.email || 'Correo no encontrado'
                }
            }

            return { ...subsData, uid: docSnap.id, nombre_taller, correo_taller }
        })

        const resolvedSubcripciones = await Promise.all(promises)
        // Solo mostrar suscripciones de pago (excluir gratuitas, no requieren validación)
        const soloPago = resolvedSubcripciones.filter((sub) => {
            const monto = sub.monto
            const montoNum =
                typeof monto === 'string'
                    ? parseFloat(monto)
                    : typeof monto === 'number'
                      ? monto
                      : 0
            return !isNaN(montoNum) && montoNum >= 0.0001
        })
        setDataSubs(soloPago)
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        const validIds = new Set(dataSubs.map((r) => r.uid))
        setSelectedUids((prev) => {
            const next = new Set<string>()
            prev.forEach((id) => {
                if (validIds.has(id)) next.add(id)
            })
            if (next.size !== prev.size) return next
            for (const id of prev) {
                if (!next.has(id)) return next
            }
            return prev
        })
    }, [dataSubs])

    useEffect(() => {
        if (refreshSignal > 0) {
            void getData()
            toast.push(
                <Notification title="Datos actualizados">
                    La tabla ha sido actualizada con éxito.
                </Notification>,
            )
        }
    }, [refreshSignal])

    useEffect(() => {
        if (exportSignal > 0) {
            setIsOpen(true)
        }
    }, [exportSignal])

    const handleCloseDialog = () => {
        setIsOpen(false)
        setStartDate('')
        setEndDate('')
    }

    const openImagePreview = (url: string) => {
        setImagePreviewUrl(url)
        setImageZoom(1)
        setImageRotation(0)
        setImageOffset({ x: 0, y: 0 })
        setImagePreviewOpen(true)
    }

    const closeImagePreview = () => {
        setImagePreviewOpen(false)
        setImagePreviewUrl('')
        setIsDraggingImage(false)
    }

    const openDrawer = (person: Subscriptions) => {
        setSelectedPerson(person)
        setDrawerIsOpen(true)
    }

    const handleSaveChanges = async () => {
        if (!selectedPerson) return
        try {
            if (selectedPerson.status === 'Por Aprobar') {
                const updateData = {
                    status: selectedPerson.status,
                    fecha_inicio: null,
                    fecha_fin: null,
                    monto: selectedPerson.monto ?? '',
                    nombre: selectedPerson.nombre,
                    vigencia: selectedPerson.vigencia,
                }
                await updateDoc(
                    doc(db, 'Subscripciones', selectedPerson.uid),
                    updateData,
                )
                if (selectedPerson.taller_uid) {
                    await updateDoc(
                        doc(db, 'Usuarios', selectedPerson.taller_uid),
                        { subscripcion_actual: updateData },
                    )

                    const userDoc = await getDoc(
                        doc(db, 'Usuarios', selectedPerson.taller_uid),
                    )
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as Record<string, unknown>
                        const pushToken = getUsuarioPushToken(userData)
                        if (pushToken) {
                            try {
                                await axios.post(
                                    'https://apisolvers.solversapp.com/api/usuarios/sendNotification',
                                    {
                                        token: pushToken,
                                        title: 'Codigo Validado',
                                        body: 'Hola, se ha rechazado su pago',
                                        secretCode: 'Validar codigo',
                                    },
                                )
                            } catch (error) {
                                console.error(
                                    'Error al enviar notificación:',
                                    error,
                                )
                            }
                        }
                    }
                }

                toast.push(
                    <Notification title="Éxito">
                        Subscripción actualizada con éxito.
                    </Notification>,
                )

                setDrawerIsOpen(false)
                getData()
                return
            }

            try {
                await approveSubscriptionAsApproved(selectedPerson)
            } catch (err) {
                if (
                    err instanceof Error &&
                    err.message === 'INVALID_VIGENCIA'
                ) {
                    toast.push(
                        <Notification title="Error">
                            La vigencia proporcionada no es válida.
                        </Notification>,
                    )
                    return
                }
                throw err
            }

            toast.push(
                <Notification title="Éxito">
                    Subscripción actualizada con éxito.
                </Notification>,
            )

            setDrawerIsOpen(false)
            getData()
        } catch (error) {
            console.error('Error actualizando la subscripción:', error)
            toast.push(
                <Notification title="Error">
                    Hubo un error al actualizar la subscripción.
                </Notification>,
            )
        }
    }

    const executeBulkApprove = async () => {
        const toApprove = dataSubs.filter((s) => selectedUids.has(s.uid))
        if (toApprove.length === 0) return
        setBulkApproving(true)
        let ok = 0
        let failed = 0
        for (const sub of toApprove) {
            try {
                await approveSubscriptionAsApproved(sub)
                ok++
            } catch (e) {
                failed++
                console.error('Aprobación masiva — error en fila:', sub.uid, e)
            }
        }
        setBulkApproving(false)
        setBulkApproveDialogOpen(false)
        setSelectedUids(new Set())
        await getData()
        if (failed === 0) {
            toast.push(
                <Notification title="Aprobación completada">
                    Se aprobaron {ok} pago{ok === 1 ? '' : 's'} correctamente.
                </Notification>,
            )
        } else {
            toast.push(
                <Notification title="Aprobación parcial">
                    Correctos: {ok}. Con error: {failed}. Revise vigencia y datos
                    en los registros fallidos.
                </Notification>,
            )
        }
    }

    const formatDate = (timestamp: unknown): string => {
        if (timestamp instanceof Timestamp) {
            const dateObj = timestamp.toDate()
            return dateObj.toLocaleDateString('es-ES')
        }
        return '-'
    }

    const { Tr, Th, Td, THead, TBody } = Table

    const handleDrawerClose = (e: MouseEvent) => {
        console.log('Drawer cerrado', e)
        setDrawerIsOpen(false)
        setSelectedPerson(null) // Limpiar la selección
    }

    const handleDeleteSubscription = (subscription: Subscriptions) => {
        setSubscriptionToDelete(subscription)
        setDeleteModalIsOpen(true)
    }

    const confirmDeleteSubscription = async () => {
        if (subscriptionToDelete) {
            try {
                // Eliminar la suscripción de la colección Subscripciones
                await deleteDoc(doc(db, 'Subscripciones', subscriptionToDelete.uid))

                // Si tiene taller_uid, verificar si el usuario existe antes de actualizar
                if (subscriptionToDelete.taller_uid) {
                    const userDocRef = doc(db, 'Usuarios', subscriptionToDelete.taller_uid)
                    const userDoc = await getDoc(userDocRef)

                    if (userDoc.exists()) {
                        await updateDoc(userDocRef, { subscripcion_actual: null })
                    }
                }

                toast.push(
                    <Notification title="Suscripción eliminada">
                        La suscripción ha sido eliminada exitosamente.
                    </Notification>,
                )

                setDeleteModalIsOpen(false)
                setSubscriptionToDelete(null)
                getData() // Recargar los datos
            } catch (error) {
                console.error('Error eliminando la suscripción:', error)
                toast.push(
                    <Notification title="Error">
                        Hubo un error al eliminar la suscripción.
                    </Notification>,
                )
            }
        }
    }

    const cancelDeleteSubscription = () => {
        setDeleteModalIsOpen(false)
        setSubscriptionToDelete(null)
    }

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const onPaginationChange = (page: number) => {
        setCurrentPage(page)
    }

    const onRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const handleExportToExcel = async () => {
        if (!startDate || !endDate) {
            toast.push(
                <Notification title="Fechas incompletas">
                    Por favor, selecciona ambas fechas para continuar.
                </Notification>,
            )
            return
        }

        // Ajustar fecha de inicio al principio del día en UTC
        const adjustedStartDate = new Date(startDate)
        adjustedStartDate.setUTCHours(0, 0, 0, 0)

        // Ajustar fecha de fin al final del día en UTC
        const adjustedEndDate = new Date(endDate)
        adjustedEndDate.setUTCHours(23, 59, 59, 999)

        console.log({
            startDate: adjustedStartDate,
            endDate: adjustedEndDate,
        })

        // Filtrar los datos para las fechas dentro del rango (pendientes usan fecha de pago del comprobante)
        const filteredData = dataSubs.filter((row) => {
            const fechaRef =
                row.fecha_inicio instanceof Timestamp
                    ? row.fecha_inicio.toDate()
                    : row.comprobante_pago?.fechaPago instanceof Timestamp
                      ? row.comprobante_pago.fechaPago.toDate()
                      : null
            if (!fechaRef || !(fechaRef instanceof Date) || isNaN(fechaRef.getTime())) {
                return false
            }
            return (
                fechaRef.getTime() >= adjustedStartDate.getTime() &&
                fechaRef.getTime() <= adjustedEndDate.getTime()
            )
        })

        if (filteredData.length === 0) {
            toast.push(
                <Notification title="Sin datos para exportar">
                    No hay datos disponibles en el rango de fechas seleccionado.
                </Notification>,
            )
            return
        }

        const tableData = filteredData.map((row) => {
            const montoNum = Number(row.monto ?? 0)
            const comprobanteUrl =
                row.comprobante_pago?.comprobante ||
                row.comprobante_pago?.receiptFile ||
                ''
            return {
                nombreCliente: row.nombre ?? '',
                nombreNegocio: row.nombre_taller ?? '',
                correoNegocio: row.correo_taller ?? '',
                cantidadServicios: String(row.cantidad_servicios ?? ''),
                montoTotal:
                    Number.isNaN(montoNum) || montoNum < 0.0001
                        ? 'GRATIS'
                        : String(row.monto ?? ''),
                fechaInicio:
                    row.fecha_inicio instanceof Timestamp
                        ? row.fecha_inicio.toDate().toISOString().split('T')[0]
                        : String(row.fecha_inicio ?? ''),
                fechaFin:
                    row.fecha_fin instanceof Timestamp
                        ? row.fecha_fin.toDate().toISOString().split('T')[0]
                        : String(row.fecha_fin ?? ''),
                estado: row.status ?? '',
                metodoComprobante: row.comprobante_pago?.metodo || '',
                bancoOrigen: row.comprobante_pago?.bancoOrigen || '',
                bancoDestino: row.comprobante_pago?.bancoDestino || '',
                cedulaComprobante: String(row.comprobante_pago?.cedula ?? ''),
                telefonoComprobante: String(row.comprobante_pago?.telefono ?? ''),
                montoComprobante: String(row.comprobante_pago?.monto ?? ''),
                recibo: comprobanteUrl,
                numeroReferencia: row.comprobante_pago?.numReferencia || '',
                fechaPago: row.comprobante_pago?.fechaPago
                    ? formatDate(row.comprobante_pago.fechaPago)
                    : '-',
                correoComprobante: row.comprobante_pago?.correo || '',
            }
        })

        await exportStyledExcel({
            rows: tableData,
            columns: [
                { header: 'Nombre Cliente', key: 'nombreCliente' },
                { header: 'Nombre Negocio', key: 'nombreNegocio' },
                {
                    header: 'Correo Negocio',
                    key: 'correoNegocio',
                    linkType: 'email',
                },
                { header: 'Cantidad de Servicios', key: 'cantidadServicios' },
                { header: 'Monto Total', key: 'montoTotal' },
                { header: 'Fecha de Inicio', key: 'fechaInicio' },
                { header: 'Fecha de Fin', key: 'fechaFin' },
                { header: 'Estado', key: 'estado' },
                { header: 'Método Comprobante', key: 'metodoComprobante' },
                { header: 'Banco Origen', key: 'bancoOrigen' },
                { header: 'Banco Destino', key: 'bancoDestino' },
                { header: 'Cédula', key: 'cedulaComprobante' },
                { header: 'Teléfono Comprobante', key: 'telefonoComprobante' },
                { header: 'Monto', key: 'montoComprobante' },
                { header: 'Recibo', key: 'recibo', linkType: 'url' },
                { header: 'Número Referencia', key: 'numeroReferencia' },
                { header: 'Fecha Pago', key: 'fechaPago' },
                {
                    header: 'Correo Comprobante',
                    key: 'correoComprobante',
                    linkType: 'email',
                },
            ],
            sheetName: 'Subscripciones',
            fileName: 'subscripciones.xlsx',
        })

        toast.push(
            <Notification title="Exportación exitosa">
                El archivo Excel se ha descargado correctamente.
            </Notification>,
        )
        handleCloseDialog()
    }

    const selectedCount = selectedUids.size

    const columns: ColumnDef<Subscriptions>[] = [
        {
            id: 'select',
            enableSorting: false,
            header: ({ table }) => {
                const pageRows = table
                    .getRowModel()
                    .rows.slice(startIndex, endIndex)
                const visibleUids = pageRows.map((r) => r.original.uid)
                const allSelected =
                    visibleUids.length > 0 &&
                    visibleUids.every((id) => selectedUids.has(id))
                return (
                    <div
                        className="flex justify-center px-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            aria-label="Seleccionar todos en esta página"
                            checked={allSelected}
                            disabled={visibleUids.length === 0}
                            onChange={(checked) => {
                                setSelectedUids((prev) => {
                                    const next = new Set(prev)
                                    if (checked) {
                                        visibleUids.forEach((id) =>
                                            next.add(id),
                                        )
                                    } else {
                                        visibleUids.forEach((id) =>
                                            next.delete(id),
                                        )
                                    }
                                    return next
                                })
                            }}
                        />
                    </div>
                )
            },
            cell: ({ row }) => (
                <div
                    className="flex justify-center px-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        aria-label={`Seleccionar ${row.original.nombre_taller ?? row.original.uid}`}
                        checked={selectedUids.has(row.original.uid)}
                        onChange={(checked) => {
                            setSelectedUids((prev) => {
                                const next = new Set(prev)
                                if (checked) next.add(row.original.uid)
                                else next.delete(row.original.uid)
                                return next
                            })
                        }}
                    />
                </div>
            ),
        },
        {
            header: 'Plan',
            accessorKey: 'nombre',
        },
        {
            header: 'Negocio Subscrito',
            accessorKey: 'nombre_taller',
        },
        {
            header: 'Correo Negocio',
            accessorKey: 'correo_taller',
        },
        {
            header: 'Cantidad de Servicios',
            accessorKey: 'cantidad_servicios',
        },
        {
            header: 'Monto',
            accessorKey: 'monto',
            cell: ({ row }) => {
                const monto = row.getValue('monto') as string | number | undefined
                
                if (!monto) {
                    return <span>-</span>
                }
                
                // Convertir a número si es string
                const montoNum = typeof monto === 'string' ? parseFloat(monto) : monto
                
                // Verificar si es un plan gratuito (monto muy pequeño, como 1e-16 o 0)
                if (isNaN(montoNum) || montoNum < 0.0001) {
                    return <span className="font-semibold text-green-600">GRATIS</span>
                }
                
                // Formatear el monto con separador de miles
                return <span>${montoNum.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            },
        },
        {
            header: 'Fecha de reporte de pago',
            accessorKey: 'comprobante_pago.fechaPago',
            cell: ({ row }) => {
                const fechaPago = row.original.comprobante_pago?.fechaPago
                return fechaPago ? formatDate(fechaPago) : '-'
            },
        },
        {
            header: 'Estado Subscripción',
            accessorKey: 'status',
            cell: ({ row }) => {
                const fechaFin = row.original.fecha_fin as
                    | Timestamp
                    | Date
                    | string
                    | number
                    | undefined
                    | null

                // Verificar si la fecha de vigencia ya pasó
                let isVencido = false
                if (fechaFin) {
                    const fechaFinDate =
                        fechaFin instanceof Timestamp
                            ? fechaFin.toDate()
                            : fechaFin instanceof Date
                              ? fechaFin
                              : new Date(fechaFin)
                    const fechaActual = new Date()
                    // Comparar solo fechas (sin horas)
                    fechaActual.setHours(0, 0, 0, 0)
                    fechaFinDate.setHours(0, 0, 0, 0)
                    isVencido = fechaFinDate < fechaActual
                }

                // Si está vencido, mostrar "Vencido" en rojo
                if (isVencido) {
                    return (
                        <div className="flex items-center text-red-500">
                            <FaTimesCircle className="text-red-500 mr-1" />
                            <span>Vencido</span>
                        </div>
                    )
                }

                // Si no está vencido, mostrar "Vigente" en verde
                return (
                    <div className="flex items-center text-green-500">
                        <FaCheckCircle className="text-green-500 mr-1" />
                        <span>Vigente</span>
                    </div>
                )
            },
        },
        {
            header: 'Acciones',
            cell: ({ row }) => {
                const person = row.original
                return (
                    <div className="flex gap-2">
                        {person.status !== 'Vencido' && person.comprobante_pago && (
                            <button
                                className="text-blue-900 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                                onClick={() => openDrawer(person)}
                            >
                                <FaRegEye />
                            </button>
                        )}
                        <button
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                            title="Eliminar suscripción"
                            onClick={() => handleDeleteSubscription(person)}
                        >
                            <FaTrash />
                        </button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: dataSubs,
        columns,
        state: {
            columnFilters: filtering,
            globalFilter: searchTerm,
        },
        onColumnFiltersChange: setFiltering,
        globalFilterFn: (row, _columnId, filterValue) => {
            const term = (filterValue ?? '').toString().toLowerCase().trim()
            if (!term) return true
            return paymentValidationSearchableText(
                row.original as Subscriptions & { correo_taller?: string },
            ).includes(term)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    const data = table.getRowModel().rows
    const totalRows = data.length

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        disabled={selectedCount === 0 || bulkApproving}
                        style={{ backgroundColor: '#000B7E' }}
                        className="h-10 shrink-0 whitespace-nowrap px-4 text-sm font-medium text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setBulkApproveDialogOpen(true)}
                    >
                        {bulkApproving
                            ? 'Aprobando…'
                            : `Aprobar seleccionados${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                    </Button>
                </div>
                <div className="flex flex-wrap items-end justify-end gap-3">
                </div>
            </div>
            <div className="p-1 rounded-lg shadow">
                <Table className="w-full  rounded-lg">
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <Th
                                            key={header.id}
                                            colSpan={header.colSpan}
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
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}
                                                </div>
                                            )}
                                        </Th>
                                    )
                                })}
                            </Tr>
                        ))}
                    </THead>
                    <TBody>
                        {data.slice(startIndex, endIndex).map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
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
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                    onChange={onPaginationChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            </div>
            <Drawer
                isOpen={drawerIsOpen}
                className="rounded-md shadow"
                onClose={handleDrawerClose}
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">
                        Revisión de Pago
                    </h2>
                    {selectedPerson?.comprobante_pago && (
                        <p className="text-gray-700">
                            <span className="font-semibold">Tipo de pago: </span>
                            <span>
                                {selectedPerson.comprobante_pago.metodo || 'No especificado'}
                            </span>
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-2 mb-4">
                    <div />
                    <div className="flex items-center">
                        <Switcher
                            defaultChecked={
                                selectedPerson?.status === 'Aprobado'
                            }
                            color={
                                selectedPerson?.status === 'Aprobado'
                                    ? 'green-500'
                                    : 'red-500'
                            }
                            onChange={(e) =>
                                setSelectedPerson((prev) =>
                                    prev
                                        ? {
                                              ...prev,
                                              status: e
                                                  ? 'Aprobado'
                                                  : 'Por Aprobar',
                                          }
                                        : prev,
                                )
                            }
                        />
                        <span className="ml-2 text-gray-700">
                            {selectedPerson?.status}
                        </span>{' '}
                    </div>
                </div>
                <div className="flex flex-col space-y-6">
                    {selectedPerson?.comprobante_pago.fechaPago && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Fecha de Pago:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago
                                        .fechaPago instanceof Timestamp
                                        ? // Si es un Timestamp de Firebase, usar .toDate() para convertirlo a un objeto Date
                                        new Date(
                                            selectedPerson.comprobante_pago.fechaPago.toDate(),
                                        ).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : // Si es un string ISO, lo convertimos a Date y usamos toLocaleDateString
                                        new Date(
                                            selectedPerson.comprobante_pago.fechaPago,
                                        ).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.bancoOrigen && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Banco Origen:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.bancoOrigen
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.bancoDestino && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Banco Destino:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago.bancoDestino
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {selectedPerson?.comprobante_pago.correo && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Correo:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={selectedPerson.comprobante_pago.correo}
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {(() => {
                        const cedulaRaw = selectedPerson?.comprobante_pago.cedula
                        const cedulaText =
                            cedulaRaw === undefined || cedulaRaw === null
                                ? ''
                                : String(cedulaRaw).trim()
                        if (!cedulaText || cedulaText === '0') return null
                        return (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Cédula:
                                </span>
                                <input
                                    readOnly
                                    type="text"
                                    value={cedulaText}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )
                    })()}
                    {selectedPerson?.comprobante_pago.telefono !== undefined &&
                        selectedPerson.comprobante_pago.telefono !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Telefono:
                                </span>
                                <input
                                    readOnly
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.telefono
                                    }
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.monto !== undefined &&
                        selectedPerson.comprobante_pago.monto !== 0 && (
                            <label className="flex flex-col">
                                <span className="font-semibold text-gray-700">
                                    Monto:
                                </span>
                                <input
                                    readOnly
                                    type="text"
                                    value={
                                        selectedPerson.comprobante_pago.monto
                                    }
                                    className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </label>
                        )}
                    {selectedPerson?.comprobante_pago.numReferencia && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Numero de referencia:
                            </span>
                            <input
                                readOnly
                                type="text"
                                value={
                                    selectedPerson.comprobante_pago
                                        .numReferencia
                                }
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                        </label>
                    )}
                    {(selectedPerson?.comprobante_pago.comprobante ||
                        selectedPerson?.comprobante_pago.receiptFile) && (
                        <label className="flex flex-col">
                            <span className="font-semibold text-gray-700">
                                Comprobante de pago:
                            </span>
                            {(() => {
                                const comprobanteUrl =
                                    selectedPerson.comprobante_pago.comprobante ||
                                    selectedPerson.comprobante_pago.receiptFile ||
                                    ''
                                if (!comprobanteUrl) return null
                                return (
                                    <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2">
                                        <button
                                            type="button"
                                            className="w-full"
                                            onClick={() =>
                                                openImagePreview(comprobanteUrl)
                                            }
                                        >
                                            <img
                                                src={comprobanteUrl}
                                                alt="Comprobante de pago"
                                                className="max-h-72 w-full rounded-md object-contain bg-white"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-2 inline-block text-sm font-medium text-[#000B7E] hover:underline"
                                            onClick={() =>
                                                openImagePreview(comprobanteUrl)
                                            }
                                        >
                                            Ampliar comprobante
                                        </button>
                                    </div>
                                )
                            })()}
                        </label>
                    )}
                </div>
                <div className="text-center mt-6 ">
                    <Button
                        style={{ backgroundColor: '#000B7E' }}
                        className="text-white hover:opacity-80"
                        onClick={handleSaveChanges}
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </Drawer>
            <Dialog isOpen={dialogIsOpen} onClose={handleCloseDialog}>
                <div className="p-4">
                    <h3 className="text-lg font-bold">
                        Seleccionar Rango de Fechas
                    </h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label
                                htmlFor="startDate"
                                className="block text-sm"
                            >
                                Desde:
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                className="w-full border border-gray-300 rounded-md p-2"
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm">
                                Hasta:
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                className="w-full border border-gray-300 rounded-md p-2"
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button
                            className="text-white hover:opacity-80"
                            style={{ backgroundColor: '#10B981' }}
                            onClick={handleExportToExcel}
                        >
                            Exportar
                        </Button>
                    </div>
                </div>
            </Dialog>

            <Dialog isOpen={imagePreviewOpen} onClose={closeImagePreview}>
                <div className="p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                            Vista de comprobante
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                onClick={() =>
                                    setImageZoom((z) => Math.max(0.5, z - 0.1))
                                }
                            >
                                Zoom -
                            </Button>
                            <Button
                                size="sm"
                                onClick={() =>
                                    setImageZoom((z) => Math.min(4, z + 0.1))
                                }
                            >
                                Zoom +
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setImageRotation((r) => r - 90)}
                            >
                                Girar izq
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setImageRotation((r) => r + 90)}
                            >
                                Girar der
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setImageZoom(1)
                                    setImageRotation(0)
                                    setImageOffset({ x: 0, y: 0 })
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                    <div className="flex h-[70vh] items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-black/90">
                        {imagePreviewUrl ? (
                            <img
                                src={imagePreviewUrl}
                                alt="Comprobante ampliado"
                                className="max-h-full max-w-full select-none"
                                style={{
                                    cursor: isDraggingImage ? 'grabbing' : 'grab',
                                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageZoom}) rotate(${imageRotation}deg)`,
                                    transition: isDraggingImage
                                        ? 'none'
                                        : 'transform 120ms ease-out',
                                }}
                                draggable={false}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    setIsDraggingImage(true)
                                    setDragStart({
                                        x: e.clientX - imageOffset.x,
                                        y: e.clientY - imageOffset.y,
                                    })
                                }}
                                onMouseMove={(e) => {
                                    if (!isDraggingImage) return
                                    setImageOffset({
                                        x: e.clientX - dragStart.x,
                                        y: e.clientY - dragStart.y,
                                    })
                                }}
                                onMouseUp={() => setIsDraggingImage(false)}
                                onMouseLeave={() => setIsDraggingImage(false)}
                            />
                        ) : null}
                    </div>
                </div>
            </Dialog>

            <Dialog
                isOpen={bulkApproveDialogOpen}
                onClose={() =>
                    !bulkApproving && setBulkApproveDialogOpen(false)
                }
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Aprobar pagos seleccionados
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Se marcarán como aprobados {selectedCount} registro
                        {selectedCount === 1 ? '' : 's'} con las fechas de vigencia
                        actuales de cada plan. Esta acción notificará a los negocios
                        afectados.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            disabled={bulkApproving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => setBulkApproveDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            disabled={bulkApproving}
                            className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
                            style={{ backgroundColor: '#000B7E' }}
                            onClick={() => void executeBulkApprove()}
                        >
                            {bulkApproving ? 'Procesando…' : 'Confirmar aprobación'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Modal de confirmación para eliminar suscripción */}
            <Dialog isOpen={deleteModalIsOpen} onClose={cancelDeleteSubscription}>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                            <FaTrash className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            ¿Eliminar suscripción?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Esta acción no se puede deshacer. Se eliminará permanentemente la suscripción de{' '}
                            <span className="font-semibold text-gray-900">
                                {subscriptionToDelete?.nombre}
                            </span>{' '}
                            para el negocio{' '}
                            <span className="font-semibold text-gray-900">
                                {subscriptionToDelete?.nombre_taller}
                            </span>.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={cancelDeleteSubscription}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                style={{ backgroundColor: '#dc2626' }}
                                onClick={confirmDeleteSubscription}
                                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#991b1b'}
                                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default PaymentValidationPending
