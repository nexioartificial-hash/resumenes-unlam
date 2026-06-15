import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

function verifyToken(
  token: string,
  question: string
): { correct_index: number; explanation: string } | null {
  try {
    const decoded  = JSON.parse(Buffer.from(token, 'base64url').toString())
    const secret   = process.env.WEBHOOK_SECRET
    if (!secret) return null
    const payload  = JSON.stringify({ correct_index: decoded.correct_index, explanation: decoded.explanation })
    const expected = crypto.createHmac('sha256', secret).update(question + payload).digest('hex')
    try {
      if (!crypto.timingSafeEqual(Buffer.from(decoded.sig, 'hex'), Buffer.from(expected, 'hex'))) return null
    } catch { return null }
    return { correct_index: decoded.correct_index, explanation: decoded.explanation }
  } catch {
    return null
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) return Response.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return Response.json({ error: 'Sin acceso' }, { status: 403 })

  const { question, selected_index, token } = await req.json()
  if (typeof question !== 'string' || typeof selected_index !== 'number' || typeof token !== 'string') {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const verified = verifyToken(token, question)
  if (!verified) return Response.json({ error: 'Token inválido o expirado' }, { status: 400 })

  const { correct_index, explanation } = verified
  return Response.json({ is_correct: selected_index === correct_index, correct_index, explanation })
}
