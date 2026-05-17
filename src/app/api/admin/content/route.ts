import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return null
  return supabase
}

export async function GET(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const subjectId = new URL(req.url).searchParams.get('subject_id')
  let query = supabase
    .from('content_items')
    .select('id, subject_id, title, type, body, audio_url, duration_seconds, order_index, is_published, subjects(name)')
    .order('order_index')

  if (subjectId) query = query.eq('subject_id', subjectId)

  const { data } = await query
  return NextResponse.json(data ?? [])
}

const createSchema = z.object({
  subject_id:       z.string().uuid(),
  title:            z.string().min(1),
  type:             z.enum(['summary', 'guide', 'exam_model', 'audio']),
  body:             z.string().optional(),
  audio_url:        z.string().optional(),
  duration_seconds: z.number().int().optional(),
  order_index:      z.number().int().default(0),
  is_published:     z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body   = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })

  const { data, error } = await supabase.from('content_items').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

const updateSchema = z.object({
  id:               z.string().uuid(),
  title:            z.string().min(1).optional(),
  body:             z.string().optional(),
  audio_url:        z.string().optional(),
  duration_seconds: z.number().int().optional(),
  order_index:      z.number().int().optional(),
  is_published:     z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body   = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { id, ...updates } = parsed.data
  const { data, error } = await supabase.from('content_items').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const { error } = await supabase.from('content_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
