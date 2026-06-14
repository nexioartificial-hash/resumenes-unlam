'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Subject {
  name:        string
  slug:        string
  price:       number
  available:   boolean
  description: string
  benefit:     string
  department:  string
}

function CheckoutContent() {
  const params  = useSearchParams()
  const router  = useRouter()

  const emailFromUrl   = params.get('email')      ?? ''
  const nameFromUrl    = params.get('name')       ?? ''
  const slugFromUrl    = params.get('subject')    ?? ''
  const instagram      = params.get('instagram')  ?? ''
  const contactId      = params.get('contact_id') ?? ''

  const [email,   setEmail]   = useState(emailFromUrl)
  const [name,    setName]    = useState(nameFromUrl)
  const [slug,    setSlug]    = useState(slugFromUrl)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying,  setPaying]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function init() {
      let resolvedEmail = emailFromUrl
      let resolvedName  = nameFromUrl
      let resolvedSlug  = slugFromUrl

      // Si no vienen email o slug por URL, leer de la sesión activa
      if (!resolvedEmail || !resolvedSlug) {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          if (!resolvedEmail) resolvedEmail = session.user.email ?? ''
          if (!resolvedName)  resolvedName  = session.user.user_metadata?.full_name ?? resolvedEmail
        }
      }

      setEmail(resolvedEmail)
      setName(resolvedName)
      setSlug(resolvedSlug)

      if (!resolvedSlug) { setLoading(false); return }

      fetch('/api/subjects')
        .then(r => r.json())
        .then((subjects: Subject[]) => {
          const found = subjects.find(s => s.slug === resolvedSlug)
          setSubject(found ?? null)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePagar() {
    if (!subject || !email) return
    setPaying(true)
    setError('')

    const res = await fetch('/api/checkout/create', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        full_name:            name || email,
        subject_slug:         slug,
        instagram_username:   instagram,
        sendpulse_contact_id: contactId,
      }),
    })

    const data = await res.json() as { init_point?: string; error?: string }

    if (!res.ok || !data.init_point) {
      setError(data.error ?? 'Error al iniciar el pago')
      setPaying(false)
      return
    }

    router.push(data.init_point)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo">
        <p className="text-tinta/60">Cargando...</p>
      </div>
    )
  }

  if (!subject || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo">
        <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
          <p className="text-tinta/60">Acceso no válido. Ingresá al dashboard y hacé click en "Comprar acceso" en la materia que querés.</p>
        </div>
      </div>
    )
  }

  if (!subject.available) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo">
        <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
          <p className="text-2xl mb-2">😔</p>
          <p className="font-bold text-tinta">{subject.name} no está disponible por el momento.</p>
          <p className="text-tinta/60 text-sm mt-2">Próximamente disponible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 30% 0%, #1b6040 0%, #0a2918 50%, #040c07 100%)' }}>

      {/* Formas decorativas de fondo */}
      <div style={{ position:'absolute', top:'-15%', right:'-5%', width:'480px', height:'480px', borderRadius:'50%', background:'rgba(245,214,62,0.07)', filter:'blur(90px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:'420px', height:'420px', borderRadius:'50%', background:'rgba(15,63,38,0.5)', filter:'blur(70px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', left:'55%', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(0,158,227,0.06)', filter:'blur(60px)', pointerEvents:'none' }} />

      {/* Card glassmorphism */}
      <div className="relative z-10 w-full max-w-sm" style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.11)',
        borderRadius: '28px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding:'36px 36px 28px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', fontWeight:'700', letterSpacing:'0.28em', textTransform:'uppercase', marginBottom:'14px' }}>
            Resúmenes UNLaM
          </p>
          <h1 style={{ color:'#fff', fontSize:'2.4rem', fontWeight:'900', lineHeight:'1', letterSpacing:'-0.01em', marginBottom:'6px' }}>
            {subject.name}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>{subject.department}</p>
          <div style={{ marginTop:'20px', width:'36px', height:'3px', background:'#F5D63E', borderRadius:'2px' }} />
        </div>

        {/* Descripción */}
        <div style={{ padding:'22px 36px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {subject.description && (
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px', lineHeight:'1.65', marginBottom: subject.benefit ? '10px' : '0' }}>
              {subject.description}
            </p>
          )}
          {subject.benefit && (
            <p style={{ color:'#F5D63E', fontSize:'13px', fontWeight:'600' }}>✓ {subject.benefit}</p>
          )}
        </div>

        {/* Precio */}
        <div style={{ padding:'20px 36px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px', fontWeight:'600', letterSpacing:'0.1em', textTransform:'uppercase' }}>Precio</span>
          <span style={{ color:'#fff', fontSize:'2rem', fontWeight:'900', letterSpacing:'-0.02em' }}>
            ${subject.price.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Email */}
        <div style={{ padding:'16px 36px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)' }}>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', fontWeight:'600', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'4px' }}>Acceso para</p>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px', fontWeight:'500' }}>{email}</p>
        </div>

        {/* CTA */}
        <div style={{ padding:'28px 36px' }}>
          {error && (
            <p style={{ color:'#ff6b6b', fontSize:'13px', marginBottom:'14px', textAlign:'center' }}>{error}</p>
          )}
          <button
            onClick={handlePagar}
            disabled={paying}
            style={{
              width:'100%', background:'#009EE3', color:'#fff', fontWeight:'700',
              fontSize:'15px', padding:'16px', borderRadius:'14px', border:'none',
              cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.55 : 1,
              transition:'all 0.2s', letterSpacing:'0.02em',
              boxShadow: paying ? 'none' : '0 8px 24px rgba(0,158,227,0.35)',
            }}
            onMouseEnter={e => { if (!paying) (e.currentTarget as HTMLButtonElement).style.background = '#0081BE' }}
            onMouseLeave={e => { if (!paying) (e.currentTarget as HTMLButtonElement).style.background = '#009EE3' }}
          >
            {paying ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
          </button>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'11px', textAlign:'center', marginTop:'14px' }}>
            Pago 100% seguro procesado por MercadoPago
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-fondo">
        <p className="text-tinta/60">Cargando...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
