// ⚠️ PÁGINA TEMPORAL DE PREVIEW — borrar tras revisar el diseño.
// Lee los módulos corregidos desde scripts/_audit_logica/fixed/ (sin base de datos)
// y los renderiza con el MarkdownRenderer real (figuras SVG) y el CSS real.
import fs from 'node:fs'
import path from 'node:path'
import MarkdownRenderer from '@/components/content/MarkdownRenderer'

export const dynamic = 'force-static'

const TEMAS: Record<number, string> = {
  1: 'Lógica',
  2: 'Teoría de conjuntos',
  3: 'Funciones',
  4: 'Análisis combinatorio',
  5: 'Probabilidades',
  6: 'Estadística',
}

export default function PreviewLogica() {
  const dir = path.join(process.cwd(), 'scripts', '_audit_logica', 'fixed')
  // Los .md viven solo localmente (gitignorados). En entornos sin esos archivos
  // (p. ej. el build de Vercel) no debe romper el build: se omite el módulo.
  const mods = [1, 2, 3, 4, 5, 6]
    .map((n) => {
      try {
        return { n, body: fs.readFileSync(path.join(dir, `modulo_0${n}.md`), 'utf8') }
      } catch {
        return { n, body: '' }
      }
    })
    .filter((m) => m.body)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--crema)' }} className="py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        <p className="text-[10px] font-bold tracking-widest text-tinta/40">PREVIEW — LÓGICA MATEMÁTICA (local)</p>
        {mods.map((m) => (
          <div key={m.n} className="bg-white rounded-2xl shadow-sm border border-tinta/5 overflow-hidden">
            <div className="h-1 w-full" style={{ backgroundColor: 'var(--verde)' }} />
            <div className="p-6">
              <span className="text-[10px] font-bold tracking-widest text-tinta/40">MÓDULO {m.n}</span>
              <h2 className="font-display text-verde text-2xl mt-1 mb-4 leading-tight">
                {TEMAS[m.n].toUpperCase()}
              </h2>
              <div className="prose prose-sm max-w-none
                prose-headings:font-display prose-headings:text-verde
                prose-p:text-tinta/80 prose-p:leading-relaxed
                prose-strong:text-tinta prose-strong:font-bold
                prose-ul:text-tinta/80 prose-ol:text-tinta/80
                prose-li:marker:text-verde">
                <MarkdownRenderer breaks>{m.body}</MarkdownRenderer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
