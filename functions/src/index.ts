/**
 * Firebase Functions para Talleres Solvers
 * Funcion para envio de correos al aprobar/rechazar negocios.
 */

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https"
import {onDocumentWritten} from "firebase-functions/v2/firestore"
import {defineSecret} from "firebase-functions/params"
import * as logger from "firebase-functions/logger"
import {initializeApp} from "firebase-admin/app"
import {getAuth} from "firebase-admin/auth"
import {getFirestore} from "firebase-admin/firestore"
import nodemailer from "nodemailer"

try {
  initializeApp()
} catch (error) {
  // Ignorar si ya esta inicializado.
}

type WorkshopDecision = "Aprobado" | "Rechazado"

// Configuracion del transportador de correo.
// La contrasena de aplicacion de Gmail vive en Secret Manager (nunca en el
// codigo: este repositorio es publico). Se carga con:
//   firebase functions:secrets:set GMAIL_APP_PASSWORD
const GMAIL_USER = "solverstalleres@gmail.com"
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD")

let transporter: nodemailer.Transporter | null = null
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.value(),
      },
    })
  }
  return transporter
}

/* ------------------------------------------------------------------ *
 * Solo personal de Solvers
 *
 * Las funciones que llama el panel (borrar cuentas, enviar correos de
 * decision, reconstruir indices) antes solo pedian "tener sesion", y
 * cualquier conductor o taller de la app tiene sesion de Firebase.
 * Ahora se exige ser personal, con el mismo criterio que firestore.rules
 * (esPersonal): Admins/{uid}, Usuarios/{uid} con typeUser Certificador o
 * Soporte, o Personal/{uid} activo.
 * ------------------------------------------------------------------ */

const estaActivo = (datos: Record<string, unknown> | undefined) =>
  !!datos && datos.status !== "Eliminado"

type RolPersonal = "Admin" | "Certificador" | "Soporte" | "Personal"

/**
 * Devuelve el rol de personal del uid, o null si no es personal.
 * @param {string} uid Usuario de Firebase Auth.
 * @return {Promise<RolPersonal | null>} Rol de personal o null.
 */
async function rolDePersonal(uid: string): Promise<RolPersonal | null> {
  const db = getFirestore()
  const [admin, usuario, personal] = await Promise.all([
    db.collection("Admins").doc(uid).get(),
    db.collection("Usuarios").doc(uid).get(),
    db.collection("Personal").doc(uid).get(),
  ])

  if (admin.exists && estaActivo(admin.data())) return "Admin"

  const datosUsuario = usuario.data()
  const tipo = datosUsuario?.typeUser
  if (
    usuario.exists &&
    (tipo === "Certificador" || tipo === "Soporte") &&
    estaActivo(datosUsuario)
  ) {
    return tipo
  }

  if (personal.exists && personal.data()?.activo === true) return "Personal"

  return null
}

/**
 * Corta la llamada si no viene de personal de Solvers.
 * @param {CallableRequest} request Llamada recibida.
 * @return {Promise<{uid: string, rol: RolPersonal}>} Quien llama y su rol.
 */
async function exigirPersonal(
  request: CallableRequest,
): Promise<{uid: string; rol: RolPersonal}> {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Debe iniciar sesión para ejecutar esta acción.",
    )
  }
  const rol = await rolDePersonal(uid)
  if (!rol) {
    logger.warn("Llamada rechazada: no es personal de Solvers", {uid})
    throw new HttpsError(
      "permission-denied",
      "Solo el personal de Solvers puede ejecutar esta acción.",
    )
  }
  return {uid, rol}
}

const SOLVERS_LOGO_URL = "https://talleres-solvers-app.web.app/img/logo/logo-light-streamline.png"
const SOLVERS_PRIMARY = "#000B7E"

// Funcion para enviar correo
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      logger.error(`Email invalido: ${to}`)
      return {success: false, error: `Email invalido: ${to}`}
    }

    const mailOptions = {
      from: GMAIL_USER,
      to,
      subject,
      html,
    }

    const info = await getTransporter().sendMail(mailOptions)
    logger.info("Correo enviado correctamente", info.messageId)
    return {success: true, messageId: info.messageId}
  } catch (error: unknown) {
    logger.error("Error al enviar correo", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al enviar correo",
    }
  }
}

