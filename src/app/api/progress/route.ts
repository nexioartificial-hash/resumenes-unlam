import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  content_item_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const body   = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar que el content_item pertenece a una materia con acceso activo
  const { data: item } = await supabase
    .from('content_items')
    .select('subject_id')
    .eq('id', parsed.data.content_item_id)
    .single()

  if (!item) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })

  const { data: access } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', item.subject_id)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!access) return NextResponse.json({ error: 'Sin acceso a esta materia' }, { status: 403 })

  await supabase
    .from('user_progress')
    .upsert({ user_id: user.id, content_item_id: parsed.data.content_item_id })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const content_item_id  = searchParams.get('content_item_id')

  if (!content_item_id) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('content_item_id', content_item_id)

  return NextResponse.json({ success: true })
}
