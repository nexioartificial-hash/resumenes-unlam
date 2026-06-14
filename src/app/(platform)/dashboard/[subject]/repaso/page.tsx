'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FeatureIntro from '@/components/ui/FeatureIntro'

interface RepasoQuestion {
  id:            string
  question:      string
  options:       string[]
  correct_index: number
  explanation:   string | null
  failure_rate:  number | null
  times_seen:    number
}

type Screen = 'start' | 'card' | 'results'

export default function RepasoPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params.subject as string

  const [screen,       setScreen]       = useState<Screen>('start')
  const [questions,    setQuestions]    = useState<RepasoQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped,      setFlipped]      = useState(false)
  const [known,        setKnown]        = useState(0)
  const [loading,      setLoading]      = useState(false)
  const [noQuestions,  setNoQuestions]  = useState(false)

  async function start() {
    setLoading(true)
    const res  = await fetch(`/api/subjects/${slug}/repaso`)
    const data = await res.json()
    setLoading(false)
    if (!data.questions?.length) { setNoQuestions(true); return }
    setQuestions(data.questions)
    setCurrentIndex(0)
    setFlipped(false)
    setKnown(0)
    setNoQuestions(false)
    setScreen('card')
  }

  function answer(didKnow: boolean) {
    if (didKnow) setKnown(k => k + 1)
    const next = currentIndex + 1
    if (next >= questions.length) {
      setScreen('results')
    } else {
      setCurrentIndex(next)
      setFlipped(false)
    }
  }

  const q = questions[currentIndex]

  // ── INICIO ──────────────────────────────────────────────────────────────────
  if (screen === 'start') return (
    <div className="max-w-lg mx-auto">
      <FeatureIntro
        featureKey="repaso"
        icon="🔁"
        title="Repaso inteligente"
        description="El repaso te muestra las preguntas en las que más erraste o que menos practicaste. Es el modo más eficiente para reforzar antes del examen."
        steps={[
          { icon: '📉', text: 'Prioriza las preguntas con mayor tasa de error.' },
          { icon: '🃏', text: 'Respondé y confirmá la respuesta correcta.' },
          { icon: '📈', text: 'Con cada sesión el sistema ajusta qué preguntas mostrarte.' },
        ]}
        ctaLabel="Entendido"
      />
      <button onClick={() => router.back()} className="text-tinta/40 hover:text-tinta text-sm mb-6 block">
        ← Volver
      </button>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5">
        <span className="text-[10px] font-bold tracking-widest text-tinta/40">ESTUDIO</span>
        <h1 className="font-display text-verde text-3xl mt-1 mb-2">REPASO INTELIGENTE</h1>
        <p className="text-tinta/50 text-sm mb-8">
          Las preguntas que más te costaron en tus simulacros anteriores, primero.
        </p>
        {noQuestions ? (
          <p className="text-tinta/50 text-sm bg-tinta/5 rounded-xl p-4">
            No hay preguntas disponibles para repasar.
          </p>
        ) : (
          <button
            onClick={start}
            disabled={loading}
            className="w-full bg-amarillo text-tinta font-bold py-3.5 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'CARGANDO...' : 'INICIAR REPASO'}
          </button>
        )}
      </div>
    </div>
  )

  // ── CARD ─────────────────────────────────────────────────────────────────────
  if (screen === 'card' && q) return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => router.back()} className="text-tinta/40 hover:text-tinta text-sm">
          ← Salir
        </button>
        <span className="text-xs font-bold text-tinta/40 tracking-wider">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex gap-0.5 mb-5">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
            i < currentIndex ? 'bg-verde' : i === currentIndex ? 'bg-amarillo' : 'bg-tinta/10'
          }`} />
        ))}
      </div>

      <div
        style={{ perspective: '1000px' }}
        onClick={() => !flipped && setFlipped(true)}
        className="mb-4"
      >
        <div style={{
          display:        'grid',
          transformStyle: 'preserve-3d',
          transition:     'transform 0.5s',
          transform:      flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor:         flipped ? 'default' : 'pointer',
        }}>
          {/* Frente */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', gridArea: '1 / 1' }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 flex flex-col justify-between min-h-[220px]"
          >
            <p className="text-[10px] font-bold tracking-widest text-tinta/30">
              PREGUNTA — tocá para ver la respuesta
            </p>
            <p className="text-tinta font-medium text-lg leading-relaxed">{q.question}</p>
            {q.failure_rate !== null && (
              <p className="text-[10px] text-rojo/60">
                Fallada el {Math.round(q.failure_rate * 100)}% de las veces ({q.times_seen} intentos)
              </p>
            )}
          </div>
          {/* Dorso */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', gridArea: '1 / 1' }}
            className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-verde/20 flex flex-col justify-center gap-3 min-h-[220px]"
          >
            <p className="text-[10px] font-bold tracking-widest text-verde/60">RESPUESTA CORRECTA</p>
            <p className="text-verde font-bold text-base leading-snug">{q.options[q.correct_index]}</p>
            {q.explanation && (
              <p className="text-tinta/60 text-sm leading-relaxed border-t border-tinta/10 pt-3">
                {q.explanation}
              </p>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button
            onClick={() => answer(false)}
            className="flex-1 bg-rojo/10 text-rojo font-bold py-3.5 rounded-xl tracking-wider hover:bg-rojo/20 transition-colors"
          >
            NO LO SABÍA
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 bg-verde/10 text-verde font-bold py-3.5 rounded-xl tracking-wider hover:bg-verde/20 transition-colors"
          >
            LO SABÍA ✓
          </button>
        </div>
      )}
    </div>
  )

  // ── RESULTADOS ────────────────────────────────────────────────────────────────
  if (screen === 'results') {
    const pct = Math.round((known / questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 text-center">
          <span className="text-[10px] font-bold tracking-widest text-tinta/40">RESULTADO</span>
          <p className="text-8xl font-display text-tinta leading-none mt-4 mb-1">
            {pct}<span className="text-4xl text-tinta/40">%</span>
          </p>
          <p className="text-xs font-bold tracking-widest text-tinta/30 mb-8">
            DOMINASTE {known} DE {questions.length}
          </p>
          <div className="flex gap-3">
            <button
              onClick={start}
              className="flex-1 bg-amarillo text-tinta font-bold py-3 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors"
            >
              REPETIR
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-tinta/10 text-tinta font-bold py-3 rounded-xl tracking-wider hover:bg-tinta/20 transition-colors"
            >
              VOLVER
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
