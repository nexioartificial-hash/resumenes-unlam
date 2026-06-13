'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type DueCard = {
  review_id:     string
  question_id:   string
  question:      string
  options:       string[]
  correct_index: number
  explanation:   string | null
}

type Screen = 'loading' | 'start' | 'card' | 'done'

export default function FlashcardsPage() {
  const { subject: slug } = useParams<{ subject: string }>()
  const router = useRouter()

  const [screen,        setScreen]        = useState<Screen>('loading')
  const [cards,         setCards]         = useState<DueCard[]>([])
  const [nextReviewAt,  setNextReviewAt]  = useState<string | null>(null)
  const [index,         setIndex]         = useState(0)
  const [isFlipped,     setIsFlipped]     = useState(false)
  const [sessionKnown,  setSessionKnown]  = useState(0)
  const [sessionMissed, setSessionMissed] = useState(0)

  useEffect(() => {
    fetch(`/api/subjects/${slug}/flashcards`)
      .then(r => r.json())
      .then(data => {
        setCards(data.due ?? [])
        setNextReviewAt(data.next_review_at ?? null)
        setScreen(data.due?.length > 0 ? 'start' : 'done')
      })
      .catch(() => setScreen('done'))
  }, [slug])

  const currentCard = cards[index]

  async function handleQuality(quality: 0 | 3 | 5) {
    if (!currentCard) return
    if (quality >= 3) setSessionKnown(k => k + 1)
    else               setSessionMissed(k => k + 1)

    const res = await fetch(`/api/subjects/${slug}/flashcards/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: currentCard.question_id, quality }),
    })
    if (!res.ok) return

    const next = index + 1
    if (next >= cards.length) {
      setScreen('done')
    } else {
      setIndex(next)
      setIsFlipped(false)
    }
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-tinta/40 text-sm">Cargando flashcards...</div>
      </div>
    )
  }

  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-crema flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="font-display text-verde text-3xl mb-2">FLASHCARDS</h1>
          <p className="text-tinta/50 text-sm">Repetición espaciada — Algoritmo SM-2</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 text-center max-w-sm w-full">
          <div className="text-5xl font-bold text-verde mb-2">{cards.length}</div>
          <p className="text-tinta/60 text-sm">
            {cards.length === 1 ? 'card para revisar hoy' : 'cards para revisar hoy'}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => setScreen('card')}
            className="bg-verde text-crema font-bold text-sm px-6 py-3 rounded-xl tracking-wider hover:bg-verde/90 transition-colors"
          >
            INICIAR SESIÓN →
          </button>
          <button
            onClick={() => router.back()}
            className="text-tinta/40 text-sm hover:text-tinta transition-colors text-center"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'done') {
    const total = sessionKnown + sessionMissed
    const hadCards = cards.length > 0

    let nextMsg = ''
    if (nextReviewAt) {
      const d = new Date(nextReviewAt)
      const now = new Date()
      const diffMs = d.getTime() - now.getTime()
      const diffH = Math.round(diffMs / (1000 * 60 * 60))
      if (diffH < 24) nextMsg = `en ${diffH} hora${diffH !== 1 ? 's' : ''}`
      else {
        const diffD = Math.round(diffH / 24)
        nextMsg = `en ${diffD} día${diffD !== 1 ? 's' : ''}`
      }
    }

    return (
      <div className="min-h-screen bg-crema flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">{hadCards ? '🎉' : '📅'}</div>
          <h1 className="font-display text-verde text-2xl mb-1">
            {hadCards ? '¡Sesión completa!' : 'Sin cards para hoy'}
          </h1>
          {!hadCards && nextMsg && (
            <p className="text-tinta/50 text-sm">Próxima revisión {nextMsg}</p>
          )}
        </div>

        {hadCards && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5 w-full max-w-sm">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-bold text-verde">{sessionKnown}</div>
                <div className="text-xs text-tinta/40 mt-1">Lo sabía</div>
              </div>
              <div className="w-px bg-tinta/10" />
              <div>
                <div className="text-3xl font-bold text-rojo">{sessionMissed}</div>
                <div className="text-xs text-tinta/40 mt-1">A reforzar</div>
              </div>
              <div className="w-px bg-tinta/10" />
              <div>
                <div className="text-3xl font-bold text-tinta">{total}</div>
                <div className="text-xs text-tinta/40 mt-1">Total</div>
              </div>
            </div>
            {nextMsg && (
              <p className="text-center text-tinta/40 text-xs mt-4">
                Próxima revisión {nextMsg}
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="bg-tinta/10 text-tinta font-bold text-sm px-6 py-3 rounded-xl tracking-wider hover:bg-tinta/20 transition-colors"
        >
          ← VOLVER A LA MATERIA
        </button>
      </div>
    )
  }

  if (!currentCard) return null
  const progress = Math.round(((index) / cards.length) * 100)

  return (
    <div className="min-h-screen bg-crema flex flex-col p-4 gap-4">
      <div className="flex items-center gap-3 max-w-lg mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="text-tinta/40 hover:text-tinta text-sm transition-colors shrink-0"
        >
          ←
        </button>
        <div className="flex-1 bg-tinta/10 rounded-full h-2">
          <div
            className="bg-verde rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-tinta/40 text-xs shrink-0">{index + 1} / {cards.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div
          style={{ perspective: '1000px' }}
          className="w-full max-w-lg cursor-pointer"
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          <div
            style={{
              transformStyle:  'preserve-3d',
              transform:       isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition:      'transform 0.4s ease',
              position:        'relative',
              minHeight:       '240px',
            }}
          >
            <div
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              className="absolute inset-0 bg-white rounded-2xl p-6 shadow-sm border border-tinta/5 flex flex-col items-center justify-center"
            >
              <p className="text-xs text-tinta/30 mb-3 tracking-widest">PREGUNTA</p>
              <p className="text-tinta font-medium text-center leading-relaxed">
                {currentCard.question}
              </p>
              {!isFlipped && (
                <p className="text-tinta/30 text-xs mt-6">Tocá para ver la respuesta</p>
              )}
            </div>

            <div
              style={{
                backfaceVisibility:       'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform:                'rotateY(180deg)',
              }}
              className="absolute inset-0 bg-white rounded-2xl p-6 shadow-sm border border-verde/20 flex flex-col gap-3 overflow-y-auto"
            >
              <p className="text-xs text-verde/60 tracking-widest">RESPUESTA CORRECTA</p>
              <p className="text-verde font-bold text-sm">
                {currentCard.options[currentCard.correct_index]}
              </p>
              {currentCard.explanation && (
                <>
                  <div className="h-px bg-tinta/10" />
                  <p className="text-tinta/60 text-xs leading-relaxed">
                    {currentCard.explanation}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="flex gap-3 w-full max-w-lg">
            <button
              onClick={() => handleQuality(0)}
              className="flex-1 bg-rojo/10 text-rojo font-bold text-xs py-3 rounded-xl tracking-wider hover:bg-rojo/20 transition-colors border border-rojo/20"
            >
              🔴 NO LO SABÍA
              <span className="block text-rojo/60 font-normal mt-0.5">Vuelve mañana</span>
            </button>
            <button
              onClick={() => handleQuality(3)}
              className="flex-1 bg-amarillo/10 text-amarillo font-bold text-xs py-3 rounded-xl tracking-wider hover:bg-amarillo/20 transition-colors border border-amarillo/20"
            >
              🟡 DUDÉ
              <span className="block text-amarillo/60 font-normal mt-0.5">Vuelve en 6 días</span>
            </button>
            <button
              onClick={() => handleQuality(5)}
              className="flex-1 bg-verde/10 text-verde font-bold text-xs py-3 rounded-xl tracking-wider hover:bg-verde/20 transition-colors border border-verde/20"
            >
              🟢 LO SABÍA
              <span className="block text-verde/60 font-normal mt-0.5">Intervalo × 2.5</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
