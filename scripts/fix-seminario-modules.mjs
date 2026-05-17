import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── helpers ──────────────────────────────────────────────────────────────────
function removeHeading(body, heading) {
  // Removes exactly the heading line (with trailing newline)
  return body.replace(new RegExp(`^${escRe(heading)}\\n`, 'm'), '')
}

function renameHeading(body, oldHeading, newHeading) {
  return body.replace(new RegExp(`^${escRe(oldHeading)}$`, 'm'), newHeading)
}

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function removeFromHeadingToEnd(body, heading) {
  const idx = body.indexOf('\n' + heading)
  if (idx === -1) return body
  return body.slice(0, idx).trimEnd() + '\n'
}

// ── Obtener módulos ───────────────────────────────────────────────────────────
const { data: subject } = await supabase
  .from('subjects').select('id').eq('slug', 'seminario').single()
const subjectId = subject.id

const { data: modules } = await supabase
  .from('modules')
  .select('id, title, order_index, body')
  .eq('subject_id', subjectId)
  .eq('is_published', true)
  .order('order_index')

const byOrder = Object.fromEntries(modules.map(m => [m.order_index, m]))

// ── Fixes por módulo ─────────────────────────────────────────────────────────

const fixes = []

// ── Módulo 2: quitar encabezado vacío "## EL TEXTO" ──────────────────────────
{
  let body = byOrder[2].body
  body = removeHeading(body, '## EL TEXTO')
  fixes.push({ id: byOrder[2].id, order: 2, body, label: 'Módulo 2 — quitar ## EL TEXTO vacío' })
}

// ── Módulo 3: consolidar 7 → 4 submodulos ────────────────────────────────────
{
  let body = byOrder[3].body

  // 3.2 ADECUACIÓN absorbe a 3.3 CORRECCIÓN (renombrar 3.2, quitar heading 3.3)
  body = renameHeading(body, '## 3.2 ADECUACIÓN', '## 3.2 ADECUACIÓN Y CORRECCIÓN')
  body = removeHeading(body, '## 3.3 CORRECCIÓN')

  // 3.4 CONCIENCIA RETÓRICA absorbe a 3.5 ETHOS ACADÉMICO → nuevo heading 3.3
  body = renameHeading(body, '## 3.4 CONCIENCIA RETÓRICA', '## 3.3 CONCIENCIA RETÓRICA Y ETHOS ACADÉMICO')
  body = removeHeading(body, '## 3.5 ETHOS ACADÉMICO')

  // 3.6 COMUNIDAD DISCURSIVA absorbe a 3.7 COMUNIDAD ACADÉMICA → nuevo heading 3.4
  body = renameHeading(body, '## 3.6 COMUNIDAD DISCURSIVA', '## 3.4 COMUNIDADES DISCURSIVAS Y ACADÉMICA')
  body = removeHeading(body, '## 3.7 COMUNIDAD ACADÉMICA')

  fixes.push({ id: byOrder[3].id, order: 3, body, label: 'Módulo 3 — consolidar 7 → 4 submodulos' })
}

// ── Módulo 4: renumerar y aplanar niveles ────────────────────────────────────
{
  let body = byOrder[4].body

  // 4.4 LA EXPOSICIÓN pasa a ser 4.3 (overview que engloba explicación + argumentación)
  body = renameHeading(body, '## 4.4 LA EXPOSICIÓN: EXPLICAR/ARGUMENTAR', '## 4.3 LA EXPOSICIÓN')

  // 4.4.1 y 4.4.2 suben de nivel y pasan a ser 4.4 y 4.5
  body = renameHeading(body, '## 4.4.1 LA EXPLICACIÓN', '## 4.4 LA EXPLICACIÓN')
  body = renameHeading(body, '## 4.4.2 LA ARGUMENTACIÓN', '## 4.5 LA ARGUMENTACIÓN')

  fixes.push({ id: byOrder[4].id, order: 4, body, label: 'Módulo 4 — renumerar: 4.3 Exposición, 4.4 Explicación, 4.5 Argumentación' })
}

