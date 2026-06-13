import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, options, explanation')
    .eq('subject_id', subject.id)
    .eq('is_published', true)

  if (!questions || questions.length === 0) {
    return NextResponse.json({ due: [], next_review_at: null })
  }

  const rows = questions.map(q => ({
    user_id:     user.id,
    question_id: q.id,
    subject_id:  subject.id,
  }))
  await supabase
    .from('flashcard_reviews')
    .upsert(rows, { onConflict: 'user_id,question_id', ignoreDuplicates: true })

  const now = new Date().toISOString()
  const { data: dueReviews } = await supabase
    .from('flashcard_reviews')
    .select('id, question_id, next_review_at')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .lte('next_review_at', now)

  if (!dueReviews || dueReviews.length === 0) {
    const { data: nextReview } = await supabase
      .from('flashcard_reviews')
      .select('next_review_at')
      .eq('user_id', user.id)
      .eq('subject_id', subject.id)
      .order('next_review_at', { ascending: true })
      .limit(1)
      .single()

    return NextResponse.json({
      due: [],
      next_review_at: nextReview?.next_review_at ?? null,
    })
  }

  const qMap = new Map(questions.map(q => [q.id, q]))

  const due = dueReviews.map(r => {
    const q = qMap.get(r.question_id)
    if (!q) return null
    const opts = q.options as { text: string; is_correct: boolean }[]
    return {
      review_id:     r.id,
      question_id:   r.question_id,
      question:      q.question,
      options:       opts.map(o => o.text),
      correct_index: opts.findIndex(o => o.is_correct),
      explanation:   q.explanation ?? null,
    }
  }).filter(Boolean)

  return NextResponse.json({ due, next_review_at: null })
}
