/**
 * MIGRACIÓN DESDE GOOGLE DRIVE
 * ─────────────────────────────
 * Uso:
 *   node scripts/migrate-drive.mjs <folder-id>           → simulación (dry-run)
 *   node scripts/migrate-drive.mjs <folder-id> --import  → importa de verdad
 *
 * Donde <folder-id> es el ID de la carpeta raíz en Drive
 * (está en la URL: drive.google.com/drive/folders/ESTE-ES-EL-ID)
 *
 * SETUP necesario:
 *   1. Crear cuenta de servicio en Google Cloud (ver INSTRUCCIONES abajo)
 *   2. Guardar el JSON de credenciales como scripts/drive-credentials.json
 *   3. Compartir la carpeta de Drive con el email de la cuenta de servicio
 *   4. Correr este script
 */

import { google }        from 'googleapis'
import { createClient }  from '@supabase/supabase-js'
import * as dotenv       from 'dotenv'
import path              from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import fs                from 'fs'

const require        = createRequire(import.meta.url)
const pdfParseModule = require('pdf-parse')
const pdfParse       = pdfParseModule.default ?? pdfParseModule

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// ── Configuración ─────────────────────────────────────────────────
const CREDENTIALS_PATH = path.join(__dirname, 'drive-credentials.json')

// Mapeo de nombres de carpeta → slug de materia
// Editá esto si tus carpetas tienen nombres distintos
const FOLDER_TO_SLUG = {
  'logica matematica':        'logica-matematica',
  'lógica matemática':        'logica-matematica',
  'logica':                   'logica-matematica',
  'lógica':                   'logica-matematica',
  'seminario':                'seminario',
  'fundamentos':              'fundamentos-ed-fisica',
  'fundamentos de ed fisica':         'fundamentos-ed-fisica',
  'fundamentos ed fisica':            'fundamentos-ed-fisica',
  'fundamentos de educacion fisica':  'fundamentos-ed-fisica',
  'fundamentos de educación física':  'fundamentos-ed-fisica',
  'filosofia':                'filosofia',
  'filosofía':                'filosofia',
  'contabilidad':             'contabilidad',
  'historia argentina':       'historia-argentina',
  'historia':                 'historia-argentina',
  'biologia':                 'biologia',
  'biología':                 'biologia',
  'biociencias':              'biociencias',
}

// Detección de tipo de contenido desde el nombre del archivo
function detectType(filename) {
  const n = filename.toLowerCase()
  if (n.includes('guia') || n.includes('guía') || n.includes('ejercicio') || n.includes('practica')) return 'guide'
  if (n.includes('modelo') || n.includes('examen') || n.includes('parcial') || n.includes('final')) return 'exam_model'
  return 'summary'
}

function folderSlug(name) {
  // quita el año al final (ej. "Logica Matematica 2026" → "Logica Matematica")
  const normalized = name.toLowerCase().trim().replace(/\s+\d{4}$/, '')
  return FOLDER_TO_SLUG[normalized] ?? null
}

