import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type AttemptAnswer = {
  question_id: string
  is_correct:  boolean
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
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('answers')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ mastery: {} })
  }

  const allAnswers: AttemptAnswer[] = []
  for (const attempt of attempts) {
    const answers = attempt.answers as AttemptAnswer[]
    if (Array.isArray(answers)) allAnswers.push(...answers)
  }

  if (allAnswers.length === 0) return NextResponse.json({ mastery: {} })

  const questionIds = [...new Set(allAnswers.map(a => a.question_id))]
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, module_id')
    .in('id', questionIds)

  if (!questions) return NextResponse.json({ mastery: {} })

  const qModuleMap = new Map(questions.map(q => [q.id, q.module_id as string | null]))

  const stats = new Map<string, { correct: number; total: number }>()
  for (const a of allAnswers) {
    const moduleId = qModuleMap.get(a.question_id)
    if (!moduleId) continue
    const s = stats.get(moduleId)
    if (s) {
      s.total++
      if (a.is_correct) s.correct++
    } else {
      stats.set(moduleId, { correct: a.is_correct ? 1 : 0, total: 1 })
    }
  }

  const mastery: Record<string, number> = {}
  for (const [moduleId, s] of stats.entries()) {
    mastery[moduleId] = s.correct / s.total
  }

  return NextResponse.json({ mastery })
}
