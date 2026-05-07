import { useCallback, useEffect, useMemo, useState } from 'react'
import { collection, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import MapsGarages, { MarkerData } from './components/MapsGarages'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { MultiValue } from 'react-select'

type SelectOption = { value: string; label: string }

const DEFAULT_CENTER = { lat: 10.47915, lng: -66.90618 }

const APPROVAL_FILTER_OPTIONS: SelectOption[] = [
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'En espera por aprobación', label: 'En espera por aprobación' },
    { value: 'Rechazado', label: 'Rechazado' },
]

const ACTIVIDAD_FILTER_OPTIONS: SelectOption[] = [
    { value: 'activo', label: 'Cuenta activa (plan vigente)' },
    { value: 'suspendido', label: 'Cuenta suspendida (plan vencido o sin plan)' },
]

const normalizeBusinessStatus = (
    status: unknown,
): 'Aprobado' | 'En espera por aprobación' | 'Rechazado' | null => {
    const raw = String(status || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
    if (raw.includes('esper')) return 'En espera por aprobación'
    if (raw.includes('rechaz')) return 'Rechazado'
    if (raw.includes('aprob')) return 'Aprobado'
    return null
}

function timestampLikeToDate(value: unknown): Date | null {
    if (value == null) return null
    if (value instanceof Timestamp) return value.toDate()
    if (
        typeof value === 'object' &&
        value !== null &&
        'seconds' in value &&
        typeof (value as { seconds: unknown }).seconds === 'number'
    ) {
        return new Date((value as { seconds: number }).seconds * 1000)
    }
    if (typeof value === 'string') {
        const t = new Date(value)
        return Number.isNaN(t.getTime()) ? null : t
    }
    return null
}

function getActividadCuenta(data: Record<string, unknown>): 'activo' | 'suspendido' {
    const sub = data.subscripcion_actual as Record<string, unknown> | undefined
    const fechaFin = sub ? timestampLikeToDate(sub.fecha_fin) : null
    if (!fechaFin) return 'suspendido'
    return fechaFin >= new Date() ? 'activo' : 'suspendido'
}

function readUbicacionCoords(
    data: Record<string, unknown>,
): { lat: number; lng: number } | null {
    const raw = data.ubicacion
    if (!raw || typeof raw !== 'object') return null
    const u = raw as Record<string, unknown>
    const lat = u.lat
    const lng = u.lng
    if (typeof lat === 'number' && typeof lng === 'number') {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return { lat, lng }
    }
    return null
}

const UbicationGarages = () => {
    const [markers, setMarkers] = useState<MarkerData[]>([])
    const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState(true)

    const [filterCiudades, setFilterCiudades] = useState<string[]>([])
    const [filterAprobacion, setFilterAprobacion] = useState<string[]>([])
    const [filterActividad, setFilterActividad] = useState<string[]>([])
    const [filterCategorias, setFilterCategorias] = useState<string[]>([])

    const fetchGarages = useCallback(async () => {
        setLoading(true)
        try {
            const [usersSnap, serviciosSnap, categoriasSnap] = await Promise.all([
                getDocs(collection(db, 'Usuarios')),
                getDocs(collection(db, 'Servicios')),
                getDocs(collection(db, 'Categorias')),
            ])

            setCategoryOptions(
                categoriasSnap.docs
                    .map((cDoc) => ({
                        value: cDoc.id,
                        label: String(cDoc.data().nombre || '').trim() || cDoc.id,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label, 'es')),
            )

            const tallerCategorias = new Map<string, Set<string>>()
            serviciosSnap.docs.forEach((sDoc) => {
                const d = sDoc.data() as Record<string, unknown>
                const uidTaller = String(d.uid_taller || '').trim()
                const uidCat = String(d.uid_categoria || '').trim()
                if (!uidTaller || !uidCat) return
                if (!tallerCategorias.has(uidTaller)) {
                    tallerCategorias.set(uidTaller, new Set())
                }
                tallerCategorias.get(uidTaller)!.add(uidCat)
            })

            const garages: MarkerData[] = []

            usersSnap.docs.forEach((doc) => {
                const data = doc.data() as Record<string, unknown>
                const typeNorm = String(data.typeUser || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toLowerCase()
                if (typeNorm !== 'taller') return

                const statusRaw = String(data.status || '').trim()
                if (statusRaw === 'Eliminado') return

                const coords = readUbicacionCoords(data)
                if (!coords) return

                const nombre = String(
                    data.nombre || data.nombre_taller || 'Sin nombre',
                ).trim()
                const ciudad = String(data.estado || 'Sin ciudad').trim() || 'Sin ciudad'
                const approvalStatus = normalizeBusinessStatus(data.status)
                const actividad = getActividadCuenta(data)
                const categoryIds = Array.from(
                    tallerCategorias.get(doc.id) || [],
                )

                const approvalLabel = approvalStatus || 'Sin clasificar'
                const actividadLabel =
                    actividad === 'activo' ? 'Plan vigente' : 'Plan vencido / sin plan'

                garages.push({
                    id: doc.id,
                    lat: coords.lat,
                    lng: coords.lng,
                    title: `${nombre} · ${approvalLabel} · ${actividadLabel}`,
                    ciudad,
                    approvalStatus,
                    actividad,
                    categoryIds,
                })
            })

            setMarkers(garages)
        } catch (error) {
            console.error('Error fetching garages:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchGarages()
    }, [fetchGarages])

    const ciudadOptions = useMemo(() => {
        const set = new Set<string>()
        markers.forEach((m) => set.add(m.ciudad))
        return Array.from(set)
            .sort((a, b) => a.localeCompare(b, 'es'))
            .map((c) => ({ value: c, label: c }))
    }, [markers])

    const filteredMarkers = useMemo(() => {
        return markers.filter((m) => {
            if (filterCiudades.length > 0 && !filterCiudades.includes(m.ciudad)) {
                return false
            }
            if (filterAprobacion.length > 0) {
                if (!m.approvalStatus || !filterAprobacion.includes(m.approvalStatus)) {
                    return false
                }
            }
            if (filterActividad.length > 0 && !filterActividad.includes(m.actividad)) {
                return false
            }
            if (filterCategorias.length > 0) {
                const matchCat = m.categoryIds.some((cid) =>
                    filterCategorias.includes(cid),
                )
                if (!matchCat) return false
            }
            return true
        })
    }, [
        markers,
        filterCiudades,
        filterAprobacion,
        filterActividad,
        filterCategorias,
    ])

    const mapCenter = useMemo(() => {
        if (filteredMarkers.length === 0) return DEFAULT_CENTER
        const sum = filteredMarkers.reduce(
            (acc, m) => ({ lat: acc.lat + m.lat, lng: acc.lng + m.lng }),
            { lat: 0, lng: 0 },
        )
        return {
            lat: sum.lat / filteredMarkers.length,
            lng: sum.lng / filteredMarkers.length,
        }
    }, [filteredMarkers])

    const multiProps = {
        isMulti: true as const,
        closeMenuOnSelect: false,
        hideSelectedOptions: false,
        className: 'min-w-0',
        placeholder: 'Todos…',
    }

    const clearFilters = () => {
        setFilterCiudades([])
        setFilterAprobacion([])
        setFilterActividad([])
        setFilterCategorias([])
    }

    const hasActiveFilters =
        filterCiudades.length > 0 ||
        filterAprobacion.length > 0 ||
        filterActividad.length > 0 ||
        filterCategorias.length > 0

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#000B7E]">
                    Ubicación de negocios
                </h1>
                <p className="text-sm text-gray-600 sm:max-w-md sm:text-right">
                    Filtra por ciudad, estado de aprobación, vigencia del plan y
                    categorías de servicios publicados.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">Cargando negocios…</p>
                ) : (
                    <>
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold tabular-nums text-[#000B7E]">
                                    {filteredMarkers.length}
                                </span>
                                <span className="text-gray-500">
                                    {' '}
                                    de {markers.length} con ubicación en mapa
                                </span>
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="plain"
                                disabled={!hasActiveFilters}
                                className="!text-[#000B7E] disabled:opacity-40"
                                onClick={clearFilters}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <label className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Ciudad / estado
                                </span>
                                <Select<SelectOption, true>
                                    {...multiProps}
                                    options={ciudadOptions}
                                    placeholder="Todas las ciudades"
                                    value={ciudadOptions.filter((o) =>
                                        filterCiudades.includes(o.value),
                                    )}
                                    onChange={(sel: MultiValue<SelectOption>) => {
                                        setFilterCiudades(sel?.map((o) => o.value) ?? [])
                                    }}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Aprobación del negocio
                                </span>
                                <Select<SelectOption, true>
                                    {...multiProps}
                                    options={APPROVAL_FILTER_OPTIONS}
                                    placeholder="Todos los estados"
                                    value={APPROVAL_FILTER_OPTIONS.filter((o) =>
                                        filterAprobacion.includes(o.value),
                                    )}
                                    onChange={(sel: MultiValue<SelectOption>) => {
                                        setFilterAprobacion(sel?.map((o) => o.value) ?? [])
                                    }}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Vigencia del plan
                                </span>
                                <Select<SelectOption, true>
                                    {...multiProps}
                                    options={ACTIVIDAD_FILTER_OPTIONS}
                                    placeholder="Activos y suspendidos"
                                    value={ACTIVIDAD_FILTER_OPTIONS.filter((o) =>
                                        filterActividad.includes(o.value),
                                    )}
                                    onChange={(sel: MultiValue<SelectOption>) => {
                                        setFilterActividad(sel?.map((o) => o.value) ?? [])
                                    }}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Categoría (servicios)
                                </span>
                                <Select<SelectOption, true>
                                    {...multiProps}
                                    options={categoryOptions}
                                    placeholder="Todas las categorías"
                                    value={categoryOptions.filter((o) =>
                                        filterCategorias.includes(o.value),
                                    )}
                                    onChange={(sel: MultiValue<SelectOption>) => {
                                        setFilterCategorias(sel?.map((o) => o.value) ?? [])
                                    }}
                                />
                            </label>
                        </div>
                    </>
                )}
            </div>

            <MapsGarages markers={filteredMarkers} center={mapCenter} />
        </div>
    )
}

export default UbicationGarages
