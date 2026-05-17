'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthCard from '@/components/shared/AuthCard'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const reason       = searchParams.get('reason')

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al ingresar')
        return
      }

      if (data.user.must_change_pass) {
        router.push('/change-password')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Ingresá a tu cuenta"
      subtitle="Accedé al material de tu curso de ingreso"
    >
      {reason === 'session_replaced' && (
        <div className="bg-amarillo/20 border border-amarillo text-tinta text-sm rounded-lg p-3 mb-4">
          Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.
        </div>
      )}

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

        <div>
          <label className="block text-sm font-medium text-tinta mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full border border-tinta/20 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-verde focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-rojo text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amarillo text-tinta font-bold py-3 rounded-lg hover:bg-amarillo/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ingresando...' : 'INGRESAR'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/reset-password" className="text-sm text-verde hover:underline">
          Olvidé mi contraseña
        </Link>
      </div>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-verde flex items-center justify-center">
        <div className="text-crema text-sm">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
