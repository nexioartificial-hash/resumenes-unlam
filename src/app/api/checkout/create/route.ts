import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email:                 z.string().email(),
  full_name:             z.string().min(1),
  subject_slug:          z.string().min(1),
  instagram_username:    z.string().optional(),
  sendpulse_contact_id:  z.string().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })
  }

  const { email, full_name, subject_slug, instagram_username, sendpulse_contact_id } = parsed.data

  // Verificar que la materia existe y está disponible
  const supabase = createAdminClient()
  const { data: subject } = await supabase
    .from('subjects')
    .select('id, name, price, available')
    .eq('slug', subject_slug)
    .single()

  if (!subject) {
    return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })
  }
  if (!subject.available) {
    return NextResponse.json({ error: 'Materia no disponible' }, { status: 400 })
  }
  if (!subject.price) {
    return NextResponse.json({ error: 'Materia sin precio configurado' }, { status: 400 })
  }

  // Verificar si el usuario ya tiene acceso activo (evitar doble cobro)
  const { data: existingUserId } = await supabase.rpc('get_user_id_by_email', { user_email: email })
  if (existingUserId) {
    const { data: existingAccess } = await supabase
      .from('user_subjects').select('id')
      .eq('user_id', existingUserId).eq('subject_id', subject.id)
      .gt('expires_at', new Date().toISOString()).maybeSingle()
    if (existingAccess) {
      return NextResponse.json({ error: 'Ya tenés acceso activo a esta materia' }, { status: 400 })
    }
  }

  // Codificar metadata en external_reference (base64 JSON)
  const meta = {
    email,
    full_name,
    subject_slug,
    instagram_username:   instagram_username   ?? '',
    sendpulse_contact_id: sendpulse_contact_id ?? '',
  }
  const external_reference = Buffer.from(JSON.stringify(meta)).toString('base64')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumenesunlam.site'

  // Crear preferencia en MercadoPago
  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [{
        title:      `Resúmenes UNLaM — ${subject.name}`,
        quantity:   1,
        unit_price: subject.price,
        currency_id: 'ARS',
      }],
      payer:              { email },
      external_reference,
      back_urls: {
        success: `${appUrl}/checkout/success`,
        failure: `${appUrl}/checkout/failure`,
        pending: `${appUrl}/checkout/success`,
      },
      ...(appUrl.startsWith('https') ? { auto_return: 'approved' } : {}),
      notification_url:  `https://resumenesunlam.site/api/webhooks/mercadopago`,
    }),
  })

  if (!mpRes.ok) {
    const err = await mpRes.text()
    console.error('[checkout/create] MP error:', err)
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 })
  }

  const { init_point, sandbox_init_point, id: preference_id } = await mpRes.json() as {
    init_point: string; sandbox_init_point: string; id: string
  }
  const useSandbox = !appUrl.startsWith('https')
  return NextResponse.json({ init_point: useSandbox ? sandbox_init_point : init_point, preference_id })
}
