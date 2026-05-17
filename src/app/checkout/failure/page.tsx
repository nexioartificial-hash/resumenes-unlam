'use client'

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-tinta/10 p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">😕</p>
        <h1 className="text-xl font-bold text-tinta mb-2">El pago no se procesó</h1>
        <p className="text-tinta/60 text-sm mb-6">
          No se realizó ningún cobro. Podés intentarlo de nuevo o escribirnos por Instagram.
        </p>
        <a
          href="https://instagram.com"
          className="block w-full bg-amarillo text-tinta font-bold py-3 rounded-xl hover:bg-amarillo/90 transition-colors"
        >
          Contactar por Instagram
        </a>
      </div>
    </div>
  )
}
