import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

function verifyToken(
  token: string,
  question: string
): { correct_index: number; explanation: string } | null {
  try {
    const decoded  = JSON.parse(Buffer.from(token, 'base64url').toString())
    const secret   = process.env.WEBHOOK_SECRET || 'exam-dev-secret'
    const payload  = JSON.stringify({ correct_index: decoded.correct_index, explanation: decoded.explanation })
    const expected = crypto.createHmac('sha256', secret).update(question + payload).digest('hex')
    if (decoded.sig !== expected) return null
    return { correct_index: decoded.correct_index, explanation: decoded.explanation }
  } catch {
    return null
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: _slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { question, selected_index, token } = await req.json()

  if (typeof question !== 'string' || typeof selected_index !== 'number' || typeof token !== 'string') {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const verified = verifyToken(token, question)
  if (!verified) return Response.json({ error: 'Token inválido o expirado' }, { status: 400 })

  const { correct_index, explanation } = verified
  const is_correct = selected_index === correct_index

  return Response.json({ is_correct, correct_index, explanation })
}
