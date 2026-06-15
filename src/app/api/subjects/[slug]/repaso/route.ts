import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type AttemptAnswer = {
  question_id:    string
  question:       string
  selected_index: number
  correct_index:  number
  is_correct:     boolean
  options:        string[]
  explanation:    string | null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('answers')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)

  // Sin intentos previos → preguntas aleatorias como fallback
  if (!attempts || attempts.length === 0) {
    const { data: qs } = await supabase
      .from('quiz_questions')
      .select('id, question, options, explanation')
      .eq('subject_id', subject.id)
      .eq('is_published', true)
      .limit(20)
    if (!qs) return NextResponse.json({ questions: [] })
    const mapped = qs.map(q => {
      const opts = q.options as { text: string; is_correct: boolean }[]
      return {
        id:            q.id,
        question:      q.question,
        options:       opts.map(o => o.text),
        correct_index: opts.findIndex(o => o.is_correct),
        explanation:   q.explanation,
        failure_rate:  null,
        times_seen:    0,
      }
    })
    // Fisher-Yates shuffle
    for (let i = mapped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]]
    }
    return NextResponse.json({ questions: mapped })
  }

  // Agregar estadísticas por pregunta
  const stats = new Map<string, { wrong: number; total: number; data: AttemptAnswer }>()

  for (const attempt of attempts) {
    const answers = attempt.answers as AttemptAnswer[]
    if (!Array.isArray(answers)) continue
    for (const a of answers) {
      const s = stats.get(a.question_id)
      if (s) {
        s.total++
        if (!a.is_correct) s.wrong++
      } else {
        stats.set(a.question_id, { wrong: a.is_correct ? 0 : 1, total: 1, data: a })
      }
    }
  }

  const questions = Array.from(stats.entries())
    .sort(([, a], [, b]) => (b.wrong / b.total) - (a.wrong / a.total))
    .slice(0, 20)
    .map(([id, s]) => ({
      id,
      question:      s.data.question,
      options:       s.data.options,
      correct_index: s.data.correct_index,
      explanation:   s.data.explanation,
      failure_rate:  s.wrong / s.total,
      times_seen:    s.total,
    }))

  return NextResponse.json({ questions })
}
