import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id: moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: subject } = await supabase
    .from('subjects').select('id, name').eq('slug', slug).single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const { data: module_ } = await supabase
    .from('modules').select('title').eq('id', moduleId).single()
  if (!module_) return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 })

  const { data: rows } = await supabase
    .from('quiz_questions')
    .select('question, options, explanation')
    .eq('module_id', moduleId)
    .eq('is_published', true)
    .order('order_index')

  if (!rows || rows.length === 0)
    return NextResponse.json({ error: 'No hay preguntas para este módulo' }, { status: 404 })

  const questions = rows.map(row => {
    const opts = row.options as { text: string; is_correct: boolean }[]
    return {
      question:      row.question,
      options:       opts.map(o => o.text),
      correct_index: opts.findIndex(o => o.is_correct),
      explanation:   row.explanation,
    }
  })

  // Mezcla aleatoria para que no siempre salgan en el mismo orden
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]
  }

  return NextResponse.json({ questions: questions.slice(0, 10), module_title: module_.title })
}
