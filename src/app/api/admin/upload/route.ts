import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return null
  return user
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/x-m4a']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido. Solo audio (mp3, m4a, wav, ogg)' }, { status: 400 })
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera el límite de 50 MB' }, { status: 400 })
  }

  const ext      = file.name.split('.').pop() ?? 'mp3'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer   = await file.arrayBuffer()

  const admin = createAdminClient()
  const { error } = await admin.storage
    .from('audios')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[upload]', error)
    return NextResponse.json({ error: 'Error al subir el archivo: ' + error.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from('audios').getPublicUrl(filename)

  return NextResponse.json({ url: urlData.publicUrl, filename })
}
