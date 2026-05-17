import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendWelcomeEmail, sendAccessGrantedEmail } from '@/lib/email'

const schema = z.object({
  email:               z.string().email(),
  full_name:           z.string().min(1),
  subject_slugs:       z.array(z.string()).min(1),
  instagram_username:  z.string().optional(),
  contact_id:          z.string().optional(),
})

export async function POST(req: NextRequest) {
  // ── Validar secreto ──────────────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret')
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // ── Parsear y validar body ───────────────────────────────────────
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })
  }

  const { email, full_name, subject_slugs, instagram_username, contact_id } = parsed.data
  const supabase = createAdminClient()

  // ── Buscar o crear usuario ───────────────────────────────────────
  let userId:    string
  let isNewUser: boolean
  let password:  string | null = null

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === email)

  if (existingUser) {
    userId    = existingUser.id
    isNewUser = false

    await supabase
      .from('profiles')
      .update({ full_name, instagram_username: instagram_username ?? null, ...(contact_id ? { sendpulse_contact_id: contact_id } : {}) })
      .eq('id', userId)

  } else {
    password = crypto.randomUUID().slice(0, 16)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !newUser.user) {
      console.error('[webhook] Error creando usuario:', createError)
      return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 })
    }

    userId    = newUser.user.id
    isNewUser = true

    await supabase.from('profiles').upsert({
      id:                    userId,
      full_name,
      instagram_username:    instagram_username ?? null,
      sendpulse_contact_id:  contact_id ?? null,
      must_change_pass:      false,
      is_admin:              false,
    })
  }

  // ── Otorgar acceso a las materias ────────────────────────────────
  const grantedSubjects: string[] = []

  for (const slug of subject_slugs) {
    const { data: subject } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (!subject) {
      console.warn(`[webhook] Materia no encontrada: ${slug}`)
      continue
    }

    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    await supabase.from('user_subjects').upsert(
      {
        user_id:    userId,
        subject_id: subject.id,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'user_id,subject_id' }
    )

    grantedSubjects.push(subject.name)
  }

  // ── Generar link de acceso (para usuarios nuevos) ───────────────
  let resetLink: string | null = null

  if (isNewUser) {
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type:    'recovery',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/change-password` },
    })
    resetLink = (linkData as { properties?: { action_link?: string } })?.properties?.action_link
      ?? `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
  }

  // ── Enviar email (opcional — no interrumpe el flujo si falla) ───
  try {
    if (isNewUser && resetLink) {
      await sendWelcomeEmail({ email, full_name, subjects: grantedSubjects, reset_link: resetLink })
    } else if (!isNewUser) {
      await sendAccessGrantedEmail({ email, full_name, subjects: grantedSubjects })
    }
  } catch (emailErr) {
    console.error('[webhook] Error enviando email:', emailErr)
  }

  return NextResponse.json({
    success:          true,
    user_id:          userId,
    is_new_user:      isNewUser,
    subjects_granted: grantedSubjects,
    password,
    reset_link:       resetLink,
  })
}
