'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  return (
    <aside className="w-60 bg-verde min-h-screen flex flex-col shrink-0 relative overflow-hidden">
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
          className="text-crema/30 text-[10px] tracking-wider hover:text-crema/60 transition-colors"
        >
          ← Plataforma
        </Link>
      </div>
    </aside>
  )
}
