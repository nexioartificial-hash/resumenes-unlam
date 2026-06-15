import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.json(
      { error: 'Email o contraseña incorrectos' },
      { status: 401 }
    )
  }

  const sessionToken = crypto.randomUUID()
  const admin = createAdminClient()

  // Paralelo: registrar sesión + leer perfil
  const [, { data: profile }] = await Promise.all([
    admin.from('user_sessions').upsert(
      {
        user_id:       data.user.id,
        session_token: sessionToken,
        last_active:   new Date().toISOString(),
        updated_at:    new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    ),
    admin
      .from('profiles')
      .select('must_change_pass, full_name, is_admin')
      .eq('id', data.user.id)
      .single(),
  ])

  const response = NextResponse.json({
    user: {
      id:             data.user.id,
      email:          data.user.email,
      full_name:      profile?.full_name,
      is_admin:       profile?.is_admin ?? false,
      must_change_pass: profile?.must_change_pass ?? false,
    },
    session_token: sessionToken,
  })

  // Guardar session_token en cookie httpOnly
  response.cookies.set('session_token', sessionToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 365, // 1 año
    path:     '/',
  })

  return response
}
