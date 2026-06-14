'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
   Panel izquierdo — branding + animaciones
══════════════════════════════════════════════════ */
function LeftPanel() {
  const glowRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width)  * 100
    const y = ((e.clientY - r.top)  / r.height) * 100
    if (glowRef.current) {
      glowRef.current.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(245,214,62,0.18) 0%, transparent 55%)`
    }
  }, [])

  return (
    <div
      className="hidden lg:flex w-[52%] relative flex-col p-14 overflow-hidden"
      style={{ backgroundColor: 'var(--verde)' }}
      onMouseMove={handleMouseMove}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Cursor-following glow — sin state, directo al DOM para máxima fluidez */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 72% 30%, rgba(245,214,62,0.18) 0%, transparent 55%)',
      }} />

      {/* ── Top: marca ── */}
      <div className="relative z-10" style={{ height: 40 }}>
        <img
          src="/logo-cropped.png"
          alt="Resúmenes UNLaM"
          className="absolute"
          style={{ width: 72, height: 72, objectFit: 'contain', filter: 'brightness(0) invert(1)', top: -16, left: 0 }}
        />
        <span className="absolute text-crema/80 text-xs font-bold tracking-[0.3em] uppercase" style={{ top: '50%', transform: 'translateY(-50%)', left: 82 }}>
          ResumenesUNLaM
        </span>
      </div>

      {/* ── Centro: headline — confinado al 55% izquierdo ── */}
      <div className="relative z-10 mt-auto mb-auto" style={{ maxWidth: '55%' }}>
        <h1
          className="font-display text-crema leading-[0.88] tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 4vw, 4.2rem)' }}
        >
          EL<br />
          INGRESO<br />
          ES DIFÍCIL.<br />
          <span style={{ color: 'var(--amarillo)' }}>ESTUDIAR</span><br />
          NO TIENE<br />
          QUE SERLO.
        </h1>
      </div>

      {/* ── 1. Resultado de examen ── */}
      <div className="absolute z-20" style={{ top: '13%', right: '5%' }}>
        <div style={{ borderLeft: '3px solid var(--amarillo)', paddingLeft: 16 }}>
          <p className="text-crema/45 text-xs font-bold tracking-[0.2em] uppercase mb-1">Lógica Matemática</p>
          <p className="font-display text-crema leading-none" style={{ fontSize: 52 }}>87<span className="text-amarillo text-2xl">pts</span></p>
          <p className="text-crema/40 text-sm mt-1.5">Nota final del módulo</p>
        </div>
      </div>

      {/* ── 2. Progreso con barra ── */}
      <div className="absolute z-20" style={{ top: '30%', right: '5%', width: 220 }}>
        <p className="text-crema/40 text-xs tracking-[0.18em] uppercase mb-3">Historia Argentina</p>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}>
          <div style={{ height: 3, width: '91%', background: 'var(--amarillo)', borderRadius: 2 }} />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-crema/35 text-xs">Quiz completado</p>
          <p className="text-amarillo text-xs font-bold">91%</p>
        </div>
      </div>

      {/* ── 3. Cifra social ── */}
      <div className="absolute z-20" style={{ top: '45%', right: '5%' }}>
        <p className="font-display leading-none tabular-nums" style={{ fontSize: 72, color: 'rgba(255,255,255,0.07)' }}>10K</p>
        <p className="text-crema text-base font-semibold" style={{ marginTop: -16 }}>+10.000 alumnos</p>
        <p className="text-crema/40 text-sm mt-0.5">aprobaron el ingreso UNLaM</p>
      </div>

      {/* ── 4. Racha ── */}
      <div className="absolute z-20" style={{ top: '62%', right: '5%' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10 }}>
          <div className="flex gap-1 shrink-0">
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ width: 5, height: 26, borderRadius: 3, backgroundColor: 'var(--amarillo)', opacity: 0.3 + i * 0.1 }} />
            ))}
          </div>
          <div>
            <p className="text-crema text-sm font-bold leading-none">7 días seguidos</p>
            <p className="text-crema/40 text-xs mt-1">Biología · En racha</p>
          </div>
        </div>
      </div>

      {/* ── 5. Acceso activo ── */}
      <div className="absolute z-20 flex items-center gap-2.5" style={{ top: '77%', right: '5%' }}>
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: 'var(--amarillo)' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--amarillo)' }} />
        </span>
        <p className="text-crema/60 text-sm">365 días de acceso activo</p>
      </div>

      {/* ── Bottom: claim ── */}
      <div className="relative z-10 mt-auto">
        <div className="flex items-start gap-4">
          <div className="w-px h-10 bg-crema/50 mt-1 shrink-0" />
          <p className="text-crema/75 text-base font-medium leading-relaxed">
            La única plataforma de ingreso UNLaM<br />
            diseñada para que realmente apruebes.
          </p>
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

        <LeftPanel />

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

            {/* Olvidé contraseña */}
            <div className="mt-4 text-center">
              <Link
                href="/reset-password"
                className="text-[12px] text-tinta/35 hover:text-verde transition-colors"
              >
                Olvidé mi contraseña
              </Link>
            </div>

            {/* Registro */}
            <p className="mt-3 text-center text-[12px] text-tinta/35">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-verde font-semibold hover:underline underline-offset-2">
                Registrate
              </Link>
            </p>

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
