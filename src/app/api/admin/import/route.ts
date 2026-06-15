import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return null
  return supabase
}

const itemSchema = z.object({
  subject_slug:     z.string(),
  title:            z.string().min(1),
  type:             z.enum(['summary', 'guide', 'exam_model', 'audio']),
  body:             z.string().optional(),
  audio_url:        z.string().optional(),
  duration_seconds: z.number().int().optional(),
  order_index:      z.number().int().default(0),
  is_published:     z.boolean().default(true),
})

const importSchema = z.array(itemSchema).min(1).max(200)

export async function POST(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = importSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })
  }

  // Resolver slugs → IDs
  const slugs = [...new Set(parsed.data.map(i => i.subject_slug))]
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, slug')
    .in('slug', slugs)

  const slugToId = new Map(subjects?.map(s => [s.slug, s.id]) ?? [])

  const skipped: string[] = []
  const toInsert = parsed.data
    .filter(item => {
      if (!slugToId.has(item.subject_slug)) {
        skipped.push(`"${item.title}" (slug desconocido: ${item.subject_slug})`)
        return false
      }
      return true
    })
    .map(({ subject_slug, ...rest }) => ({
      ...rest,
      subject_id: slugToId.get(subject_slug)!,
      body:        rest.body  || null,
      audio_url:   rest.audio_url || null,
    }))

  if (toInsert.length === 0) {
    return NextResponse.json({ error: 'Ningún ítem pudo importarse', skipped }, { status: 400 })
  }

  const { data: inserted, error } = await supabase
    .from('content_items')
    .insert(toInsert)
    .select('id, title')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    imported: inserted?.length ?? 0,
    skipped_count: skipped.length,
    skipped,
  })
}
