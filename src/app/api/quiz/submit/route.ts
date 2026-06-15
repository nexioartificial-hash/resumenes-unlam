import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  subject_slug: z.string(),
  answers: z.array(z.object({
    question_id:    z.string().uuid(),
    selected_index: z.number().int().min(0),
  })),
})

export async function POST(request: NextRequest) {
  const body   = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { subject_slug, answers } = parsed.data

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subject_slug)
    .single()

  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  // Verificar acceso pagado y vigente
  const { data: access } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (!access) return NextResponse.json({ error: 'Sin acceso a esta materia' }, { status: 403 })

  // Obtener preguntas con respuestas correctas (server-side)
  const questionIds = answers.map(a => a.question_id)
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, options, explanation')
    .in('id', questionIds)

  if (!questions) return NextResponse.json({ error: 'Error al verificar respuestas' }, { status: 500 })

  const questionMap = new Map(questions.map(q => [q.id, q]))

  let score = 0
  const results = answers.map(answer => {
    const q       = questionMap.get(answer.question_id)
    if (!q) return null
    const options = q.options as { text: string; is_correct: boolean }[]
    const correct = options.findIndex(o => o.is_correct)
    const isRight = answer.selected_index === correct

    if (isRight) score++

    return {
      question_id:     answer.question_id,
      question:        q.question,
      selected_index:  answer.selected_index,
      correct_index:   correct,
      is_correct:      isRight,
      options:         options.map(o => o.text),
      explanation:     q.explanation,
    }
  }).filter(Boolean)

  // Guardar intento
  await supabase.from('quiz_attempts').insert({
    user_id:    user.id,
    subject_id: subject.id,
    score,
    total:      answers.length,
    answers:    results,
  })

  return NextResponse.json({ score, total: answers.length, results })
}
