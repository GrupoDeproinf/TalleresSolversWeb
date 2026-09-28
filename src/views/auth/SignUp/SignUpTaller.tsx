// Registro del taller en el panel, en 4 pasos con guardado automático.
// Mismo flujo y mismos mensajes que la app (signUpTaller):
//   1. Cuenta       · responsable, correo, teléfono, contraseña
//   2. Negocio      · nombre, RIF verificado al instante, estado, dirección, mapa, horario
//   3. Servicios    · categorías, métodos de pago y el plan gratuito
//   4. Documentos   · RIF, fotos del taller, opcionales, resumen y envío
// El borrador se guarda en este navegador sin la contraseña ni los archivos.
// Envía a SaveTallerExtended (back), asigna el plan gratis y entra al panel.
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import axios from 'axios'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Steps from '@/components/ui/Steps'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useAuth from '@/utils/hooks/useAuth'
import useGoogleMapsReady from '@/utils/hooks/useGoogleMapsReady'
import {
    validarNombre,
    validarCorreo,
    validarTelefono,
    validarPassword,
    validarRif,
    normalizarTelefono,
    formatearTelefono,
    formatearRif,
    onlyDigits,
    RIF_PREFIJOS,
    mensajeDeError,
} from '@/utils/registroValidators'

const API = 'https://apisolvers.solversapp.com/api'
const DRAFT_KEY = 'solvers.registroTaller.borrador'
const MAX_BYTES = 5 * 1024 * 1024
const CENTRO_DEFECTO = { lat: 10.4806, lng: -66.9036 } // Caracas

const ESTADOS = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo',
    'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira',
    'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre',
    'Táchira', 'Trujillo', 'Yaracuy', 'Zulia',
]

const DIAS = [
    { key: 'lunes', label: 'Lun' },
    { key: 'martes', label: 'Mar' },
    { key: 'miercoles', label: 'Mié' },
    { key: 'jueves', label: 'Jue' },
    { key: 'viernes', label: 'Vie' },
    { key: 'sabado', label: 'Sáb' },
    { key: 'domingo', label: 'Dom' },
] as const

const HORAS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)

const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'pagoMovil', label: 'Pago Móvil' },
    { value: 'puntoVenta', label: 'Punto de venta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjetaCreditoN', label: 'Crédito nacional' },
    { value: 'tarjetaCreditoI', label: 'Crédito internacional' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'zinli', label: 'Zinli' },
]

type DocKey =
    | 'rifIdFiscal'
    | 'fotoFrenteTaller'
    | 'fotoInternaTaller'
    | 'permisoOperacion'
    | 'logotipoNegocio'

const DOCS: { key: DocKey; label: string; help: string; required?: boolean; pdf?: boolean }[] = [
    { key: 'rifIdFiscal', label: 'RIF', help: 'Foto o PDF legible del RIF vigente.', required: true, pdf: true },
    { key: 'fotoFrenteTaller', label: 'Frente del taller', help: 'Que se vea la fachada o el letrero.', required: true },
    { key: 'fotoInternaTaller', label: 'Interior del taller', help: 'El área de trabajo.', required: true },
    { key: 'permisoOperacion', label: 'Registro mercantil o permiso', help: 'Opcional, acelera la revisión.', pdf: true },
    { key: 'logotipoNegocio', label: 'Logo del negocio', help: 'Opcional. Se muestra a los conductores.' },
]

type Dia = { enabled: boolean; open: string; close: string }
type Horario = Record<string, Dia>
type Categoria = { uid: string; nombre: string }
type Archivo = { name: string; type: string; dataUrl: string }
type Plan = { nombre?: string; vigencia?: number | string; cantidad_servicios?: number | string }
type TipoAviso = 'danger' | 'warning' | 'success'

type Borrador = {
    step: number
    responsable: string
    email: string
    phone: string
    whatsappIgual: boolean
    whatsapp: string
    nombre: string
    rifPrefijo: string
    rifNumero: string
    estado: string
    direccion: string
    lat: number | null
    lng: number | null
    horario: Horario
    categorias: string[]
    metodosPago: string[]
    descripcion: string
}

const horarioVacio = (): Horario =>
    DIAS.reduce<Horario>((acc, d) => {
        acc[d.key] = { enabled: false, open: '08:00', close: '17:00' }
        return acc
    }, {})

const PRESETS = [
    { label: 'Lun–Vie 8–17', dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], open: '08:00', close: '17:00' },
    { label: 'Sáb 8–12', dias: ['sabado'], open: '08:00', close: '12:00' },
]

