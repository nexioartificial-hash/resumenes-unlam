import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { grantAccess, type CheckoutMeta } from '@/lib/grantAccess'

export async function POST(req: NextRequest) {
  const { payment_id } = await req.json() as { payment_id?: string }

  if (!payment_id || !/^\d+$/.test(String(payment_id))) {
    return NextResponse.json({ error: 'payment_id inválido' }, { status: 400 })
  }
  const pid = String(payment_id)

  // Verificar pago con MP (fuente de verdad: nunca confiamos en el body del request)
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${pid}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    signal: AbortSignal.timeout(8000),
  })

  if (!mpRes.ok) {
    return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 400 })
  }

  const payment = await mpRes.json() as { status: string; external_reference: string }

  if (payment.status !== 'approved') {
    return NextResponse.json({ status: payment.status })
  }

  // Decodificar metadata desde la respuesta de MP (no del body del request)
  let meta: CheckoutMeta
  try {
    meta = JSON.parse(Buffer.from(payment.external_reference, 'base64').toString('utf8'))
  } catch {
    return NextResponse.json({ error: 'external_reference inválido' }, { status: 400 })
  }
  if (!meta.email || !meta.subject_slug) {
    return NextResponse.json({ error: 'external_reference incompleto' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Idempotencia por pago: reclamar el payment_id. Solo el primero procesa;
  // recargas de la página de éxito o el webhook en paralelo caen en 23505.
  const { error: claimErr } = await supabase
    .from('processed_payments')
    .insert({ payment_id: pid })

  if (claimErr) {
    if (claimErr.code === '23505') {
      // Ya procesado (esta misma página recargada o el webhook) → idempotente.
      return NextResponse.json({ status: 'approved' })
    }
    console.error('[finalize] processed_payments error:', claimErr.message)
    return NextResponse.json({ error: 'Error procesando el pago' }, { status: 500 })
  }

  try {
    await grantAccess(meta)
  } catch (err) {
    // Liberar el claim para que el webhook o un reintento puedan reprocesar.
    await supabase.from('processed_payments').delete().eq('payment_id', pid)
    console.error('[finalize] grantAccess falló:', err)
    return NextResponse.json({ error: 'Error otorgando acceso' }, { status: 500 })
  }

  return NextResponse.json({ status: 'approved' })
}
