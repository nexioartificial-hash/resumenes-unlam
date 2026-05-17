'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const params             = useSearchParams()
  const paymentId          = params.get('payment_id')
  const externalReference  = params.get('external_reference') ?? ''
  const status             = params.get('status')

  const [resetLink, setResetLink] = useState<string | null>(null)
  const [email,     setEmail]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (status !== 'approved' || !paymentId) { setLoading(false); return }

    fetch('/api/checkout/finalize', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, external_reference: externalReference }),
    })
      .then(r => r.json())
      .then((data: { status?: string; reset_link?: string }) => {
        if (data.reset_link) setResetLink(data.reset_link)
        // Obtener email del external_reference
        try {
          const meta = JSON.parse(atob(externalReference)) as { email: string }
          setEmail(meta.email)
        } catch { /* ok */ }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [paymentId, externalReference, status])

  if (status === 'failure') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-xl font-bold text-tinta mb-2">El pago no se procesó</h1>
          <p className="text-tinta/60 text-sm">Podés intentarlo de nuevo o escribirnos por Instagram.</p>
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
          <p className="text-tinta/60 text-sm">Cuando se confirme el pago te avisamos por Instagram DM con tus accesos.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fondo">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-verde border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-tinta/60 text-sm">Activando tu acceso...</p>
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
          Tu acceso está activo. Ahora configurá tu contraseña para entrar a la plataforma.
        </p>

        {email && (
          <div className="bg-fondo rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-tinta/50 mb-0.5">Tu email de acceso</p>
            <p className="text-sm font-medium text-tinta">{email}</p>
          </div>
        )}

        {resetLink ? (
          <>
            <a
              href={resetLink}
              className="block w-full bg-amarillo text-tinta font-bold py-4 rounded-xl hover:bg-amarillo/90 transition-colors text-center mb-4"
            >
              CONFIGURAR CONTRASEÑA
            </a>
            <p className="text-xs text-tinta/40">
              También te mandamos este link por Instagram DM por si lo necesitás después.
            </p>
          </>
        ) : (
          <p className="text-sm text-tinta/60">
            En unos instantes te llegará un DM de Instagram con el link para configurar tu contraseña.
          </p>
        )}
      </div>
    </div>
  )
}
