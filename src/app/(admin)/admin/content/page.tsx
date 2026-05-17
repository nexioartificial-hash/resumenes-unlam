'use client'

import { useEffect, useState } from 'react'

interface Subject { id: string; name: string; slug: string }
interface ContentItem {
  id:               string
  subject_id:       string
  title:            string
  type:             'summary' | 'guide' | 'exam_model' | 'audio'
  body:             string | null
  audio_url:        string | null
  duration_seconds: number | null
  order_index:      number
  is_published:     boolean
  subjects:         { name: string }
}

const TYPE_LABELS = { summary: 'Resumen', guide: 'Guía', exam_model: 'Modelo Examen', audio: 'Audio' }

type FormType = 'summary' | 'guide' | 'exam_model' | 'audio'
interface ContentForm {
  subject_id: string; title: string; type: FormType
  body: string; audio_url: string; duration_seconds: number; order_index: number; is_published: boolean
}
const EMPTY_FORM: ContentForm = {
  subject_id: '', title: '', type: 'summary',
  body: '', audio_url: '', duration_seconds: 0, order_index: 0, is_published: true,
}

export default function AdminContentPage() {
  const [subjects,  setSubjects]  = useState<Subject[]>([])
  const [items,     setItems]     = useState<ContentItem[]>([])
  const [filter,    setFilter]    = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState<ContentItem | null>(null)
  const [form,      setForm]      = useState<ContentForm>(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg,       setMsg]       = useState('')

  useEffect(() => {
    fetch('/api/admin/subjects').then(r => r.json()).then(setSubjects)
    loadItems()
  }, [])

  async function loadItems(subjectId = '') {
    const url = subjectId ? `/api/admin/content?subject_id=${subjectId}` : '/api/admin/content'
    const data = await fetch(url).then(r => r.json())
    setItems(data)
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, subject_id: filter || subjects[0]?.id || '' })
    setShowForm(true)
  }

  function openEdit(item: ContentItem) {
    setEditing(item)
    setForm({
      subject_id:       item.subject_id,
      title:            item.title,
      type:             item.type,
      body:             item.body ?? '',
      audio_url:        item.audio_url ?? '',
      duration_seconds: item.duration_seconds ?? 0,
      order_index:      item.order_index,
      is_published:     item.is_published,
    })
    setShowForm(true)
  }

  async function save() {
    setSaving(true)
    const payload = {
      ...form,
      body:             form.body || null,
      audio_url:        form.audio_url || null,
      duration_seconds: form.duration_seconds || null,
    }
    const res = editing
      ? await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      : await fetch('/api/admin/content', { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      loadItems(filter)
      setMsg(editing ? 'Ítem actualizado' : 'Ítem creado')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('¿Eliminar este ítem?')) return
    await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = filter ? items.filter(i => i.subject_id === filter) : items

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-tinta/40 text-[10px] font-bold tracking-widest">ADMIN</p>
          <h1 className="font-display text-verde text-3xl mt-1">CONTENIDO</h1>
        </div>
        <button onClick={openCreate} className="bg-amarillo text-tinta font-bold px-5 py-2.5 rounded-lg text-xs tracking-wider hover:bg-amarillo/80 transition-colors">
          + NUEVO ÍTEM
        </button>
      </div>

      {msg && <p className="text-verde bg-verde/10 border border-verde/20 rounded-lg px-4 py-2 text-sm mb-4">{msg}</p>}

      {/* Filtro por materia */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => { setFilter(''); loadItems('') }} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${!filter ? 'bg-amarillo text-tinta' : 'bg-tinta/5 text-tinta/60 hover:bg-tinta/10'}`}>
          TODAS
        </button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => { setFilter(s.id); loadItems(s.id) }} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${filter === s.id ? 'bg-amarillo text-tinta' : 'bg-tinta/5 text-tinta/60 hover:bg-tinta/10'}`}>
            {s.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-tinta/30 text-sm">Sin ítems de contenido</div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="bg-white border border-tinta/5 rounded-xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider shrink-0 ${item.is_published ? 'bg-verde/20 text-verde' : 'bg-tinta/10 text-tinta/40'}`}>
                {TYPE_LABELS[item.type]}
              </span>
              <div className="min-w-0">
                <p className="text-tinta text-sm font-bold truncate">{item.title}</p>
                <p className="text-tinta/40 text-xs">{(item.subjects as unknown as { name: string })?.name} · orden {item.order_index}</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => openEdit(item)} className="text-xs text-tinta/40 hover:text-amarillo transition-colors font-bold">EDITAR</button>
              <button onClick={() => deleteItem(item.id)} className="text-xs text-tinta/40 hover:text-rojo transition-colors font-bold">ELIMINAR</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white border border-tinta/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amarillo/50 to-transparent rounded-t-2xl" />
            <h2 className="font-display text-verde text-xl mb-5">
              {editing ? 'EDITAR ÍTEM' : 'NUEVO ÍTEM'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">MATERIA</label>
                  <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30">
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">TIPO</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof f.type }))} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30">
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">TÍTULO</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30" placeholder="Título del ítem" />
              </div>
              {form.type !== 'audio' && (
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">CONTENIDO (Markdown)</label>
                  <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={10} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30 font-mono resize-y" placeholder="# Título&#10;&#10;Contenido en Markdown..." />
                </div>
              )}
              {form.type === 'audio' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">SUBIR ARCHIVO DE AUDIO</label>
                    <input
                      type="file"
                      accept="audio/*"
                      disabled={uploading}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        const fd = new FormData()
                        fd.append('file', file)
                        const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                        const data = await res.json()
                        setUploading(false)
                        if (res.ok) setForm(f => ({ ...f, audio_url: data.url }))
                        else alert(data.error ?? 'Error al subir')
                      }}
                      className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta/70 file:mr-3 file:bg-amarillo file:text-tinta file:font-bold file:text-xs file:px-3 file:py-1 file:rounded file:border-0 file:cursor-pointer disabled:opacity-50"
                    />
                    {uploading && <p className="text-xs text-amarillo mt-1">Subiendo audio...</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">URL DEL AUDIO</label>
                      <input value={form.audio_url} onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30" placeholder="https://... (se completa automáticamente al subir)" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">DURACIÓN (segundos)</label>
                      <input type="number" value={form.duration_seconds} onChange={e => setForm(f => ({ ...f, duration_seconds: parseInt(e.target.value) || 0 }))} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30" />
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">ORDEN</label>
                  <input type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} className="w-full bg-crema border border-tinta/15 rounded-lg px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-amarillo" />
                    <span className="text-sm text-tinta font-bold">Publicado</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="bg-amarillo text-tinta font-bold px-6 py-2.5 rounded-lg text-xs tracking-wider hover:bg-amarillo/80 transition-colors disabled:opacity-50">
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-tinta/40 hover:text-tinta font-bold text-xs px-4 transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