const getEmailTemplate = (
  decision: WorkshopDecision,
  workshopName: string,
  reason: string,
) => {
  const isApproved = decision === "Aprobado"

  let subject = "Tu negocio ha sido rechazado | Solvers"
  if (isApproved) {
    subject = "Tu negocio ha sido aprobado | Solvers"
  }

  const statusText = isApproved ? "APROBADO" : "RECHAZADO"
  const statusColor = isApproved ? "#15803d" : "#b91c1c"
  const statusBg = isApproved ? "#f0fdf4" : "#fef2f2"
  const statusBorder = isApproved ? "#bbf7d0" : "#fecaca"
  const title = isApproved ? "Revision completada" : "Revision con observaciones"

  let message = "Tu negocio fue rechazado durante el proceso de revision."
  if (isApproved) {
    message = "Tu negocio fue aprobado exitosamente y ya puede operar en Solvers."
  }

  let reasonBlock = ""
  if (!isApproved) {
    reasonBlock =
      '<div style="margin-top:20px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px">' +
      '<p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.4px">Motivo del rechazo</p>' +
      `<p style="margin:0;font-size:14px;color:#374151">${reason || "No especificado"}</p>` +
      "</div>"
  }

  const html =
    '<div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">' +
    '<table role="presentation" style="max-width:640px;width:100%;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">' +
    '<tr><td style="background:' + SOLVERS_PRIMARY + ';padding:28px 24px;text-align:center">' +
    `<img src="${SOLVERS_LOGO_URL}" alt="Solvers" style="width:68px;height:68px;object-fit:contain;border-radius:10px;background:#ffffff;padding:8px"/>` +
    '<h1 style="margin:14px 0 4px 0;color:#ffffff;font-size:22px;line-height:1.2">Solvers</h1>' +
    '<p style="margin:0;color:#c7d2fe;font-size:13px">Gestion de negocios y certificaciones</p>' +
    '</td></tr>' +
    '<tr><td style="padding:24px">' +
    `<p style="margin:0 0 10px 0;color:#111827;font-size:16px">Hola, <strong>${workshopName}</strong>.</p>` +
    '<h2 style="margin:0 0 8px 0;color:#111827;font-size:20px">' + title + '</h2>' +
    '<p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6">' + message + '</p>' +
    '<div style="margin-top:20px;background:' + statusBg + ';border:1px solid ' + statusBorder + ';border-radius:10px;padding:16px">' +
    '<p style="margin:0 0 8px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Estado actual del negocio</p>' +
    '<p style="margin:0;font-size:18px;font-weight:700;color:' + statusColor + '">' + statusText + '</p>' +
    '</div>' +
    reasonBlock +
    '<div style="margin-top:22px;padding-top:16px;border-top:1px solid #e5e7eb">' +
    '<p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6">Este es un mensaje automatico de Solvers. Si necesitas soporte, responde a este correo o contacta a tu administrador.</p>' +
    '</div>' +
    '</td></tr>' +
    '</table>' +
    '</div>'

  return {subject, html}
}

// Firebase Function callable para enviar correo por decision del negocio
export const sendWorkshopDecisionEmail = onCall(
  {secrets: [GMAIL_APP_PASSWORD]},
  async (request) => {
    await exigirPersonal(request)
    try {
      const {to, workshopName, decision, reason} = request.data ?? {}

      logger.info("Datos recibidos en sendWorkshopDecisionEmail", {
        to,
        workshopName,
        decision,
      })

      if (!to || !workshopName || !decision) {
        throw new HttpsError(
          "invalid-argument",
          "Faltan campos requeridos: to, workshopName, decision",
        )
      }

      if (decision !== "Aprobado" && decision !== "Rechazado") {
        throw new HttpsError(
          "invalid-argument",
          "Decision invalida. Debe ser 'Aprobado' o 'Rechazado'",
        )
      }

      const safeDecision = decision as WorkshopDecision
      const safeReason = String(reason || "").trim()

      if (safeDecision === "Rechazado" && !safeReason) {
        throw new HttpsError(
          "invalid-argument",
          "Para rechazo, el motivo es obligatorio",
        )
      }

      const template = getEmailTemplate(
        safeDecision,
        String(workshopName),
        safeReason,
      )

      const emailResult = await sendEmail(String(to), template.subject, template.html)

      if (emailResult.success) {
        logger.info("Correo de decision enviado correctamente")
        return {
          success: true,
          message: "Correo enviado correctamente",
          decision: safeDecision,
          messageId: emailResult.messageId,
        }
      }

      logger.error("Error al enviar correo de decision", emailResult.error)
      return {
        success: false,
        error: "Error al enviar correo de decision",
        details: emailResult.error,
      }
    } catch (error) {
      logger.error("Error en sendWorkshopDecisionEmail", error)
      if (error instanceof HttpsError) {
        throw error
      }
      throw new HttpsError("internal", "Error interno del servidor")
    }
  },
)

