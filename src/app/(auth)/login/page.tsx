'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'

/* ══════════════════════════════════════════════════
   Términos y Condiciones
══════════════════════════════════════════════════ */
const TERMINOS = [
  {
    titulo: '1. Acceso y vigencia del material',
    texto:
      'Al completar tu primer inicio de sesión, el acceso al material queda habilitado por un período de 365 días corridos. Transcurrido ese plazo, el acceso se desactiva automáticamente sin necesidad de aviso previo. No se realizan extensiones por períodos de inactividad, interrupciones voluntarias ni cualquier otra causa.',
  },
  {
    titulo: '2. Uso personal e intransferible',
    texto:
      'La cuenta y el acceso al material son estrictamente personales e intransferibles. Queda prohibida la cesión, venta, préstamo o cualquier tipo de compartición de las credenciales de acceso a terceros.',
  },
  {
    titulo: '3. Sesión única por dispositivo',
    texto:
      'No está permitido iniciar sesión con el mismo usuario en dos o más dispositivos de forma simultánea. Al detectarse un acceso desde un segundo dispositivo, la sesión anterior será cerrada automáticamente. El uso simultáneo o reiterado puede derivar en la suspensión definitiva de la cuenta sin derecho a reembolso.',
  },
  {
    titulo: '4. Prohibición de descarga del contenido',
    texto:
      'Todo el material disponible en la plataforma —incluyendo resúmenes, ejercicios, cuestionarios y cualquier otro recurso— está protegido. Queda expresamente prohibida su descarga, almacenamiento local, impresión o distribución por cualquier medio, sea digital o físico.',
  },
  {
    titulo: '5. Prohibición de copia y reproducción',
    texto:
      'Está prohibido copiar, reproducir, transcribir o difundir parcial o totalmente el contenido de la plataforma mediante cualquier procedimiento, incluida la selección y copia de texto (copy-paste), capturas de pantalla, grabaciones de pantalla u otros métodos equivalentes. El contenido es propiedad intelectual de ResumenesUNLaM y está protegido por la legislación argentina vigente en materia de derechos de autor.',
  },
  {
    titulo: '6. Política de no reembolso',
    texto:
      'Podés solicitar un reembolso únicamente si todavía no realizaste tu primer inicio de sesión en la plataforma. Una vez que iniciás sesión por primera vez, se considera que leíste y aceptaste estos términos y condiciones, y que hiciste uso del servicio, por lo que no se efectuarán devoluciones del dinero bajo ninguna circunstancia a partir de ese momento. Esto incluye, pero no se limita a: falta de uso posterior, cambio de decisión, desaprobación del curso de ingreso o inconvenientes técnicos ajenos a la plataforma.',
  },
  {
    titulo: '7. Sanciones por incumplimiento',
    texto:
      'El incumplimiento de cualquiera de las condiciones establecidas en este documento faculta a ResumenesUNLaM a suspender o cancelar el acceso del usuario de forma inmediata y sin previo aviso, sin derecho a reembolso ni compensación alguna.',
  },
  {
    titulo: '8. Modificaciones',
    texto:
      'ResumenesUNLaM se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán publicados en la plataforma y entrarán en vigencia desde su publicación. El uso continuado del servicio implica la aceptación de los términos vigentes.',
  },
  {
    titulo: '9. Aceptación',
    texto:
      'Al iniciar sesión en la plataforma, el usuario declara haber leído, comprendido y aceptado en su totalidad los presentes Términos y Condiciones de Uso.',
  },
]

