import Link from 'next/link'
import ProgressBar from '@/components/shared/ProgressBar'

interface SubjectCardProps {
  name:       string
  slug:       string
  color:      string
  progress:   number
  expires_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day:   '2-digit',
    month: '2-digit',
    year:  '2-digit',
  })
}

export default function SubjectCard({
  name, slug, color, progress, expires_at,
}: SubjectCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-tinta/5 flex flex-col group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">

      {/* Header de color con nombre de materia */}
      <div
        className="p-5 min-h-[5.5rem] flex flex-col justify-end relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <h3 className="font-display text-white text-xl leading-tight relative z-10 drop-shadow-sm">
          {name.toUpperCase()}
        </h3>
      </div>

      {/* Contenido inferior */}
      <div className="p-5 pt-4 flex flex-col flex-1 bg-white">
        <ProgressBar value={progress} className="mb-4" />

        <div className="mt-auto flex items-center justify-between">
          <p className="text-[10px] text-tinta/40 tracking-wider">
            VENCE {formatDate(expires_at)}
          </p>
          <Link
            href={`/dashboard/${slug}`}
            className="text-crema text-xs font-bold px-4 py-2 rounded-xl tracking-wider transition-opacity hover:opacity-80"
            style={{ backgroundColor: color }}
          >
            ENTRAR →
          </Link>
        </div>
      </div>

    </div>
  )
}
