import Link from 'next/link'

interface LockedSubjectCardProps {
  name:  string
  color: string
  slug:  string
}

export default function LockedSubjectCard({ name, color, slug }: LockedSubjectCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-tinta/8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

      {/* Bloque de color oscurecido con monograma */}
      <div
        className="relative px-5 pt-5 pb-6 min-h-[6.5rem] flex flex-col justify-end overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="pointer-events-none absolute inset-0 bg-tinta/30" />
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.12] mix-blend-overlay" />
        <span
          className="pointer-events-none absolute -right-2 -bottom-7 font-display leading-none text-white/10 select-none"
          style={{ fontSize: '7rem' }}
          aria-hidden
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="absolute top-4 right-4 text-base opacity-90">🔒</span>
        <p className="relative text-[10px] font-bold tracking-[0.25em] text-white/50 mb-1.5">MATERIA</p>
        <h3 className="relative font-display text-white text-lg leading-tight pr-12">
          {name.toUpperCase()}
        </h3>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-tinta/30 tracking-widest mb-4">NO HABILITADA</p>
        <Link
          href={`/checkout?subject=${slug}`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 w-full bg-verde hover:bg-verde-claro text-crema text-xs font-bold py-2.5 rounded-xl tracking-wider transition-colors"
        >
          COMPRAR ACCESO
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

    </div>
  )
}
