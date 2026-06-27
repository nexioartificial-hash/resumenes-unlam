'use client'

import { useMobileNav } from './MobileNavProvider'

export default function HamburgerButton({ className = '' }: { className?: string }) {
  const { open, toggle } = useMobileNav()
  return (
    <button
      onClick={toggle}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      className={`flex items-center justify-center w-9 h-9 rounded-xl bg-tinta/5 text-tinta/70 hover:bg-tinta/10 hover:text-tinta transition-colors ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}
