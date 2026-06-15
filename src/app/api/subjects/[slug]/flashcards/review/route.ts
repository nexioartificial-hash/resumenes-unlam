import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function applySpacedRepetition(
  ease: number,
  interval: number,
  reps: number,
  quality: 0 | 3 | 5
): { ease: number; interval: number; reps: number } {
  if (quality < 3) {
    return { ease, interval: 1, reps: 0 }
  }
  let newInterval: number
  if (reps === 0)      newInterval = 1
  else if (reps === 1) newInterval = 6
  else                  newInterval = Math.round(interval * ease)

  const newEase = Math.max(
    1.3,
    ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )
  return { ease: newEase, interval: newInterval, reps: reps + 1 }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json() as { question_id?: string; quality?: 0 | 3 | 5 }
  if (!body.question_id || body.quality === undefined) {
    return NextResponse.json({ error: 'question_id y quality son requeridos' }, { status: 400 })
  }
  if (!(([0, 3, 5] as number[]).includes(body.quality))) {
    return NextResponse.json({ error: 'quality debe ser 0, 3 o 5' }, { status: 400 })
  }

  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  // Verificar que la pregunta pertenece a la materia (evita actualizar flashcards de otras materias)
  const { data: question } = await supabase
    .from('quiz_questions')
    .select('id')
    .eq('id', body.question_id)
    .eq('subject_id', subject.id)
    .single()
  if (!question) return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 })

  const { data: existing } = await supabase
    .from('flashcard_reviews')
    .select('id, ease_factor, interval_days, repetitions')
    .eq('user_id', user.id)
    .eq('question_id', body.question_id)
    .single()

  const ease     = existing?.ease_factor  ?? 2.5
  const interval = existing?.interval_days ?? 1
  const reps     = existing?.repetitions   ?? 0

  const next = applySpacedRepetition(ease, interval, reps, body.quality)

  const nextReviewAt = new Date(
    Date.now() + next.interval * 24 * 60 * 60 * 1000
  ).toISOString()

  await supabase
    .from('flashcard_reviews')
    .upsert({
      user_id:        user.id,
      question_id:    body.question_id,
      subject_id:     subject.id,
      ease_factor:    next.ease,
      interval_days:  next.interval,
      repetitions:    next.reps,
      next_review_at: nextReviewAt,
      updated_at:     new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' })

  return NextResponse.json({
    next_review_at: nextReviewAt,
    interval_days:  next.interval,
  })
}
