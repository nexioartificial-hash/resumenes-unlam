// Diagrama de Venn: A ⊂ B, ambos dentro del universal U; C como otro subconjunto de U.
const T = '#0A0A0A'
const V = '#0F3F26'

export default function VennAB() {
  return (
    <svg
      viewBox="0 0 360 220"
      width="320"
      className="max-w-full h-auto"
      role="img"
      aria-label="Diagrama de Venn: A incluido en B, dentro del conjunto universal U"
    >
      {/* Universal */}
      <rect x="8" y="8" width="344" height="178" fill="none" stroke={T} strokeWidth="1.3" rx="4" />
      <text x="20" y="28" fill={T} fontSize="15" fontWeight="700">U</text>
      {/* B */}
      <circle cx="138" cy="106" r="78" fill={V} fillOpacity="0.06" stroke={V} strokeWidth="1.6" />
      <text x="138" y="50" fill={V} fontSize="15" fontWeight="700" textAnchor="middle">B</text>
      {/* A dentro de B */}
      <circle cx="126" cy="122" r="38" fill={V} fillOpacity="0.13" stroke={T} strokeWidth="1.3" />
      <text x="126" y="127" fill={T} fontSize="14" fontWeight="700" textAnchor="middle">A</text>
      {/* C separado */}
      <circle cx="288" cy="102" r="46" fill="none" stroke={T} strokeWidth="1.3" />
      <text x="288" y="107" fill={T} fontSize="14" fontWeight="700" textAnchor="middle">C</text>
      {/* leyenda */}
      <text x="180" y="208" fill={T} fontSize="13.5" textAnchor="middle">A ⊂ B  (A incluido en B)</text>
    </svg>
  )
}