const INICIAL: Borrador = {
    step: 0,
    responsable: '',
    email: '',
    phone: '',
    whatsappIgual: true,
    whatsapp: '',
    nombre: '',
    rifPrefijo: 'J',
    rifNumero: '',
    estado: '',
    direccion: '',
    lat: null,
    lng: null,
    horario: horarioVacio(),
    categorias: [],
    metodosPago: [],
    descripcion: '',
}

const leerBorrador = (): Borrador | null => {
    try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (!raw) return null
        const d = JSON.parse(raw) as Partial<Borrador>
        const step = Math.min(Math.max(Number(d.step) || 0, 0), 3)
        return { ...INICIAL, ...d, step, horario: { ...horarioVacio(), ...(d.horario || {}) } }
    } catch {
        return null
    }
}

const guardarBorrador = (b: Borrador | null) => {
    try {
        if (b) localStorage.setItem(DRAFT_KEY, JSON.stringify(b))
        else localStorage.removeItem(DRAFT_KEY)
    } catch {
        // Modo privado o sin espacio: el registro sigue funcionando sin borrador.
    }
}

const resumenHorario = (h: Horario) => {
    const on = DIAS.filter((d) => h[d.key]?.enabled)
    if (!on.length) return 'Sin horario'
    return on.map((d) => `${d.label} ${h[d.key].open}–${h[d.key].close}`).join(' · ')
}

const leerComoDataUrl = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result || ''))
        r.onerror = () => reject(new Error('No se pudo leer el archivo'))
        r.readAsDataURL(file)
    })

// Fotos: se reducen a 1600 px y calidad 70 % para que el envío sea rápido.
const reducirImagen = async (file: File): Promise<string | null> => {
    const url = URL.createObjectURL(file)
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const i = new Image()
            i.onload = () => resolve(i)
            i.onerror = reject
            i.src = url
        })
        const escala = Math.min(1, 1600 / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * escala)
        canvas.height = Math.round(img.height * escala)
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', 0.7)
    } catch {
        return null
    } finally {
        URL.revokeObjectURL(url)
    }
}

const prepararArchivo = async (file: File): Promise<Archivo> => {
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
        const reducida = await reducirImagen(file)
        if (reducida && reducida.length * 0.75 <= MAX_BYTES) {
            return { name: file.name, type: 'image/jpeg', dataUrl: reducida }
        }
    }
    if (file.size > MAX_BYTES) {
        throw { friendly: `"${file.name}" pesa más de 5 MB. Usa una foto o un PDF más liviano.` }
    }
    return { name: file.name, type: file.type, dataUrl: await leerComoDataUrl(file) }
}

const sinPrefijo = (dataUrl?: string) => {
    if (!dataUrl) return ''
    const i = dataUrl.indexOf(',')
    return i >= 0 ? dataUrl.slice(i + 1) : dataUrl
}

const statusHttp = (x: PromiseSettledResult<unknown>): number | undefined =>
    x.status === 'rejected'
        ? (x.reason as { response?: { status?: number } } | undefined)?.response?.status
        : 200

// ── Piezas de interfaz ──────────────────────────────────────────────────────
const Campo = ({
    label,
    error,
    help,
    ok,
    children,
}: {
    label?: string
    error?: string
    help?: string
    ok?: string
    children: ReactNode
}) => (
    <div className="mb-4">
        {label ? <label className="block font-semibold mb-1">{label}</label> : null}
        {children}
        {error ? (
            <p className="text-red-600 text-sm mt-1 font-semibold" aria-live="polite">
                {error}
            </p>
        ) : ok ? (
            <p className="text-emerald-600 text-sm mt-1 font-semibold">✓ {ok}</p>
        ) : help ? (
            <p className="text-gray-500 text-sm mt-1">{help}</p>
        ) : null}
    </div>
)