/* ── Modal ────────────────────────────────────────── */
function TermsModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      aria-modal="true" role="dialog" aria-label="Términos y Condiciones"
    >
      <div className="relative bg-crema w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-tinta/8 shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-tinta/30">LEGALES</p>
            <h2 className="font-display text-tinta text-xl leading-tight mt-0.5">TÉRMINOS Y CONDICIONES</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-tinta/30 hover:text-tinta hover:bg-tinta/8 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          <p className="text-xs text-tinta/40 leading-relaxed">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}.
            {' '}Estos términos regulan el uso del servicio ofrecido por{' '}
            <strong className="text-tinta/60">ResumenesUNLaM</strong> a través de la plataforma resumenesunlam.site.
          </p>
          {TERMINOS.map(({ titulo, texto }) => (
            <div key={titulo}>
              <h3 className="font-display text-sm text-tinta mb-1.5">{titulo}</h3>
              <p className="text-sm text-tinta/65 leading-relaxed">{texto}</p>
            </div>
          ))}
          <p className="text-xs text-tinta/35 pt-2 border-t border-tinta/8 leading-relaxed">
            Para consultas sobre estos términos podés escribirnos por Instagram
            a <strong className="text-tinta/50">@resumenes.unlam</strong>.
          </p>
        </div>
        <div className="px-6 pb-6 pt-4 border-t border-tinta/8 shrink-0">
          <button onClick={onClose}
            className="w-full bg-verde text-crema font-bold text-sm py-3 rounded-xl hover:bg-verde-claro transition-colors tracking-wider">
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Badge glassmorphism reutilizable ─────────────── */
function GlassBadge({
  icon,
  title,
  subtitle,
  anim,
  delay = '0s',
}: {
  icon:     React.ReactNode
  title:    string
  subtitle: string
  anim:     string
  delay?:   string
}) {
  return (
    <div style={{ animation: `${anim} ease-in-out infinite`, animationDelay: delay }}>
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
        style={{
          background:     'rgba(255,255,255,0.10)',
          border:         '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--amarillo)' }}
        >
          {icon}
        </div>
        <div>
          <p className="text-crema text-sm font-bold leading-none">{title}</p>
          <p className="text-crema/55 text-xs mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   Formulario
══════════════════════════════════════════════════ */
function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const reason       = searchParams.get('reason')

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const [focusedEmail, setFocusedEmail]       = useState(false)
  const [focusedPassword, setFocusedPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al ingresar'); return }
      router.push(data.user.must_change_pass ? '/change-password' : '/dashboard')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--crema)' }}>

        <AuthLeftPanel />

        {/* ── Panel derecho — formulario ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

          {/* Marca mobile */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
            <div className="w-5 h-5 bg-verde rounded-sm flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--crema)" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--crema)" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-verde text-[11px] font-bold tracking-[0.3em] uppercase">
              ResumenesUNLaM
            </span>
          </div>

          <div
            className="w-full max-w-sm"
            style={{ animation: 'fade-in-up 0.5s ease both' }}
          >
            {/* Encabezado */}
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-[0.25em] text-tinta/30 mb-2">
                BIENVENIDO DE VUELTA
              </p>
              <h2
                className="font-display text-tinta leading-tight"
                style={{ fontSize: '2.4rem' }}
              >
                INGRESÁ A<br />
                <span style={{ color: 'var(--verde)' }}>TU CUENTA</span>
              </h2>
            </div>

            {/* Aviso sesión reemplazada */}
            {reason === 'session_replaced' && (
              <div className="bg-amarillo/15 border border-amarillo/40 text-tinta text-sm rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
                <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="var(--tinta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors"
                  style={{ color: focusedEmail ? 'var(--verde)' : 'rgba(10,10,10,0.45)' }}
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
                  style={{
                    border: focusedEmail
                      ? '1.5px solid var(--verde)'
                      : '1.5px solid rgba(10,10,10,0.10)',
                    outline: 'none',
                    boxShadow: focusedEmail
                      ? '0 0 0 3px rgba(15,63,38,0.08)'
                      : 'none',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-[11px] font-bold tracking-[0.15em] mb-1.5 transition-colors"
                  style={{ color: focusedPassword ? 'var(--verde)' : 'rgba(10,10,10,0.45)' }}
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3.5 text-sm bg-white transition-all duration-200"
                  style={{
                    border: focusedPassword
                      ? '1.5px solid var(--verde)'
                      : '1.5px solid rgba(10,10,10,0.10)',
                    outline: 'none',
                    boxShadow: focusedPassword
                      ? '0 0 0 3px rgba(15,63,38,0.08)'
                      : 'none',
                  }}
                />
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
                style={{
                  backgroundColor: loading ? 'rgba(15,63,38,0.7)' : 'var(--verde)',
                  color: 'var(--crema)',
                  transform: loading ? 'none' : undefined,
                }}
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
                    Ingresando...
                  </span>
                ) : 'INGRESAR →'}
              </button>
            </form>

            {/* Términos */}
            <p className="mt-5 text-[11px] text-tinta/35 text-center leading-relaxed">
              Al iniciar sesión aceptás nuestros{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="font-semibold underline underline-offset-2 transition-colors"
                style={{ color: 'var(--azul)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                términos y condiciones
              </button>
            </p>

            {/* Links inferiores */}
            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/reset-password"
                className="text-[12px] text-tinta/35 hover:text-verde transition-colors"
              >
                Olvidé mi contraseña
              </Link>
              <Link
                href="/register"
                className="text-[12px] font-bold hover:underline underline-offset-2 transition-colors"
                style={{ color: 'var(--verde)' }}
              >
                Crear cuenta →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--verde)' }}>
        <div className="text-crema/50 text-sm tracking-widest">CARGANDO...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