/** Elimina cuentas de Firebase Auth (uids). */
export const deleteAuthUsers = onCall(async (request) => {
  const llamante = await exigirPersonal(request)

  const {uids} = request.data ?? {}
  if (!Array.isArray(uids) || uids.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un arreglo de uids.",
    )
  }

  const auth = getAuth()
  const results: Array<{uid: string; success: boolean; error?: string}> = []

  for (const rawUid of uids) {
    const uid = String(rawUid ?? "").trim()
    if (!uid) continue

    // Nadie borra su propia cuenta desde aqui, y solo un Admin puede
    // borrar la cuenta de otra persona del personal.
    if (uid === llamante.uid) {
      results.push({uid, success: false, error: "No puede eliminar su propia cuenta."})
      continue
    }
    if (llamante.rol !== "Admin" && (await rolDePersonal(uid))) {
      logger.warn("Intento de borrar personal sin ser Admin", {
        llamante: llamante.uid,
        uid,
      })
      results.push({
        uid,
        success: false,
        error: "Solo un administrador puede eliminar cuentas del personal.",
      })
      continue
    }

    try {
      await auth.deleteUser(uid)
      results.push({uid, success: true})
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido"
      logger.warn("No se pudo eliminar usuario de Auth", {uid, message})
      results.push({uid, success: false, error: message})
    }
  }

  const deletedCount = results.filter((item) => item.success).length
  const failedCount = results.length - deletedCount

  return {
    success: failedCount === 0,
    deletedCount,
    failedCount,
    results,
  }
})

/** @deprecated Usar deleteAuthUsers */
export const deleteWorkshopAuthUsers = deleteAuthUsers

/* ------------------------------------------------------------------ *
 * Calificaciones denormalizadas
 *
 * La vista "Lista de Servicios" mostraba el promedio de calificaciones
 * leyendo la subcoleccion `calificaciones` de CADA servicio (una consulta
 * por servicio: ~150 consultas y varios MB al abrir la pantalla).
 *
 * Para evitarlo, guardamos el promedio y el conteo dentro del propio
 * documento del servicio (`puntuacion_promedio` y `reviews_count`) y los
 * mantenemos actualizados con un disparador de Firestore.
 * ------------------------------------------------------------------ */

/** Recalcula promedio y conteo de calificaciones de un servicio. */
async function recomputeServiceRating(servicioId: string): Promise<{
  promedio: number
  count: number
}> {
  const db = getFirestore()
  const serviceRef = db.collection("Servicios").doc(servicioId)
  const snap = await serviceRef.collection("calificaciones").get()

  let sum = 0
  let count = 0
  snap.forEach((docSnap) => {
    const raw = docSnap.data() as {puntuacion?: unknown}
    const value = Number(raw?.puntuacion)
    if (Number.isFinite(value)) {
      sum += value
      count += 1
    }
  })

  const promedio = count > 0 ? sum / count : 0

  // update() y no set(merge): si el servicio ya se borró (por ejemplo al
  // eliminar un taller con sus calificaciones), no se vuelve a crear un
  // servicio vacío sin dueño.
  try {
    await serviceRef.update({
      puntuacion_promedio: promedio,
      reviews_count: count,
    })
  } catch (error: unknown) {
    const code = (error as {code?: unknown})?.code
    if (code === 5 || code === "5" || code === "not-found") {
      return {promedio, count}
    }
    throw error
  }

  return {promedio, count}
}

/**
 * Mantiene actualizado el promedio del servicio cada vez que se crea,
 * edita o elimina una calificacion.
 */
export const onCalificacionWritten = onDocumentWritten(
  "Servicios/{servicioId}/calificaciones/{calificacionId}",
  async (event) => {
    const servicioId = event.params.servicioId
    try {
      const result = await recomputeServiceRating(servicioId)
      logger.info("Calificaciones recalculadas", {servicioId, ...result})
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido"
      logger.error("No se pudo recalcular calificaciones", {
        servicioId,
        message,
      })
    }
  },
)

/**
 * Recalcula las calificaciones de TODOS los servicios.
 * Se ejecuta una sola vez para rellenar los datos existentes.
 */
export const backfillServiceRatings = onCall(async (request) => {
  await exigirPersonal(request)

  const db = getFirestore()
  const servicios = await db.collection("Servicios").get()

  let updated = 0
  let failed = 0

  for (const docSnap of servicios.docs) {
    try {
      await recomputeServiceRating(docSnap.id)
      updated += 1
    } catch (error: unknown) {
      failed += 1
      const message =
        error instanceof Error ? error.message : "Error desconocido"
      logger.warn("Fallo al recalcular servicio", {
        servicioId: docSnap.id,
        message,
      })
    }
  }

  logger.info("Backfill de calificaciones finalizado", {updated, failed})

  return {success: failed === 0, updated, failed}
})

