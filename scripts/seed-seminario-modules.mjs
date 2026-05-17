import { createClient }  from '@supabase/supabase-js'
import * as dotenv       from 'dotenv'
import path              from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Obtener subject_id de Seminario
const { data: subject } = await supabase
  .from('subjects').select('id').eq('slug', 'seminario').single()
const subjectId = subject.id

// Obtener el resumen
const { data: item } = await supabase
  .from('content_items')
  .select('body')
  .ilike('title', '%Resumen%Seminario%')
  .single()

// Limpiar marcas de agua del PDF
const body = item.body.replace(/\n## @RESUMENES\.UNLAM\n/g, '\n')

// 8 módulos numerados como el PDF: 1, 2, 3, 4, (sin 5), 6, 7, 8, 9
// "EL TEXTO" es el título de la sección 2 y se incluye como parte de ese módulo
const MODULES = [
  { title: '1. Introducción: Lectura y Escritura Académicas',   start: /## 1\.INTRODUCCIÓN/,                              order: 1 },
  { title: '2. El Texto',                                       start: /## EL TEXTO/,                                     order: 2 },
  { title: '3. Texto, Enunciado y Discurso',                    start: /## 3\.1 TEXTO, ENUNCIADO/,                        order: 3 },
  { title: '4. Géneros Discursivos y Secuencias Textuales',     start: /## 4\.1 GÉNEROS DISCURSIVOS/,                     order: 4 },
  { title: '6. La Lectura',                                     start: /## 6\.1 LA LECTURA/,                              order: 6 },
  { title: '7. La Escritura',                                   start: /## 7\.1 LA ESCRITURA/,                            order: 7 },
  { title: '8. Enunciación y Polifonía',                        start: /## 8\. ENUNCIACIÓN Y POLIFONÍA/,                  order: 8 },
  { title: '9. Géneros Académicos Producidos por Estudiantes',  start: /## 9\. GÉNEROS ACADÉMICOS PRODUCIDOS/,            order: 9 },
]

// Encontrar posición de cada sección en el body
const positions = MODULES.map(m => ({ ...m, pos: body.search(m.start) }))
                          .filter(m => m.pos >= 0)
                          .sort((a, b) => a.pos - b.pos)

if (positions.length !== MODULES.length) {
  const missing = MODULES.filter(m => body.search(m.start) < 0).map(m => m.title)
  console.error('❌ No se encontraron estas secciones en el body:', missing)
  process.exit(1)
}

// Extraer el body de cada módulo (desde su inicio hasta el inicio del siguiente)
for (let i = 0; i < positions.length; i++) {
  const start = positions[i].pos
  const end   = i + 1 < positions.length ? positions[i + 1].pos : body.length
  positions[i].body = body.slice(start, end).trim()
}

console.log(`\n📚 Insertando ${positions.length} módulos para Seminario...\n`)

for (const mod of positions) {
  const { error } = await supabase.from('modules').insert({
    subject_id:  subjectId,
    title:       mod.title,
    body:        mod.body,
    order_index: mod.order,
    is_published: true,
  })
  if (error) console.error(`❌ ${mod.title}: ${error.message}`)
  else       console.log(`✅ ${mod.title}`)
}

console.log('\n🎉 Listo. Revisá los módulos en /admin/modules o desde la plataforma.\n')
