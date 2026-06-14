'use client'

import React from 'react'

export default function AuthLeftPanel() {
  const glowRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width)  * 100
    const y = ((e.clientY - r.top)  / r.height) * 100
    if (glowRef.current) {
      glowRef.current.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(245,214,62,0.18) 0%, transparent 55%)`
    }
  }, [])

  return (
    <div
      className="hidden lg:flex w-[52%] relative flex-col p-14 overflow-hidden"
      style={{ backgroundColor: 'var(--verde)' }}
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
      <div ref={glowRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 72% 30%, rgba(245,214,62,0.18) 0%, transparent 55%)',
      }} />

      {/* Marca */}
      <div className="relative z-10" style={{ height: 40 }}>
        <img
          src="/logo-cropped.png"
          alt="Resúmenes UNLaM"
          className="absolute"
          style={{ width: 72, height: 72, objectFit: 'contain', filter: 'brightness(0) invert(1)', top: -16, left: 0 }}
        />
        <span className="absolute text-crema/80 text-xs font-bold tracking-[0.3em] uppercase" style={{ top: '50%', transform: 'translateY(-50%)', left: 82 }}>
          ResumenesUNLaM
        </span>
      </div>

      {/* Headline */}
      <div className="relative z-10 mt-auto mb-auto" style={{ maxWidth: '55%' }}>
        <h1
          className="font-display text-crema leading-[0.88] tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 4vw, 4.2rem)' }}
        >
          EL<br />
          INGRESO<br />
          ES DIFÍCIL.<br />
          <span style={{ color: 'var(--amarillo)' }}>ESTUDIAR</span><br />
          NO TIENE<br />
          QUE SERLO.
        </h1>
      </div>

      {/* 1. Resultado de examen */}
      <div className="absolute z-20" style={{ top: '13%', right: '5%' }}>
        <div style={{ borderLeft: '3px solid var(--amarillo)', paddingLeft: 16 }}>
          <p className="text-crema/45 text-xs font-bold tracking-[0.2em] uppercase mb-1">Lógica Matemática</p>
          <p className="font-display text-crema leading-none" style={{ fontSize: 52 }}>87<span className="text-amarillo text-2xl">pts</span></p>
          <p className="text-crema/40 text-sm mt-1.5">Nota final del módulo</p>
        </div>
      </div>

      {/* 2. Progreso */}
      <div className="absolute z-20" style={{ top: '30%', right: '5%', width: 220 }}>
        <p className="text-crema/40 text-xs tracking-[0.18em] uppercase mb-3">Historia Argentina</p>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}>
          <div style={{ height: 3, width: '91%', background: 'var(--amarillo)', borderRadius: 2 }} />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-crema/35 text-xs">Quiz completado</p>
          <p className="text-amarillo text-xs font-bold">91%</p>
        </div>
      </div>

      {/* 3. Cifra social */}
      <div className="absolute z-20" style={{ top: '45%', right: '5%' }}>
        <p className="font-display leading-none tabular-nums" style={{ fontSize: 72, color: 'rgba(255,255,255,0.07)' }}>10K</p>
        <p className="text-crema text-base font-semibold" style={{ marginTop: -16 }}>+10.000 alumnos</p>
        <p className="text-crema/40 text-sm mt-0.5">aprobaron el ingreso UNLaM</p>
      </div>

      {/* 4. Racha */}
      <div className="absolute z-20" style={{ top: '62%', right: '5%' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10 }}>
          <div className="flex gap-1 shrink-0">
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ width: 5, height: 26, borderRadius: 3, backgroundColor: 'var(--amarillo)', opacity: 0.3 + i * 0.1 }} />
            ))}
          </div>
          <div>
            <p className="text-crema text-sm font-bold leading-none">7 días seguidos</p>
            <p className="text-crema/40 text-xs mt-1">Biología · En racha</p>
          </div>
        </div>
      </div>

      {/* 5. Acceso activo */}
      <div className="absolute z-20 flex items-center gap-2.5" style={{ top: '77%', right: '5%' }}>
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: 'var(--amarillo)' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--amarillo)' }} />
        </span>
        <p className="text-crema/60 text-sm">365 días de acceso activo</p>
      </div>

      {/* Bottom claim */}
      <div className="relative z-10 mt-auto">
        <div className="flex items-start gap-4">
          <div className="w-px h-10 bg-crema/50 mt-1 shrink-0" />
          <p className="text-crema/75 text-base font-medium leading-relaxed">
            La única plataforma de ingreso UNLaM<br />
            diseñada para que realmente apruebes.
          </p>
        </div>
      </div>
    </div>
  )
}
