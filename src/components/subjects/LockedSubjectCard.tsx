import Link from 'next/link'

interface LockedSubjectCardProps {
  name:  string
  color: string
  slug:  string
}

export default function LockedSubjectCard({ name, color, slug }: LockedSubjectCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-tinta/5 flex flex-col" style={{ opacity: 0.85 }}>

      {/* Header de color — oscurecido */}
      <div
        className="p-5 min-h-[5.5rem] flex flex-col justify-end relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-tinta/25" />
        <div className="absolute top-3 right-3 z-10">
          <span className="text-base">🔒</span>
        </div>
        <h3 className="font-display text-white text-xl leading-tight relative z-10">
          {name.toUpperCase()}
        </h3>
      </div>

      {/* Contenido inferior */}
      <div className="p-5 pt-4 flex flex-col flex-1 bg-white/70">
        <p className="text-[10px] font-bold text-tinta/30 tracking-wider mb-3">NO HABILITADA</p>
        <Link
          href={`/checkout?subject=${slug}`}
          className="mt-auto w-full text-center bg-verde hover:bg-verde-claro text-crema text-xs font-bold py-2 rounded-xl tracking-wider transition-colors block"
        >
          COMPRAR ACCESO →
        </Link>
      </div>

    </div>
  )
}
