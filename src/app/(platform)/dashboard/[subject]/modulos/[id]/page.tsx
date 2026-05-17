'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Question {
  question:      string
  options:       string[]
  correct_index: number
  explanation:   string
}

interface Section {
  heading: string
  id:      string
  body:    string
}

type Phase = 'loading' | 'reading' | 'completing' | 'done' | 'quiz' | 'results'

function parseSections(body: string): Section[] {
  const lines    = body.split('\n')
  const sections: Section[] = []
  let current: Section | null = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      const heading = line.replace(/^##\s+/, '')
      current = {
        heading,
        id: heading.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, '-'),
        body: '',
      }
    } else if (current) {
      current.body += line + '\n'
    }
  }
  if (current) sections.push(current)
  return sections
}

export default function ModulePage() {
  const { subject: slug, id: moduleId } = useParams<{ subject: string; id: string }>()
  const router = useRouter()

  const [title,     setTitle]     = useState('')
  const [sections,  setSections]  = useState<Section[]>([])
  const [completed, setCompleted] = useState(false)
  const [phase,     setPhase]     = useState<Phase>('loading')
  const [error,     setError]     = useState('')
  const [activeId,  setActiveId]  = useState('')

  // quiz
  const [questions,   setQuestions]   = useState<Question[]>([])
  const [moduleTitle, setModuleTitle] = useState('')
  const [current,     setCurrent]     = useState(0)
  const [selected,    setSelected]    = useState<number | null>(null)
  const [answered,    setAnswered]    = useState(false)
  const [score,       setScore]       = useState(0)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const load = useCallback(async () => {
    const res = await fetch(`/api/subjects/${slug}/modules/${moduleId}`)
    if (!res.ok) { setError('Módulo no encontrado'); setPhase('reading'); return }
    const data = await res.json()
    setTitle(data.title)
    const parsed = parseSections(data.body ?? '')
    setSections(parsed)
    if (parsed.length > 0) setActiveId(parsed[0].id)
    setCompleted(data.completed)
    setPhase('reading')
  }, [slug, moduleId])

  useEffect(() => { load() }, [load])

  // Observer para resaltar sección activa al hacer scroll
  useEffect(() => {
    if (phase !== 'reading' || sections.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections, phase])

  async function markComplete() {
    setPhase('completing')
    await fetch(`/api/subjects/${slug}/modules/${moduleId}/complete`, { method: 'POST' })
    setCompleted(true)
    const res = await fetch(`/api/subjects/${slug}/modules/${moduleId}/quiz`, { method: 'POST' })
    if (!res.ok) { setPhase('done'); return }
    const data = await res.json()
    setQuestions(data.questions)
    setModuleTitle(data.module_title)
    setCurrent(0); setSelected(null); setAnswered(false); setScore(0)
    setPhase('quiz')
  }

  async function retakeQuiz() {
    setPhase('completing')
    const res = await fetch(`/api/subjects/${slug}/modules/${moduleId}/quiz`, { method: 'POST' })
    if (!res.ok) { setPhase('done'); return }
    const data = await res.json()
    setQuestions(data.questions)
    setModuleTitle(data.module_title)
    setCurrent(0); setSelected(null); setAnswered(false); setScore(0)
    setPhase('quiz')
  }

  function answer(idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (idx === questions[current].correct_index) setScore(s => s + 1)
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1); setSelected(null); setAnswered(false)
    } else {
      setPhase('results')
    }
  }

  // ── Loading ────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="flex items-center justify-center h-64 text-tinta/40 text-sm">Cargando módulo...</div>
  )
  if (error) return (
    <div className="flex items-center justify-center h-64 text-rojo text-sm">{error}</div>
  )

  // ── Guardando / Cargando quiz ──────────────────────────────────────
  if (phase === 'completing') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-tinta/5 text-center">
        <div className="text-5xl mb-4 animate-pulse">📝</div>
        <p className="font-display text-verde text-xl">CARGANDO QUIZ...</p>
        <p className="text-tinta/40 text-sm mt-2">Un momento</p>
      </div>
    </div>
  )

  // ── Completado sin quiz ────────────────────────────────────────────
  if (phase === 'done') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-tinta/5 text-center">
        <div className="text-6xl mb-4">✅</div>
        <p className="font-display text-3xl text-tinta mb-2">¡Módulo completado!</p>
        <p className="text-tinta/50 text-sm mb-8">Este módulo no tiene quiz asociado.</p>
        <button
          onClick={() => router.push(`/dashboard/${slug}`)}
          className="bg-verde text-crema font-bold px-6 py-2.5 rounded-xl text-sm tracking-wider hover:bg-verde/80 transition-colors"
        >
          VOLVER A MÓDULOS →
        </button>
      </div>
    </div>
  )

  // ── Quiz ───────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = questions[current]
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold tracking-widest text-tinta/40">QUIZ — {moduleTitle.toUpperCase()}</p>
            <p className="text-xs font-bold text-tinta/40">{current + 1} / {questions.length}</p>
          </div>
          <div className="w-full bg-tinta/10 rounded-full h-1.5 mb-6">
            <div className="bg-verde h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
          <p className="font-display text-tinta text-lg mb-6">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'border-tinta/20 text-tinta/80 hover:border-verde hover:bg-verde/5'
              if (answered) {
                if (i === q.correct_index)   cls = 'border-verde bg-verde/10 text-verde font-bold'
                else if (i === selected)      cls = 'border-rojo bg-rojo/10 text-rojo'
                else                         cls = 'border-tinta/10 text-tinta/40'
              } else if (selected === i)    cls = 'border-verde bg-verde/10 text-verde'
              return (
                <button key={i} onClick={() => answer(i)} disabled={answered}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${cls}`}>
                  <span className="font-bold mr-2">{['A','B','C','D'][i]}.</span>{opt}
                </button>
              )
            })}
          </div>
          {answered && (
            <div className="mt-4 bg-tinta/5 rounded-xl px-4 py-3">
              <p className="text-xs text-tinta/60">{q.explanation}</p>
            </div>
          )}
        </div>
        {answered && (
          <button onClick={next} className="w-full bg-verde text-crema font-bold py-3 rounded-xl tracking-wider hover:bg-verde/80 transition-colors">
            {current + 1 < questions.length ? 'SIGUIENTE →' : 'VER RESULTADOS →'}
          </button>
        )}
      </div>
    )
  }

  // ── Resultados ─────────────────────────────────────────────────────
  if (phase === 'results') {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 text-center">
          <div className="text-6xl mb-4">{pct >= 70 ? '🎉' : '📚'}</div>
          <p className="font-display text-3xl text-tinta mb-1">{score} / {questions.length}</p>
          <p className={`text-lg font-bold mb-2 ${pct >= 70 ? 'text-verde' : 'text-amarillo'}`}>{pct}% correcto</p>
          <p className="text-tinta/50 text-sm mb-8">
            {pct >= 90 ? '¡Excelente! Dominás el tema.' : pct >= 70 ? 'Buen trabajo. Repasá los errores.' : 'Te recomendamos releer el módulo.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={retakeQuiz} className="bg-amarillo/20 text-tinta font-bold px-6 py-2.5 rounded-xl text-sm tracking-wider hover:bg-amarillo/30 transition-colors">
              REPETIR QUIZ
            </button>
            <button onClick={() => router.push(`/dashboard/${slug}`)} className="bg-verde text-crema font-bold px-6 py-2.5 rounded-xl text-sm tracking-wider hover:bg-verde/80 transition-colors">
              VOLVER A MÓDULOS →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Lectura ────────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 max-w-5xl mx-auto">
      {/* Índice lateral */}
      {sections.length > 1 && (
        <aside className="w-52 shrink-0 hidden lg:block">
          <div className="sticky top-4 bg-white rounded-2xl p-4 shadow-sm border border-tinta/5">
            <p className="text-[10px] font-bold tracking-widest text-tinta/30 mb-3">CONTENIDO</p>
            <nav className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setActiveId(s.id)
                  }}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors leading-tight ${
                    activeId === s.id
                      ? 'bg-verde/10 text-verde font-bold'
                      : 'text-tinta/50 hover:text-tinta hover:bg-tinta/5'
                  }`}
                >
                  {s.heading}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 mb-4 flex items-center gap-3">
          <button onClick={() => router.push(`/dashboard/${slug}`)} className="text-tinta/40 hover:text-tinta transition-colors text-sm shrink-0">
            ← Módulos
          </button>
          <div className="h-4 w-px bg-tinta/20 shrink-0" />
          <h1 className="font-display text-verde text-lg flex-1 leading-tight">{title}</h1>
          {completed && (
            <span className="text-[10px] font-bold tracking-widest text-verde bg-verde/10 px-2 py-1 rounded shrink-0">✓ LEÍDO</span>
          )}
        </div>

        {/* Secciones */}
        <div className="space-y-4">
          {sections.map((s, idx) => (
            <div
              key={s.id}
              id={s.id}
              ref={el => { sectionRefs.current[s.id] = el }}
              className="bg-white rounded-2xl shadow-sm border border-tinta/5 overflow-hidden scroll-mt-4"
            >
              {/* Cabecera de sección */}
              <div className="px-6 py-4 border-b border-tinta/5 bg-tinta/[0.02] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-verde/10 text-verde text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h2 className="font-display text-tinta text-base">{s.heading}</h2>
              </div>
              {/* Contenido de sección */}
              <div className="px-6 py-5">
                <div className="prose prose-sm max-w-none
                  prose-headings:font-display prose-headings:text-verde
                  prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-h3:font-bold
                  prose-p:text-tinta/80 prose-p:leading-relaxed
                  prose-strong:text-tinta
                  prose-li:text-tinta/80
                  prose-table:text-sm
                  prose-th:bg-verde/10 prose-th:text-verde prose-th:font-bold prose-th:px-3 prose-th:py-2
                  prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-tinta/5
                  prose-tr:even:bg-tinta/[0.02]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acción */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 mt-4">
          {completed ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-tinta/60">Ya completaste este módulo.</p>
              {questions.length > 0 && (
                <button onClick={retakeQuiz} className="bg-amarillo text-tinta font-bold px-6 py-2.5 rounded-xl text-sm tracking-wider hover:bg-amarillo/80 transition-colors">
                  HACER QUIZ NUEVAMENTE →
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-tinta/60">¿Terminaste de leer este módulo?</p>
              <button onClick={markComplete} className="bg-verde text-crema font-bold px-6 py-2.5 rounded-xl text-sm tracking-wider hover:bg-verde/80 transition-colors">
                MARCAR COMO LEÍDO Y HACER QUIZ →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
