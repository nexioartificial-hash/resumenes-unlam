import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail, sendAccessGrantedEmail } from '@/lib/email'

export interface CheckoutMeta {
  email:                 string
  full_name:             string
  subject_slug:          string
  instagram_username?:   string
  sendpulse_contact_id?: string
}

export interface GrantResult {
  userId:    string
  isNewUser: boolean
  granted:   boolean
}

/**
 * Otorga acceso a una materia tras un pago aprobado.
 *
 * La idempotencia REAL la garantiza el caller deduplicando por payment_id
 * (tabla processed_payments), por eso acá no se repite ninguna guarda de
 * ventana temporal: cada pago llega a grantAccess una sola vez.
 *
 * Crea el usuario si no existe — esto cubre los pagos en efectivo/Rapipago,
 * que aprueban horas después vía webhook cuando el usuario nunca pasó por
 * la página de éxito.
 */
export async function grantAccess(
  meta: CheckoutMeta,
  opts: { paidAmount?: number } = {}
): Promise<GrantResult> {
  const { email, full_name, subject_slug } = meta
  const instagram_username   = meta.instagram_username   || null
  const sendpulse_contact_id = meta.sendpulse_contact_id || null
  const supabase = createAdminClient()

  // 1. Resolver o crear usuario (race-safe ante email duplicado)
  let userId: string
  let isNewUser = false

  const { data: existingId } = await supabase.rpc('get_user_id_by_email', { user_email: email })

  if (existingId) {
    userId = existingId as string
  } else {
    const password = crypto.randomUUID().slice(0, 16)
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (error || !newUser?.user) {
      // Carrera: otro proceso pudo crearlo entre el lookup y el create.
      const { data: retryId } = await supabase.rpc('get_user_id_by_email', { user_email: email })
      if (!retryId) throw new Error(`No se pudo crear/encontrar usuario: ${error?.message ?? 'desconocido'}`)
      userId = retryId as string
    } else {
      userId    = newUser.user.id
      isNewUser = true
    }
  }

  // 2. Persistir perfil con metadata unificada.
  //    Solo se setean los campos con valor para no pisar datos previos con null.
  const profile: Record<string, unknown> = { id: userId, full_name }
  if (instagram_username)   profile.instagram_username   = instagram_username
  if (sendpulse_contact_id) profile.sendpulse_contact_id = sendpulse_contact_id
  if (isNewUser) {
    profile.must_change_pass = false
    profile.is_admin         = false
  }
  await supabase.from('profiles').upsert(profile, { onConflict: 'id' })

  // 3. Resolver materia y otorgar acceso por 1 año
  const { data: subject } = await supabase
    .from('subjects').select('id, name, price').eq('slug', subject_slug).single()

  if (!subject) {
    // Sin materia no hay nada que otorgar.
    return { userId, isNewUser, granted: false }
  }

  // Tripwire de monto: la preferencia se crea server-side con el precio de la
  // materia, así que el monto pagado SIEMPRE debería coincidir. Si no coincide,
  // se loguea para revisión (posible cambio de precio o manipulación). No se
  // deniega el acceso para no perjudicar a un comprador legítimo.
  if (
    opts.paidAmount != null &&
    subject.price != null &&
    opts.paidAmount + 0.5 < Number(subject.price)
  ) {
    console.error(
      `[grantAccess] ⚠️ Monto pagado (${opts.paidAmount}) < precio de la materia (${subject.price}) — ${email} → ${subject_slug}. Se otorga igual; revisar manualmente.`
    )
  }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  await supabase.from('user_subjects').upsert(
    { user_id: userId, subject_id: subject.id, expires_at: expiresAt.toISOString() },
    { onConflict: 'user_id,subject_id' }
  )

  // 4. Email (no bloquea la entrega: el acceso ya quedó otorgado arriba)
  try {
    if (isNewUser) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumenesunlam.site'
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'recovery', email,
        options: { redirectTo: `${appUrl}/auth/callback?next=/change-password` },
      })
      const resetLink = (linkData as { properties?: { action_link?: string } })?.properties?.action_link
        ?? `${appUrl}/reset-password`
      await sendWelcomeEmail({ email, full_name, subjects: [subject.name], reset_link: resetLink })
    } else {
      await sendAccessGrantedEmail({ email, full_name, subjects: [subject.name] })
    }
  } catch (err) {
    console.error('[grantAccess] Fallo al enviar email (acceso ya otorgado):', email, err)
  }

  return { userId, isNewUser, granted: true }
}
