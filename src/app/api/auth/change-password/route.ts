import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return NextResponse.json({ error: 'Error al cambiar la contraseña' }, { status: 500 })
  }

  // Marcar que ya no necesita cambiar la contraseña
  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({ must_change_pass: false })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
