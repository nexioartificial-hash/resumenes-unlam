'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Question {
  id:       string
  question: string
  options:  string[]
}

interface Result {
  question_id:    string
  question:       string
  selected_index: number
  correct_index:  number
  is_correct:     boolean
  options:        string[]
  explanation:    string | null
}

interface Attempt {
  id:           string
  score:        number
  total:        number
  attempted_at: string
}

type Screen = 'start' | 'question' | 'feedback' | 'results'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params.subject as string

  const [screen,        setScreen]        = useState<Screen>('start')
  const [questions,     setQuestions]     = useState<Question[]>([])
  const [history,       setHistory]       = useState<Attempt[]>([])
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [selected,      setSelected]      = useState<number | null>(null)
  const [answers,       setAnswers]       = useState<{ question_id: string; selected_index: number }[]>([])
  const [lastResult,    setLastResult]    = useState<Result | null>(null)
  const [finalResults,  setFinalResults]  = useState<{ score: number; total: number; results: Result[] } | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [noQuestions,   setNoQuestions]   = useState(false)

  useEffect(() => {
    fetch(`/api/subjects/${slug}/quiz/history`)
      .then(r => r.json())
      .then(setHistory)
  }, [slug])

  async function startQuiz() {
    setLoading(true)
    const res  = await fetch(`/api/subjects/${slug}/quiz?limit=10`)
    const data = await res.json()
    setLoading(false)

    if (!data.questions || data.questions.length === 0) {
      setNoQuestions(true)
      return
    }

    setQuestions(data.questions)
    setAnswers([])
    setCurrentIndex(0)
    setSelected(null)
    setFinalResults(null)
    setScreen('question')
  }

  function confirmAnswer() {
    if (selected === null) return
    const q      = questions[currentIndex]
    const newAns = [...answers, { question_id: q.id, selected_index: selected }]
    setAnswers(newAns)

    // Feedback inmediato — necesito saber si acertó pero sin spoilear las otras
    // Por ahora mostramos feedback al final; para feedback inmediato se necesita un endpoint extra
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      submitQuiz(newAns)
    }
  }

  async function submitQuiz(finalAnswers: typeof answers) {
    setLoading(true)
    const res  = await fetch('/api/quiz/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subject_slug: slug, answers: finalAnswers }),
    })
    const data = await res.json()
    setLoading(false)
    setFinalResults(data)
    setHistory(prev => [{ id: Date.now().toString(), score: data.score, total: data.total, attempted_at: new Date().toISOString() }, ...prev.slice(0, 4)])
    setScreen('results')
  }

  const pct     = questions.length > 0 ? Math.round(((currentIndex) / questions.length) * 100) : 0
  const bestPct = history.length > 0 ? Math.max(...history.map(h => Math.round(h.score / h.total * 100))) : null

  // ── PANTALLA: INICIO ─────────────────────────────────────────
  if (screen === 'start') return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => router.back()} className="text-tinta/40 hover:text-tinta text-sm mb-6 block">
        ← Volver
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 mb-4">
        <span className="text-[10px] font-bold tracking-widest text-tinta/40">QUIZ</span>
        <h1 className="font-display text-verde text-3xl mt-1 mb-6">MODO PRÁCTICA</h1>

        <div className="flex gap-4 mb-8">
          <div className="bg-verde/5 rounded-xl px-5 py-3 text-center">
            <p className="text-3xl font-display text-verde">10</p>
            <p className="text-xs text-tinta/40 tracking-wider mt-1">PREGUNTAS</p>
          </div>
          {bestPct !== null && (
            <div className="bg-verde/5 rounded-xl px-5 py-3 text-center">
              <p className="text-3xl font-display text-verde">{bestPct}%</p>
              <p className="text-xs text-tinta/40 tracking-wider mt-1">MEJOR PUNTAJE</p>
            </div>
          )}
        </div>

        {noQuestions ? (
          <p className="text-tinta/50 text-sm bg-tinta/5 rounded-lg p-4">
            Todavía no hay preguntas cargadas en esta materia.
          </p>
        ) : (
          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full bg-amarillo text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-amarillo/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'CARGANDO...' : 'COMENZAR QUIZ'}
          </button>
        )}
      </div>

      {/* Historial */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <h3 className="text-xs font-bold tracking-widest text-tinta/40 mb-3">INTENTOS ANTERIORES</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-tinta/50 text-xs">
                  {new Date(h.attempted_at).toLocaleDateString('es-AR')}
                </span>
                <span className={`font-bold ${Math.round(h.score / h.total * 100) >= 60 ? 'text-verde' : 'text-rojo'}`}>
                  {h.score}/{h.total} — {Math.round(h.score / h.total * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── PANTALLA: PREGUNTA ────────────────────────────────────────
  if (screen === 'question') {
    const q = questions[currentIndex]
    return (
      <div className="max-w-lg mx-auto">
        {/* Progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-tinta/40 tracking-wider">
              PREGUNTA {currentIndex + 1} DE {questions.length}
            </span>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? 'bg-verde'
                    : i === currentIndex
                    ? 'bg-amarillo'
                    : 'bg-tinta/10'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5">
          <p className="text-tinta font-medium text-lg leading-relaxed mb-8">{q.question}</p>

          <div className="space-y-2.5 mb-8">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-sm ${
                  selected === i
                    ? 'border-verde bg-verde/8 text-tinta'
                    : 'border-tinta/10 hover:border-verde/40 text-tinta/70'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 transition-all ${
                  selected === i
                    ? 'bg-verde text-crema'
                    : 'bg-tinta/10 text-tinta/50'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={selected === i ? 'font-medium' : ''}>{opt}</span>
              </button>
            ))}
          </div>

          <button
            onClick={confirmAnswer}
            disabled={selected === null || loading}
            className="w-full bg-amarillo text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-amarillo/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'ENVIANDO...' : currentIndex < questions.length - 1 ? 'SIGUIENTE →' : 'FINALIZAR QUIZ'}
          </button>
        </div>
      </div>
    )
  }

  // ── PANTALLA: RESULTADOS ──────────────────────────────────────
  if (screen === 'results' && finalResults) {
    const { score, total, results } = finalResults
    const pctScore = Math.round(score / total * 100)
    const passed   = pctScore >= 60

    return (
      <div className="max-w-lg mx-auto space-y-4">
        {/* Puntaje */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 text-center">
          <p className="text-7xl font-display text-verde leading-none mb-1">{score}/{total}</p>
          <p className="text-xs font-bold tracking-widest text-tinta/30 mt-1 mb-4">{score} DE {total} CORRECTAS</p>
          <p className={`text-2xl font-bold mb-4 ${passed ? 'text-verde' : 'text-rojo'}`}>
            {pctScore}% — {passed ? '¡Muy bien!' : 'Seguí practicando'}
          </p>
          <div className="w-full bg-tinta/10 rounded-full h-2 mb-6">
            <div
              className={`h-2 rounded-full transition-all ${passed ? 'bg-verde' : 'bg-rojo'}`}
              style={{ width: `${pctScore}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              className="flex-1 bg-amarillo text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-amarillo/90 transition-colors"
            >
              REPETIR QUIZ
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-tinta/10 text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-tinta/20 transition-colors"
            >
              VOLVER
            </button>
          </div>
        </div>

        {/* Detalle de respuestas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <h3 className="text-xs font-bold tracking-widest text-tinta/40 mb-4">DETALLE DE RESPUESTAS</h3>
          <div className="space-y-4">
            {results.map((r, i) => (
              <div key={i} className={`rounded-xl p-4 ${r.is_correct ? 'bg-verde/5 border border-verde/20' : 'bg-rojo/5 border border-rojo/20'}`}>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-tinta/10 text-tinta/50 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-tinta mb-2">
                      {r.is_correct ? '✅' : '❌'} {r.question}
                    </p>
                    <p className="text-xs text-tinta/50">
                      Tu respuesta: <span className={r.is_correct ? 'text-verde font-bold' : 'text-rojo font-bold'}>
                        {r.options[r.selected_index]}
                      </span>
                    </p>
                    {!r.is_correct && (
                      <p className="text-xs text-tinta/50 mt-1">
                        Correcta: <span className="text-verde font-bold">{r.options[r.correct_index]}</span>
                      </p>
                    )}
                    {r.explanation && (
                      <p className="text-xs text-tinta/60 mt-2 italic border-t border-tinta/10 pt-2">
                        {r.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
