import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function sb() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v3',
      task:  'retrieval.query',
      input: [text],
    }),
  })
  if (!res.ok) throw new Error(`Jina ${res.status}`)
  const data = await res.json()
  return data.data[0].embedding as number[]
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: 'IA no configurada' }, { status: 503 })
  }

  const { messages } = await req.json()
  const lastUserMsg = messages[messages.length - 1]

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

  // ── Paralelizar: embed + historial + módulos al mismo tiempo ─────────────
  const client = sb()

  const [embedResult, historyResult, modulesResult] = await Promise.allSettled([
    // 1. Embed de la pregunta (para RAG)
    process.env.JINA_API_KEY ? embedQuery(lastUserMsg.content) : Promise.reject('no key'),

    // 2. Historial persistente
    (async () => {
      const { data: existing } = await client
        .from('ai_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('subject_id', subject.id)
        .maybeSingle()

      let conversationId: string
      if (existing) {
        conversationId = existing.id
      } else {
        const { data: created, error } = await client
          .from('ai_conversations')
          .insert({ user_id: user.id, subject_id: subject.id })
          .select('id')
          .single()
        if (error || !created) throw error
        conversationId = created.id
      }

      await client.from('ai_messages').insert({
        conversation_id: conversationId,
        role:    'user',
        content: lastUserMsg.content,
      })

      const { data: prevMsgs } = await client
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(21)

      const history = ((prevMsgs ?? []).slice(1).reverse() as { role: string; content: string }[])
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      return { conversationId, history }
    })(),

    // 3. Títulos de módulos (para contexto estructural)
    client
      .from('modules')
      .select('order_index, title')
      .eq('subject_id', subject.id)
      .order('order_index'),
  ])

  // Extraer resultados sin crashear si alguno falló
  const queryEmbedding = embedResult.status === 'fulfilled' ? embedResult.value : null
  const conversationId = historyResult.status === 'fulfilled' ? historyResult.value.conversationId : null
  const historyForGroq = historyResult.status === 'fulfilled' ? historyResult.value.history : []
  const modulesList    = modulesResult.status === 'fulfilled'
    ? (modulesResult.value.data ?? []).map(m => `Módulo ${m.order_index}: ${m.title}`).join('\n')
    : ''

  if (historyResult.status === 'rejected') {
    console.error('[chat] history error:', historyResult.reason)
  }

  // ── RAG semántico + cobertura por módulo ─────────────────────────────────
  let ragContext = ''

  if (queryEmbedding) {
    try {
      type Chunk = { module_id: string; module_order: number; module_title: string; content: string }

      const [ragResult, coverageResult] = await Promise.allSettled([
        client.rpc('match_module_chunks', {
          query_embedding: queryEmbedding,
          p_subject_id:    subject.id,
          match_count:     8,
        }),
        client.rpc('get_module_coverage', {
          p_subject_id: subject.id,
        }),
      ])

      const ragChunks      = ragResult.status      === 'fulfilled' ? (ragResult.value.data      ?? []) as Chunk[] : []
      const coverageChunks = coverageResult.status === 'fulfilled' ? (coverageResult.value.data ?? []) as Chunk[] : []

      // Merge: RAG chunks primero (más relevantes), coverage llena los módulos faltantes
      const seenModules = new Set(ragChunks.map(c => c.module_id))
      const missing     = coverageChunks.filter(c => !seenModules.has(c.module_id))
      const allChunks   = [...ragChunks, ...missing].sort((a, b) => a.module_order - b.module_order)

      if (allChunks.length > 0) {
        ragContext = allChunks
          .map(c => `[Módulo ${c.module_order} — ${c.module_title}]\n${c.content}`)
          .join('\n\n---\n\n')
      }
    } catch (err) {
      console.error('[chat] RAG error:', err)
    }
  }

  // Fallback a content_items si no hay chunks
  if (!ragContext) {
    const { data: items } = await supabase
      .from('content_items')
      .select('title, body')
      .eq('subject_id', subject.id)
      .eq('is_published', true)
      .not('body', 'is', null)
      .order('order_index')
      .limit(3)

    ragContext = (items ?? [])
      .filter(i => i.body)
      .map(i => `### ${i.title}\n${i.body}`)
      .join('\n\n---\n\n')
  }

  // ── Stream a Groq ─────────────────────────────────────────────────────────
  const groq   = createGroq({ apiKey: process.env.GROQ_API_KEY })
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `Sos un asistente de estudio para **${subject.name}** del ingreso a la UNLaM.

## Tu rol
Ayudás a estudiantes a entender el material, repasar conceptos y prepararse para el examen.

## Cómo responder
- Si el usuario saluda, respondé con naturalidad en una oración y seguí.
- No empieces con "¡Claro!", "Por supuesto", "¡Excelente pregunta!" ni similares. Respondé directo.
- No termines con "Espero que te sea útil", "No dudes en preguntar" ni frases de cierre. Cortá cuando terminaste de responder.
- Español argentino, tuteo, tono directo y amigable.
- Cuando uses información del material, mencioná el módulo (ej: "El Módulo 3 explica que…").
- Si te piden info de todos los módulos, respondé TODOS — el contexto tiene un fragmento de cada uno.
- Si algo no está en el material, decilo. No inventes.

## Módulos de ${subject.name}
${modulesList || '(no disponible)'}

## Contenido del material
${ragContext || 'No se encontraron fragmentos. Respondé solo con lo que aparece en la lista de módulos.'}`,
    messages: [...historyForGroq, lastUserMsg],
    maxOutputTokens: 1536,
    onFinish: async ({ text }) => {
      if (!conversationId) return
      try {
        await client.from('ai_messages').insert({
          conversation_id: conversationId,
          role:    'assistant',
          content: text,
        })
        await client
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)
      } catch (err) {
        console.error('[chat] onFinish save error:', err)
      }
    },
  })

  return result.toTextStreamResponse()
}
