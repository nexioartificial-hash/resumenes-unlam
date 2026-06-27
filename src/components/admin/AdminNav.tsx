'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobileNav } from '@/components/layout/MobileNavProvider'

const NAV = [
  { href: '/admin',          label: 'INICIO',    icon: '🏠', exact: true },
  { href: '/admin/subjects', label: 'MATERIAS',  icon: '📚' },
  { href: '/admin/content',  label: 'CONTENIDO', icon: '📄' },
  { href: '/admin/quiz',     label: 'QUIZ',      icon: '❓' },
  { href: '/admin/users',    label: 'USUARIOS',  icon: '👥' },
  { href: '/admin/import',   label: 'IMPORTAR',  icon: '📥' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { open: mobileOpen, close } = useMobileNav()

  return (
    <>
      {/* Backdrop móvil */}
      {mobileOpen && (
        <div onClick={close} className="fixed inset-0 bg-tinta/50 z-40 lg:hidden" aria-hidden="true" />
      )}

      <aside className={`
        bg-verde flex flex-col overflow-hidden w-60
        fixed inset-y-0 left-0 z-50 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:inset-auto lg:translate-x-0 lg:z-auto lg:min-h-screen lg:shrink-0 lg:transition-none
      `}>
      {/* Logo */}
      <div className="px-6 py-7 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-1 h-10 bg-amarillo rounded-full shrink-0 mt-0.5" />
          <div>
            <p className="text-crema font-display text-xl tracking-tight leading-tight">
              RESÚMENES<br />UNLAM
            </p>
            <span className="inline-block mt-2 bg-amarillo text-tinta text-[9px] font-bold px-2 py-0.5 rounded tracking-[0.15em]">
              ADMIN
            </span>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-crema/10" />

      {/* Navegación */}
      <nav className="flex-1 px-3 py-5 space-y-1 relative z-10">
        {NAV.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-amarillo text-tinta shadow-sm'
                  : 'text-crema/60 hover:bg-crema/10 hover:text-crema'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-crema/10 relative z-10">
        <Link
          href="/dashboard"
          onClick={close}
          className="text-crema/30 text-[10px] tracking-wider hover:text-crema/60 transition-colors"
        >
          ← Plataforma
        </Link>
      </div>
    </aside>
    </>
  )
}
