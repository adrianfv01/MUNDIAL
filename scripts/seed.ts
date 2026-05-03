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
 * El script es idempotente: vuelve a escribir los documentos sin borrar otros.
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

async function main() {
  await inicializar()
  const db = getFirestore()
  console.log(`Proyecto: ${PROJECT_ID}`)

  console.log(`Subiendo ${equipos.length} equipos...`)
  const batchEquipos = db.batch()
  for (const eq of equipos) {
    batchEquipos.set(db.collection('equipos').doc(eq.codigo), eq)
  }
  await batchEquipos.commit()
  console.log('  -> equipos OK')

  console.log(`Subiendo ${catalogoCompleto.length} estampas en lotes...`)
  const TAM_LOTE = 400
  for (let i = 0; i < catalogoCompleto.length; i += TAM_LOTE) {
    const lote = catalogoCompleto.slice(i, i + TAM_LOTE)
    const batch = db.batch()
    for (const est of lote) {
      batch.set(db.collection('catalogo').doc(est.id), est)
    }
    await batch.commit()
    console.log(`  -> lote ${i / TAM_LOTE + 1} (${lote.length} docs)`)
  }
  console.log('Seed completo.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
