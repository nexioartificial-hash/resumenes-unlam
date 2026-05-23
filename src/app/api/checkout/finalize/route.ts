import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendAccessGrantedEmail } from '@/lib/email'

interface CheckoutMeta {
  email: string
  full_name: string
  subject_slug: string
  instagram_username: string
}

async function grantAccess(meta: CheckoutMeta) {
  const { email, full_name, subject_slug, instagram_username } = meta
  const supabase = createAdminClient()

  // Buscar o crear usuario
  let userId: string
  let isNewUser: boolean
  let password: string | null = null

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === email)

  if (existing) {
    userId    = existing.id
    isNewUser = false
    await supabase.from('profiles')
      .update({ full_name, instagram_username: instagram_username || null })
      .eq('id', userId)
  } else {
    password = crypto.randomUUID().slice(0, 16)
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (error || !newUser.user) throw new Error('Error creando usuario')
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

  // Generar link de recuperación para nuevos usuarios
  let resetLink: string | null = null
  if (isNewUser) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumenesunlam.site'
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
  } catch { /* email falla sin interrumpir */ }

  return { userId, isNewUser, resetLink, password }
}

export async function POST(req: NextRequest) {
  const { payment_id, external_reference } = await req.json() as {
    payment_id: string
    external_reference: string
  }

  if (!payment_id || !external_reference) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  // Verificar pago con MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })

  if (!mpRes.ok) {
    return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 400 })
  }

  const payment = await mpRes.json() as { status: string; external_reference: string }

  if (payment.status !== 'approved') {
    return NextResponse.json({ status: payment.status })
  }

  // Decodificar metadata
  let meta: CheckoutMeta
  try {
    meta = JSON.parse(Buffer.from(external_reference, 'base64').toString('utf8'))
  } catch {
    return NextResponse.json({ error: 'external_reference inválido' }, { status: 400 })
  }

  const { resetLink } = await grantAccess(meta)

  return NextResponse.json({ status: 'approved', reset_link: resetLink })
}
