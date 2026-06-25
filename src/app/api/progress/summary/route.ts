import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Materias con acceso activo
  const { data: userSubjectsRaw } = await supabase
    .from('user_subjects')
    .select('subject_id, expires_at, subjects(id, name, slug, color, available)')
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString())

  // Excluir materias "próximamente" (available = false): no cuentan para el progreso
  const userSubjects = (userSubjectsRaw ?? []).filter(us => {
    const s = us.subjects as unknown as { available?: boolean } | null
    return s != null && s.available !== false
  })

  if (userSubjects.length === 0) {
    return NextResponse.json({ subjects: [], overall: { completed: 0, total: 0, quizzes: 0 } })
  }

  const subjectIds = userSubjects.map(us => us.subject_id)

  // Todas las queries en paralelo
  const [
    { data: contentCounts },
    { data: progressRows },
    { data: moduleCounts },
    { data: moduleProgressRows },
    { data: quizAttempts },
  ] = await Promise.all([
    // Content items publicados por materia
    supabase
      .from('content_items')
      .select('subject_id')
      .in('subject_id', subjectIds)
      .eq('is_published', true),

    // Content items completados por el usuario
    supabase
      .from('user_progress')
      .select('content_item_id, content_items(subject_id)')
      .eq('user_id', user.id),

    // Módulos publicados por materia
    supabase
      .from('modules')
      .select('id, subject_id')
      .in('subject_id', subjectIds)
      .eq('is_published', true),

    // Módulos completados por el usuario
    supabase
      .from('module_progress')
      .select('module_id')
      .eq('user_id', user.id),

    // Intentos de quiz
    supabase
      .from('quiz_attempts')
      .select('subject_id, score, total, attempted_at')
      .eq('user_id', user.id)
      .in('subject_id', subjectIds)
      .order('attempted_at', { ascending: false }),
  ])

  // ── Mapas de conteo ───────────────────────────────────

  // Content items: total y completados por materia
  const contentTotalBySubject     = new Map<string, number>()
  const contentCompletedBySubject = new Map<string, number>()

  for (const row of contentCounts ?? []) {
    contentTotalBySubject.set(row.subject_id, (contentTotalBySubject.get(row.subject_id) ?? 0) + 1)
  }
  for (const row of progressRows ?? []) {
    const sid = (row.content_items as unknown as { subject_id: string } | null)?.subject_id
    if (sid) contentCompletedBySubject.set(sid, (contentCompletedBySubject.get(sid) ?? 0) + 1)
  }

  // Módulos: total y completados por materia
  const moduleTotalBySubject     = new Map<string, number>()
  const moduleCompletedBySubject = new Map<string, number>()

  // Mapa module_id → subject_id para resolver las completiones
  const moduleSubjectMap = new Map<string, string>()
  for (const m of moduleCounts ?? []) {
    moduleTotalBySubject.set(m.subject_id, (moduleTotalBySubject.get(m.subject_id) ?? 0) + 1)
    moduleSubjectMap.set(m.id, m.subject_id)
  }
  for (const mp of moduleProgressRows ?? []) {
    const sid = moduleSubjectMap.get(mp.module_id)
    if (sid) moduleCompletedBySubject.set(sid, (moduleCompletedBySubject.get(sid) ?? 0) + 1)
  }

  // Quizzes por materia
  const quizzesBySubject = new Map<string, { score: number; total: number; attempted_at: string }[]>()
  for (const attempt of quizAttempts ?? []) {
    const list = quizzesBySubject.get(attempt.subject_id) ?? []
    list.push({ score: attempt.score, total: attempt.total, attempted_at: attempt.attempted_at })
    quizzesBySubject.set(attempt.subject_id, list)
  }

  // ── Construir respuesta por materia ──────────────────

  const subjects = userSubjects.map(us => {
    const subject = us.subjects as unknown as { id: string; name: string; slug: string; color: string }

    // Sumar content items + módulos
    const total     = (contentTotalBySubject.get(us.subject_id) ?? 0)
                    + (moduleTotalBySubject.get(us.subject_id) ?? 0)
    const completed = (contentCompletedBySubject.get(us.subject_id) ?? 0)
                    + (moduleCompletedBySubject.get(us.subject_id) ?? 0)

    const quizzes = quizzesBySubject.get(us.subject_id) ?? []
    const bestPct = quizzes.length > 0
      ? Math.max(...quizzes.map(q => Math.round(q.score / q.total * 100)))
      : null
    const lastQuiz = quizzes[0] ?? null

    return {
      id:             subject.id,
      name:           subject.name,
      slug:           subject.slug,
      color:          subject.color,
      expires_at:     us.expires_at,
      total,
      completed,
      pct:            total > 0 ? Math.round(completed / total * 100) : 0,
      quiz_count:     quizzes.length,
      best_pct:       bestPct,
      last_quiz:      lastQuiz,
      recent_quizzes: quizzes.slice(0, 5).map(q => ({
        score: q.score,
        total: q.total,
        pct:   Math.round(q.score / q.total * 100),
      })),
    }
  })

  const overall = {
    completed: subjects.reduce((s, x) => s + x.completed, 0),
    total:     subjects.reduce((s, x) => s + x.total, 0),
    quizzes:   subjects.reduce((s, x) => s + x.quiz_count, 0),
  }

  return NextResponse.json({ subjects, overall })
}
