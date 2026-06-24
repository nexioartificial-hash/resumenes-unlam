import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { grantAccess, type CheckoutMeta } from '@/lib/grantAccess'
import { createHmac, timingSafeEqual } from 'crypto'

async function verifySignature(req: NextRequest): Promise<boolean> {
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

  if (!(await verifySignature(req))) {
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
    // Error transitorio: devolver 500 para que MP reintente la notificación.
    console.error('[webhook/mp] Error consultando pago (se pedirá reintento):', paymentId)
    return NextResponse.json({ error: 'mp_unreachable' }, { status: 500 })
  }

  const payment = await mpRes.json() as {
    status: string
    external_reference: string
    transaction_amount: number
  }

  if (payment.status !== 'approved') {
    // Pendiente/rechazado: nada que otorgar todavía. Cuando se apruebe, MP
    // enviará otra notificación. No reintentar esta.
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

  if (!meta.email || !meta.subject_slug) {
    console.error('[webhook/mp] external_reference sin email o subject_slug')
    return NextResponse.json({ ok: true })
  }

  const supabase = createAdminClient()

  // Idempotencia por pago: reclamar el payment_id. Si finalize (o un reintento
  // previo) ya lo procesó, caemos en 23505 y devolvemos OK sin duplicar.
  const { error: claimErr } = await supabase
    .from('processed_payments')
    .insert({ payment_id: String(paymentId) })

  if (claimErr) {
    if (claimErr.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    console.error('[webhook/mp] processed_payments error (se pedirá reintento):', claimErr.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  try {
    // grantAccess crea la cuenta si no existe (clave para pagos en efectivo/Rapipago
    // que aprueban acá sin que el usuario haya pasado por la página de éxito).
    await grantAccess(meta, { paidAmount: payment.transaction_amount })
  } catch (err) {
    // Liberar el claim y pedir reintento a MP.
    await supabase.from('processed_payments').delete().eq('payment_id', String(paymentId))
    console.error('[webhook/mp] grantAccess falló (se pedirá reintento):', err)
    return NextResponse.json({ error: 'grant_failed' }, { status: 500 })
  }

  console.log(`[webhook/mp] ✅ Acceso otorgado: ${meta.email} → ${meta.subject_slug}`)
  return NextResponse.json({ ok: true })
}
