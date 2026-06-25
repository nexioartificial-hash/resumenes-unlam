interface ComingSoonSubjectCardProps {
  name:  string
  color: string
}

export default function ComingSoonSubjectCard({ name, color }: ComingSoonSubjectCardProps) {
  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden bg-white border border-tinta/8 shadow-sm">

      {/* Bloque de color atenuado con monograma */}
      <div
        className="relative px-5 pt-5 pb-6 min-h-[6.5rem] flex flex-col justify-end overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="pointer-events-none absolute inset-0 bg-tinta/35" />
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.12] mix-blend-overlay" />
        <span
          className="pointer-events-none absolute -right-2 -bottom-7 font-display leading-none text-white/10 select-none"
          style={{ fontSize: '7rem' }}
          aria-hidden
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="absolute top-4 right-4 text-base opacity-80">⏳</span>
        <p className="relative text-[10px] font-bold tracking-[0.25em] text-white/45 mb-1.5">MATERIA</p>
        <h3 className="relative font-display text-white/85 text-lg leading-tight pr-12">
          {name.toUpperCase()}
        </h3>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-tinta/30 tracking-widest mb-4">PRÓXIMAMENTE</p>
        <div className="mt-auto w-full text-center bg-tinta/5 text-tinta/35 text-xs font-bold py-2 rounded-xl tracking-wider">
          EN PREPARACIÓN
        </div>
      </div>

    </div>
  )
}
