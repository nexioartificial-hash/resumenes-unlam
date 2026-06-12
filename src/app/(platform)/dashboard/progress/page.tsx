'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BooksShowcase from '@/components/shared/BooksShowcase'

interface SubjectStat {
  id:         string
  name:       string
  slug:       string
  color:      string
  expires_at: string
  total:      number
  completed:  number
  pct:        number
  quiz_count: number
  best_pct:   number | null
  last_quiz:  { score: number; total: number; attempted_at: string } | null
}

interface Overall {
  completed: number
  total:     number
  quizzes:   number
}

const RING_R    = 27
const RING_CIRC = 2 * Math.PI * RING_R

function ProgressRing({ pct, mounted, delay }: { pct: number; mounted: boolean; delay: number }) {
  const isDone   = pct >= 100
  const offset   = mounted ? RING_CIRC * (1 - pct / 100) : RING_CIRC

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg width="64" height="64" className="-rotate-90" aria-hidden="true">
        <circle
          cx="32" cy="32" r={RING_R}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3.5"
        />
        <circle
          cx="32" cy="32" r={RING_R}
          fill="none"
          stroke={isDone ? 'var(--amarillo)' : 'white'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={offset}
          style={{ transition: `stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isDone ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="rotate-0">
            <path d="M5 13l4 4L19 7" stroke="var(--amarillo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <>
            <span className="font-display text-white text-[17px] leading-none tabular-nums">{pct}</span>
            <span className="text-white/50 text-[8px] font-bold tracking-widest">%</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<SubjectStat[]>([])
  const [overall,  setOverall]  = useState<Overall | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    fetch('/api/progress/summary')
      .then(r => r.json())
      .then(data => {
        setSubjects(data.subjects ?? [])
        setOverall(data.overall ?? null)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60)
      return () => clearTimeout(t)
    }
  }, [loading])

  /* ─── Loading skeleton ─── */
  if (loading) return (
    <div className="w-full max-w-5xl animate-pulse space-y-8 pt-4">
      <div className="h-3 w-12 bg-tinta/8 rounded" />
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <div className="h-2.5 w-20 bg-tinta/8 rounded" />
          <div className="h-9 w-48 bg-tinta/10 rounded" />
        </div>
        <div className="h-20 w-28 bg-tinta/8 rounded" />
      </div>
      <div className="h-2 w-full bg-tinta/8 rounded-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="h-36 bg-tinta/10" />
            <div className="bg-white p-4 flex gap-2">
              <div className="h-7 w-24 bg-tinta/6 rounded-lg" />
              <div className="h-7 w-24 bg-tinta/6 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const overallPct = overall && overall.total > 0
    ? Math.round(overall.completed / overall.total * 100)
    : 0

  return (
    <div className="w-full max-w-5xl">

      {/* Back */}
      <button
        onClick={() => router.push('/dashboard')}
        className="text-tinta/30 hover:text-tinta text-xs tracking-widest transition-colors mb-10 block"
      >
        ← VOLVER
      </button>

      {/* Hero */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-tinta/30 mb-2">ESTADÍSTICAS</p>
          <h1 className="font-display text-tinta text-4xl leading-none">MI PROGRESO</h1>
        </div>
        {overall && (
          <div className="text-right">
            <p
              className="font-display leading-none tabular-nums"
              style={{
                fontSize: 'clamp(3.5rem,8vw,5.5rem)',
                color: overallPct === 100 ? 'var(--verde)' : 'var(--tinta)',
              }}
            >
              {overallPct}<span className="text-2xl text-tinta/25">%</span>
            </p>
            <p className="text-[10px] tracking-widest text-tinta/30 font-bold mt-1">COMPLETADO</p>
          </div>
        )}
      </div>

      {/* Overall bar */}
      {overall && overall.total > 0 && (
        <div className="mb-6">
          <div className="w-full bg-tinta/8 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: mounted ? `${overallPct}%` : '0%',
                background: 'var(--verde)',
                transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      )}

      {/* 3D Books Showcase */}
      {subjects.length > 0 && (
        <div className="mb-2 -mx-4">
          <BooksShowcase
            books={subjects.map(s => ({
              name:  s.name,
              color: s.color || 'var(--verde)',
              slug:  s.slug,
              pct:   s.pct,
            }))}
          />
        </div>
      )}

      {/* Secondary stats */}
      {overall && (
        <div className="flex gap-8 pb-10 mb-10 border-b border-tinta/8">
          <div>
            <p className="font-display text-2xl text-tinta tabular-nums leading-none">{overall.completed}</p>
            <p className="text-[10px] tracking-widest text-tinta/35 font-bold mt-1.5">TEMAS LEÍDOS</p>
          </div>
          <div className="w-px bg-tinta/8 self-stretch" />
          <div>
            <p className="font-display text-2xl text-tinta tabular-nums leading-none">{overall.quizzes}</p>
            <p className="text-[10px] tracking-widest text-tinta/35 font-bold mt-1.5">QUIZZES</p>
          </div>
          {overall.total > 0 && (
            <>
              <div className="w-px bg-tinta/8 self-stretch" />
              <div>
                <p className="font-display text-2xl text-tinta tabular-nums leading-none">{overall.total}</p>
                <p className="text-[10px] tracking-widest text-tinta/35 font-bold mt-1.5">TEMAS TOTALES</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Grid */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-tinta/30 mb-6">POR MATERIA</p>

        {subjects.length === 0 && (
          <div className="border border-dashed border-tinta/12 rounded-2xl p-16 text-center">
            <p className="font-display text-tinta/20 text-xl mb-2">SIN MATERIAS AÚN</p>
            <p className="text-tinta/30 text-sm">Cuando actives una materia aparecerá acá.</p>
          </div>
        )}

        {(() => {
          // Scattered positions: [top%, left%, rotate deg, width px]
          const SCATTER = [
            { top: '2%',  left: '0%',   rot: -2,   w: 300 },
            { top: '0%',  left: '52%',  rot:  1.5, w: 320 },
            { top: '34%', left: '8%',   rot:  1,   w: 290 },
            { top: '30%', left: '58%',  rot: -1.5, w: 310 },
            { top: '66%', left: '2%',   rot:  2,   w: 305 },
            { top: '62%', left: '54%',  rot: -1,   w: 295 },
          ]

          const totalH = subjects.length <= 2 ? 320 : subjects.length <= 4 ? 580 : 860

          return (
            <div className="relative w-full" style={{ height: totalH }}>
              {subjects.map((s, idx) => {
                const pos      = SCATTER[idx] ?? { top: `${idx * 18}%`, left: `${(idx % 2) * 50}%`, rot: 0, w: 300 }
                const daysLeft = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86_400_000)
                const isExpired = daysLeft <= 0
                const isDone   = s.pct >= 100
                const accent   = s.color || 'var(--verde)'
                const ringDelay = 280 + idx * 80

                return (
                  <div
                    key={s.id}
                    className="absolute group rounded-2xl overflow-hidden border border-tinta/6 hover:border-transparent hover:shadow-[0_24px_60px_-12px_rgba(10,10,10,0.22)] transition-all duration-300"
                    style={{
                      top:     pos.top,
                      left:    pos.left,
                      width:   pos.w,
                      opacity: mounted ? 1 : 0,
                      transform: mounted
                        ? `rotate(${pos.rot}deg) scale(1)`
                        : `rotate(${pos.rot}deg) translateY(20px) scale(0.96)`,
                      transition: `opacity 0.55s ease ${idx * 100}ms, transform 0.55s cubic-bezier(0.34,1.3,0.64,1) ${idx * 100}ms, box-shadow 0.3s, border-color 0.3s`,
                      zIndex: 10 - idx,
                    }}
              >
                {/* ── Colored header ── */}
                <div
                  className="relative p-6 overflow-hidden"
                  style={{
                    backgroundColor: accent,
                    opacity: isExpired ? 0.65 : 1,
                  }}
                >
                  {/* Depth: radial highlight */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 90% 10%, rgba(255,255,255,0.22), transparent 55%), linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.18))',
                    }}
                  />

                  {/* Fill overlay: progress fill from left */}
                  <div
                    className="absolute inset-y-0 left-0 pointer-events-none"
                    style={{
                      width: mounted ? `${s.pct}%` : '0%',
                      background: 'rgba(255,255,255,0.09)',
                      transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${ringDelay}ms`,
                    }}
                  />

                  {/* Top row: name + ring */}
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-display text-white text-lg leading-tight tracking-tight">
                        {s.name.toUpperCase()}
                      </p>
                      <p className="text-white/55 text-[11px] mt-1.5 font-medium tracking-wide">
                        {isExpired
                          ? 'ACCESO VENCIDO'
                          : isDone
                            ? 'COMPLETADO ✓'
                            : `${daysLeft} DÍAS RESTANTES`}
                      </p>
                    </div>

                    <ProgressRing pct={s.pct} mounted={mounted} delay={ringDelay} />
                  </div>

                  {/* Bottom: count + thin bar */}
                  <div className="relative z-10 mt-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-white/45 text-[9px] font-bold tracking-widest">
                        {s.completed} DE {s.total} TEMAS
                      </span>
                    </div>
                    <div className="w-full h-[3px] bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: mounted ? `${s.pct}%` : '0%',
                          background: isDone ? 'var(--amarillo)' : 'rgba(255,255,255,0.85)',
                          transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${ringDelay}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── White stats body ── */}
                <div className="bg-white px-5 py-4 flex items-center gap-2 flex-wrap">

                  {/* Quizzes chip */}
                  <div className="inline-flex items-center gap-1.5 border border-tinta/10 rounded-lg px-2.5 py-1.5">
                    <span className="text-[9px] tracking-widest text-tinta/35 font-bold">QUIZZES</span>
                    <span className="text-[11px] font-bold text-tinta">{s.quiz_count}</span>
                  </div>

                  {/* Best score chip */}
                  {s.best_pct !== null && (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border"
                      style={{
                        borderColor: s.best_pct >= 60 ? 'rgba(15,63,38,0.22)' : 'rgba(200,51,42,0.22)',
                        backgroundColor: s.best_pct >= 60 ? 'rgba(15,63,38,0.05)' : 'rgba(200,51,42,0.05)',
                      }}
                    >
                      <span className="text-[9px] tracking-widest text-tinta/35 font-bold">MEJOR</span>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: s.best_pct >= 60 ? 'var(--verde)' : 'var(--rojo)' }}
                      >
                        {s.best_pct}%
                      </span>
                    </div>
                  )}

                  {/* Last quiz chip */}
                  {s.last_quiz && (
                    <div className="inline-flex items-center gap-1.5 border border-tinta/10 rounded-lg px-2.5 py-1.5">
                      <span className="text-[9px] tracking-widest text-tinta/35 font-bold">ÚLTIMO</span>
                      <span className="text-[11px] font-bold text-tinta">
                        {s.last_quiz.score}/{s.last_quiz.total}
                      </span>
                      <span className="text-[10px] text-tinta/25">
                        {new Date(s.last_quiz.attempted_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  {s.quiz_count === 0 ? (
                    <button
                      onClick={() => router.push(`/dashboard/${s.slug}/quiz`)}
                      className="ml-auto text-[10px] font-bold tracking-widest bg-amarillo text-tinta px-4 py-1.5 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-200"
                    >
                      HACER QUIZ →
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/dashboard/${s.slug}`)}
                      className="ml-auto text-[10px] font-bold tracking-widest text-white px-4 py-1.5 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-200"
                      style={{ backgroundColor: accent }}
                    >
                      IR →
                    </button>
                  )}
                </div>
                </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
