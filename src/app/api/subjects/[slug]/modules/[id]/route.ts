import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id: moduleId } = await params
  const supabase = await createClient()
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

  const { data: module_ } = await supabase
    .from('modules').select('id, title, body, order_index')
    .eq('id', moduleId).eq('subject_id', subject.id).single()
  if (!module_) return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 })

  const { data: progress } = await supabase
    .from('module_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()

  return NextResponse.json({ ...module_, completed: !!progress })
}
