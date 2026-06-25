// Recta de probabilidad: 0 (suceso imposible) a 1 (suceso seguro).
const T = '#0A0A0A'
const V = '#0F3F26'

export default function ProbabilityLine() {
  return (
    <svg
      viewBox="0 0 360 120"
      width="320"
      className="max-w-full h-auto"
      role="img"
      aria-label="Recta de probabilidad de 0 (suceso imposible) a 1 (suceso seguro)"
    >
      <text x="180" y="24" fill={V} fontSize="14" fontWeight="700" textAnchor="middle">0 ≤ P(A) ≤ 1</text>
      <line x1="48" y1="62" x2="312" y2="62" stroke={T} strokeWidth="1.6" />
      <line x1="48" y1="52" x2="48" y2="72" stroke={T} strokeWidth="1.6" />
      <line x1="312" y1="52" x2="312" y2="72" stroke={T} strokeWidth="1.6" />
      <text x="48" y="46" fill={T} fontSize="14" fontWeight="700" textAnchor="middle">0</text>
      <text x="312" y="46" fill={T} fontSize="14" fontWeight="700" textAnchor="middle">1</text>
      <text x="48" y="92" fill={T} fontSize="12" textAnchor="middle">Suceso imposible</text>
      <text x="312" y="92" fill={T} fontSize="12" textAnchor="middle">Suceso seguro</text>
    </svg>
  )
}
