'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ReadToggle from './ReadToggle'
import AudioPlayer from './AudioPlayer'

interface ContentItem {
  id:               string
  title:            string
  body:             string | null
  type:             'summary' | 'guide' | 'exam_model' | 'audio'
  audio_url:        string | null
  duration_seconds: number | null
  completed:        boolean
}

interface ContentViewerProps {
  item: ContentItem
}

const TYPE_LABELS: Record<string, string> = {
  summary:    'RESUMEN',
  guide:      'GUÍA',
  exam_model: 'MODELO DE EXAMEN',
  audio:      'AUDIO',
}

const TYPE_COLORS: Record<string, string> = {
  summary:    'var(--verde)',
  guide:      'var(--azul)',
  exam_model: 'var(--rojo)',
  audio:      'var(--verde-claro)',
}

export default function ContentViewer({ item }: ContentViewerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-tinta/5 overflow-hidden">
      {/* Franja de acento superior */}
      <div className="h-1 w-full" style={{ backgroundColor: TYPE_COLORS[item.type] ?? 'var(--verde)' }} />

      <div className="p-6">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-tinta/40">
              {TYPE_LABELS[item.type]}
            </span>
            <h2 className="font-display text-verde text-2xl mt-1 leading-tight">
              {item.title.toUpperCase()}
            </h2>
          </div>
          <ReadToggle
            contentItemId={item.id}
            initialCompleted={item.completed}
          />
        </div>

      {/* Audio */}
      {item.type === 'audio' && item.audio_url && (
        <AudioPlayer url={item.audio_url} duration={item.duration_seconds} />
      )}

      {/* Contenido texto */}
      {item.body && (
        <div className="prose prose-sm max-w-none mt-4
          prose-headings:font-display prose-headings:text-verde
          prose-p:text-tinta/80 prose-p:leading-relaxed
          prose-strong:text-tinta prose-strong:font-bold
          prose-ul:text-tinta/80 prose-ol:text-tinta/80
          prose-li:marker:text-verde
          prose-blockquote:border-amarillo prose-blockquote:bg-amarillo/10
          prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded
          prose-code:bg-verde/10 prose-code:text-verde prose-code:px-1 prose-code:rounded
          prose-hr:border-tinta/10"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {item.body}
          </ReactMarkdown>
        </div>
      )}
      </div>
    </div>
  )
}