/* ------------------------------------------------------------------ *
 * Indice ligero de negocios (talleres)
 *
 * La pantalla "Negocios" descargaba los documentos COMPLETOS de los
 * ~870 talleres (unos 3 MB) solo para pintar una tabla de 10 filas. La
 * mayor parte de ese peso son campos que la tabla nunca muestra:
 * categorias, metodos_pago, horarios_atencion, fotos, tokens, etc.
 *
 * Para evitarlo mantenemos una coleccion `TalleresIndex` con una copia
 * reducida de cada taller: solo los campos que la tabla usa para
 * mostrar, buscar, filtrar y exportar. Un disparador de Firestore la
 * mantiene sincronizada con `Usuarios`.
 * ------------------------------------------------------------------ */

const TALLERES_INDEX_COLLECTION = "TalleresIndex"

/** Campos de primer nivel que necesita la tabla de Negocios. */
const TALLER_INDEX_FIELDS = [
  "uid",
  "status",
  "nombre",
  "image_perfil",
  "rif",
  "phone",
  "email",
  "estado",
  "createdAt",
  "certificador_nombre",
  "Direccion",
  "ubicacion",
  "LinkFacebook",
  "LinkInstagram",
  "LinkTiktok",
  "whatsapp",
]

/** Campos del plan que se usan en columnas, filtros y busqueda. */
const TALLER_INDEX_SUBSCRIPCION_FIELDS = [
  "nombre",
  "fecha_fin",
  "fecha_inicio",
  "status",
  "vigencia",
  "monto",
]

/**
 * Construye la version reducida de un taller.
 * `fecha_fin` y `createdAt` se copian tal cual para conservar el tipo
 * Timestamp, del que dependen el filtro "Vencen hoy" y el orden por
 * fecha de registro.
 */
function buildTallerIndexDoc(
  uid: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const field of TALLER_INDEX_FIELDS) {
    const value = data[field]
    if (value !== undefined) out[field] = value
  }

  // La tabla identifica cada fila por `uid`; nunca debe faltar.
  out.uid = typeof data.uid === "string" && data.uid ? data.uid : uid
  out.typeUser = "Taller"

  const subs = data.subscripcion_actual
  if (subs && typeof subs === "object") {
    const source = subs as Record<string, unknown>
    const reduced: Record<string, unknown> = {}
    for (const field of TALLER_INDEX_SUBSCRIPCION_FIELDS) {
      const value = source[field]
      if (value !== undefined) reduced[field] = value
    }
    out.subscripcion_actual = reduced
  }

  return out
}

/**
 * Mantiene `TalleresIndex` sincronizado con `Usuarios`.
 * Si el usuario deja de ser taller o se elimina, se borra su entrada.
 */
export const onUsuarioWritten = onDocumentWritten(
  "Usuarios/{uid}",
  async (event) => {
    const uid = event.params.uid
    const db = getFirestore()
    const indexRef = db.collection(TALLERES_INDEX_COLLECTION).doc(uid)

    try {
      const after = event.data?.after
      const data = after?.exists ?
        (after.data() as Record<string, unknown>) :
        null

      if (!data || data.typeUser !== "Taller") {
        await indexRef.delete()
        return
      }

      await indexRef.set(buildTallerIndexDoc(uid, data))
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido"
      logger.error("No se pudo actualizar el indice de negocios", {
        uid,
        message,
      })
    }
  },
)

/**
 * Reconstruye `TalleresIndex` completo a partir de `Usuarios`.
 * Se ejecuta una vez para rellenar los datos existentes; despues el
 * disparador lo mantiene al dia.
 */
export const backfillTalleresIndex = onCall(async (request) => {
  await exigirPersonal(request)

  const db = getFirestore()
  const snapshot = await db
    .collection("Usuarios")
    .where("typeUser", "==", "Taller")
    .get()

  let updated = 0
  let failed = 0
  const BATCH_SIZE = 400
  let batch = db.batch()
  let pending = 0

  for (const docSnap of snapshot.docs) {
    try {
      const reduced = buildTallerIndexDoc(
        docSnap.id,
        docSnap.data() as Record<string, unknown>,
      )
      batch.set(
        db.collection(TALLERES_INDEX_COLLECTION).doc(docSnap.id),
        reduced,
      )
      pending += 1
      updated += 1

      if (pending >= BATCH_SIZE) {
        await batch.commit()
        batch = db.batch()
        pending = 0
      }
    } catch (error: unknown) {
      failed += 1
      const message =
        error instanceof Error ? error.message : "Error desconocido"
      logger.warn("Fallo al indexar negocio", {uid: docSnap.id, message})
    }
  }

  if (pending > 0) {
    await batch.commit()
  }

  logger.info("Indice de negocios reconstruido", {updated, failed})

  return {success: failed === 0, updated, failed}
})
