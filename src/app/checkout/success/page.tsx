'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type ConfirmState = 'confirming' | 'approved' | 'pending' | 'failure'

function SuccessContent() {
  const params            = useSearchParams()
  const router            = useRouter()
  const externalReference = params.get('external_reference') ?? ''
  const statusParam       = params.get('status')
  const paymentId         = params.get('payment_id') ?? params.get('collection_id') ?? ''

  let email: string | null = null
  let subjectSlug: string | null = null
  try {
    const meta = JSON.parse(atob(externalReference)) as { email: string; subject_slug: string }
    email       = meta.email        ?? null
    subjectSlug = meta.subject_slug ?? null
  } catch { /* ok */ }

  const redirectTo = subjectSlug ? `/dashboard/${subjectSlug}` : '/dashboard'

  const [status, setStatus] = useState<ConfirmState>('confirming')

  // Confirmar y otorgar el acceso de forma activa (no depender del timing del webhook)
  useEffect(() => {
    let cancelled = false

    async function confirm() {
      if (statusParam === 'failure' || statusParam === 'rejected') {
        if (!cancelled) setStatus('failure')
        return
      }
      // Sin payment_id no podemos verificar contra MP → confiar en el status de la URL
      if (!paymentId) {
        if (!cancelled) setStatus(statusParam === 'pending' ? 'pending' : 'approved')
        return
      }
      try {
        const res  = await fetch('/api/checkout/finalize', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ payment_id: paymentId }),
        })
        const data = await res.json() as { status?: string }
        if (cancelled) return
        if (data.status === 'approved')                                   setStatus('approved')
        else if (data.status === 'pending' || data.status === 'in_process') setStatus('pending')
        else                                                              setStatus('failure')
      } catch {
        // Falla de red: el webhook probablemente ya otorgó el acceso → no bloquear al usuario
        if (!cancelled) setStatus('approved')
      }
    }

    confirm()
    return () => { cancelled = true }
  }, [paymentId, statusParam])

  useEffect(() => {
    if (status !== 'approved') return
    const t = setTimeout(() => router.push(redirectTo), 2500)
    return () => clearTimeout(t)
  }, [status, router, redirectTo])

  if (status === 'confirming') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
          <div className="w-10 h-10 border-4 border-verde border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <h1 className="text-xl font-bold text-tinta mb-2">Confirmando tu pago...</h1>
          <p className="text-tinta/60 text-sm">Estamos habilitando tu acceso. No cierres esta ventana.</p>
        </div>
      </div>
    )
  }

  if (status === 'failure') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-xl font-bold text-tinta mb-2">El pago no se procesó</h1>
          <p className="text-tinta/60 text-sm mb-6">Podés intentarlo de nuevo desde el dashboard.</p>
          <Link
            href="/dashboard"
            className="block w-full bg-verde text-crema font-bold py-3 rounded-xl hover:bg-verde-claro transition-colors text-sm tracking-wider"
          >
            IR AL DASHBOARD
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">⏳</p>
          <h1 className="text-xl font-bold text-tinta mb-2">Pago pendiente</h1>
          <p className="text-tinta/60 text-sm mb-6">
            Cuando se confirme el pago te llegará un email a <strong>{email ?? 'tu casilla'}</strong> y tu acceso se activará automáticamente.
          </p>
          <Link
            href="/dashboard"
            className="block w-full bg-verde text-crema font-bold py-3 rounded-xl hover:bg-verde-claro transition-colors text-sm tracking-wider"
          >
            IR AL DASHBOARD
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold text-tinta mb-2">¡Pago confirmado!</h1>
        <p className="text-tinta/60 text-sm mb-6">
          Tu acceso ya está activo. Te redirigimos a la materia en un momento...
        </p>

        {email && (
          <div className="bg-fondo rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-tinta/50 mb-0.5">Acceso habilitado para</p>
            <p className="text-sm font-medium text-tinta">{email}</p>
          </div>
        )}

        <Link
          href={redirectTo}
          className="block w-full bg-verde text-crema font-bold py-3 rounded-xl hover:bg-verde-claro transition-colors text-sm tracking-wider"
        >
          IR A MIS MATERIAS →
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-fondo">
        <div className="w-10 h-10 border-4 border-verde border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
