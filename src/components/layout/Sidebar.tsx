'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useCallback } from 'react'
import { useMobileNav } from './MobileNavProvider'

function IconBook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const NAV = [
  { href: '/dashboard',          label: 'MIS MATERIAS', Icon: IconBook  },
  { href: '/dashboard/progress', label: 'MI PROGRESO',  Icon: IconChart },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const { open: mobileOpen, close } = useMobileNav()
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width)  * 100
    const y = ((e.clientY - r.top)  / r.height) * 100
    if (glowRef.current) {
      glowRef.current.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(245,214,62,0.18) 0%, transparent 55%)`
    }
  }, [])

  return (
    <>
      {/* Backdrop móvil */}
      {mobileOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-tinta/50 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          bg-verde flex flex-col overflow-hidden relative
          fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto lg:min-h-screen lg:shrink-0 lg:transition-all
          ${open ? 'lg:w-52' : 'lg:w-14'}
        `}
        onMouseMove={handleMouseMove}
      >

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Cursor glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none transition-[background] duration-100"
          style={{ background: 'radial-gradient(circle at 50% 18%, rgba(245,214,62,0.14) 0%, transparent 55%)' }}
        />

        {/* Header */}
        <div className={`relative z-10 flex items-center pt-5 pb-5 px-5 gap-3 ${open ? '' : 'lg:flex-col lg:items-center lg:gap-3 lg:px-0'}`}>
          <div className="w-0.5 h-8 bg-amarillo rounded-full shrink-0" />
          <div className={`flex-1 min-w-0 ${open ? '' : 'lg:hidden'}`}>
            <p className="text-crema font-display text-sm leading-tight tracking-tight">
              RESÚMENES<br />UNLAM
            </p>
            <p className="text-crema/30 text-[9px] tracking-[0.3em] mt-1">INGRESO</p>
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            className="shrink-0 hidden lg:flex items-center justify-center w-6 h-6 rounded-xl bg-crema/10 hover:bg-crema/20 transition-colors text-crema/40 hover:text-crema/80"
            title={open ? 'Contraer' : 'Expandir'}
          >
            <svg
              width="10" height="10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
            >
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="relative z-10 mx-3 h-px bg-crema/10" />

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-2.5 py-4 space-y-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={close}
                className={`group/nav relative flex items-center rounded-xl text-[11px] font-bold tracking-wider transition-colors duration-200 px-3.5 py-2.5 gap-2.5 ${
                  open ? '' : 'lg:justify-center lg:px-0 lg:py-3 lg:gap-0'
                } ${active ? 'text-crema' : 'text-crema/55 hover:text-crema'}`}
              >
                {/* Fondo (activo / hover) */}
                <span
                  className={`absolute inset-0 rounded-xl transition-all duration-200 ${
                    active ? 'bg-crema/12' : 'bg-transparent group-hover/nav:bg-crema/[0.07]'
                  }`}
                />
                {/* Barra de acento amarilla */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-amarillo transition-all duration-200 ${
                    active
                      ? 'h-5 opacity-100'
                      : 'h-0 opacity-0 group-hover/nav:h-3 group-hover/nav:opacity-50'
                  }`}
                />
                <span className={`relative shrink-0 transition-colors duration-200 ${active ? 'text-amarillo' : 'text-crema/70 group-hover/nav:text-crema'}`}>
                  <Icon />
                </span>
                <span className={`relative ${open ? '' : 'lg:hidden'}`}>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`relative z-10 px-5 py-4 border-t border-crema/10 ${open ? '' : 'lg:hidden'}`}>
          <p className="text-crema/20 text-[9px] tracking-[0.3em]">@RESUMENES.UNLAM</p>
        </div>

      </aside>
    </>
  )
}
