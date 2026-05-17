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
