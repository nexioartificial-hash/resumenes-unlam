import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Materias con acceso activo
  const { data: userSubjects } = await supabase
    .from('user_subjects')
    .select('subject_id, expires_at, subjects(id, name, slug, color)')
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString())

  if (!userSubjects || userSubjects.length === 0) {
    return NextResponse.json({ subjects: [], overall: { completed: 0, total: 0, quizzes: 0 } })
  }

  const subjectIds = userSubjects.map(us => us.subject_id)

  // Total de ítems de contenido por materia
  const { data: contentCounts } = await supabase
    .from('content_items')
    .select('subject_id')
    .in('subject_id', subjectIds)
    .eq('is_published', true)

  // Ítems completados por el usuario
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('content_item_id, content_items(subject_id)')
    .eq('user_id', user.id)

  // Intentos de quiz por materia
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('subject_id, score, total, attempted_at')
    .eq('user_id', user.id)
    .in('subject_id', subjectIds)
    .order('attempted_at', { ascending: false })

  // Agrupar por materia
  const totalBySubject   = new Map<string, number>()
  const completedBySubject = new Map<string, number>()
  const quizzesBySubject  = new Map<string, { score: number; total: number; attempted_at: string }[]>()

  for (const row of contentCounts ?? []) {
    totalBySubject.set(row.subject_id, (totalBySubject.get(row.subject_id) ?? 0) + 1)
  }

  for (const row of progressRows ?? []) {
    const sid = (row.content_items as unknown as { subject_id: string } | null)?.subject_id
    if (sid) completedBySubject.set(sid, (completedBySubject.get(sid) ?? 0) + 1)
  }

  for (const attempt of quizAttempts ?? []) {
    const list = quizzesBySubject.get(attempt.subject_id) ?? []
    list.push({ score: attempt.score, total: attempt.total, attempted_at: attempt.attempted_at })
    quizzesBySubject.set(attempt.subject_id, list)
  }

  const subjects = userSubjects.map(us => {
    const subject   = us.subjects as unknown as { id: string; name: string; slug: string; color: string }
    const total     = totalBySubject.get(us.subject_id) ?? 0
    const completed = completedBySubject.get(us.subject_id) ?? 0
    const quizzes   = quizzesBySubject.get(us.subject_id) ?? []
    const bestPct   = quizzes.length > 0
      ? Math.max(...quizzes.map(q => Math.round(q.score / q.total * 100)))
      : null
    const lastQuiz  = quizzes[0] ?? null

    return {
      id:         subject.id,
      name:       subject.name,
      slug:       subject.slug,
      color:      subject.color,
      expires_at: us.expires_at,
      total,
      completed,
      pct:        total > 0 ? Math.round(completed / total * 100) : 0,
      quiz_count: quizzes.length,
      best_pct:   bestPct,
      last_quiz:  lastQuiz,
    }
  })

  const overall = {
    completed: subjects.reduce((s, x) => s + x.completed, 0),
    total:     subjects.reduce((s, x) => s + x.total, 0),
    quizzes:   subjects.reduce((s, x) => s + x.quiz_count, 0),
  }

  return NextResponse.json({ subjects, overall })
}
