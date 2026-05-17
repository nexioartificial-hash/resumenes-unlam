import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM    = 'Resúmenes UNLaM <noreply@resumenes-unlam.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function brandedHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { background: #F5F7E9; font-family: Arial, sans-serif; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .brand { color: #0F3F26; font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-bottom: 24px; }
    .divider { border: none; border-top: 1px solid #f0f0f0; margin: 24px 0; }
    p { color: #333; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #F5D63E; color: #0A0A0A; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none; letter-spacing: 1px; font-size: 13px; margin: 8px 0; }
    .footer { text-align: center; color: #aaa; font-size: 12px; margin-top: 32px; }
    .subject-tag { display: inline-block; background: #0F3F26; color: #F5F7E9; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin: 4px 4px 4px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">RESÚMENES UNLAM</div>
    ${body}
    <hr class="divider" />
    <div class="footer">@resumenes.unlam · Curso de Ingreso UNLaM</div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(opts: {
  email:       string
  full_name:   string
  subjects:    string[]
  reset_link:  string
}) {
  if (!resend) {
    console.log('[email] Resend no configurado — omitiendo welcome email para', opts.email)
    return
  }

  const subjectTags = opts.subjects
    .map(s => `<span class="subject-tag">${s}</span>`)
    .join('')

  const html = brandedHtml(
    'Bienvenido a Resúmenes UNLaM',
    `<p>Hola <strong>${opts.full_name}</strong>, ¡bienvenido al curso de ingreso!</p>
     <p>Tu acceso fue habilitado para las siguientes materias:</p>
     <p>${subjectTags}</p>
     <p>Para ingresar a la plataforma, primero configurá tu contraseña haciendo clic en el botón:</p>
     <p><a class="btn" href="${opts.reset_link}">CONFIGURAR CONTRASEÑA</a></p>
     <p style="color:#999;font-size:13px;">Una vez que configures tu contraseña, podés ingresar desde <a href="${APP_URL}/login">${APP_URL}/login</a> con tu email.</p>
     <p style="color:#999;font-size:12px;">Este link es de un solo uso y expira en 24 horas.</p>`
  )

  await resend.emails.send({
    from:    FROM,
    to:      opts.email,
    subject: '¡Tu acceso a Resúmenes UNLaM está listo! 🎓',
    html,
  })
}

export async function sendAccessGrantedEmail(opts: {
  email:    string
  full_name: string
  subjects: string[]
}) {
  if (!resend) {
    console.log('[email] Resend no configurado — omitiendo access email para', opts.email)
    return
  }

  const subjectTags = opts.subjects
    .map(s => `<span class="subject-tag">${s}</span>`)
    .join('')

  const html = brandedHtml(
    'Nuevo acceso habilitado',
    `<p>Hola <strong>${opts.full_name}</strong>,</p>
     <p>Se habilitó tu acceso a las siguientes materias:</p>
     <p>${subjectTags}</p>
     <p>Entrá a la plataforma para estudiar:</p>
     <p><a class="btn" href="${APP_URL}/login">IR A LA PLATAFORMA</a></p>`
  )

  await resend.emails.send({
    from:    FROM,
    to:      opts.email,
    subject: '✅ Nuevo acceso habilitado — Resúmenes UNLaM',
    html,
  })
}
