/**
 * Firebase Functions para Talleres Solvers
 * Funcion para envio de correos al aprobar/rechazar negocios.
 */

import {onCall, HttpsError} from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import {initializeApp} from "firebase-admin/app"
import nodemailer from "nodemailer"

try {
  initializeApp()
} catch (error) {
  // Ignorar si ya esta inicializado.
}

type WorkshopDecision = "Aprobado" | "Rechazado"

// Configuracion del transportador de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "solverstalleres@gmail.com",
    pass: "dxsr rchx hjnf ucfn",
  },
})

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
      from: "solverstalleres@gmail.com",
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
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
export const sendWorkshopDecisionEmail = onCall(async (request) => {
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
})
