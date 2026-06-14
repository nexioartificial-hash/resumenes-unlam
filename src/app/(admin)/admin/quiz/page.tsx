'use client'

import { useEffect, useState } from 'react'

interface Subject { id: string; name: string }
interface Option  { text: string; is_correct: boolean }
interface Question {
  id:          string
  subject_id:  string
  question:    string
  options:     Option[]
  difficulty:  'easy' | 'medium' | 'hard'
  explanation: string | null
  is_published: boolean
  order_index: number
  subjects:    { name: string }
}

const DIFF_LABELS = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' }
const EMPTY_OPTS: Option[] = [
  { text: '', is_correct: false },
  { text: '', is_correct: true  },
  { text: '', is_correct: false },
  { text: '', is_correct: false },
]

export default function AdminQuizPage() {
  const [subjects,   setSubjects]   = useState<Subject[]>([])
  const [questions,  setQuestions]  = useState<Question[]>([])
  const [filter,     setFilter]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState<Question | null>(null)
  const [form, setForm] = useState({
    subject_id: '', question: '', difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    explanation: '', order_index: 0, is_published: true,
    options: EMPTY_OPTS.map(o => ({ ...o })),
  })
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')

  useEffect(() => {
    fetch('/api/admin/subjects').then(r => r.json()).then(setSubjects)
    loadQuestions()
  }, [])

  async function loadQuestions(subjectId = '') {
    const url = subjectId ? `/api/admin/quiz?subject_id=${subjectId}` : '/api/admin/quiz'
    setQuestions(await fetch(url).then(r => r.json()))
  }

  function setOptionText(i: number, text: string) {
    setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? { ...o, text } : o) }))
  }

  function setOptionCorrect(i: number) {
    setForm(f => ({ ...f, options: f.options.map((o, idx) => ({ ...o, is_correct: idx === i })) }))
  }

  function openCreate() {
    setEditing(null)
    setForm({ subject_id: filter || subjects[0]?.id || '', question: '', difficulty: 'medium', explanation: '', order_index: 0, is_published: true, options: EMPTY_OPTS.map(o => ({ ...o })) })
    setShowForm(true)
  }

  function openEdit(q: Question) {
    setEditing(q)
    setForm({ subject_id: q.subject_id, question: q.question, difficulty: q.difficulty, explanation: q.explanation ?? '', order_index: q.order_index, is_published: q.is_published, options: q.options.map(o => ({ ...o })) })
    setShowForm(true)
  }

  async function save() {
    if (!form.options.some(o => o.is_correct)) return alert('Marcá una opción como correcta')
    setSaving(true)
    const res = editing
      ? await fetch('/api/admin/quiz', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      : await fetch('/api/admin/quiz', { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      loadQuestions(filter)
      setMsg(editing ? 'Pregunta actualizada' : 'Pregunta creada')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  async function deleteQ(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await fetch(`/api/admin/quiz?id=${id}`, { method: 'DELETE' })
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const filtered = filter ? questions.filter(q => q.subject_id === filter) : questions
  const DIFF_COLOR = { easy: 'text-verde bg-verde/20', medium: 'text-amarillo bg-amarillo/20', hard: 'text-rojo bg-rojo/20' }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-tinta/40 text-[10px] font-bold tracking-widest">ADMIN</p>
          <h1 className="font-display text-verde text-3xl mt-1">QUIZ</h1>
        </div>
        <button onClick={openCreate} className="bg-amarillo text-tinta font-bold px-5 py-2.5 rounded-xl text-xs tracking-wider hover:bg-amarillo/80 transition-colors">
          + NUEVA PREGUNTA
        </button>
      </div>

      {msg && <p className="text-verde bg-verde/10 border border-verde/20 rounded-xl px-4 py-2 text-sm mb-4">{msg}</p>}

      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => { setFilter(''); loadQuestions('') }} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${!filter ? 'bg-amarillo text-tinta' : 'bg-tinta/5 text-tinta/60 hover:bg-tinta/10'}`}>TODAS</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => { setFilter(s.id); loadQuestions(s.id) }} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${filter === s.id ? 'bg-amarillo text-tinta' : 'bg-tinta/5 text-tinta/60 hover:bg-tinta/10'}`}>
            {s.name.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-12 text-tinta/30 text-sm">Sin preguntas</div>}
        {filtered.map(q => (
          <div key={q.id} className="bg-white border border-tinta/5 rounded-xl shadow-sm px-5 py-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider shrink-0 mt-0.5 ${DIFF_COLOR[q.difficulty]}`}>
                {DIFF_LABELS[q.difficulty].toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-tinta text-sm leading-snug line-clamp-2">{q.question}</p>
                <p className="text-tinta/40 text-xs mt-1">{(q.subjects as unknown as { name: string })?.name}</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => openEdit(q)} className="text-xs text-tinta/40 hover:text-amarillo transition-colors font-bold">EDITAR</button>
              <button onClick={() => deleteQ(q.id)} className="text-xs text-tinta/40 hover:text-rojo transition-colors font-bold">ELIMINAR</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white border border-tinta/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amarillo/50 to-transparent rounded-t-2xl" />
            <h2 className="font-display text-verde text-xl mb-5">{editing ? 'EDITAR PREGUNTA' : 'NUEVA PREGUNTA'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">MATERIA</label>
                  <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} className="w-full bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30">
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">DIFICULTAD</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as typeof f.difficulty }))} className="w-full bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30">
                    <option value="easy">Fácil</option>
                    <option value="medium">Medio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">PREGUNTA</label>
                <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={3} className="w-full bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30 resize-none" placeholder="Texto de la pregunta..." />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-2">OPCIONES <span className="text-tinta/30 normal-case font-normal">(marcá la correcta)</span></label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct"
                        checked={opt.is_correct}
                        onChange={() => setOptionCorrect(i)}
                        className="w-4 h-4 accent-amarillo shrink-0"
                      />
                      <span className="text-tinta/40 text-xs font-bold w-4 shrink-0">{String.fromCharCode(65 + i)})</span>
                      <input
                        value={opt.text}
                        onChange={e => setOptionText(i, e.target.value)}
                        className="flex-1 bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30"
                        placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">EXPLICACIÓN <span className="text-tinta/30 normal-case font-normal">(opcional)</span></label>
                <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2} className="w-full bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30 resize-none" placeholder="Por qué esta opción es correcta..." />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-[10px] font-bold tracking-widest text-tinta/40 block mb-1">ORDEN</label>
                  <input type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} className="bg-crema border border-tinta/15 rounded-xl px-3 py-2 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-verde/30 w-24" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-amarillo" />
                  <span className="text-sm text-tinta font-bold">Publicada</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="bg-amarillo text-tinta font-bold px-6 py-2.5 rounded-xl text-xs tracking-wider hover:bg-amarillo/80 transition-colors disabled:opacity-50">
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-tinta/40 hover:text-tinta font-bold text-xs px-4 transition-colors">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
