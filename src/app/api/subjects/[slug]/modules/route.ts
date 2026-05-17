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

  const { data: subject } = await supabase
    .from('subjects')
    .select('id, name, slug, color')
    .eq('slug', slug)
    .single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects')
    .select('expires_at')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, description, order_index')
    .eq('subject_id', subject.id)
    .eq('is_published', true)
    .order('order_index')

  const { data: progress } = await supabase
    .from('module_progress')
    .select('module_id')
    .eq('user_id', user.id)
    .in('module_id', (modules ?? []).map(m => m.id))

  const completedIds = new Set((progress ?? []).map(p => p.module_id))

  const result = (modules ?? []).map(m => ({
    ...m,
    completed: completedIds.has(m.id),
  }))

  return NextResponse.json({ subject, modules: result })
}
