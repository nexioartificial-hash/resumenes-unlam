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
    <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-sm text-tinta/50 font-medium uppercase tracking-wide">Resúmenes UNLaM</p>
          <h1 className="text-2xl font-bold text-tinta mt-1">{subject.name}</h1>
          <p className="text-tinta/60 text-sm mt-1">{subject.department}</p>
        </div>

        {/* Info */}
        <div className="bg-fondo rounded-xl p-4 mb-6 space-y-3">
          {subject.description && (
            <p className="text-sm text-tinta">{subject.description}</p>
          )}
          {subject.benefit && (
            <p className="text-sm text-verde font-medium">✓ {subject.benefit}</p>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-tinta/60 text-sm">Precio</span>
          <span className="text-2xl font-bold text-tinta">${subject.price.toLocaleString('es-AR')}</span>
        </div>

        {/* Email del comprador */}
        <div className="bg-tinta/5 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-tinta/50 mb-0.5">Acceso para</p>
          <p className="text-sm font-medium text-tinta">{email}</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handlePagar}
          disabled={paying}
          className="w-full bg-[#009EE3] hover:bg-[#0081BE] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg"
        >
          {paying ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
        </button>

        <p className="text-center text-xs text-tinta/40 mt-4">
          Pago 100% seguro procesado por MercadoPago
        </p>
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
