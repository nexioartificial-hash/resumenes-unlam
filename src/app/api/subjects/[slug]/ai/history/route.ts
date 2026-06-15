import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json([])

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', slug)
    .single()
  if (!subject) return Response.json([])

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return Response.json([], { status: 403 })

  const sb = serviceClient()

  const { data: conv } = await sb
    .from('ai_conversations')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .single()

  if (!conv) return Response.json([])

  const { data: messages } = await sb
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
    .limit(50)

  return Response.json(messages ?? [])
}

// Limpiar conversación
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', slug)
    .single()
  if (!subject) return new Response('No encontrado', { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return new Response('Sin acceso', { status: 403 })

  const sb = serviceClient()
  await sb
    .from('ai_conversations')
    .delete()
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)

  return new Response(null, { status: 204 })
}