// Convierte texto extraído de PDF a Markdown básico
function toMarkdown(text, title) {
  const lines  = text.split('\n')
  let md       = `# ${title}\n\n`
  let lastBlank = true

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { if (!lastBlank) { md += '\n'; lastBlank = true } continue }

    // Línea corta en MAYÚSCULAS → probable subtítulo
    if (line.length < 80 && line === line.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(line) && line.length > 3) {
      md += `\n## ${line}\n\n`
    } else {
      md += line + '\n'
    }
    lastBlank = false
  }

  return md.trim()
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const folderId = process.argv[2]
  const doImport = process.argv.includes('--import')

  if (!folderId) {
    console.error('❌ Uso: node scripts/migrate-drive.mjs <folder-id> [--import]')
    process.exit(1)
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`❌ No encontré el archivo de credenciales en: ${CREDENTIALS_PATH}`)
    console.error('   Seguí las instrucciones del archivo INSTRUCCIONES-DRIVE.md')
    process.exit(1)
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Faltan variables de entorno de Supabase en .env.local')
    process.exit(1)
  }

  console.log(`\n🔑 Autenticando con Google Drive...`)
  const auth  = new google.auth.GoogleAuth({ keyFile: CREDENTIALS_PATH, scopes: ['https://www.googleapis.com/auth/drive.readonly'] })
  const drive = google.drive({ version: 'v3', auth })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Cargar IDs de materias
  const { data: subjects } = await supabase.from('subjects').select('id, slug, name')
  const slugToId = new Map(subjects.map(s => [s.slug, s.id]))

  console.log(`📁 Escaneando carpeta ${folderId}...\n`)

  // Listar subcarpetas (un nivel)
  const { data: { files: folders } } = await drive.files.list({
    q:      `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  })

  if (!folders?.length) {
    console.log('⚠️  No encontré subcarpetas. Procesando archivos directamente en la carpeta raíz...')
    folders.push({ id: folderId, name: '__root__' })
  }

  const plan = []  // lo que se va a importar

  for (const folder of folders) {
    const slug = folder.name === '__root__' ? null : folderSlug(folder.name)

    if (!slug && folder.name !== '__root__') {
      console.log(`⚠️  Carpeta "${folder.name}" → no encontré materia correspondiente (omitida)`)
      console.log(`   Agregá el mapeo en FOLDER_TO_SLUG si querés incluirla\n`)
      continue
    }

    if (slug && !slugToId.has(slug)) {
      console.log(`⚠️  Carpeta "${folder.name}" → slug "${slug}" no existe en Supabase (omitida)\n`)
      continue
    }

    // Listar PDFs en esta carpeta
    const { data: { files: pdfs } } = await drive.files.list({
      q:      `'${folder.id}' in parents and mimeType = 'application/pdf' and trashed = false`,
      fields: 'files(id, name, size)',
    })

    if (!pdfs?.length) {
      console.log(`📂 ${folder.name} → sin PDFs\n`)
      continue
    }

    const subjectId = slugToId.get(slug)
    console.log(`📂 ${folder.name} → ${slug} (${pdfs.length} PDF${pdfs.length !== 1 ? 's' : ''})`)

    for (const file of pdfs) {
      const type  = detectType(file.name)
      const title = file.name.replace(/\.pdf$/i, '').trim()
      console.log(`   📄 ${title} [${type}]`)
      plan.push({ fileId: file.id, title, type, subjectId, slug })
    }
    console.log()
  }

  if (!plan.length) {
    console.log('❌ No hay nada para importar.')
    return
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`📋 RESUMEN: ${plan.length} archivo${plan.length !== 1 ? 's' : ''} encontrado${plan.length !== 1 ? 's' : ''}`)

  if (!doImport) {
    console.log(`\n   Esto fue una SIMULACIÓN. Para importar de verdad, corré:`)
    console.log(`   node scripts/migrate-drive.mjs ${folderId} --import\n`)
    return
  }

  // ── Importación real ───────────────────────────────────────────
  console.log('\n🚀 Iniciando importación...\n')
  let ok = 0, failed = 0

  for (const item of plan) {
    process.stdout.write(`   ⬇  Descargando "${item.title}"... `)

    try {
      const res = await drive.files.get(
        { fileId: item.fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      )
      const buffer = Buffer.from(res.data)

      process.stdout.write('📝 Extrayendo texto... ')
      const pdf  = await pdfParse(buffer)
      const body = toMarkdown(pdf.text, item.title)

      // Orden: usar cantidad actual de ítems en esa materia + 1
      const { count } = await supabase
        .from('content_items')
        .select('id', { count: 'exact', head: true })
        .eq('subject_id', item.subjectId)

      await supabase.from('content_items').insert({
        subject_id:   item.subjectId,
        title:        item.title,
        type:         item.type,
        body,
        order_index:  (count ?? 0) + 1,
        is_published: true,
      })

      console.log('✅')
      ok++
    } catch (err) {
      console.log(`❌ Error: ${err.message}`)
      failed++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ Importados: ${ok}`)
  if (failed) console.log(`❌ Fallidos:   ${failed}`)
  console.log('\n🎉 ¡Migración completa! Revisá el contenido en /admin/content\n')
}

main().catch(err => { console.error('\n❌ Error fatal:', err.message); process.exit(1) })