// ── Módulo 8: quitar vacío, fusionar 8.3 duplicado, renumerar ────────────────
{
  let body = byOrder[8].body

  // Quitar encabezado vacío
  body = removeHeading(body, '## 8. ENUNCIACIÓN Y POLIFONÍA')

  // Hay dos "## 8.3 POLIFONÍA ENUNCIATIVA". El primero es más corto.
  // Lo renombramos a 8.2 y quitamos el heading del segundo (su contenido se une al de 8.2).
  // Estrategia: hacer la primera ocurrencia → 8.2, y remover solo la segunda ocurrencia del heading.
  const firstIdx  = body.indexOf('## 8.3 POLIFONÍA ENUNCIATIVA')
  const secondIdx = body.indexOf('## 8.3 POLIFONÍA ENUNCIATIVA', firstIdx + 1)

  if (firstIdx !== -1) {
    body = body.slice(0, firstIdx) + '## 8.2 POLIFONÍA ENUNCIATIVA' + body.slice(firstIdx + '## 8.3 POLIFONÍA ENUNCIATIVA'.length)
  }
  if (secondIdx !== -1) {
    // El índice del segundo puede haber cambiado por la edición anterior (mismo largo de heading, OK)
    const si = body.indexOf('## 8.3 POLIFONÍA ENUNCIATIVA')
    if (si !== -1) {
      body = body.slice(0, si) + body.slice(si + '## 8.3 POLIFONÍA ENUNCIATIVA'.length + 1) // +1 para el \n
    }
  }

  // 8.4 pasa a ser 8.3
  body = renameHeading(body, '## 8.4 MODOS DE REALIZAR LA REFERENCIA BIBLIOGRÁFICA', '## 8.3 REFERENCIA BIBLIOGRÁFICA')

  fixes.push({ id: byOrder[8].id, order: 8, body, label: 'Módulo 8 — quitar vacío, fusionar 8.3 duplicado, renumerar' })
}

// ── Módulo 9: quitar vacío, renumerar, quitar marca de agua ──────────────────
{
  let body = byOrder[9].body

  // Quitar encabezado vacío
  body = removeHeading(body, '## 9. GÉNEROS ACADÉMICOS PRODUCIDOS POR ESTUDIANTES')

  // Renumerar: 9.3 → 9.2, 9.5 → 9.3
  body = renameHeading(body, '## 9.3 EL RESUMEN', '## 9.2 EL RESUMEN')
  body = renameHeading(body, '## 9.5 EL PARCIAL', '## 9.3 EL PARCIAL')

  // Quitar marca de agua y todo lo que sigue
  body = removeFromHeadingToEnd(body, '## @RESUMENES.UNLAM')

  fixes.push({ id: byOrder[9].id, order: 9, body, label: 'Módulo 9 — quitar vacío, renumerar 9.2/9.3, quitar watermark' })
}

// ── Previsualización ─────────────────────────────────────────────────────────
console.log('\n📋 CAMBIOS A APLICAR:\n')
for (const f of fixes) {
  console.log(`\n  ✏️  ${f.label}`)
  const headings = f.body.split('\n').filter(l => l.startsWith('## '))
  headings.forEach(h => console.log('      ', h))
}

// ── Aplicar en Supabase ───────────────────────────────────────────────────────
console.log('\n🚀 Aplicando cambios...\n')
for (const f of fixes) {
  const { error } = await supabase
    .from('modules')
    .update({ body: f.body })
    .eq('id', f.id)

  if (error) console.error(`❌ Módulo ${f.order}: ${error.message}`)
  else       console.log(`✅ Módulo ${f.order} actualizado`)
}

console.log('\n🎉 Listo. Recargá la plataforma para ver los cambios.\n')
