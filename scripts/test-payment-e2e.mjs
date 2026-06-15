/**
 * E2E test del flujo de pago MercadoPago
 *
 * Pasos:
 *   1. Crear preferencia via nuestra API (/api/checkout/create)
 *   2. Tokenizar tarjeta de prueba via MP API (/v1/card_tokens)
 *   3. Crear pago aprobado via MP API (/v1/payments)
 *   4. Disparar nuestro webhook con HMAC-SHA256 válido
 *   5. Verificar respuesta { ok: true }
 *
 * Tarjeta de prueba: Visa 4509953566233704, titular "APRO" → siempre aprobada
 */

import { createHmac } from 'crypto'
import { readFileSync } from 'fs'

// ── Cargar .env.local ─────────────────────────────────────────────────────────
function parseEnvLocal() {
  const content = readFileSync('.env.local', 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...rest] = trimmed.split('=')
    env[key.trim()] = rest.join('=').trim()
  }
  return env
}

const env = parseEnvLocal()
const MP_ACCESS_TOKEN  = env.MP_ACCESS_TOKEN
const MP_WEBHOOK_SECRET = env.MP_WEBHOOK_SECRET
const BASE_URL = 'http://localhost:3000'

if (!MP_ACCESS_TOKEN || !MP_WEBHOOK_SECRET) {
  console.error('❌ Faltan MP_ACCESS_TOKEN o MP_WEBHOOK_SECRET en .env.local')
  process.exit(1)
}

// ── Datos de prueba ──────────────────────────────────────────────────────────
const RUN_ID    = Date.now()
const testEmail = `e2e-${RUN_ID}@testpago.com`
const testMeta  = {
  email:                testEmail,
  full_name:            'Test E2E Checkout',
  subject_slug:         'logica-matematica',
  instagram_username:   '',
  sendpulse_contact_id: '',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const ok   = (msg) => console.log(`   ✅ ${msg}`)
const fail = (msg) => { console.error(`   ❌ ${msg}`); process.exit(1) }
const step = (n, msg) => console.log(`\n${n}  ${msg}`)

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════╗')
console.log('║   E2E: MercadoPago Checkout — ResumenesUNLaM         ║')
console.log('╚══════════════════════════════════════════════════════╝')
console.log(`   Email de prueba: ${testEmail}`)

// PASO 1 — Crear preferencia
step('1️⃣ ', 'Creando preferencia MP via /api/checkout/create...')
const prefRes = await fetch(`${BASE_URL}/api/checkout/create`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({
    email:        testMeta.email,
    full_name:    testMeta.full_name,
    subject_slug: testMeta.subject_slug,
  }),
})
if (!prefRes.ok) fail(`HTTP ${prefRes.status}: ${await prefRes.text()}`)
const { init_point, preference_id } = await prefRes.json()
if (!preference_id) fail('No se recibió preference_id')
ok(`preference_id: ${preference_id}`)
ok(`init_point:    ${init_point}`)

// PASO 2 — Tokenizar tarjeta de prueba
step('2️⃣ ', 'Tokenizando tarjeta Visa test (titular APRO → aprobada)...')
const tokenRes = await fetch('https://api.mercadopago.com/v1/card_tokens', {
  method:  'POST',
  headers: {
    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    'Content-Type':  'application/json',
  },
  body: JSON.stringify({
    card_number:      '4509953566233704',
    expiration_year:  2027,
    expiration_month: 11,
    security_code:    '123',
    cardholder: {
      name: 'APRO',
      identification: { type: 'DNI', number: '12345678' },
    },
  }),
})
if (!tokenRes.ok) {
  const err = await tokenRes.text()
  fail(`Tokenización fallida (HTTP ${tokenRes.status}): ${err}`)
}
const tokenData = await tokenRes.json()
const cardToken = tokenData.id
if (!cardToken) fail(`No se recibió card token: ${JSON.stringify(tokenData)}`)
ok(`card_token: ${cardToken}`)

// PASO 3 — Crear pago en sandbox
step('3️⃣ ', 'Creando pago en sandbox MP (monto ARS 100)...')
const external_reference = Buffer.from(JSON.stringify(testMeta)).toString('base64')
const payRes = await fetch('https://api.mercadopago.com/v1/payments', {
  method:  'POST',
  headers: {
    'Authorization':    `Bearer ${MP_ACCESS_TOKEN}`,
    'Content-Type':     'application/json',
    'X-Idempotency-Key': `e2e-test-${RUN_ID}`,
  },
  body: JSON.stringify({
    transaction_amount: 100,
    token:              cardToken,
    description:        'E2E Test — Resúmenes UNLaM Lógica Matemática',
    installments:       1,
    payment_method_id:  'visa',
    payer: {
      email:          testMeta.email,
      identification: { type: 'DNI', number: '12345678' },
    },
    external_reference,
  }),
})
const payment = await payRes.json()
console.log(`   payment_id:     ${payment.id}`)
console.log(`   status:         ${payment.status}`)
console.log(`   status_detail:  ${payment.status_detail}`)
if (payment.status !== 'approved') {
  console.error('   Respuesta completa:', JSON.stringify(payment, null, 2))
  fail(`Pago no aprobado: status=${payment.status}`)
}
ok(`PAGO APROBADO — payment_id: ${payment.id}`)

// PASO 4 — Disparar webhook con HMAC-SHA256
step('4️⃣ ', 'Disparando webhook /api/webhooks/mercadopago con firma HMAC...')
const paymentId = payment.id.toString()
const requestId = `e2e-req-${RUN_ID}`
const ts        = Math.floor(Date.now() / 1000).toString()
const manifest  = `id:${paymentId};request-id:${requestId};ts:${ts};`
const sig       = createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex')

console.log(`   manifest:  ${manifest}`)
console.log(`   signature: ts=${ts},v1=${sig.slice(0, 16)}...`)

const whRes = await fetch(
  `${BASE_URL}/api/webhooks/mercadopago?data.id=${paymentId}&type=payment`,
  {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'x-signature':   `ts=${ts},v1=${sig}`,
      'x-request-id':  requestId,
    },
    body: JSON.stringify({ action: 'payment.created', data: { id: paymentId } }),
  }
)
const whBody = await whRes.json()
console.log(`   HTTP ${whRes.status} → ${JSON.stringify(whBody)}`)
if (whRes.status !== 200 || !whBody.ok) {
  fail(`Webhook retornó error: HTTP ${whRes.status} → ${JSON.stringify(whBody)}`)
}
ok('Webhook procesado — acceso otorgado en Supabase')

// ── Resumen ───────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════╗')
console.log('║   🎉  TODOS LOS PASOS EXITOSOS                       ║')
console.log('╚══════════════════════════════════════════════════════╝')
console.log(`   preference_id : ${preference_id}`)
console.log(`   payment_id    : ${payment.id}  (approved)`)
console.log(`   email test    : ${testEmail}`)
console.log(`   subject       : ${testMeta.subject_slug}`)
console.log('\n👉 Verificar en Supabase Studio → tabla user_subjects')
console.log(`   WHERE user's email = '${testEmail}'`)
console.log()
