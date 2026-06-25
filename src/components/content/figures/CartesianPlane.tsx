// Plano cartesiano: 4 cuadrantes con los signos de (x, y). Fiel a la figura del PDF.
const T = '#0A0A0A' // tinta
const V = '#0F3F26' // verde

export default function CartesianPlane() {
  return (
    <svg
      viewBox="0 0 360 260"
      width="320"
      className="max-w-full h-auto"
      role="img"
      aria-label="Plano cartesiano con los cuatro cuadrantes y los signos de x e y"
    >
      {/* eje x */}
      <line x1="24" y1="130" x2="330" y2="130" stroke={T} strokeWidth="1.5" />
      <polygon points="332,130 320,124 320,136" fill={T} />
      {/* eje y */}
      <line x1="180" y1="236" x2="180" y2="22" stroke={T} strokeWidth="1.5" />
      <polygon points="180,20 174,32 186,32" fill={T} />
      {/* rótulos de ejes */}
      <text x="192" y="28" fill={T} fontSize="15" fontStyle="italic">y</text>
      <text x="338" y="135" fill={T} fontSize="15" fontStyle="italic">x</text>
      {/* signos por cuadrante */}
      <text x="92" y="80" fill={V} fontSize="17" fontWeight="700" textAnchor="middle">(−, +)</text>
      <text x="270" y="80" fill={V} fontSize="17" fontWeight="700" textAnchor="middle">(+, +)</text>
      <text x="92" y="192" fill={V} fontSize="17" fontWeight="700" textAnchor="middle">(−, −)</text>
      <text x="270" y="192" fill={V} fontSize="17" fontWeight="700" textAnchor="middle">(+, −)</text>
    </svg>
  )
}
