'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthCard from '@/components/shared/AuthCard'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/change-password`,
    })

    setLoading(false)

    if (error) {
      setError('No pudimos enviar el email. Verificá la dirección.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard title="Revisá tu email">
        <p className="text-tinta/70 text-sm mb-6">
          Te enviamos un link para restablecer tu contraseña a{' '}
          <strong>{email}</strong>. Revisá también la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="block text-center text-sm text-verde hover:underline"
        >
          ← Volver al inicio de sesión
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviamos un link para crear una nueva"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-tinta mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full border border-tinta/20 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-verde focus:border-transparent"
          />
        </div>

        {error && <p className="text-rojo text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amarillo text-tinta font-bold py-3 rounded-lg hover:bg-amarillo/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'ENVIAR LINK'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-verde hover:underline">
          ← Volver al inicio de sesión
        </Link>
      </div>
    </AuthCard>
  )
}
