'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function RegisterForm() {
  const router   = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [done,        setDone]        = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

    if (data.session) {
      router.push('/dashboard')
      return
    }

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
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--crema)' }}>

      <AuthLeftPanel />

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

        {/* Marca mobile */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-5 h-5 bg-verde rounded-sm flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--crema)" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--crema)" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-verde text-[11px] font-bold tracking-[0.3em] uppercase">ResumenesUNLaM</span>
        </div>

        <div className="w-full max-w-sm" style={{ animation: 'fade-in-up 0.5s ease both' }}>

          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.25em] text-tinta/30 mb-2">ACCESO A LA PLATAFORMA</p>
            <h2 className="font-display text-tinta leading-tight" style={{ fontSize: '2.4rem' }}>
              CREÁ TU<br />
              <span style={{ color: 'var(--verde)' }}>CUENTA</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors" style={labelStyle(focusedEmail)}>
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

            {/* Contraseña */}
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors" style={labelStyle(focusedPassword)}>
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedPassword(true)}
                  onBlur={() => setFocusedPassword(false)}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl px-4 py-3.5 pr-11 text-sm bg-white transition-all duration-200"
                  style={inputStyle(focusedPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tinta/30 hover:text-tinta/60 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors" style={labelStyle(focusedConfirm)}>
                CONFIRMÁ LA CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocusedConfirm(true)}
                  onBlur={() => setFocusedConfirm(false)}
                  required
                  autoComplete="new-password"
                  placeholder="Repetí tu contraseña"
                  className="w-full rounded-xl px-4 py-3.5 pr-11 text-sm bg-white transition-all duration-200"
                  style={inputStyle(focusedConfirm)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tinta/30 hover:text-tinta/60 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-rojo text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
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

          {/* Link a login */}
          <div className="mt-4 text-center">
            <Link href="/login" className="text-[12px] text-tinta/35 hover:text-verde transition-colors">
              ¿Ya tenés cuenta? <span className="font-semibold" style={{ color: 'var(--verde)' }}>Iniciá sesión</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <RegisterForm />
}
