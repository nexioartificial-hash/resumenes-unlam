import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminHomePage() {
  const supabase = await createClient()

  const [
    { count: subjects },
    { count: content },
    { count: questions },
    { count: users },
  ] = await Promise.all([
    supabase.from('subjects').select('id', { count: 'exact', head: true }),
    supabase.from('content_items').select('id', { count: 'exact', head: true }),
    supabase.from('quiz_questions').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'MATERIAS',  value: subjects  ?? 0, href: '/admin/subjects', icon: '📚' },
    { label: 'CONTENIDO', value: content   ?? 0, href: '/admin/content',  icon: '📄' },
    { label: 'PREGUNTAS', value: questions ?? 0, href: '/admin/quiz',     icon: '❓' },
    { label: 'USUARIOS',  value: users     ?? 0, href: '/admin/users',    icon: '👥' },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-tinta/40 text-[10px] font-bold tracking-widest">PANEL</p>
        <h1 className="font-display text-verde text-4xl mt-1">ADMINISTRACIÓN</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="group relative bg-white border border-tinta/5 rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 overflow-hidden shadow-sm"
          >
            {/* Línea gradiente superior */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-verde/40 to-transparent" />
            {/* Círculo decorativo */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-verde/5 pointer-events-none" />

            <p className="text-2xl mb-4 relative z-10">{s.icon}</p>
            <p className="text-5xl font-display text-verde relative z-10">{s.value}</p>
            <p className="text-[10px] font-bold tracking-widest text-tinta/40 mt-1 mb-4 relative z-10">{s.label}</p>
            <p className="text-tinta/30 text-xs group-hover:text-verde transition-colors relative z-10 flex items-center gap-1">
              Administrar
              <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
