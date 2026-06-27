'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FeatureIntro from '@/components/ui/FeatureIntro'

interface Question {
  id:         string
  question:   string
  options:    string[]
  difficulty: string
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

type Screen = 'start' | 'question' | 'results'

const EXAM_QUESTIONS = 40
const EXAM_SECONDS   = 45 * 60  // 45 minutos

export default function QuizPage() {
  const params  = useParams()
  const router  = useRouter()
  const slug    = params.subject as string

  const [screen,       setScreen]       = useState<Screen>('start')
  const [questions,    setQuestions]    = useState<Question[]>([])
  const [history,      setHistory]      = useState<Attempt[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected,     setSelected]     = useState<number | null>(null)
  const [answers,      setAnswers]      = useState<{ question_id: string; selected_index: number }[]>([])
  const [finalResults, setFinalResults] = useState<{ score: number; total: number; results: Result[] } | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [noQuestions,  setNoQuestions]  = useState(false)
  const [timeLeft,     setTimeLeft]     = useState(EXAM_SECONDS)

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef  = useRef(answers)
  answersRef.current = answers

  useEffect(() => {
    fetch(`/api/subjects/${slug}/quiz/history`)
      .then(r => r.json())
      .then(setHistory)
  }, [slug])

  const submitQuiz = useCallback(async (finalAnswers: { question_id: string; selected_index: number }[]) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setLoading(true)
    const res  = await fetch('/api/quiz/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subject_slug: slug, answers: finalAnswers }),
    })
    const data = await res.json()
    setLoading(false)
    setFinalResults(data)
    setHistory(prev => [
      { id: Date.now().toString(), score: data.score, total: data.total, attempted_at: new Date().toISOString() },
      ...prev.slice(0, 4),
    ])
    setScreen('results')
  }, [slug])

  // Timer — solo corre cuando screen === 'question'
  useEffect(() => {
    if (screen !== 'question') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          submitQuiz(answersRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [screen, submitQuiz])

  async function startExam() {
    setLoading(true)
    const res  = await fetch(`/api/subjects/${slug}/quiz?limit=${EXAM_QUESTIONS}`)
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
    setTimeLeft(EXAM_SECONDS)
    setScreen('question')
  }

  function confirmAnswer() {
    if (selected === null) return
    const q       = questions[currentIndex]
    const newAns  = [...answers, { question_id: q.id, selected_index: selected }]
    setAnswers(newAns)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      submitQuiz(newAns)
    }
  }

  const mins      = Math.floor(timeLeft / 60)
  const secs      = timeLeft % 60
  const timeStr   = `${mins}:${secs.toString().padStart(2, '0')}`
  const timeWarn  = timeLeft < 10 * 60
  const timeCrit  = timeLeft < 5 * 60
  const bestPct   = history.length > 0 ? Math.max(...history.map(h => Math.round(h.score / h.total * 100))) : null

  // ── PANTALLA: INICIO ─────────────────────────────────────────────────────────
  if (screen === 'start') return (
    <div className="max-w-lg mx-auto">
      <FeatureIntro
        featureKey="quiz"
        icon="📝"
        title="Simulacro de examen"
        description="Respondé preguntas de opción múltiple con cronómetro, igual que en el examen real. Al final ves tu puntaje y las respuestas correctas."
        steps={[
          { icon: '⏱️', text: 'Tenés 45 minutos para responder hasta 40 preguntas.' },
          { icon: '🎯', text: 'Cada pregunta tiene una sola respuesta correcta.' },
          { icon: '📊', text: 'Al terminar ves tu nota y en qué módulos fallaste.' },
          { icon: '🔄', text: 'Podés hacer el simulacro cuantas veces quieras.' },
        ]}
        ctaLabel="Entendido"
      />
      <button onClick={() => router.back()} className="text-tinta/40 hover:text-tinta text-sm mb-6 block">
        ← Volver
      </button>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-tinta/5 mb-4">
        <span className="text-[10px] font-bold tracking-widest text-tinta/40">EVALUACIÓN</span>
        <h1 className="font-display text-verde text-3xl mt-1 mb-2">SIMULACRO DE EXAMEN</h1>
        <p className="text-tinta/50 text-sm mb-8">Condiciones similares a un parcial real. Todas las preguntas, tiempo limitado.</p>

        <div className="flex gap-3 mb-8">
          <div className="bg-verde/5 rounded-xl px-4 py-3 text-center flex-1">
            <p className="text-2xl sm:text-3xl font-display text-verde">{EXAM_QUESTIONS}</p>
            <p className="text-[10px] text-tinta/40 tracking-wider mt-1">PREGUNTAS</p>
          </div>
          <div className="bg-amarillo/10 rounded-xl px-4 py-3 text-center flex-1">
            <p className="text-2xl sm:text-3xl font-display text-amarillo">45</p>
            <p className="text-[10px] text-tinta/40 tracking-wider mt-1">MINUTOS</p>
          </div>
          <div className="bg-tinta/5 rounded-xl px-4 py-3 text-center flex-1">
            <p className="text-2xl sm:text-3xl font-display text-tinta">60</p>
            <p className="text-[10px] text-tinta/40 tracking-wider mt-1">% PARA APROBAR</p>
          </div>
        </div>

        {bestPct !== null && (
          <div className={`rounded-xl px-5 py-3 mb-6 text-center ${bestPct >= 60 ? 'bg-verde/5 border border-verde/20' : 'bg-rojo/5 border border-rojo/20'}`}>
            <p className={`text-sm font-bold ${bestPct >= 60 ? 'text-verde' : 'text-rojo'}`}>
              Mejor resultado: {bestPct}% — {bestPct >= 60 ? 'APROBADO' : 'DESAPROBADO'}
            </p>
          </div>
        )}

        {noQuestions ? (
          <p className="text-tinta/50 text-sm bg-tinta/5 rounded-xl p-4">
            Todavía no hay preguntas cargadas en esta materia.
          </p>
        ) : (
          <button
            onClick={startExam}
            disabled={loading}
            className="w-full bg-amarillo text-tinta font-bold py-3.5 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors disabled:opacity-50 text-base"
          >
            {loading ? 'CARGANDO...' : 'INICIAR SIMULACRO'}
          </button>
        )}
      </div>

      {/* Historial */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <h3 className="text-xs font-bold tracking-widest text-tinta/40 mb-3">INTENTOS ANTERIORES</h3>
          <div className="space-y-2">
            {history.map((h, i) => {
              const pct    = Math.round(h.score / h.total * 100)
              const passed = pct >= 60
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-tinta/50 text-xs">
                    {new Date(h.attempted_at).toLocaleDateString('es-AR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-tinta/40 text-xs">{h.score}/{h.total}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-verde/10 text-verde' : 'bg-rojo/10 text-rojo'}`}>
                      {passed ? 'APROBADO' : 'DESAPROBADO'} {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  // ── PANTALLA: PREGUNTA ───────────────────────────────────────────────────────
  if (screen === 'question') {
    const q = questions[currentIndex]
    return (
      <div className="max-w-lg mx-auto">
        {/* Header: progreso + timer */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-tinta/40 tracking-wider">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tabular-nums transition-colors ${
            timeCrit  ? 'bg-rojo/10 text-rojo animate-pulse' :
            timeWarn  ? 'bg-amarillo/20 text-amarillo' :
                        'bg-tinta/5 text-tinta/50'
          }`}>
            <span>⏱</span>
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="flex gap-0.5 mb-5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < currentIndex  ? 'bg-verde' :
                i === currentIndex ? 'bg-amarillo' :
                                     'bg-tinta/10'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-tinta/5">
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
                  selected === i ? 'bg-verde text-crema' : 'bg-tinta/10 text-tinta/50'
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
            className="w-full bg-amarillo text-tinta font-bold py-3 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'ENVIANDO...' : currentIndex < questions.length - 1 ? 'SIGUIENTE →' : 'FINALIZAR EXAMEN'}
          </button>
        </div>
      </div>
    )
  }

  // ── PANTALLA: RESULTADOS ─────────────────────────────────────────────────────
  if (screen === 'results' && finalResults) {
    const { score, total, results } = finalResults
    const pctScore = Math.round(score / total * 100)
    const passed   = pctScore >= 60

    return (
      <div className="max-w-lg mx-auto space-y-4">
        {/* Resultado principal */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-tinta/5 text-center">
          <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold tracking-widest mb-6 ${
            passed ? 'bg-verde/10 text-verde' : 'bg-rojo/10 text-rojo'
          }`}>
            {passed ? '✓ APROBADO' : '✗ DESAPROBADO'}
          </div>

          <p className="text-6xl sm:text-8xl font-display text-tinta leading-none mb-1">{pctScore}<span className="text-4xl text-tinta/40">%</span></p>
          <p className="text-xs font-bold tracking-widest text-tinta/30 mt-2 mb-6">
            {score} CORRECTAS DE {total} PREGUNTAS
          </p>

          <div className="w-full bg-tinta/10 rounded-full h-2.5 mb-8">
            <div
              className={`h-2.5 rounded-full transition-all ${passed ? 'bg-verde' : 'bg-rojo'}`}
              style={{ width: `${pctScore}%` }}
            />
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            <div className="bg-verde/5 rounded-xl p-3">
              <p className="text-2xl font-display text-verde">{score}</p>
              <p className="text-[10px] text-tinta/40 tracking-wider">CORRECTAS</p>
            </div>
            <div className="bg-rojo/5 rounded-xl p-3">
              <p className="text-2xl font-display text-rojo">{total - score}</p>
              <p className="text-[10px] text-tinta/40 tracking-wider">INCORRECTAS</p>
            </div>
            <div className="bg-tinta/5 rounded-xl p-3">
              <p className="text-2xl font-display text-tinta">{total}</p>
              <p className="text-[10px] text-tinta/40 tracking-wider">TOTAL</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startExam}
              className="flex-1 bg-amarillo text-tinta font-bold py-3 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors"
            >
              REPETIR SIMULACRO
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-tinta/10 text-tinta font-bold py-3 rounded-xl tracking-wider hover:bg-tinta/20 transition-colors"
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
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                    r.is_correct ? 'bg-verde/20 text-verde' : 'bg-rojo/20 text-rojo'
                  }`}>
                    {r.is_correct ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-tinta mb-2">{r.question}</p>
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
