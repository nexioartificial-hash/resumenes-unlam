import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 60)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: subject } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  // Preguntas random — sin revelar cuál es la correcta al cliente
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, options, difficulty')
    .eq('subject_id', subject.id)
    .eq('is_published', true)
    .order('order_index')
    .limit(limit * 3) // traer más para mezclar

  if (!questions || questions.length === 0) {
    return NextResponse.json({ subject, questions: [] })
  }

  // Mezclar y tomar N — ocultar is_correct al cliente
  const shuffled = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)
    .map(q => ({
      id:         q.id,
      question:   q.question,
      difficulty: q.difficulty,
      options:    (q.options as { text: string }[]).map(o => o.text),
    }))

  return NextResponse.json({ subject, questions: shuffled })
}
