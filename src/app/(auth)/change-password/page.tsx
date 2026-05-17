'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthCard from '@/components/shared/AuthCard'

export default function ChangePasswordPage() {
  const router = useRouter()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/change-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al cambiar la contraseña')
      return
    }

    router.push('/dashboard')
  }

  return (
    <AuthCard
      title="Creá tu contraseña"
      subtitle="Elegí una contraseña segura para tu cuenta"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-tinta mb-1">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full border border-tinta/20 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-verde focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tinta mb-1">
            Confirmá la contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Repetí tu contraseña"
            className="w-full border border-tinta/20 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-verde focus:border-transparent"
          />
        </div>

        {error && <p className="text-rojo text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amarillo text-tinta font-bold py-3 rounded-lg hover:bg-amarillo/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'GUARDAR CONTRASEÑA'}
        </button>
      </form>
    </AuthCard>
  )
}
