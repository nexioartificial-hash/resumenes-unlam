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
    .select('id')
    .eq('slug', slug)
    .single()

  if (!subject) return NextResponse.json([], { status: 200 })

  const { data: history } = await supabase
    .from('quiz_attempts')
    .select('id, score, total, attempted_at')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .order('attempted_at', { ascending: false })
    .limit(5)

  return NextResponse.json(history ?? [])
}
