import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAccessGrantedEmail } from '@/lib/email'
import { createHmac } from 'crypto'

interface CheckoutMeta {
  email: string
  full_name: string
  subject_slug: string
  sendpulse_contact_id?: string
}

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // si no hay secret configurado, no bloquear

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  const url    = new URL(req.url)
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id')

  const parts: Record<string, string> = {}
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=')
    if (k && v) parts[k.trim()] = v.trim()
  }
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId ?? ''};request-id:${xRequestId};ts:${ts};`
  const computed = createHmac('sha256', secret).update(manifest).digest('hex')
  return computed === v1
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!(await verifySignature(req, rawBody))) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  // MP envía el payment_id como query param o en el body
  const url    = new URL(req.url)
  const topic  = url.searchParams.get('topic') ?? url.searchParams.get('type')
  const id     = url.searchParams.get('id') ?? url.searchParams.get('data.id')

  let paymentId = id

  // También puede venir en el body JSON
  if (!paymentId) {
    try {
      const body = JSON.parse(rawBody) as { action?: string; data?: { id?: string } }
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

  const { email, full_name, subject_slug, sendpulse_contact_id } = meta
  const supabase = createAdminClient()

  // Buscar usuario existente (el checkout requiere cuenta previa)
  const { data: userId } = await supabase.rpc('get_user_id_by_email', { user_email: email })

  if (!userId) {
    console.error('[webhook/mp] Usuario no encontrado:', email)
    return NextResponse.json({ ok: true })
  }

  await supabase.from('profiles').upsert(
    { id: userId, full_name, sendpulse_contact_id: sendpulse_contact_id || null },
    { onConflict: 'id' }
  )

  // Otorgar acceso a la materia por 1 año
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

  // Email de confirmación de compra
  try {
    const subjects = subject ? [subject.name] : []
    await sendAccessGrantedEmail({ email, full_name, subjects })
  } catch { /* no bloquea */ }

  console.log(`[webhook/mp] ✅ Acceso otorgado: ${email} → ${subject_slug}`)
  return NextResponse.json({ ok: true })
}
