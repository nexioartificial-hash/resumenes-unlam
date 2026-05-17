'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',          label: 'MIS MATERIAS', icon: '📚' },
  { href: '/dashboard/progress', label: 'MI PROGRESO',  icon: '📊' },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(true)

  return (
    <aside className={`${open ? 'w-60' : 'w-16'} bg-verde min-h-screen flex flex-col shrink-0 relative overflow-hidden transition-all duration-300`}>
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative z-10 self-end mr-3 mt-3 flex items-center justify-center w-7 h-7 rounded-full bg-crema/10 hover:bg-amarillo/30 transition-colors text-crema/60 hover:text-crema shrink-0"
        title={open ? 'Contraer menú' : 'Expandir menú'}
      >
        <span className={`text-xs transition-transform duration-300 ${open ? '' : 'rotate-180'}`}>◀</span>
      </button>

      {/* Logo */}
      <div className={`py-5 relative z-10 ${open ? 'px-6' : 'px-0 flex justify-center'}`}>
        {open ? (
          <div className="flex items-start gap-3">
            <div className="w-1 h-10 bg-amarillo rounded-full shrink-0 mt-0.5" />
            <div>
              <p className="text-crema font-display text-xl tracking-tight leading-tight">
                RESÚMENES<br />UNLAM
              </p>
              <p className="text-crema/30 text-[10px] tracking-[0.25em] mt-1.5">INGRESO</p>
            </div>
          </div>
        ) : (
          <div className="w-1 h-10 bg-amarillo rounded-full" />
        )}
      </div>

      <div className="mx-4 h-px bg-crema/10" />

      {/* Navegación */}
      <nav className="flex-1 px-3 py-5 space-y-1 relative z-10">
        {NAV.map(item => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                open ? '' : 'justify-center'
              } ${
                active
                  ? 'bg-amarillo text-tinta shadow-sm'
                  : 'text-crema/60 hover:bg-crema/10 hover:text-crema'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {open && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="px-6 py-5 border-t border-crema/10 relative z-10">
          <p className="text-crema/25 text-[10px] tracking-[0.3em]">@RESUMENES.UNLAM</p>
        </div>
      )}

    </aside>
  )
}
