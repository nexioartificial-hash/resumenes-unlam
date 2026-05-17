import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Buscar la materia
  const { data: subject } = await supabase
    .from('subjects')
    .select('id, name, slug, color')
    .eq('slug', slug)
    .single()

  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  // Verificar acceso activo (no vencido)
  const { data: access } = await supabase
    .from('user_subjects')
    .select('expires_at')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!access) return NextResponse.json({ error: 'Sin acceso a esta materia' }, { status: 403 })

  // Obtener contenido ordenado
  const { data: items } = await supabase
    .from('content_items')
    .select('id, title, body, type, audio_url, duration_seconds, order_index')
    .eq('subject_id', subject.id)
    .eq('is_published', true)
    .order('order_index')

  // Obtener progreso del usuario en esta materia
  const { data: progress } = await supabase
    .from('user_progress')
    .select('content_item_id')
    .eq('user_id', user.id)
    .in('content_item_id', (items ?? []).map(i => i.id))

  const completedIds = new Set((progress ?? []).map(p => p.content_item_id))

  const content = (items ?? []).map(item => ({
    ...item,
    completed: completedIds.has(item.id),
  }))

  return NextResponse.json({ subject, content })
}
