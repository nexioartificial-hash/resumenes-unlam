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
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('score, total, attempted_at, answers')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .order('attempted_at', { ascending: true })

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ no_data: true })
  }

  // Historia
  const history = attempts.map(a => ({
    pct:          Math.round((a.score / a.total) * 100),
    attempted_at: a.attempted_at,
  }))

  // Promedio ponderado (últimos 3: pesos 0.5 / 0.3 / 0.2)
  const last3   = attempts.slice(-3).reverse()
  const weights = [0.5, 0.3, 0.2]
  let wSum = 0, wScore = 0
  last3.forEach((a, i) => {
    const w = weights[i] ?? 0
    wScore += (a.score / a.total) * 100 * w
    wSum   += w
  })
  const probability = Math.round(wScore / wSum)

  // Tendencia
  let trend: 'up' | 'stable' | 'down' = 'stable'
  if (attempts.length >= 2) {
    const last = attempts[attempts.length - 1]
    const prev = attempts[attempts.length - 2]
    const diff = (last.score / last.total) - (prev.score / prev.total)
    if (diff > 0.05)       trend = 'up'
    else if (diff < -0.05) trend = 'down'
  }

  // Módulos débiles: desempaquetar answers de los últimos 3 intentos
  const qFailures = new Map<string, { wrong: number; total: number }>()
  for (const attempt of attempts.slice(-3)) {
    const answers = attempt.answers as AttemptAnswer[]
    if (!Array.isArray(answers)) continue
    for (const a of answers) {
      const s = qFailures.get(a.question_id) ?? { wrong: 0, total: 0 }
      s.total++
      if (!a.is_correct) s.wrong++
      qFailures.set(a.question_id, s)
    }
  }

  const questionIds = Array.from(qFailures.keys())
  const { data: qData } = await supabase
    .from('quiz_questions')
    .select('id, module_id')
    .in('id', questionIds)

  const mFailures = new Map<string, { wrong: number; total: number }>()
  for (const q of (qData ?? [])) {
    if (!q.module_id) continue
    const qf = qFailures.get(q.id)!
    const mf = mFailures.get(q.module_id) ?? { wrong: 0, total: 0 }
    mf.wrong += qf.wrong
    mf.total += qf.total
    mFailures.set(q.module_id, mf)
  }

  const moduleIds = Array.from(mFailures.keys())
  const { data: modules } = await supabase
    .from('modules').select('id, title').in('id', moduleIds)

  const weak_modules = (modules ?? [])
    .map(m => ({
      module_id:    m.id,
      title:        m.title,
      failure_rate: mFailures.has(m.id)
        ? mFailures.get(m.id)!.wrong / mFailures.get(m.id)!.total
        : 0,
    }))
    .filter(m => m.failure_rate > 0)
    .sort((a, b) => b.failure_rate - a.failure_rate)
    .slice(0, 3)

  return NextResponse.json({ probability, trend, history, weak_modules })
}
