import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAccessGrantedEmail } from '@/lib/email'
import { createHmac, timingSafeEqual } from 'crypto'

interface CheckoutMeta {
  email: string
  full_name: string
  subject_slug: string
  sendpulse_contact_id?: string
}

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false // sin secret configurado, rechazar todo

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
  try {
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
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

  // Validar que paymentId sea numérico
  if (!paymentId || !/^\d+$/.test(paymentId)) {
    return NextResponse.json({ ok: true })
  }

  // Verificar el pago con MP (timeout 8s para no agotar Vercel)
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    signal: AbortSignal.timeout(8000),
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
  if (!email || !subject_slug) {
    console.error('[webhook/mp] external_reference sin email o subject_slug')
    return NextResponse.json({ ok: true })
  }
  const supabase = createAdminClient()

  // Buscar usuario existente (el checkout requiere cuenta previa)
  const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', { user_email: email })

  if (rpcError) console.error('[webhook/mp] RPC error:', rpcError.message)

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

  if (!subject) {
    console.error('[webhook/mp] Subject no encontrado:', subject_slug)
    return NextResponse.json({ ok: true })
  }

  // Idempotencia: si el acceso fue otorgado en las últimas 24h (expires_at > 11 meses), ya está procesado
  const elevenMonthsFromNow = new Date()
  elevenMonthsFromNow.setMonth(elevenMonthsFromNow.getMonth() + 11)
  const { data: recentAccess } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', userId).eq('subject_id', subject.id)
    .gt('expires_at', elevenMonthsFromNow.toISOString()).maybeSingle()

  if (recentAccess) {
    console.log(`[webhook/mp] Acceso ya otorgado recientemente para ${email} → ${subject_slug}`)
    return NextResponse.json({ ok: true })
  }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  await supabase.from('user_subjects').upsert(
    { user_id: userId, subject_id: subject.id, expires_at: expiresAt.toISOString() },
    { onConflict: 'user_id,subject_id' }
  )

  // Email de confirmación de compra
  try {
    await sendAccessGrantedEmail({ email, full_name, subjects: [subject.name] })
  } catch { /* no bloquea */ }

  console.log(`[webhook/mp] ✅ Acceso otorgado: ${email} → ${subject_slug}`)
  return NextResponse.json({ ok: true })
}
