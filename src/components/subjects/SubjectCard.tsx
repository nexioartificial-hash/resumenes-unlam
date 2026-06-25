import Link from 'next/link'

interface SubjectCardProps {
  name:       string
  slug:       string
  color:      string
  progress:   number
  expires_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day:   '2-digit',
    month: '2-digit',
    year:  '2-digit',
  })
}

export default function SubjectCard({
  name, slug, color, progress, expires_at,
}: SubjectCardProps) {
  const pct = Math.min(100, Math.max(0, progress))

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-tinta/8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

      {/* Bloque de color con monograma editorial */}
      <div
        className="relative px-5 pt-5 pb-6 min-h-[6.5rem] flex flex-col justify-end overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.15] mix-blend-overlay" />
        <span
          className="pointer-events-none absolute -right-2 -bottom-7 font-display leading-none text-white/10 select-none transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-0.5"
          style={{ fontSize: '7rem' }}
          aria-hidden
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <p className="relative text-[10px] font-bold tracking-[0.25em] text-white/55 mb-1.5">MATERIA</p>
        <h3 className="relative font-display text-white text-lg leading-tight pr-12 drop-shadow-sm">
          {name.toUpperCase()}
        </h3>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-bold tracking-widest text-tinta/40">PROGRESO</span>
          <span className="font-display text-sm text-tinta">{pct}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-tinta/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        <div className="mt-auto pt-5 flex items-center justify-between gap-2">
          <span className="text-[10px] text-tinta/40 tracking-wider">
            VENCE {formatDate(expires_at)}
          </span>
          <Link
            href={`/dashboard/${slug}`}
            className="inline-flex items-center gap-1.5 text-crema text-xs font-bold px-4 py-2 rounded-xl tracking-wider shadow-sm transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            ENTRAR
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>

    </div>
  )
}
