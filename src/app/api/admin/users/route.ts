import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export async function GET() {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Perfiles con sus materias activas
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, instagram_username, is_admin, must_change_pass')
    .order('full_name')

  if (!profiles) return NextResponse.json([])

  // Materias activas por usuario
  const { data: userSubjects } = await supabase
    .from('user_subjects')
    .select('user_id, expires_at, subjects(id, name, slug)')
    .gt('expires_at', new Date().toISOString())

  const subjectsByUser = new Map<string, { name: string; slug: string; expires_at: string }[]>()
  for (const us of userSubjects ?? []) {
    const list = subjectsByUser.get(us.user_id) ?? []
    const sub  = us.subjects as unknown as { name: string; slug: string }
    list.push({ name: sub.name, slug: sub.slug, expires_at: us.expires_at })
    subjectsByUser.set(us.user_id, list)
  }

  // Obtener emails del admin client
  const adminClient = createAdminClient()
  const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
  const emailById = new Map(authData?.users?.map(u => [u.id, u.email ?? '']) ?? [])

  const result = profiles.map(p => ({
    ...p,
    email:    emailById.get(p.id) ?? '',
    subjects: subjectsByUser.get(p.id) ?? [],
  }))

  return NextResponse.json(result)
}

const grantSchema = z.object({
  user_id:     z.string().uuid(),
  subject_id:  z.string().uuid(),
  expires_at:  z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body   = await req.json()
  const parsed = grantSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const expiresAt = parsed.data.expires_at ?? (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString()
  })()

  const { error } = await supabase.from('user_subjects').upsert(
    { user_id: parsed.data.user_id, subject_id: parsed.data.subject_id, expires_at: expiresAt },
    { onConflict: 'user_id,subject_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const user_id    = searchParams.get('user_id')
  const subject_id = searchParams.get('subject_id')
  if (!user_id || !subject_id) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })

  const { error } = await supabase.from('user_subjects').delete()
    .eq('user_id', user_id).eq('subject_id', subject_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
