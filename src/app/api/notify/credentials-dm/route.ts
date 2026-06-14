import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { password } = await req.json() as { password?: string }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('sendpulse_contact_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.sendpulse_contact_id) {
    return NextResponse.json({ ok: true })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumenesunlam.site'
  let message: string

  if (password) {
    message =
      `Tus credenciales de Resúmenes UNLaM:\n` +
      `Email: ${user.email}\n` +
      `Contraseña: ${password}\n` +
      `Web: ${appUrl}\n` +
      `¡Guardá este mensaje!`
  } else {
    // Fallback: generar link fresco para setear contraseña
    const { data: linkData } = await admin.auth.admin.generateLink({
      type:    'recovery',
      email:   user.email!,
      options: { redirectTo: `${appUrl}/change-password` },
    })
    const resetLink = (linkData as { properties?: { action_link?: string } })?.properties?.action_link
      ?? `${appUrl}/reset-password`

    message =
      `Hola! Recordamos que podés ingresar a la plataforma de Resúmenes UNLaM.\n` +
      `Email: ${user.email}\n` +
      `Configurá tu contraseña acá: ${resetLink}\n` +
      `Web: ${appUrl}`
  }

  // Llamar al webhook de n8n (fire and forget)
  fetch('https://n8n.nexioagency.online/webhook/bienvenida-mp', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact_id: profile.sendpulse_contact_id, message }),
  }).catch(() => { /* no bloquea */ })

  return NextResponse.json({ ok: true })
}
