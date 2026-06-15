import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('sendpulse_contact_id')
    .eq('id', user.id)
    .single()

  if (!profile?.sendpulse_contact_id) {
    return NextResponse.json({ ok: true })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumenesunlam.site'

  // Siempre usar link de recovery — nunca enviar contraseña en texto plano
  const { data: linkData } = await admin.auth.admin.generateLink({
    type:    'recovery',
    email:   user.email!,
    options: { redirectTo: `${appUrl}/auth/callback?next=/change-password` },
  })
  const resetLink = (linkData as { properties?: { action_link?: string } })?.properties?.action_link
    ?? `${appUrl}/reset-password`

  const message =
    `Hola! Recordamos que podés ingresar a la plataforma de Resúmenes UNLaM.\n` +
    `Email: ${user.email}\n` +
    `Configurá tu contraseña acá: ${resetLink}\n` +
    `Web: ${appUrl}`

  // Llamar al webhook de n8n (fire and forget)
  fetch('https://n8n.nexioagency.online/webhook/bienvenida-mp', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact_id: profile.sendpulse_contact_id, message }),
  }).catch(() => { /* no bloquea */ })

  return NextResponse.json({ ok: true })
}
