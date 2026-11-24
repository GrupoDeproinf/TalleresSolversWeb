// Prueba: las funciones que llama el panel solo responden al personal de Solvers.
//
// Corre contra los emuladores (Auth, Firestore y Functions), nunca contra la
// base real. Ver pruebas/LEEME.md.

import {initializeApp} from "firebase-admin/app"
import {getAuth} from "firebase-admin/auth"
import {getFirestore} from "firebase-admin/firestore"

const PROYECTO = process.env.GCLOUD_PROJECT || "demo-solvers"
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST
const FUNCIONES = `http://127.0.0.1:5001/${PROYECTO}/us-central1`

if (!AUTH_HOST || !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("Falta el emulador: ejecuta esto con firebase emulators:exec.")
  process.exit(1)
}

initializeApp({projectId: PROYECTO})
const auth = getAuth()
const db = getFirestore()

const CLAVE = "clave-de-prueba-123"

async function crearCuenta(uid) {
  await auth.createUser({uid, email: `${uid}@prueba.test`, password: CLAVE})
}

async function tokenDe(uid) {
  const r = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`,
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email: `${uid}@prueba.test`, password: CLAVE, returnSecureToken: true}),
    },
  )
  const j = await r.json()
  if (!j.idToken) throw new Error(`Sin token para ${uid}: ${JSON.stringify(j)}`)
  return j.idToken
}

async function llamar(funcion, data, uid) {
  const headers = {"Content-Type": "application/json"}
  if (uid) headers.Authorization = `Bearer ${await tokenDe(uid)}`
  const r = await fetch(`${FUNCIONES}/${funcion}`, {
    method: "POST",
    headers,
    body: JSON.stringify({data}),
  })
  return r.json()
}

const existe = async (uid) => auth.getUser(uid).then(() => true, () => false)

let fallos = 0
function comprobar(nombre, condicion, detalle) {
  if (condicion) {
    console.log(`  ok   ${nombre}`)
  } else {
    fallos += 1
    console.log(`  FALLA ${nombre}\n        ${JSON.stringify(detalle)}`)
  }
}
const estado = (res) => res?.error?.status

// ── Datos de prueba ─────────────────────────────────────────────────────────
const cuentas = {
  admin: () => db.doc("Admins/admin").set({nombre: "Admin"}),
  adminEliminado: () => db.doc("Admins/adminEliminado").set({status: "Eliminado"}),
  certificador: () => db.doc("Usuarios/certificador").set({typeUser: "Certificador"}),
  soporte: () => db.doc("Usuarios/soporte").set({typeUser: "Soporte"}),
  certificadorEliminado: () =>
    db.doc("Usuarios/certificadorEliminado").set({typeUser: "Certificador", status: "Eliminado"}),
  personalAntiguo: () => db.doc("Personal/personalAntiguo").set({activo: true}),
  personalInactivo: () => db.doc("Personal/personalInactivo").set({activo: false}),
  conductor: () => db.doc("Usuarios/conductor").set({typeUser: "Cliente"}),
  taller: () => db.doc("Usuarios/taller").set({typeUser: "Taller", nombre: "Taller"}),
  victima1: () => db.doc("Usuarios/victima1").set({typeUser: "Cliente"}),
  victima2: () => db.doc("Usuarios/victima2").set({typeUser: "Cliente"}),
  victima3: () => db.doc("Usuarios/victima3").set({typeUser: "Cliente"}),
  otroAdmin: () => db.doc("Admins/otroAdmin").set({nombre: "Otro"}),
  otroCertificador: () => db.doc("Usuarios/otroCertificador").set({typeUser: "Certificador"}),
}
for (const [uid, crearDoc] of Object.entries(cuentas)) {
  await crearCuenta(uid)
  await crearDoc()
}

const NO_PERSONAL = [undefined, "conductor", "taller", "adminEliminado", "certificadorEliminado", "personalInactivo"]
const FUNCIONES_PROTEGIDAS = {
  deleteAuthUsers: {uids: ["victima1"]},
  deleteWorkshopAuthUsers: {uids: ["victima1"]},
  backfillServiceRatings: {},
  backfillTalleresIndex: {},
  sendWorkshopDecisionEmail: {to: "x@prueba.test", workshopName: "T", decision: "Aprobado"},
}

console.log("Quien no es personal no puede usar ninguna función:")
for (const [funcion, data] of Object.entries(FUNCIONES_PROTEGIDAS)) {
  for (const uid of NO_PERSONAL) {
    const res = await llamar(funcion, data, uid)
    const esperado = uid ? "PERMISSION_DENIED" : "UNAUTHENTICATED"
    comprobar(`${funcion} · ${uid ?? "sin sesión"} → ${esperado}`, estado(res) === esperado, res)
  }
}
comprobar("victima1 sigue existiendo", await existe("victima1"), null)

console.log("El personal sí puede:")
for (const uid of ["admin", "certificador", "soporte", "personalAntiguo"]) {
  const res = await llamar("backfillTalleresIndex", {}, uid)
  comprobar(`backfillTalleresIndex · ${uid}`, res?.result !== undefined, res)
}
// Pasa el control de personal y llega a la validación (no envía correo).
const decisionMala = await llamar(
  "sendWorkshopDecisionEmail",
  {to: "x@prueba.test", workshopName: "T", decision: "Quizas"},
  "certificador",
)
comprobar("sendWorkshopDecisionEmail · certificador pasa el control", estado(decisionMala) === "INVALID_ARGUMENT", decisionMala)

const r1 = await llamar("deleteAuthUsers", {uids: ["victima1"]}, "certificador")
comprobar("certificador borra a un conductor", r1?.result?.deletedCount === 1 && !(await existe("victima1")), r1)

const r2 = await llamar("deleteWorkshopAuthUsers", {uids: ["victima2"]}, "personalAntiguo")
comprobar("personal antiguo borra con el nombre viejo de la función", r2?.result?.deletedCount === 1, r2)

console.log("Protecciones del personal:")
const r3 = await llamar("deleteAuthUsers", {uids: ["otroAdmin", "otroCertificador", "victima3"]}, "soporte")
comprobar(
  "soporte no borra a un admin ni a un certificador, pero sí al conductor",
  r3?.result?.deletedCount === 1 && (await existe("otroAdmin")) && (await existe("otroCertificador")) && !(await existe("victima3")),
  r3,
)
const r4 = await llamar("deleteAuthUsers", {uids: ["admin"]}, "admin")
comprobar("nadie borra su propia cuenta", r4?.result?.deletedCount === 0 && (await existe("admin")), r4)

const r5 = await llamar("deleteAuthUsers", {uids: ["otroCertificador"]}, "admin")
comprobar("un admin sí borra a otro miembro del personal", r5?.result?.deletedCount === 1, r5)

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : "\nTodas las pruebas pasaron")
process.exit(fallos ? 1 : 0)
