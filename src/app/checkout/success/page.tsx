'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const params            = useSearchParams()
  const externalReference = params.get('external_reference') ?? ''
  const status            = params.get('status')

  let email: string | null = null
  try {
    const meta = JSON.parse(atob(externalReference)) as { email: string }
    email = meta.email ?? null
  } catch { /* ok */ }

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
          Tu acceso se está activando. En unos segundos la materia aparece habilitada en tu dashboard.
        </p>

        {email && (
          <div className="bg-fondo rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-tinta/50 mb-0.5">Acceso habilitado para</p>
            <p className="text-sm font-medium text-tinta">{email}</p>
          </div>
        )}

        <Link
          href="/dashboard"
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
