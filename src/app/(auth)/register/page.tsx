'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  const [focusedEmail,    setFocusedEmail]    = useState(false)
  const [focusedPassword, setFocusedPassword] = useState(false)
  const [focusedConfirm,  setFocusedConfirm]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (signUpError) {
      const msg = signUpError.message
      setError(
        msg.includes('already registered') || msg.includes('already exists')
          ? 'Ya existe una cuenta con ese email. Iniciá sesión.'
          : msg
      )
      setLoading(false)
      return
    }

    // Si hay sesión activa, redirigir inmediatamente
    if (data.session) {
      router.push('/dashboard')
      return
    }

    // Sin sesión = Supabase pide confirmación por email
    setDone(true)
    setLoading(false)
  }

  const inputStyle = (focused: boolean) => ({
    border: focused ? '1.5px solid var(--verde)' : '1.5px solid rgba(10,10,10,0.10)',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(15,63,38,0.08)' : 'none',
  })

  const labelStyle = (focused: boolean) => ({
    color: focused ? 'var(--verde)' : 'rgba(10,10,10,0.45)',
  })

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--crema)' }}>
        <div className="w-full max-w-sm text-center px-8">
          <p className="text-4xl mb-4">📬</p>
          <h2 className="font-display text-verde text-2xl mb-3">REVISÁ TU EMAIL</h2>
          <p className="text-tinta/60 text-sm leading-relaxed mb-6">
            Te enviamos un link de confirmación a <strong>{email}</strong>. Hacé click en el link para activar tu cuenta.
          </p>
          <Link href="/login" className="text-[12px] text-tinta/40 hover:text-verde transition-colors">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--crema)' }}>
      <div className="w-full max-w-sm px-8" style={{ animation: 'fade-in-up 0.5s ease both' }}>

        {/* Marca */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-5 h-5 rounded-sm flex items-center justify-center" style={{ backgroundColor: 'var(--verde)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--crema)" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--crema)" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-verde text-[11px] font-bold tracking-[0.3em] uppercase">ResumenesUNLaM</span>
        </div>

        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.25em] text-tinta/30 mb-2">ACCESO A LA PLATAFORMA</p>
          <h2 className="font-display text-tinta leading-tight" style={{ fontSize: '2.4rem' }}>
            CREÁ TU<br />
            <span style={{ color: 'var(--verde)' }}>CUENTA</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors"
              style={labelStyle(focusedEmail)}
            >
              CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedEmail(true)}
              onBlur={() => setFocusedEmail(false)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full rounded-xl px-4 py-3.5 text-sm bg-white transition-all duration-200"
              style={inputStyle(focusedEmail)}
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors"
              style={labelStyle(focusedPassword)}
            >
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedPassword(true)}
              onBlur={() => setFocusedPassword(false)}
              required
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl px-4 py-3.5 text-sm bg-white transition-all duration-200"
              style={inputStyle(focusedPassword)}
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors"
              style={labelStyle(focusedConfirm)}
            >
              CONFIRMÁ LA CONTRASEÑA
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onFocus={() => setFocusedConfirm(true)}
              onBlur={() => setFocusedConfirm(false)}
              required
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
              className="w-full rounded-xl px-4 py-3.5 text-sm bg-white transition-all duration-200"
              style={inputStyle(focusedConfirm)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rojo text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3.5 rounded-xl transition-all duration-200 tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--verde)', color: 'var(--crema)' }}
            onMouseEnter={e => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--verde-claro)'
            }}
            onMouseLeave={e => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--verde)'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Creando cuenta...
              </span>
            ) : 'CREAR CUENTA →'}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-tinta/40">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-verde font-semibold hover:underline underline-offset-2">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
