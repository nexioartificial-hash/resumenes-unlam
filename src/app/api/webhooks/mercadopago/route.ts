import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail, sendAccessGrantedEmail } from '@/lib/email'

interface CheckoutMeta {
  email: string
  full_name: string
  subject_slug: string
  instagram_username: string
}

export async function POST(req: NextRequest) {
  // MP envía el payment_id como query param o en el body
  const url    = new URL(req.url)
  const topic  = url.searchParams.get('topic') ?? url.searchParams.get('type')
  const id     = url.searchParams.get('id') ?? url.searchParams.get('data.id')

  let paymentId = id

  // También puede venir en el body JSON
  if (!paymentId) {
    try {
      const body = await req.json() as { action?: string; data?: { id?: string } }
      if (body?.data?.id) paymentId = String(body.data.id)
    } catch { /* body vacío */ }
  }

  // Ignorar notificaciones que no sean de pagos
  if (topic && topic !== 'payment') {
    return NextResponse.json({ ok: true })
  }

  if (!paymentId) {
    return NextResponse.json({ ok: true })
  }

  // Verificar el pago con MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })

  if (!mpRes.ok) {
    console.error('[webhook/mp] Error fetching payment:', paymentId)
    return NextResponse.json({ ok: true })
  }

  const payment = await mpRes.json() as {
    status: string
    external_reference: string
  }

  if (payment.status !== 'approved') {
    return NextResponse.json({ ok: true })
  }

  // Decodificar metadata
  let meta: CheckoutMeta
  try {
    meta = JSON.parse(Buffer.from(payment.external_reference, 'base64').toString('utf8'))
  } catch {
    console.error('[webhook/mp] external_reference inválido')
    return NextResponse.json({ ok: true })
  }

  const { email, full_name, subject_slug, instagram_username } = meta
  const supabase = createAdminClient()

  // Buscar o crear usuario (idempotente)
  let userId: string
  let isNewUser: boolean

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === email)

  if (existing) {
    userId    = existing.id
    isNewUser = false
    await supabase.from('profiles')
      .update({ full_name, instagram_username: instagram_username || null })
      .eq('id', userId)
  } else {
    const password = crypto.randomUUID().slice(0, 16)
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (error || !newUser.user) {
      console.error('[webhook/mp] Error creando usuario:', error)
      return NextResponse.json({ ok: true })
    }
    userId    = newUser.user.id
    isNewUser = true
    await supabase.from('profiles').upsert({
      id: userId, full_name,
      instagram_username: instagram_username || null,
      must_change_pass: false, is_admin: false,
    })
  }

  // Otorgar acceso a la materia
  const { data: subject } = await supabase
    .from('subjects').select('id, name').eq('slug', subject_slug).single()

  if (subject) {
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    await supabase.from('user_subjects').upsert(
      { user_id: userId, subject_id: subject.id, expires_at: expiresAt.toISOString() },
      { onConflict: 'user_id,subject_id' }
    )
  }

  // Generar reset_link para nuevos usuarios
  let resetLink: string | null = null
  if (isNewUser) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumenesunlam.vercel.app'
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'recovery', email,
      options: { redirectTo: `${appUrl}/change-password` },
    })
    resetLink = (linkData as { properties?: { action_link?: string } })?.properties?.action_link
      ?? `${appUrl}/reset-password`
  }

  // Email (opcional)
  try {
    const subjects = subject ? [subject.name] : []
    if (isNewUser && resetLink) {
      await sendWelcomeEmail({ email, full_name, subjects, reset_link: resetLink })
    } else if (!isNewUser) {
      await sendAccessGrantedEmail({ email, full_name, subjects })
    }
  } catch { /* no bloquea */ }

  // Enviar DM de bienvenida via n8n (con contact_id guardado en profiles)
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('sendpulse_contact_id')
      .eq('id', userId)
      .single()

    if (profile?.sendpulse_contact_id && resetLink) {
      await fetch('https://n8n.nexioagency.online/webhook/bienvenida-mp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: profile.sendpulse_contact_id,
          email,
          reset_link: resetLink,
        }),
      })
    }
  } catch { /* DM falla sin interrumpir */ }

  console.log(`[webhook/mp] ✅ Acceso otorgado: ${email} → ${subject_slug}`)
  return NextResponse.json({ ok: true })
}
