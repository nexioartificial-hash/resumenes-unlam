// Función como correspondencia: a cada x de A le corresponde un único y de B.
const T = '#0A0A0A'
const V = '#0F3F26'

export default function FunctionMapping() {
  return (
    <svg
      viewBox="0 0 360 210"
      width="320"
      className="max-w-full h-auto"
      role="img"
      aria-label="Función: a cada elemento del dominio A le corresponde un único elemento del codominio B"
    >
      {/* conjuntos */}
      <ellipse cx="82" cy="118" rx="54" ry="78" fill={V} fillOpacity="0.05" stroke={V} strokeWidth="1.6" />
      <ellipse cx="278" cy="118" rx="54" ry="78" fill={V} fillOpacity="0.05" stroke={V} strokeWidth="1.6" />
      <text x="82" y="26" fill={V} fontSize="13.5" fontWeight="700" textAnchor="middle">A (dominio)</text>
      <text x="278" y="26" fill={V} fontSize="13.5" fontWeight="700" textAnchor="middle">B (codominio)</text>
      {/* elementos */}
      <circle cx="82" cy="98" r="3.6" fill={T} />
      <circle cx="82" cy="146" r="3.6" fill={T} />
      <circle cx="278" cy="92" r="3.6" fill={T} />
      <circle cx="278" cy="150" r="3.6" fill={T} />
      <text x="66" y="102" fill={T} fontSize="13" textAnchor="end">x₁</text>
      <text x="66" y="150" fill={T} fontSize="13" textAnchor="end">x₂</text>
      <text x="294" y="96" fill={T} fontSize="13">y₁</text>
      <text x="294" y="154" fill={T} fontSize="13">y₂</text>
      {/* flechas f */}
      <line x1="88" y1="98" x2="270" y2="92" stroke={T} strokeWidth="1.2" />
      <polygon points="274,92 264,88 265,95" fill={T} />
      <line x1="88" y1="146" x2="270" y2="150" stroke={T} strokeWidth="1.2" />
      <polygon points="274,150 264,147 265,154" fill={T} />
      <text x="180" y="108" fill={V} fontSize="15" fontStyle="italic" fontWeight="700" textAnchor="middle">f</text>
    </svg>
  )
}