const Chip = ({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) => (
    <button
        type="button"
        aria-pressed={!!selected}
        className={`min-h-[40px] px-4 mr-2 mb-2 rounded-full border text-sm font-semibold transition ${
            selected
                ? 'bg-yellow-300 border-yellow-300 text-gray-900'
                : 'bg-white border-gray-300 text-gray-800 hover:border-gray-500'
        }`}
        onClick={onClick}
    >
        {label}
    </button>
)

const selectCls =
    'h-11 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

const CAMPOS_PASO: string[][] = [
    ['responsable', 'email', 'phone', 'whatsapp', 'password'],
    ['nombre', 'rif', 'estado', 'direccion', 'ubicacion', 'horario'],
    ['categorias'],
    [],
]

const SignUpTaller = ({ signInUrl = '/sign-in' }: { signInUrl?: string }) => {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const mapsReady = useGoogleMapsReady()

    const [borradorInicial] = useState(leerBorrador)
    const [f, setF] = useState<Borrador>(borradorInicial || INICIAL)
    const [resumed, setResumed] = useState(
        !!borradorInicial && (borradorInicial.step > 0 || !!borradorInicial.email || !!borradorInicial.nombre),
    )
    const [password, setPassword] = useState('')
    const [docs, setDocs] = useState<Partial<Record<DocKey, Archivo>>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [banner, setBanner] = useState<{ type: TipoAviso; text: string }>({ type: 'danger', text: '' })
    const [checking, setChecking] = useState(false)
    const [sending, setSending] = useState(false)
    const [sendStage, setSendStage] = useState('')
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    const [categoriasDisp, setCategoriasDisp] = useState<Categoria[]>([])
    const [catsError, setCatsError] = useState('')
    const [planGratis, setPlanGratis] = useState<Plan | null>(null)

    // Guardado automático (sin contraseña ni archivos).
    useEffect(() => {
        const t = window.setTimeout(() => guardarBorrador(f), 400)
        return () => window.clearTimeout(t)
    }, [f])

    const cargarCategorias = useCallback(async () => {
        setCatsError('')
        try {
            const r = await axios.get(`${API}/usuarios/getActiveCategories`, { timeout: 20000 })
            const crudas = (r?.data?.categories || []) as { id?: string; uid?: string; nombre?: string }[]
            const list: Categoria[] = crudas
                .map((c) => ({ uid: String(c.id || c.uid || ''), nombre: String(c.nombre || '').trim() }))
                .filter((c) => c.uid && c.nombre)
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
            setCategoriasDisp(list)
        } catch (e) {
            setCatsError(mensajeDeError(e, 'No pudimos cargar las categorías.'))
        }
    }, [])

    useEffect(() => {
        cargarCategorias()
        axios
            .get(`${API}/usuarios/getPlanes`, { timeout: 20000 })
            .then((r) => {
                const planes = (Array.isArray(r?.data) ? r.data : []) as Plan[]
                const g = planes.find((p) =>
                    ['gratis', 'plan gratis', 'gratuito'].includes(String(p?.nombre || '').toLowerCase()),
                )
                if (g) setPlanGratis(g)
            })
            .catch(() => undefined)
    }, [cargarCategorias])

    const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) => setF((prev) => ({ ...prev, [k]: v }))
    const touch = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))
    const touchMany = (keys: string[]) =>
        setTouched((t) => keys.reduce<Record<string, boolean>>((a, k) => ({ ...a, [k]: true }), { ...t }))

    const errores = useMemo(() => {
        const e: Record<string, string> = {
            responsable: validarNombre(f.responsable, 'el nombre del responsable'),
            email: validarCorreo(f.email),
            phone: validarTelefono(f.phone),
            whatsapp: f.whatsappIgual ? '' : validarTelefono(f.whatsapp),
            password: validarPassword(password),
            nombre: validarNombre(f.nombre, 'el nombre del taller'),
            rif: validarRif(f.rifPrefijo, f.rifNumero),
            estado: f.estado ? '' : 'Elige el estado donde está el taller.',
            direccion:
                f.direccion.trim().length >= 8
                    ? ''
                    : 'Escribe la dirección con una referencia (ej: Av. Bolívar, frente a la plaza).',
            ubicacion:
                Number.isFinite(f.lat) && Number.isFinite(f.lng)
                    ? ''
                    : 'Marca en el mapa dónde está el taller para que los conductores lleguen.',
            horario: '',
            categorias: f.categorias.length ? '' : 'Elige al menos una categoría de servicio.',
        }
        const on = DIAS.filter((d) => f.horario[d.key]?.enabled)
        if (!on.length) {
            e.horario = 'Elige al menos un día de atención (puedes usar los atajos).'
        } else {
            const mal = on.find((d) => f.horario[d.key].open >= f.horario[d.key].close)
            if (mal) e.horario = `El ${mal.label} cierra antes de abrir: revisa las horas.`
        }
        return e
    }, [f, password])

    const pasoValido = (n: number) => !CAMPOS_PASO[n].some((k) => errores[k])
    const show = (k: string) => (touched[k] ? errores[k] : '')
    const faltantesDocs = DOCS.filter((d) => d.required && !docs[d.key]).map((d) => d.label)

    const irA = (n: number) => {
        set('step', n)
        setBanner({ type: 'danger', text: '' })
        window.scrollTo({ top: 0 })
    }

    const continuar = async () => {
        touchMany(CAMPOS_PASO[f.step])
        if (!pasoValido(f.step)) {
            setBanner({ type: 'danger', text: 'Revisa lo marcado en rojo para continuar.' })
            return
        }
        if (f.step === 0) {
            // Avisar temprano si el correo o el teléfono ya existen.
            setChecking(true)
            try {
                const email = f.email.trim().toLowerCase()
                const phone = normalizarTelefono(f.phone)
                const [p, e] = await Promise.allSettled([
                    axios.post(`${API}/home/validatePhone`, { phone }, { timeout: 20000 }),
                    axios.post(`${API}/home/validateEmail`, { email }, { timeout: 20000 }),
                ])
                if (statusHttp(e) === 409) {
                    setBanner({
                        type: 'danger',
                        text: 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.',
                    })
                    return
                }
                if (statusHttp(p) === 409) {
                    setBanner({ type: 'danger', text: 'Este teléfono ya está registrado con otra cuenta.' })
                    return
                }
                const sinRed = [p, e].find((x) => x.status === 'rejected' && !statusHttp(x))
                if (sinRed && sinRed.status === 'rejected') {
                    setBanner({ type: 'danger', text: mensajeDeError(sinRed.reason) })
                    return
                }
            } finally {
                setChecking(false)
            }
        }
        irA(f.step + 1)
    }

    const onArchivo = async (key: DocKey, e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        try {
            const a = await prepararArchivo(file)
            setDocs((d) => ({ ...d, [key]: a }))
        } catch (err) {
            setBanner({ type: 'danger', text: mensajeDeError(err, 'No pudimos leer el archivo. Intenta con otro.') })
        }
    }

    const quitarDoc = (key: DocKey) =>
        setDocs((d) => {
            const n = { ...d }
            delete n[key]
            return n
        })

    const marcarUbicacion = (lat: number, lng: number) => {
        setF((prev) => ({ ...prev, lat: +lat.toFixed(6), lng: +lng.toFixed(6) }))
        touch('ubicacion')()
    }

    const usarMiUbicacion = () => {
        if (!navigator.geolocation) {
            setBanner({ type: 'warning', text: 'Tu navegador no comparte la ubicación. Haz clic en el mapa donde está el taller.' })
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => marcarUbicacion(pos.coords.latitude, pos.coords.longitude),
            () =>
                setBanner({
                    type: 'warning',
                    text: 'No pudimos leer tu ubicación. Haz clic en el mapa donde está el taller.',
                }),
            { timeout: 10000 },
        )
    }

    const empezarDeCero = () => {
        if (!window.confirm('Se borrará lo que llevas escrito en este registro.')) return
        guardarBorrador(null)
        setF(INICIAL)
        setPassword('')
        setDocs({})
        setTouched({})
        setResumed(false)
        setAceptaTerminos(false)
        setBanner({ type: 'danger', text: '' })
    }

    const enviar = async () => {
        // Revalida todo por si viene de un borrador viejo.
        for (const n of [0, 1, 2]) {
            if (!pasoValido(n)) {
                touchMany(CAMPOS_PASO[n])
                irA(n)
                setBanner({
                    type: 'danger',
                    text:
                        n === 0 && errores.password
                            ? 'Por seguridad, vuelve a escribir tu contraseña.'
                            : 'Falta completar este paso.',
                })
                return
            }
        }
        if (!aceptaTerminos) {
            setBanner({ type: 'danger', text: 'Para enviar, acepta los Términos y Condiciones.' })
            return
        }
        setSending(true)
        setBanner({ type: 'danger', text: '' })
        try {
            setSendStage('Creando tu cuenta…')
            const email = f.email.trim().toLowerCase()
            const phone = normalizarTelefono(f.phone)
            const whatsapp = f.whatsappIgual ? phone : normalizarTelefono(f.whatsapp)
            const metodos = METODOS_PAGO.reduce<Record<string, boolean>>(
                (acc, m) => ({ ...acc, [m.value]: f.metodosPago.includes(m.value) }),
                {},
            )
            const categorias = categoriasDisp.filter((c) => f.categorias.includes(c.uid))
            const res = await axios.post(
                `${API}/usuarios/SaveTallerExtended`,
                {
                    nombre: f.nombre.trim(),
                    responsable: f.responsable.trim(),
                    rif: `${f.rifPrefijo}-${onlyDigits(f.rifNumero)}`,
                    phone,
                    whatsapp,
                    typeUser: 'Taller',
                    email,
                    password,
                    Direccion: f.direccion.trim(),
                    RegComercial: '',
                    Caracteristicas: f.descripcion.trim(),
                    Experiencia: '',
                    LinkFacebook: '',
                    LinkInstagram: '',
                    LinkTiktok: '',
                    seguro: '',
                    agenteAutorizado: 'no',
                    metodos_pago: metodos,
                    horarios_atencion: f.horario,
                    estado: f.estado,
                    categorias,
                    // "base64" (foto de perfil) va sin el prefijo data:; los
                    // documentos van como data URL y el back detecta el tipo.
                    base64: sinPrefijo(docs.logotipoNegocio?.dataUrl),
                    rifIdFiscal: docs.rifIdFiscal?.dataUrl || '',
                    permisoOperacion: docs.permisoOperacion?.dataUrl || '',
                    logotipoNegocio: docs.logotipoNegocio?.dataUrl || '',
                    fotoFrenteTaller: docs.fotoFrenteTaller?.dataUrl || '',
                    fotoInternaTaller: docs.fotoInternaTaller?.dataUrl || '',
                    lat: f.lat,
                    lng: f.lng,
                    token: '',
                },
                { timeout: 90000 },
            )
            const uid = res?.data?.uid as string | undefined

            // Plan gratuito automático: sus días arrancan cuando aprueben el negocio.
            setSendStage('Activando tu plan gratuito…')
            if (uid) {
                try {
                    await axios.post(`${API}/usuarios/AsociarPlan`, { uid, plan_uid: 'gratis' }, { timeout: 20000 })
                } catch (e) {
                    console.warn('AsociarPlan gratis:', e)
                }
            }

            guardarBorrador(null)
            setSendStage('Entrando…')
            const r = await signIn({ userName: email, password, typeUser: 'Taller' })
            if (r?.status !== 'success') navigate(signInUrl)
        } catch (err) {
            setBanner({
                type: 'danger',
                text: mensajeDeError(err, 'No pudimos enviar tu registro. Tus datos siguen aquí: toca Reintentar.'),
            })
        } finally {
            setSending(false)
            setSendStage('')
        }
    }

    // ── Paso 1: Cuenta ───────────────────────────────────────────────────────
    const paso0 = (
        <>
            <Campo label="Nombre del responsable" error={show('responsable')}>
                <Input
                    value={f.responsable}
                    placeholder="Nombre y apellido"
                    autoComplete="name"
                    invalid={!!show('responsable')}
                    onChange={(e) => set('responsable', e.target.value)}
                    onBlur={touch('responsable')}
                />
            </Campo>
            <Campo
                label="Correo"
                error={show('email')}
                help="Lo usarás para entrar. Te avisamos aquí cuando revisemos tu negocio."
            >
                <Input
                    type="email"
                    value={f.email}
                    placeholder="taller@gmail.com"
                    autoComplete="email"
                    invalid={!!show('email')}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={touch('email')}
                />
            </Campo>
            <Campo label="Teléfono" error={show('phone')} help="Sin el 0 inicial.">
                <Input
                    value={formatearTelefono(f.phone)}
                    placeholder="412 123 4567"
                    inputMode="tel"
                    maxLength={12}
                    invalid={!!show('phone')}
                    onChange={(e) => set('phone', normalizarTelefono(e.target.value))}
                    onBlur={touch('phone')}
                />
            </Campo>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={f.whatsappIgual}
                    className="w-5 h-5"
                    onChange={() => set('whatsappIgual', !f.whatsappIgual)}
                />
                <span>Este número tiene WhatsApp</span>
            </label>
            {!f.whatsappIgual && (
                <Campo label="WhatsApp del taller" error={show('whatsapp')}>
                    <Input
                        value={formatearTelefono(f.whatsapp)}
                        placeholder="414 765 4321"
                        inputMode="tel"
                        maxLength={12}
                        invalid={!!show('whatsapp')}
                        onChange={(e) => set('whatsapp', normalizarTelefono(e.target.value))}
                        onBlur={touch('whatsapp')}
                    />
                </Campo>
            )}
            <Campo
                label="Contraseña"
                error={show('password')}
                help="Mínimo 6 caracteres. Por seguridad no se guarda en el borrador."
            >
                <PasswordInput
                    value={password}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    invalid={!!show('password')}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={touch('password')}
                />
            </Campo>
        </>
    )

    // ── Paso 2: Negocio ──────────────────────────────────────────────────────
    const posicion =
        f.lat !== null && f.lng !== null && Number.isFinite(f.lat) && Number.isFinite(f.lng)
            ? { lat: f.lat, lng: f.lng }
            : null
    const paso1 = (
        <>
            <Campo label="Nombre del taller" error={show('nombre')}>
                <Input
                    value={f.nombre}
                    placeholder="Taller Los Hermanos"
                    invalid={!!show('nombre')}
                    onChange={(e) => set('nombre', e.target.value)}
                    onBlur={touch('nombre')}
                />
            </Campo>
            <Campo
                label="RIF"
                error={show('rif')}
                ok={
                    !errores.rif && onlyDigits(f.rifNumero).length === 9
                        ? 'RIF con formato y dígito verificador correctos'
                        : ''
                }
                help="9 números, tal como aparece en tu RIF."
            >
                <div className="flex gap-2">
                    <select
                        value={f.rifPrefijo}
                        className={`${selectCls} w-20`}
                        aria-label="Letra del RIF"
                        onChange={(e) => set('rifPrefijo', e.target.value)}
                    >
                        {RIF_PREFIJOS.map((p) => (
                            <option key={p} value={p}>
                                {p}-
                            </option>
                        ))}
                    </select>
                    <Input
                        value={formatearRif(f.rifNumero)}
                        placeholder="12345678-9"
                        inputMode="numeric"
                        maxLength={10}
                        invalid={!!show('rif')}
                        onChange={(e) => set('rifNumero', onlyDigits(e.target.value).slice(0, 9))}
                        onBlur={touch('rif')}
                    />
                </div>
            </Campo>
            <Campo label="Estado" error={show('estado')}>
                <select
                    value={f.estado}
                    className={`${selectCls} w-full`}
                    onChange={(e) => {
                        set('estado', e.target.value)
                        touch('estado')()
                    }}
                >
                    <option value="">Elige el estado</option>
                    {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                            {e}
                        </option>
                    ))}
                </select>
            </Campo>
            <Campo label="Dirección" error={show('direccion')}>
                <Input
                    textArea
                    value={f.direccion}
                    placeholder="Av. Bolívar, local 3, frente a la plaza"
                    invalid={!!show('direccion')}
                    onChange={(e) => set('direccion', e.target.value)}
                    onBlur={touch('direccion')}
                />
            </Campo>
            <Campo
                label="Ubicación en el mapa"
                error={show('ubicacion')}
                help={
                    posicion
                        ? `Marcada: ${posicion.lat.toFixed(5)}, ${posicion.lng.toFixed(5)}. Arrastra el pin para ajustar.`
                        : 'Haz clic en el mapa donde está el taller.'
                }
            >
                <div className="mb-2">
                    <Button type="button" size="sm" onClick={usarMiUbicacion}>
                        Usar mi ubicación actual
                    </Button>
                </div>
                {mapsReady ? (
                    <GoogleMap
                        center={posicion || CENTRO_DEFECTO}
                        zoom={posicion ? 17 : 12}
                        mapContainerStyle={{ height: '320px', width: '100%', borderRadius: '0.75rem' }}
                        onClick={(e) => {
                            if (e.latLng) marcarUbicacion(e.latLng.lat(), e.latLng.lng())
                        }}
                    >
                        {posicion && (
                            <Marker
                                draggable
                                position={posicion}
                                onDragEnd={(e) => {
                                    if (e.latLng) marcarUbicacion(e.latLng.lat(), e.latLng.lng())
                                }}
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div
                        className="flex items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-400"
                        style={{ height: 320 }}
                    >
                        Cargando mapa…
                    </div>
                )}
            </Campo>
            <Campo label="Horario de atención" error={show('horario')}>
                <div className="flex flex-wrap">
                    {PRESETS.map((p) => (
                        <Chip
                            key={p.label}
                            label={`+ ${p.label}`}
                            onClick={() => {
                                setF((prev) => {
                                    const h = { ...prev.horario }
                                    p.dias.forEach((d) => {
                                        h[d] = { enabled: true, open: p.open, close: p.close }
                                    })
                                    return { ...prev, horario: h }
                                })
                                touch('horario')()
                            }}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap">
                    {DIAS.map((d) => (
                        <Chip
                            key={d.key}
                            label={d.label}
                            selected={!!f.horario[d.key]?.enabled}
                            onClick={() => {
                                setF((prev) => ({
                                    ...prev,
                                    horario: {
                                        ...prev.horario,
                                        [d.key]: { ...prev.horario[d.key], enabled: !prev.horario[d.key]?.enabled },
                                    },
                                }))
                                touch('horario')()
                            }}
                        />
                    ))}
                </div>
                {DIAS.filter((d) => f.horario[d.key]?.enabled).map((d) => (
                    <div key={d.key} className="flex items-center gap-2 mb-2">
                        <span className="w-12 font-semibold">{d.label}</span>
                        {(['open', 'close'] as const).map((k) => (
                            <select
                                key={k}
                                value={f.horario[d.key][k]}
                                className={`${selectCls} w-32`}
                                aria-label={`${d.label} ${k === 'open' ? 'abre' : 'cierra'}`}
                                onChange={(e) =>
                                    setF((prev) => ({
                                        ...prev,
                                        horario: {
                                            ...prev.horario,
                                            [d.key]: { ...prev.horario[d.key], [k]: e.target.value },
                                        },
                                    }))
                                }
                            >
                                {HORAS.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        ))}
                    </div>
                ))}
            </Campo>
        </>
    )

    // ── Paso 3: Servicios ────────────────────────────────────────────────────
    const cupo = planGratis?.cantidad_servicios
    const paso2 = (
        <>
            <Campo
                label="¿Qué trabajos hace tu taller?"
                error={show('categorias')}
                help="La primera que elijas será la principal."
            >
                {catsError ? (
                    <Alert showIcon type="danger" className="mb-2">
                        {catsError}{' '}
                        <button type="button" className="underline font-bold" onClick={cargarCategorias}>
                            Reintentar
                        </button>
                    </Alert>
                ) : !categoriasDisp.length ? (
                    <p className="text-gray-500 text-sm">Cargando categorías…</p>
                ) : null}
                <div className="flex flex-wrap">
                    {categoriasDisp.map((c) => {
                        const idx = f.categorias.indexOf(c.uid)
                        return (
                            <Chip
                                key={c.uid}
                                label={idx === 0 ? `★ ${c.nombre}` : c.nombre}
                                selected={idx >= 0}
                                onClick={() => {
                                    setF((prev) => ({
                                        ...prev,
                                        categorias: prev.categorias.includes(c.uid)
                                            ? prev.categorias.filter((x) => x !== c.uid)
                                            : [...prev.categorias, c.uid],
                                    }))
                                    touch('categorias')()
                                }}
                            />
                        )
                    })}
                </div>
            </Campo>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 mb-4">
                <p className="font-bold mb-1">Tu plan gratuito</p>
                <p className="text-sm">
                    {cupo ? `Incluye hasta ${cupo} servicios publicados` : 'Incluye tus primeros servicios publicados'}
                    {planGratis?.vigencia ? ` durante ${planGratis.vigencia} días` : ''}. Empieza a contar cuando
                    aprobemos tu negocio; el plan pago lo eliges después, cuando el gratuito esté por vencer.
                </p>
            </div>
            <Campo label="Métodos de pago que aceptas (opcional)">
                <div className="flex flex-wrap">
                    {METODOS_PAGO.map((m) => (
                        <Chip
                            key={m.value}
                            label={m.label}
                            selected={f.metodosPago.includes(m.value)}
                            onClick={() =>
                                setF((prev) => ({
                                    ...prev,
                                    metodosPago: prev.metodosPago.includes(m.value)
                                        ? prev.metodosPago.filter((x) => x !== m.value)
                                        : [...prev.metodosPago, m.value],
                                }))
                            }
                        />
                    ))}
                </div>
            </Campo>
            <Campo label="Cuéntale a los conductores sobre tu taller (opcional)" help={`${f.descripcion.length}/400`}>
                <Input
                    textArea
                    value={f.descripcion}
                    maxLength={400}
                    placeholder="Ej: 15 años en frenos y suspensión, atendemos todas las marcas."
                    onChange={(e) => set('descripcion', e.target.value)}
                />
            </Campo>
        </>
    )

    // ── Paso 4: Documentos y envío ───────────────────────────────────────────
    const catNombres = categoriasDisp.filter((c) => f.categorias.includes(c.uid)).map((c) => c.nombre)
    const paso3 = (
        <>
            {DOCS.map((d) => {
                const file = docs[d.key]
                return (
                    <div
                        key={d.key}
                        className={`flex items-center gap-3 rounded-xl border p-3 mb-3 ${
                            file ? 'border-emerald-500' : 'border-gray-200'
                        }`}
                    >
                        {file && file.type.startsWith('image/') ? (
                            <img src={file.dataUrl} alt="" className="w-14 h-14 object-cover rounded-lg" />
                        ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                {file ? 'PDF' : '+'}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="font-semibold">
                                {d.label}{' '}
                                {d.required ? (
                                    <span className="text-red-600">*</span>
                                ) : (
                                    <span className="text-gray-400 text-sm">(opcional)</span>
                                )}
                            </p>
                            <p className={`text-sm ${file ? 'text-emerald-600' : 'text-gray-500'}`}>
                                {file ? `✓ ${file.name}` : d.help}
                            </p>
                        </div>
                        {file ? (
                            <Button type="button" size="sm" onClick={() => quitarDoc(d.key)}>
                                Quitar
                            </Button>
                        ) : (
                            <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:border-gray-500">
                                Subir
                                <input
                                    type="file"
                                    className="hidden"
                                    accept={d.pdf ? 'image/*,application/pdf' : 'image/*'}
                                    onChange={(e) => onArchivo(d.key, e)}
                                />
                            </label>
                        )}
                    </div>
                )
            })}
            {faltantesDocs.length ? (
                <Alert showIcon type="warning" className="mb-4">
                    Puedes enviar ahora y subir después: {faltantesDocs.join(', ')}. Revisamos tu negocio cuando esté
                    todo.
                </Alert>
            ) : null}
            <div className="rounded-xl border border-gray-200 p-4 mb-4">
                <p className="font-bold mb-2">Resumen</p>
                {[
                    ['Taller', f.nombre],
                    ['RIF', `${f.rifPrefijo}-${formatearRif(f.rifNumero)}`],
                    ['Responsable', f.responsable],
                    ['Contacto', `${formatearTelefono(f.phone)} · ${f.email}`],
                    ['Dirección', `${f.direccion}${f.estado ? `, ${f.estado}` : ''}`],
                    ['Horario', resumenHorario(f.horario)],
                    ['Servicios', catNombres.join(', ') || '—'],
                ].map(([k, v]) => (
                    <div key={k} className="flex gap-3 py-1 text-sm">
                        <span className="w-28 text-gray-500">{k}</span>
                        <span className="flex-1">{v}</span>
                    </div>
                ))}
                <button type="button" className="text-blue-700 font-semibold mt-2" onClick={() => irA(1)}>
                    Editar datos del negocio
                </button>
            </div>
            <label className="flex items-start gap-2 mb-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    className="w-5 h-5 mt-0.5"
                    onChange={() => setAceptaTerminos((v) => !v)}
                />
                <span>Acepto los Términos y Condiciones y la Política de Privacidad de Solvers.</span>
            </label>
        </>
    )

    const pasos = [paso0, paso1, paso2, paso3]
    const esUltimo = f.step === pasos.length - 1

    return (
        <div>
            <Steps current={f.step} className="mb-4">
                <Steps.Item title="Cuenta" />
                <Steps.Item title="Negocio" />
                <Steps.Item title="Servicios" />
                <Steps.Item title="Documentos" />
            </Steps>
            <p className="text-sm text-gray-500 mb-4">
                Paso {f.step + 1} de 4 · Se guarda automáticamente en este navegador
            </p>

            {resumed ? (
                <Alert showIcon type="success" className="mb-4">
                    Retomamos donde quedaste.{' '}
                    <button type="button" className="underline font-bold" onClick={empezarDeCero}>
                        Empezar de cero
                    </button>
                </Alert>
            ) : null}
            {banner.text ? (
                <Alert showIcon type={banner.type} className="mb-4">
                    {banner.text}
                </Alert>
            ) : null}

            {pasos[f.step]}

            {sendStage ? <p className="text-center text-sm text-gray-500 mt-2">{sendStage}</p> : null}
            <div className="flex gap-3 mt-4">
                {f.step > 0 ? (
                    <Button type="button" className="flex-1" disabled={sending} onClick={() => irA(f.step - 1)}>
                        Atrás
                    </Button>
                ) : null}
                <Button
                    type="button"
                    variant="solid"
                    className="flex-1"
                    loading={checking || sending}
                    onClick={esUltimo ? enviar : continuar}
                >
                    {esUltimo ? (banner.text ? 'Reintentar envío' : 'Enviar a revisión') : 'Continuar'}
                </Button>
            </div>
            <div className="mt-4 text-center">
                <ActionLink href={signInUrl}>¿Ya tienes una cuenta? Inicia sesión</ActionLink>
            </div>
        </div>
    )
}

export default SignUpTaller
