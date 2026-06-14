'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PredictorData {
  no_data?:     boolean
  probability:  number
  trend:        'up' | 'stable' | 'down'
  history:      { pct: number; attempted_at: string }[]
  weak_modules: { module_id: string; title: string; failure_rate: number }[]
}

const TREND_LABEL = { up: '↑ Mejorando', stable: '→ Estable', down: '↓ Bajando' } as const
const TREND_COLOR = {
  up:     'text-verde bg-verde/10',
  stable: 'text-tinta/50 bg-tinta/10',
  down:   'text-rojo bg-rojo/10',
} as const

function Gauge({ probability }: { probability: number }) {
  const r   = 70
  const cx  = 100
  const cy  = 105

  const toRad   = (deg: number) => (deg * Math.PI) / 180
  const start   = 150
  const sweep   = 240
  const end     = start + sweep

  const sx = cx + r * Math.cos(toRad(start))
  const sy = cy + r * Math.sin(toRad(start))
  const ex = cx + r * Math.cos(toRad(end))
  const ey = cy + r * Math.sin(toRad(end))

  const arcPath = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`

  const circumference = 2 * Math.PI * r
  const arcLen        = (sweep / 360) * circumference
  const filled        = (probability / 100) * arcLen

  const color = probability >= 60 ? '#22c55e' : probability >= 40 ? '#eab308' : '#ef4444'

  return (
    <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
      <path d={arcPath} fill="none" stroke="#f3f4f6" strokeWidth="14" strokeLinecap="round" />
      <path
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(2)} ${circumference.toFixed(2)}`}
      />
      <text x="100" y="100" textAnchor="middle"
        style={{ fontSize: 38, fontWeight: 800, fill: '#111827', fontFamily: 'inherit' }}>
        {probability}%
      </text>
      <text x="100" y="122" textAnchor="middle"
        style={{ fontSize: 9, fill: '#9ca3af', letterSpacing: 2 }}>
        PROB. DE APROBAR
      </text>
    </svg>
  )
}

function LineChart({ history }: { history: { pct: number; attempted_at: string }[] }) {
  if (history.length < 2) return null
  const W = 300, H = 90, PAD = 20
  const iW = W - PAD * 2
  const iH = H - PAD * 2
  const pts = history.map((h, i) => ({
    x:   PAD + (i / (history.length - 1)) * iW,
    y:   PAD + (1 - h.pct / 100) * iH,
    pct: h.pct,
  }))
  const poly = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const y60  = PAD + (1 - 0.6) * iH

  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-3">EVOLUCIÓN DE SIMULACROS</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PAD} y1={y60} x2={W - PAD} y2={y60}
          stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - PAD + 3} y={y60 + 4} style={{ fontSize: 8, fill: '#9ca3af' }}>60%</text>
        <polyline points={poly} fill="none" stroke="#22c55e" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={p.pct >= 60 ? '#22c55e' : '#ef4444'}
            stroke="white" strokeWidth="2" />
        ))}
      </svg>
    </div>
  )
}

export default function PredictorPanel({ slug }: { slug: string }) {
  const router          = useRouter()
  const [data, setData] = useState<PredictorData | null>(null)

  useEffect(() => {
    fetch(`/api/subjects/${slug}/predictor`)
      .then(r => r.json())
      .then(setData)
  }, [slug])

  if (!data) return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-tinta/5">
      <p className="text-tinta/30 text-sm">Cargando predictor...</p>
    </div>
  )

  if (data.no_data) return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-tinta/5">
      <p className="text-4xl mb-3">📊</p>
      <p className="font-bold text-tinta mb-1">Sin datos todavía</p>
      <p className="text-tinta/50 text-sm mb-4">
        Hacé al menos un simulacro para ver tu predicción de nota.
      </p>
      <button
        onClick={() => router.push(`/dashboard/${slug}/quiz`)}
        className="bg-amarillo text-tinta text-xs font-bold px-5 py-2.5 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors"
      >
        IR AL SIMULACRO →
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-widest text-tinta/40">PREDICTOR</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${TREND_COLOR[data.trend]}`}>
            {TREND_LABEL[data.trend]}
          </span>
        </div>
        <Gauge probability={data.probability} />
      </div>

      {data.history.length >= 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <LineChart history={data.history} />
        </div>
      )}

      {data.weak_modules.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-4">MÓDULOS A REFORZAR</p>
          <div className="space-y-4">
            {data.weak_modules.map(m => (
              <div key={m.module_id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-tinta">{m.title}</span>
                  <span className="text-xs text-rojo font-bold">
                    {Math.round(m.failure_rate * 100)}% error
                  </span>
                </div>
                <div className="w-full bg-tinta/10 rounded-full h-1.5">
                  <div
                    className="bg-rojo h-1.5 rounded-full"
                    style={{ width: `${Math.round(m.failure_rate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push(`/dashboard/${slug}/repaso`)}
            className="mt-5 w-full bg-tinta/5 border border-tinta/10 text-tinta text-xs font-bold py-2.5 rounded-xl tracking-wider hover:bg-tinta/10 transition-colors"
          >
            REPASAR ESTAS PREGUNTAS →
          </button>
        </div>
      )}
    </div>
  )
}
