// Prueba las reglas nuevas con cada tipo de cuenta en el emulador.
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where } from 'firebase/firestore'
import { ref, uploadString, getBytes } from 'firebase/storage'
import fs from 'node:fs'

const dir = process.argv[2]
const env = await initializeTestEnvironment({
  projectId: 'demo-solvers',
  firestore: { rules: fs.readFileSync(`${dir}/firestore.rules`, 'utf8'), host: '127.0.0.1', port: 8085 },
  storage: { rules: fs.readFileSync(`${dir}/storage.rules`, 'utf8'), host: '127.0.0.1', port: 9199 },
})
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore()
  await setDoc(doc(db, 'Admins/adm'), { email: 'a@x.com' })
  await setDoc(doc(db, 'Admins/admBorrado'), { email: 'b@x.com', status: 'Eliminado' })
  await setDoc(doc(db, 'Usuarios/cert'), { typeUser: 'Certificador', email: 'c@x.com' })
  await setDoc(doc(db, 'Usuarios/sop'), { typeUser: 'Soporte', email: 's@x.com' })
  await setDoc(doc(db, 'Usuarios/certViejoDoc'), { typeUser: 'Certificador', email: 'v@x.com', uid: 'certViejoDoc' })
  await setDoc(doc(db, 'Personal/certViejoAuth'), { activo: true, rol: 'Certificador' })
  await setDoc(doc(db, 'Personal/exPersonal'), { activo: false, rol: 'Soporte' })
  await setDoc(doc(db, 'Usuarios/taller'), { typeUser: 'Taller', email: 't@x.com', status: 'Aprobado' })
  await setDoc(doc(db, 'Usuarios/cliente'), { typeUser: 'Cliente', email: 'cl@x.com' })
  await setDoc(doc(db, 'Subscripciones/s1'), { taller_uid: 'taller', status: 'Por Aprobar' })
  await uploadString(ref(c.storage(), 'documents/rif.txt'), 'rif')
  await uploadString(ref(c.storage(), 'profileImages/f.jpg'), 'foto')
})

let fallas = 0
const caso = async (desc, p, debe) => {
  try { await (debe ? assertSucceeds(p) : assertFails(p)); console.log(`✔ ${desc}`) }
  catch (e) { fallas++; console.log(`✘ ${desc} — ${e.message.split('\n')[0]}`) }
}
const como = (uid) => uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()

for (const [quien, uid] of [['admin', 'adm'], ['certificador', 'cert'], ['soporte', 'sop'], ['certificador antiguo (lista Personal)', 'certViejoAuth']]) {
  const c = como(uid), db = c.firestore()
  await caso(`${quien}: lista todos los usuarios`, getDocs(collection(db, 'Usuarios')), true)
  await caso(`${quien}: aprueba un pago`, updateDoc(doc(db, 'Subscripciones/s1'), { status: 'Aprobado' }), true)
  await caso(`${quien}: lee un documento sensible`, getBytes(ref(c.storage(), 'documents/rif.txt')), true)
  await caso(`${quien}: sube una imagen`, uploadString(ref(c.storage(), 'service_images/n.jpg'), 'x'), true)
}
{
  const db = como('certViejoAuth').firestore()
  await caso('certificador antiguo: busca su ficha por correo al iniciar sesión', getDocs(query(collection(db, 'Usuarios'), where('email', '==', 'v@x.com'))), true)
}
for (const [quien, uid] of [['taller', 'taller'], ['cliente', 'cliente'], ['admin eliminado', 'admBorrado'], ['ex personal desactivado', 'exPersonal'], ['sin sesión', null]]) {
  const c = como(uid), db = c.firestore()
  await caso(`${quien}: NO lista usuarios`, getDocs(collection(db, 'Usuarios')), false)
  await caso(`${quien}: NO aprueba pagos`, updateDoc(doc(db, 'Subscripciones/s1'), { status: 'Aprobado' }), false)
  await caso(`${quien}: NO se crea en Admins`, setDoc(doc(db, `Admins/${uid || 'x'}`), { email: 'z' }), false)
  await caso(`${quien}: NO se agrega a Personal`, setDoc(doc(db, `Personal/${uid || 'x'}`), { activo: true }), false)
  await caso(`${quien}: NO lee documentos sensibles`, getBytes(ref(c.storage(), 'documents/rif.txt')), false)
  await caso(`${quien}: NO sube archivos`, uploadString(ref(c.storage(), 'profileImages/x.jpg'), 'x'), false)
  await caso(`${quien}: sí ve imágenes públicas`, getBytes(ref(c.storage(), 'profileImages/f.jpg')), true)
}
{
  const db = como('taller').firestore()
  await caso('taller: lee su propia ficha (para el mensaje de inicio de sesión)', getDoc(doc(db, 'Usuarios/taller')), true)
  await caso('taller: NO lee la ficha de otro', getDoc(doc(db, 'Usuarios/cliente')), false)
  await caso('taller: NO se cambia a Certificador', updateDoc(doc(db, 'Usuarios/taller'), { typeUser: 'Certificador' }), false)
  await caso('taller: NO se aprueba solo', updateDoc(doc(db, 'Usuarios/taller'), { status: 'Aprobado', subscripcion_actual: { status: 'Aprobado' } }), false)
}
await env.cleanup()
console.log(fallas ? `\n${fallas} FALLAS` : '\nTodo correcto')
process.exit(fallas ? 1 : 0)
