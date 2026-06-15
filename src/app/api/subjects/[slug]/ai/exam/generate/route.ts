import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { checkRateLimit } from '@/lib/rateLimit'

function signToken(correct_index: number, explanation: string, question: string): string {
  const secret  = process.env.WEBHOOK_SECRET ?? (() => { throw new Error('WEBHOOK_SECRET no configurado') })()
  const payload = JSON.stringify({ correct_index, explanation })
  const sig     = crypto.createHmac('sha256', secret).update(question + payload).digest('hex')
  return Buffer.from(JSON.stringify({ correct_index, explanation, sig })).toString('base64url')
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: 'IA no configurada. Agregá GROQ_API_KEY en .env.local' },
      { status: 503 }
    )
  }

  const { data: subject } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('slug', slug)
    .single()
  if (!subject) return Response.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (!access) return Response.json({ error: 'Sin acceso' }, { status: 403 })

  const { allowed } = await checkRateLimit(user.id, 'exam')
  if (!allowed) {
    return Response.json(
      { error: 'Límite de generaciones alcanzado. Podés generar hasta 10 preguntas por hora.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '3600' } }
    )
  }

  const { data: items } = await supabase
    .from('content_items')
    .select('id, title, body')
    .eq('subject_id', subject.id)
    .eq('is_published', true)
    .not('body', 'is', null)

  if (!items || items.length === 0) {
    return Response.json(
      { error: 'No hay contenido disponible para generar preguntas' },
      { status: 404 }
    )
  }

  const item       = items[Math.floor(Math.random() * items.length)]
  const bodySlice  = (item.body as string).slice(0, 2500)

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `Generá UNA pregunta de opción múltiple para un estudiante universitario argentino sobre el siguiente contenido de ${subject.name}.

CONTENIDO:
## ${item.title}
${bodySlice}

REGLAS:
- La pregunta debe ser clara y específica sobre el contenido
- Exactamente 4 opciones, solo una correcta
- La opción correcta puede estar en cualquier posición (A, B, C o D)
- La explicación debe ser educativa y breve

Respondé ÚNICAMENTE con JSON válido sin texto adicional:
{
  "question": "texto de la pregunta",
  "options": [
    {"text": "opción A", "is_correct": false},
    {"text": "opción B", "is_correct": true},
    {"text": "opción C", "is_correct": false},
    {"text": "opción D", "is_correct": false}
  ],
  "explanation": "por qué la respuesta correcta es correcta"
}`,
    maxOutputTokens: 800,
  })

  let parsed: {
    question: string
    options:  { text: string; is_correct: boolean }[]
    explanation: string
  }

  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return Response.json(
      { error: 'Error al procesar la respuesta de la IA, intentá de nuevo' },
      { status: 500 }
    )
  }

  const correct_index = parsed.options.findIndex(o => o.is_correct)
  if (correct_index === -1) {
    return Response.json({ error: 'La IA no marcó ninguna opción como correcta' }, { status: 500 })
  }

  const token = signToken(correct_index, parsed.explanation, parsed.question)

  return Response.json({
    question: parsed.question,
    options:  parsed.options.map(o => o.text),
    source:   item.title,
    token,
  })
}
