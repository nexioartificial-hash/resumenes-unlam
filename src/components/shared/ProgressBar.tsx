interface ProgressBarProps {
  value:      number  // 0-100
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ value, className = '', showLabel = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold tracking-wider text-tinta/40">PROGRESO</p>
          <p className="text-[10px] font-bold text-tinta/50">{pct}%</p>
        </div>
      )}
      <div className="w-full bg-tinta/10 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'var(--verde)'
              : 'linear-gradient(90deg, var(--verde-claro), var(--verde))',
          }}
        />
      </div>
    </div>
  )
}
