import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM    = 'Resúmenes UNLaM <noreply@resumenesunlam.site>'
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

export async function sendRegistrationWelcomeEmail(opts: {
  email: string
}) {
  if (!resend) return

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a Resúmenes UNLaM</title>
</head>
<body style="margin:0;padding:0;background-color:#F2EFE6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2EFE6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="background-color:#0F3F26;border-radius:16px 16px 0 0;padding:36px 40px 32px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:10px;vertical-align:middle;">
                <img src="https://resumenesunlam.site/logo-cropped.png" alt="Resúmenes UNLaM" width="44" height="44" style="display:block;filter:brightness(0) invert(1);"/>
              </td>
              <td style="vertical-align:middle;">
                <span style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;">ResumenesUNLaM</span>
              </td>
            </tr>
          </table>
          <div style="margin-top:28px;">
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;">BIENVENIDO/A</p>
            <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:900;line-height:1;letter-spacing:-0.01em;">TU CUENTA<br/>ESTÁ LISTA</h1>
          </div>
          <div style="margin-top:24px;width:40px;height:3px;background-color:#F5D63E;border-radius:2px;"></div>
        </td></tr>

        <tr><td style="background-color:#ffffff;padding:36px 40px;">
          <p style="margin:0 0 8px;color:#0A0A0A;font-size:16px;font-weight:600;line-height:1.5;">¡Ya podés empezar!</p>
          <p style="margin:0 0 28px;color:rgba(10,10,10,0.55);font-size:15px;line-height:1.6;">
            Tu cuenta en Resúmenes UNLaM fue creada con el email <strong>${opts.email}</strong>. Ingresá a la plataforma y comprá las materias que necesitás para el ingreso.
          </p>
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td align="center">
              <a href="${APP_URL}/dashboard" style="display:inline-block;background-color:#0F3F26;color:#F2EFE6;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:12px;">
                IR A MIS MATERIAS →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background-color:#F2EFE6;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid rgba(10,10,10,0.06);">
          <p style="margin:0;color:rgba(10,10,10,0.35);font-size:11px;line-height:1.6;text-align:center;">
            Si no creaste esta cuenta, ignorá este email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from:    FROM,
    to:      opts.email,
    subject: '¡Bienvenido/a a Resúmenes UNLaM! 🎓',
    html,
  })
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
