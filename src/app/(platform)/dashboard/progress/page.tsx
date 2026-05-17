'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/shared/ProgressBar'

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

export default function ProgressPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<SubjectStat[]>([])
  const [overall,  setOverall]  = useState<Overall | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/progress/summary')
      .then(r => r.json())
      .then(data => {
        setSubjects(data.subjects ?? [])
        setOverall(data.overall ?? null)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-tinta/40 text-sm">
      Cargando progreso...
    </div>
  )

  const overallPct = overall && overall.total > 0
    ? Math.round(overall.completed / overall.total * 100)
    : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-tinta/40 hover:text-tinta text-sm mb-4 block transition-colors"
        >
          ← Volver
        </button>
        <span className="text-[10px] font-bold tracking-widest text-tinta/40">ESTADÍSTICAS</span>
        <h1 className="font-display text-verde text-3xl mt-1">MI PROGRESO</h1>
      </div>

      {/* Cards globales */}
      {overall && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-verde" />
            <p className="text-4xl font-display text-verde">{overallPct}%</p>
            <p className="text-[10px] font-bold tracking-widest text-tinta/40 mt-2">COMPLETADO</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-azul" />
            <p className="text-4xl font-display text-verde">{overall.completed}</p>
            <p className="text-[10px] font-bold tracking-widest text-tinta/40 mt-2">TEMAS LEÍDOS</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amarillo" />
            <p className="text-4xl font-display text-verde">{overall.quizzes}</p>
            <p className="text-[10px] font-bold tracking-widest text-tinta/40 mt-2">QUIZZES</p>
          </div>
        </div>
      )}

      {/* Barra global */}
      {overall && overall.total > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <div className="flex justify-between text-xs text-tinta/50 mb-2">
            <span>Progreso total</span>
            <span>{overall.completed} / {overall.total} temas</span>
          </div>
          <ProgressBar value={overallPct} />
        </div>
      )}

      {/* Por materia */}
      <div>
        <h2 className="text-[10px] font-bold tracking-widest text-tinta/40 mb-3">POR MATERIA</h2>
        <div className="space-y-3">
          {subjects.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-tinta/5">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-tinta/40 text-sm">Todavía no tenés materias activas</p>
            </div>
          )}
          {subjects.map(s => {
            const daysLeft = Math.ceil(
              (new Date(s.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5"
              >
                {/* Franja de color + nombre */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: s.color || '#0F3F26' }}
                    />
                    <div>
                      <p className="font-display text-verde text-base leading-tight">
                        {s.name.toUpperCase()}
                      </p>
                      <p className="text-[10px] text-tinta/40 mt-0.5">
                        {daysLeft > 0 ? `Vence en ${daysLeft} días` : 'Acceso vencido'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/${s.slug}`)}
                    className="text-xs text-verde font-bold hover:underline shrink-0"
                  >
                    Ir →
                  </button>
                </div>

                {/* Progreso de contenido */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-tinta/40 mb-1.5">
                    <span>Contenido</span>
                    <span>{s.completed}/{s.total} temas</span>
                  </div>
                  <ProgressBar value={s.pct} />
                </div>

                {/* Stats quiz */}
                <div className="flex gap-4 pt-3 border-t border-tinta/5">
                  <div>
                    <p className="text-[10px] text-tinta/40 tracking-wider">QUIZZES</p>
                    <p className="text-sm font-bold text-tinta">{s.quiz_count}</p>
                  </div>
                  {s.best_pct !== null && (
                    <div>
                      <p className="text-[10px] text-tinta/40 tracking-wider">MEJOR PUNTAJE</p>
                      <p className={`text-sm font-bold ${s.best_pct >= 60 ? 'text-verde' : 'text-rojo'}`}>
                        {s.best_pct}%
                      </p>
                    </div>
                  )}
                  {s.last_quiz && (
                    <div>
                      <p className="text-[10px] text-tinta/40 tracking-wider">ÚLTIMO QUIZ</p>
                      <p className="text-sm font-bold text-tinta">
                        {s.last_quiz.score}/{s.last_quiz.total} —{' '}
                        {new Date(s.last_quiz.attempted_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  )}
                  {s.quiz_count === 0 && (
                    <button
                      onClick={() => router.push(`/dashboard/${s.slug}/quiz`)}
                      className="ml-auto text-[10px] font-bold text-amarillo bg-amarillo/10 px-3 py-1.5 rounded-lg hover:bg-amarillo/20 transition-colors tracking-wider"
                    >
                      HACER QUIZ →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
