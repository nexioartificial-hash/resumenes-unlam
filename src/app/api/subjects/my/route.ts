import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Todas las materias + cuáles tiene el usuario (activas y no vencidas)
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, slug, price, available, description, benefit, department, order_index')
    .order('order_index')

  const { data: userSubjects } = await supabase
    .from('user_subjects')
    .select('subject_id, granted_at, expires_at')
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString())

  const accessMap = new Map(
    (userSubjects ?? []).map(us => [us.subject_id, us])
  )

  const result = (subjects ?? []).map(subject => ({
    ...subject,
    has_access:  accessMap.has(subject.id),
    granted_at:  accessMap.get(subject.id)?.granted_at ?? null,
    expires_at:  accessMap.get(subject.id)?.expires_at ?? null,
  }))

  return NextResponse.json(result)
}
