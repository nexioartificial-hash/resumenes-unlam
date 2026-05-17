'use client'

import { useState } from 'react'

const TEMPLATE = JSON.stringify([
  {
    subject_slug: 'logica-matematica',
    title: 'Introducción a la Lógica',
    type: 'summary',
    body: '# Introducción a la Lógica\n\n## ¿Qué es una proposición?\n\nUna **proposición** es un enunciado declarativo que puede ser verdadero o falso...\n\n## Conectivos lógicos\n\n- **Conjunción (∧)**: verdadera solo cuando ambas son verdaderas\n- **Disyunción (∨)**: falsa solo cuando ambas son falsas',
    order_index: 1,
    is_published: true,
  },
  {
    subject_slug: 'logica-matematica',
    title: 'Guía de ejercicios - Tablas de verdad',
    type: 'guide',
    body: '# Guía de Tablas de Verdad\n\n## Ejercicio 1\n\nCompletá la tabla de verdad para **p ∧ q**:\n\n| p | q | p ∧ q |\n|---|---|-------|\n| V | V |       |\n| V | F |       |',
    order_index: 2,
    is_published: true,
  },
  {
    subject_slug: 'logica-matematica',
    title: 'Modelo de Examen 2023',
    type: 'exam_model',
    body: '# Modelo de Examen - Lógica Matemática\n\n**Tiempo:** 2 horas\n\n## Parte I — Opción Múltiple\n\n1. ¿Cuál de las siguientes es una tautología?...',
    order_index: 3,
    is_published: true,
  },
], null, 2)

const SLUGS = [
  'logica-matematica', 'seminario', 'fundamentos-ed-fisica',
  'filosofia', 'contabilidad', 'historia-argentina', 'biologia', 'biociencias',
]

interface ImportResult {
  imported:      number
  skipped_count: number
  skipped:       string[]
}

export default function AdminImportPage() {
  const [json,    setJson]    = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<ImportResult | null>(null)
  const [error,   setError]   = useState('')

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'template-importacion.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setJson(ev.target?.result as string)
    reader.readAsText(file)
  }

  async function importContent() {
    setError('')
    setResult(null)

    let parsed: unknown
    try { parsed = JSON.parse(json) } catch {
      setError('El JSON no es válido. Verificá la sintaxis.')
      return
    }

    setLoading(true)
    const res  = await fetch('/api/admin/import', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(parsed),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) setError(data.error ?? 'Error al importar')
    else setResult(data)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-tinta/40 text-[10px] font-bold tracking-widest">ADMIN</p>
        <h1 className="font-display text-verde text-3xl mt-1">IMPORTAR CONTENIDO</h1>
        <p className="text-tinta/50 text-sm mt-2">
          Cargá múltiples ítems de contenido de una vez desde un archivo JSON.
          Ideal para migrar resúmenes, guías y modelos desde Google Drive.
        </p>
      </div>

      {/* Slugs de referencia */}
      <div className="bg-white border border-tinta/5 rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-3">SLUGS DE MATERIAS DISPONIBLES</p>
        <div className="flex flex-wrap gap-2">
          {SLUGS.map(s => (
            <code key={s} className="bg-verde/10 text-verde text-xs px-2 py-1 rounded font-mono">{s}</code>
          ))}
        </div>
        <p className="text-tinta/30 text-xs mt-3">
          Tipos válidos: <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">summary</code> · <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">guide</code> · <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">exam_model</code> · <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">audio</code>
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={downloadTemplate}
          className="bg-verde/20 text-verde font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider hover:bg-verde/30 transition-colors"
        >
          ↓ DESCARGAR TEMPLATE
        </button>
        <label className="bg-tinta/5 text-tinta font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider hover:bg-tinta/10 transition-colors cursor-pointer">
          📂 CARGAR ARCHIVO .JSON
          <input type="file" accept=".json,application/json" onChange={loadFile} className="hidden" />
        </label>
      </div>

      {/* Editor JSON */}
      <div className="mb-4">
        <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-2">JSON DE CONTENIDO</label>
        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={18}
          className="w-full bg-crema border border-tinta/15 rounded-xl px-4 py-3 text-sm text-tinta font-mono resize-y focus:outline-none focus:ring-2 focus:ring-verde/30"
          placeholder={`[\n  {\n    "subject_slug": "logica-matematica",\n    "title": "Título del ítem",\n    "type": "summary",\n    "body": "# Contenido en Markdown...",\n    "order_index": 1,\n    "is_published": true\n  }\n]`}
        />
        <p className="text-tinta/30 text-xs mt-1">Máximo 200 ítems por importación</p>
      </div>

      {error && (
        <div className="bg-rojo/10 border border-rojo/20 rounded-xl px-4 py-3 text-sm text-rojo mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-verde/10 border border-verde/20 rounded-xl px-4 py-4 mb-4">
          <p className="text-verde font-bold text-sm">
            ✅ {result.imported} ítem{result.imported !== 1 ? 's' : ''} importado{result.imported !== 1 ? 's' : ''} correctamente
          </p>
          {result.skipped_count > 0 && (
            <div className="mt-2">
              <p className="text-amarillo text-xs font-bold">{result.skipped_count} omitido{result.skipped_count !== 1 ? 's' : ''}:</p>
              {result.skipped.map((s, i) => (
                <p key={i} className="text-tinta/50 text-xs mt-0.5">· {s}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={importContent}
        disabled={loading || !json.trim()}
        className="bg-amarillo text-tinta font-bold px-8 py-3 rounded-lg tracking-wider hover:bg-amarillo/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'IMPORTANDO...' : 'IMPORTAR'}
      </button>

      {/* Guía */}
      <div className="mt-8 bg-white border border-tinta/5 rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-4">GUÍA DE MIGRACIÓN DESDE GOOGLE DRIVE</p>
        <ol className="space-y-3 text-sm text-tinta/60">
          <li><span className="text-verde font-bold">1.</span> Descargá el template JSON y abrilo en cualquier editor de texto</li>
          <li><span className="text-verde font-bold">2.</span> Para cada PDF de Drive: abrilo, copiá el texto, pegalo como Markdown en el campo <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">body</code></li>
          <li><span className="text-verde font-bold">3.</span> Usá el formato Markdown: <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs"># Título</code>, <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">## Subtítulo</code>, <code className="bg-tinta/5 text-tinta/70 px-1 rounded font-mono text-xs">**negrita**</code></li>
          <li><span className="text-verde font-bold">4.</span> Para audios: subílos primero desde <span className="text-tinta/80">Contenido → Nuevo ítem → Tipo: Audio</span>, luego pegá la URL en el JSON</li>
          <li><span className="text-verde font-bold">5.</span> Cargá el JSON acá y hacé clic en IMPORTAR</li>
          <li><span className="text-verde font-bold">6.</span> Verificá el contenido desde la plataforma de estudiantes</li>
        </ol>
      </div>
    </div>
  )
}
