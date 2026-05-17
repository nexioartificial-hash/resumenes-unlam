import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id: moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar acceso a la materia
  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  // Marcar módulo como completado (upsert para no duplicar)
  const { error } = await supabase
    .from('module_progress')
    .upsert({ user_id: user.id, module_id: moduleId }, { onConflict: 'user_id,module_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
