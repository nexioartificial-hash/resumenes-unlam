'use client'

import Link from 'next/link'

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">😕</p>
        <h1 className="text-xl font-bold text-tinta mb-2">El pago no se procesó</h1>
        <p className="text-tinta/60 text-sm mb-6">
          No se realizó ningún cobro. Podés intentarlo de nuevo desde tu dashboard.
        </p>
        <Link
          href="/dashboard"
          className="block w-full bg-verde text-crema font-bold py-3 rounded-xl hover:bg-verde-claro transition-colors text-sm tracking-wider"
        >
          VOLVER AL DASHBOARD
        </Link>
      </div>
    </div>
  )
}
