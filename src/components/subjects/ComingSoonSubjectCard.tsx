interface ComingSoonSubjectCardProps {
  name:  string
  color: string
}

export default function ComingSoonSubjectCard({ name, color }: ComingSoonSubjectCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-tinta/5 flex flex-col" style={{ opacity: 0.55 }}>

      {/* Header de color */}
      <div
        className="p-5 min-h-[5.5rem] flex flex-col justify-end relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-tinta/20" />
        <div className="absolute top-3 right-3 z-10">
          <span className="text-base">⏳</span>
        </div>
        <h3 className="font-display text-white text-xl leading-tight relative z-10">
          {name.toUpperCase()}
        </h3>
      </div>

      {/* Contenido inferior */}
      <div className="p-5 pt-4 flex flex-col flex-1 bg-white/70">
        <p className="text-[10px] font-bold text-tinta/30 tracking-wider mb-3">PRÓXIMAMENTE</p>
        <div className="mt-auto w-full text-center bg-tinta/5 text-tinta/30 text-xs font-bold py-2 rounded-lg tracking-wider">
          EN PREPARACIÓN
        </div>
      </div>

    </div>
  )
}
