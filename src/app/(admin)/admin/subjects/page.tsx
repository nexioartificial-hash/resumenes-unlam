'use client'

import { useEffect, useState } from 'react'

interface Subject {
  id:          string
  name:        string
  slug:        string
  color:       string
  description: string | null
  order_index: number
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [editing,  setEditing]  = useState<Subject | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => {
    fetch('/api/admin/subjects').then(r => r.json()).then(setSubjects)
  }, [])

  async function save() {
    if (!editing) return
    setSaving(true)
    const res  = await fetch('/api/admin/subjects', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(editing),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setSubjects(prev => prev.map(s => s.id === data.id ? data : s))
      setEditing(null)
      setMsg('Guardado correctamente')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-tinta/40 text-[10px] font-bold tracking-widest">ADMIN</p>
        <h1 className="font-display text-verde text-3xl mt-1">MATERIAS</h1>
      </div>

      {msg && <p className="text-verde bg-verde/10 border border-verde/20 rounded-xl px-4 py-2 text-sm mb-4">{msg}</p>}

      <div className="space-y-2">
        {subjects.map(s => (
          <div key={s.id} className="bg-white border border-tinta/5 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            {editing?.id === s.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: editing.color }} />
                  <p className="font-display text-verde text-lg">{s.name.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">COLOR (hex)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={editing.color}
                      onChange={e => setEditing({ ...editing, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-tinta/10 bg-transparent"
                    />
                    <input
                      type="text"
                      value={editing.color}
                      onChange={e => setEditing({ ...editing, color: e.target.value })}
                      className="bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta font-mono w-32 focus:outline-none focus:ring-2 focus:ring-verde/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">DESCRIPCIÓN</label>
                  <textarea
                    value={editing.description ?? ''}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    rows={2}
                    className="w-full bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta resize-none focus:outline-none focus:ring-2 focus:ring-verde/30"
                    placeholder="Descripción breve de la materia..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">ORDEN</label>
                  <input
                    type="number"
                    value={editing.order_index}
                    onChange={e => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })}
                    className="bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta w-24 focus:outline-none focus:ring-2 focus:ring-verde/30"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="bg-amarillo text-tinta font-bold px-4 py-2 rounded-xl text-xs tracking-wider hover:bg-amarillo/80 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'GUARDANDO...' : 'GUARDAR'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-tinta/40 hover:text-tinta text-xs font-bold px-4 py-2 transition-colors"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="font-display text-verde text-base">{s.name.toUpperCase()}</p>
                    <p className="text-tinta/30 text-xs mt-0.5 font-mono">{s.slug}</p>
                    {s.description && <p className="text-tinta/50 text-xs mt-1">{s.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(s)}
                  className="text-[10px] font-bold tracking-wider text-tinta/30 hover:text-verde transition-colors px-3 py-1.5 rounded-xl hover:bg-verde/10"
                >
                  EDITAR
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
