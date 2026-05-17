'use client'

interface AuthCardProps {
  title:    string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo — branding editorial */}
      <div className="hidden md:flex w-[45%] bg-verde relative flex-col justify-between p-12 overflow-hidden">
        {/* Arriba */}
        <div className="relative z-10">
          <span className="text-amarillo text-[10px] font-bold tracking-[0.4em] uppercase">
            Curso de Ingreso
          </span>
        </div>

        {/* Centro — texto hero */}
        <div className="relative z-10">
          <h1
            className="font-display text-crema leading-[0.88] tracking-tight mb-6"
            style={{ fontSize: 'clamp(3.5rem, 5.5vw, 5rem)' }}
          >
            RESÚ-<br />MENES<br /><span className="text-amarillo">UNLAM</span>
          </h1>
          <p className="text-crema/50 text-sm leading-relaxed max-w-xs">
            Material preparado especialmente para el ingreso a la Universidad Nacional de La Matanza.
          </p>
        </div>

        {/* Abajo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-px bg-crema/30" />
          <p className="text-crema/30 text-[10px] tracking-[0.4em] uppercase">
            @resumenes.unlam
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-crema flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="md:hidden text-center mb-10">
            <h1 className="font-display text-verde text-4xl tracking-tight">RESÚMENES</h1>
            <p className="text-tinta/40 text-[10px] tracking-[0.3em] mt-1 uppercase">
              UNLaM · Curso de Ingreso
            </p>
          </div>

          {/* Encabezado del form */}
          <div className="mb-8">
            <h2 className="font-display text-verde leading-tight mb-2" style={{ fontSize: '2rem' }}>
              {title.toUpperCase()}
            </h2>
            {subtitle && (
              <p className="text-tinta/50 text-sm leading-relaxed">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>

    </div>
  )
}
