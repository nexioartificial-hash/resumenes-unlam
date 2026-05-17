'use client'

import { useRouter } from 'next/navigation'

interface HeaderProps {
  fullName?: string | null
}

export default function Header({ fullName }: HeaderProps) {
  const router  = useRouter()
  const initial = (fullName ?? 'E').charAt(0).toUpperCase()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-14 bg-crema border-b border-tinta/10 px-6 flex items-center justify-end shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-verde flex items-center justify-center shrink-0">
            <span className="text-crema text-[10px] font-bold">{initial}</span>
          </div>
          <span className="text-sm text-tinta/60 font-medium">
            {fullName ?? 'Estudiante'}
          </span>
        </div>
        <div className="w-px h-4 bg-tinta/15" />
        <button
          onClick={handleLogout}
          className="text-xs font-bold text-tinta/40 hover:text-rojo tracking-wider transition-colors"
        >
          SALIR
        </button>
      </div>
    </header>
  )
}
