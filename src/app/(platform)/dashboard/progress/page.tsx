'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/* ─── Tipos ─────────────────────────────────────────────────── */

interface RecentQuiz {
  score: number
  total: number
  pct:   number
}

interface SubjectStat {
  id:             string
  name:           string
  slug:           string
  color:          string
  expires_at:     string
  total:          number
  completed:      number
  pct:            number
  quiz_count:     number
  best_pct:       number | null
  last_quiz:      { score: number; total: number; attempted_at: string } | null
  recent_quizzes: RecentQuiz[]
}

interface Overall {
  completed: number
  total:     number
  quizzes:   number
}

/* ─── Ring de progreso ──────────────────────────────────────── */

function Ring({
  pct,
  size = 56,
  stroke = 3,
  mounted,
  delay,
}: {
  pct:     number
  size?:   number
  stroke?: number
  mounted: boolean
  delay:   number
}) {
  const r      = size / 2 - stroke - 1
  const circ   = 2 * Math.PI * r
  const isDone = pct >= 100
  const offset = mounted ? circ * (1 - pct / 100) : circ

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={isDone ? 'var(--amarillo)' : 'rgba(255,255,255,0.85)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isDone ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="var(--amarillo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="font-display text-white leading-none tabular-nums" style={{ fontSize: size * 0.27 }}>
            {pct}<span style={{ fontSize: size * 0.14, opacity: 0.45 }}>%</span>
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── Barras de historial de quiz ───────────────────────────── */

function QuizBars({ quizzes }: { quizzes: RecentQuiz[] }) {
  const list = [...quizzes].reverse()
  return (
    <div className="flex items-end gap-[3px]">
      {list.map((q, i) => (
        <div
          key={i}
          title={`${q.pct}%`}
          className="rounded-sm"
          style={{
            width:           5,
            height:          Math.max(4, Math.round((q.pct / 100) * 28)),
            backgroundColor: q.pct >= 60 ? 'var(--verde)' : 'var(--rojo)',
            opacity:         0.3 + (i / list.length) * 0.7,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Skeleton ──────────────────────────────────────────────── */

function Skeleton() {
  return (
    <div className="animate-pulse space-y-8 pt-2">
      <div className="h-3 w-10 bg-tinta/8 rounded" />
      <div className="flex items-end justify-between gap-8">
        <div className="flex-1 space-y-3">
          <div className="h-2 w-20 bg-tinta/8 rounded" />
          <div className="h-10 w-56 bg-tinta/10 rounded" />
          <div className="h-1.5 w-full bg-tinta/8 rounded-full mt-4" />
        </div>
        <div className="h-20 w-28 bg-tinta/8 rounded shrink-0" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => <div key={i} className="h-24 bg-tinta/6 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-44 bg-tinta/6 rounded-2xl" />)}
      </div>
    </div>
  )
}

/* ─── Página ─────────────────────────────────────────────────── */

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
        setOverall(data.overall  ?? null)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60)
      return () => clearTimeout(t)
    }
  }, [loading])

  if (loading) return <Skeleton />

  const overallPct = overall && overall.total > 0
    ? Math.round(overall.completed / overall.total * 100)
    : 0

  const bestOverall = subjects.reduce<number | null>((acc, s) => {
    if (s.best_pct === null) return acc
    return acc === null ? s.best_pct : Math.max(acc, s.best_pct)
  }, null)

  // Materia que más necesita atención
  const focusSubject = subjects
    .filter(s => {
      const days = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86_400_000)
      return s.pct < 60 && days > 0
    })
    .sort((a, b) => a.pct - b.pct)[0] ?? null

  return (
    <div>

      {/* Volver */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-tinta/30 hover:text-tinta text-[11px] tracking-widest font-bold transition-colors mb-8"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        VOLVER
      </button>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 sm:gap-8 mb-4">
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-[0.25em] text-tinta/30 mb-2">
            ESTADÍSTICAS
          </p>
          <h1
            className="font-display text-tinta leading-none"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
          >
            MI PROGRESO
          </h1>
          {overall && (
            <p className="text-tinta/35 text-sm mt-3">
              {overall.completed} de {overall.total} temas leídos
            </p>
          )}
        </div>
        {overall && (
          <div className="text-right shrink-0">
            <p
              className="font-display leading-none tabular-nums"
              style={{
                fontSize: 'clamp(4rem, 9vw, 6rem)',
                color:    overallPct >= 100 ? 'var(--verde)' : 'var(--tinta)',
              }}
            >
              {overallPct}
              <span className="text-2xl text-tinta/20">%</span>
            </p>
            <p className="text-[10px] tracking-widest text-tinta/30 font-bold mt-1">COMPLETADO</p>
          </div>
        )}
      </div>

      {/* Barra general */}
      {overall && overall.total > 0 && (
        <div className="mb-10">
          <div className="w-full bg-tinta/8 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width:      mounted ? `${overallPct}%` : '0%',
                background: 'var(--verde)',
                transition: 'width 1.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────── */}
      {overall && (
        <div className="grid grid-cols-3 gap-3 mb-8">

          {/* Temas leídos */}
          <div className="bg-white rounded-2xl border border-tinta/5 shadow-sm p-3 sm:p-5">
            <div style={{ borderLeft: '3px solid var(--verde)', paddingLeft: 12 }}>
              <p className="font-display text-tinta tabular-nums leading-none" style={{ fontSize: '2rem' }}>
                {overall.completed}
              </p>
              <p className="text-tinta/35 text-[9px] font-bold tracking-widest mt-2">TEMAS LEÍDOS</p>
              {overall.total > 0 && (
                <p className="text-tinta/25 text-[9px] mt-0.5">de {overall.total} totales</p>
              )}
            </div>
          </div>

          {/* Quizzes */}
          <div className="bg-white rounded-2xl border border-tinta/5 shadow-sm p-3 sm:p-5">
            <div style={{ borderLeft: '3px solid var(--amarillo)', paddingLeft: 12 }}>
              <p className="font-display text-tinta tabular-nums leading-none" style={{ fontSize: '2rem' }}>
                {overall.quizzes}
              </p>
              <p className="text-tinta/35 text-[9px] font-bold tracking-widest mt-2">QUIZZES</p>
              <p className="text-tinta/25 text-[9px] mt-0.5">
                {overall.quizzes === 0 ? 'ninguno aún' : overall.quizzes === 1 ? '1 intento' : `${overall.quizzes} intentos`}
              </p>
            </div>
          </div>

          {/* Mejor puntaje */}
          <div className="bg-white rounded-2xl border border-tinta/5 shadow-sm p-3 sm:p-5">
            <div
              style={{
                borderLeft: `3px solid ${
                  bestOverall === null
                    ? 'rgba(10,10,10,0.1)'
                    : bestOverall >= 60
                    ? 'var(--verde)'
                    : 'var(--rojo)'
                }`,
                paddingLeft: 12,
              }}
            >
              {bestOverall !== null ? (
                <p
                  className="font-display tabular-nums leading-none"
                  style={{
                    fontSize: '2rem',
                    color: bestOverall >= 60 ? 'var(--verde)' : 'var(--rojo)',
                  }}
                >
                  {bestOverall}
                  <span className="text-lg text-tinta/25">%</span>
                </p>
              ) : (
                <p className="font-display text-tinta/20 leading-none" style={{ fontSize: '2rem' }}>—</p>
              )}
              <p className="text-tinta/35 text-[9px] font-bold tracking-widest mt-2">MEJOR QUIZ</p>
              <p className="text-tinta/25 text-[9px] mt-0.5">
                {bestOverall === null ? 'sin intentos' : bestOverall >= 60 ? 'aprobado' : 'a mejorar'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── Materia a reforzar ───────────────────────────── */}
      {focusSubject && (
        <div
          className="rounded-2xl overflow-hidden border border-tinta/6 mb-8"
          style={{
            opacity:    mounted ? 1 : 0,
            transform:  mounted ? 'none' : 'translateY(8px)',
            transition: 'opacity 0.5s ease 100ms, transform 0.5s ease 100ms',
          }}
        >
          <div className="px-5 py-3 flex items-center gap-2.5" style={{ backgroundColor: 'var(--amarillo)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="var(--tinta)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-tinta text-[9px] font-bold tracking-widest">MATERIA A REFORZAR</p>
          </div>
          <div className="bg-white px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-tinta text-lg leading-tight">
                {focusSubject.name.toUpperCase()}
              </p>
              <p className="text-tinta/40 text-sm mt-0.5">
                Solo completaste el {focusSubject.pct}% del material
              </p>
            </div>
            <button
              onClick={() => router.push(`/dashboard/${focusSubject.slug}`)}
              className="shrink-0 text-[10px] font-bold tracking-widest bg-verde text-crema px-5 py-2.5 rounded-xl hover:bg-verde-claro transition-colors"
            >
              CONTINUAR →
            </button>
          </div>
        </div>
      )}

      {/* ── Por materia ──────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.25em] text-tinta/30 mb-5">POR MATERIA</p>

        {subjects.length === 0 && (
          <div className="border border-dashed border-tinta/12 rounded-2xl p-16 text-center">
            <p className="font-display text-tinta/20 text-xl mb-2">SIN MATERIAS AÚN</p>
            <p className="text-tinta/30 text-sm">Cuando actives una materia aparecerá acá.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((s, idx) => {
            const daysLeft  = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86_400_000)
            const isExpired = daysLeft <= 0
            const isDone    = s.pct >= 100
            const accent    = s.color || 'var(--verde)'
            const delay     = 150 + idx * 70

            return (
              <div
                key={s.id}
                style={{
                  opacity:    mounted ? 1 : 0,
                  transform:  mounted ? 'none' : 'translateY(14px)',
                  transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
                }}
              >
              <div className="group rounded-2xl overflow-hidden bg-white border border-tinta/8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

                {/* ─ Header coloreado ─ */}
                <div
                  className="relative px-5 pt-5 pb-4 overflow-hidden"
                  style={{ backgroundColor: accent, opacity: isExpired ? 0.6 : 1 }}
                >
                  {/* Grano + monograma (coherencia con cards del dashboard) */}
                  <div className="absolute inset-0 pointer-events-none bg-grain opacity-[0.15] mix-blend-overlay" />
                  <span
                    className="pointer-events-none absolute -right-3 -bottom-9 font-display leading-none text-white/10 select-none transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-0.5"
                    style={{ fontSize: '6.5rem' }}
                    aria-hidden
                  >
                    {s.name.trim().charAt(0).toUpperCase()}
                  </span>

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-display text-white text-base leading-tight tracking-tight">
                        {s.name.toUpperCase()}
                      </p>

                      {/* Barra de progreso */}
                      <div className="mt-3">
                        <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width:      mounted ? `${s.pct}%` : '0%',
                              background: isDone ? 'var(--amarillo)' : 'rgba(255,255,255,0.85)',
                              transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
                            }}
                          />
                        </div>
                        <p className="text-white/45 text-[9px] font-bold tracking-widest mt-1.5">
                          {s.completed} DE {s.total} TEMAS
                        </p>
                      </div>
                    </div>

                    <Ring pct={s.pct} mounted={mounted} delay={delay} size={56} stroke={3} />
                  </div>
                </div>

                {/* ─ Body blanco ─ */}
                <div className="bg-white px-5 py-4 flex items-center justify-between gap-3">

                  {/* Izquierda: mejor score + barras quiz */}
                  <div className="flex items-center gap-5">

                    {/* Mejor puntaje — acento lateral */}
                    <div
                      style={{
                        borderLeft: `2px solid ${
                          s.best_pct !== null
                            ? s.best_pct >= 60 ? 'var(--verde)' : 'var(--rojo)'
                            : 'rgba(10,10,10,0.1)'
                        }`,
                        paddingLeft: 10,
                      }}
                    >
                      {s.best_pct !== null ? (
                        <>
                          <p
                            className="font-display text-xl tabular-nums leading-none"
                            style={{ color: s.best_pct >= 60 ? 'var(--verde)' : 'var(--rojo)' }}
                          >
                            {s.best_pct}<span className="text-sm text-tinta/25">%</span>
                          </p>
                          <p className="text-tinta/35 text-[9px] font-bold tracking-wider mt-1">MEJOR</p>
                        </>
                      ) : (
                        <>
                          <p className="font-display text-xl text-tinta/20 leading-none">—</p>
                          <p className="text-tinta/25 text-[9px] font-bold tracking-wider mt-1">QUIZ</p>
                        </>
                      )}
                    </div>

                    {/* Historial de quizzes */}
                    {s.recent_quizzes?.length > 0 && (
                      <div>
                        <QuizBars quizzes={s.recent_quizzes} />
                        <p className="text-tinta/35 text-[9px] font-bold tracking-wider mt-1.5">
                          {s.quiz_count} {s.quiz_count === 1 ? 'QUIZ' : 'QUIZZES'}
                        </p>
                      </div>
                    )}

                    {s.quiz_count === 0 && (
                      <p className="text-tinta/25 text-[9px] font-bold tracking-wider">SIN QUIZZES</p>
                    )}
                  </div>

                  {/* Derecha: acceso + CTA */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">

                    {/* Estado de acceso */}
                    <div className="flex items-center gap-1.5">
                      {isExpired ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-tinta/20 shrink-0" />
                          <p className="text-tinta/30 text-[10px]">vencido</p>
                        </>
                      ) : isDone ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                          <p className="text-tinta/40 text-[10px]">completado</p>
                        </>
                      ) : (
                        <>
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span
                              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                              style={{ backgroundColor: accent }}
                            />
                            <span
                              className="relative inline-flex rounded-full h-1.5 w-1.5"
                              style={{ backgroundColor: accent }}
                            />
                          </span>
                          <p className="text-tinta/40 text-[10px]">{daysLeft}d restantes</p>
                        </>
                      )}
                    </div>

                    {/* Botón */}
                    <button
                      onClick={() =>
                        router.push(
                          s.quiz_count === 0
                            ? `/dashboard/${s.slug}/quiz`
                            : `/dashboard/${s.slug}`
                        )
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-white px-4 py-1.5 rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200"
                      style={{ backgroundColor: accent }}
                    >
                      {s.quiz_count === 0 ? 'QUIZ' : 'IR'}
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </button>
                  </div>
                </div>

              </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
