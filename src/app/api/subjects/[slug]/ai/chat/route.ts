import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: 'IA no configurada. Agregá GROQ_API_KEY en .env.local' },
      { status: 503 }
    )
  }

  const { messages } = await req.json()

  const { data: subject } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('slug', slug)
    .single()
  if (!subject) return new Response('Materia no encontrada', { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (!access) return new Response('Sin acceso', { status: 403 })

  // Contexto RAG: primeros 5 ítems publicados con body
  const { data: items } = await supabase
    .from('content_items')
    .select('title, body')
    .eq('subject_id', subject.id)
    .eq('is_published', true)
    .not('body', 'is', null)
    .order('order_index')
    .limit(5)

  const context = (items ?? [])
    .filter(i => i.body)
    .map(i => `### ${i.title}\n${i.body}`)
    .join('\n\n---\n\n')

  const groq   = createGroq({ apiKey: process.env.GROQ_API_KEY })
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `Sos un asistente de estudio para el curso de ingreso a la UNLaM, especializado en "${subject.name}".

Ayudá al estudiante a entender el material, resolver dudas y prepararse para el examen. Respondé siempre en español argentino, de forma clara, concisa y pedagógica.

Material de estudio disponible:
===
${context || 'No hay material cargado aún en esta materia.'}
===

Basate en este material para responder. Si la pregunta está fuera del tema, indicalo amablemente.`,
    messages,
    maxOutputTokens: 1024,
  })

  return result.toTextStreamResponse()
}
