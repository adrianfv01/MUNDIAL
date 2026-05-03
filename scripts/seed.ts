/* eslint-disable no-console */
/**
 * Seed del catalogo y equipos hacia Firestore.
 *
 * Modo 1 (recomendado para CI o servidores):
 *   - Coloca un service-account.json en la raiz del proyecto.
 *   - npm run seed
 *
 * Modo 2 (rapido en local):
 *   - gcloud auth application-default login
 *   - npm run seed
 *
 * El script es sincronizador: agrega/actualiza los documentos del catalogo
 * actual y borra los documentos antiguos que ya no esten en el listado real
 * (por ejemplo equipos que aparecian provisionalmente y no clasificaron).
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert, applicationDefault, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { equipos } from '../src/data/equipos'
import { catalogoCompleto } from '../src/data/catalogoSeed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? 'mundial-album-2026'
const TAM_LOTE = 400

async function inicializar(): Promise<App> {
  const credPath = path.resolve(__dirname, '..', 'service-account.json')
  const json = await readFile(credPath, 'utf8').catch(() => null)
  if (json) {
    console.log('Usando service-account.json')
    return initializeApp({ credential: cert(JSON.parse(json)), projectId: PROJECT_ID })
  }
  console.log('Usando Application Default Credentials (gcloud)')
  return initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
}

async function sincronizarColeccion<T extends object>(
  db: FirebaseFirestore.Firestore,
  coleccion: string,
  docsDeseados: Array<{ id: string; data: T }>,
) {
  const idsDeseados = new Set(docsDeseados.map((d) => d.id))
  const snap = await db.collection(coleccion).get()
  const idsExistentes = snap.docs.map((d) => d.id)
  const idsABorrar = idsExistentes.filter((id) => !idsDeseados.has(id))

  if (idsABorrar.length > 0) {
    console.log(`  -> borrando ${idsABorrar.length} docs antiguos de ${coleccion}`)
    for (let i = 0; i < idsABorrar.length; i += TAM_LOTE) {
      const lote = idsABorrar.slice(i, i + TAM_LOTE)
      const batch = db.batch()
      for (const id of lote) {
        batch.delete(db.collection(coleccion).doc(id))
      }
      await batch.commit()
    }
  }

  console.log(`  -> escribiendo ${docsDeseados.length} docs en ${coleccion}`)
  for (let i = 0; i < docsDeseados.length; i += TAM_LOTE) {
    const lote = docsDeseados.slice(i, i + TAM_LOTE)
    const batch = db.batch()
    for (const doc of lote) {
      batch.set(db.collection(coleccion).doc(doc.id), doc.data)
    }
    await batch.commit()
    console.log(`     lote ${Math.floor(i / TAM_LOTE) + 1} (${lote.length} docs)`)
  }
}

async function main() {
  await inicializar()
  const db = getFirestore()
  console.log(`Proyecto: ${PROJECT_ID}`)

  console.log(`Sincronizando ${equipos.length} equipos...`)
  await sincronizarColeccion(
    db,
    'equipos',
    equipos.map((eq) => ({ id: eq.codigo, data: eq })),
  )

  console.log(`Sincronizando ${catalogoCompleto.length} estampas...`)
  await sincronizarColeccion(
    db,
    'catalogo',
    catalogoCompleto.map((est) => ({ id: est.id, data: est })),
  )

  console.log('Seed completo.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
