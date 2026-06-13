'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ContentViewer from '@/components/content/ContentViewer'
import ProgressBar from '@/components/shared/ProgressBar'
import PredictorPanel from '@/components/subject/PredictorPanel'

interface Module {
  id:          string
  title:       string
  description: string | null
  order_index: number
  completed:   boolean
}

interface ContentItem {
  id:               string
  title:            string
  body:             string | null
  type:             'summary' | 'guide' | 'exam_model' | 'audio'
  audio_url:        string | null
  duration_seconds: number | null
  completed:        boolean
}

interface Subject {
  id:    string
  name:  string
  slug:  string
  color: string
}

interface SubjectContentProps {
  subject: Subject
  modules: Module[]
  content: ContentItem[]
}

type Tab = 'modulos' | 'material' | 'predictor'

export default function SubjectContent({ subject, modules, content }: SubjectContentProps) {
  const router = useRouter()
  const slug   = subject.slug

  const [tab,          setTab]          = useState<Tab>('modulos')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(content[0] ?? null)

  const completedModules = modules.filter(m => m.completed).length
  const moduleProgress   = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0

  const supportTypes = ['guide', 'exam_model', 'audio'].filter(t =>
    content.some(c => c.type === t)
  )

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-tinta/40 hover:text-tinta transition-colors text-sm"
          >
            ← Volver
          </button>
          <div className="h-4 w-px bg-tinta/20" />
          <h1 className="font-display text-verde text-xl flex-1">
            {subject.name.toUpperCase()}
          </h1>
          <button
            onClick={() => router.push(`/dashboard/${slug}/quiz`)}
            className="bg-amarillo text-tinta text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-amarillo/80 transition-colors shrink-0"
          >
            QUIZ →
          </button>
          <button
            onClick={() => router.push(`/dashboard/${slug}/repaso`)}
            className="bg-tinta/10 text-tinta text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-tinta/20 transition-colors shrink-0 border border-tinta/10"
          >
            REPASO →
          </button>
          <button
            onClick={() => router.push(`/dashboard/${slug}/flashcards`)}
            className="bg-tinta/10 text-tinta text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-tinta/20 transition-colors shrink-0 border border-tinta/10"
          >
            CARDS →
          </button>
          <button
            onClick={() => router.push(`/dashboard/${slug}/ai`)}
            className="bg-verde text-crema text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-verde-claro transition-colors shrink-0"
          >
            IA →
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar value={moduleProgress} />
          <span className="text-xs text-tinta/40 shrink-0">
            {completedModules}/{modules.length} módulos
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('modulos')}
          className={`text-xs font-bold px-4 py-2 rounded-lg tracking-wider transition-colors ${
            tab === 'modulos'
              ? 'bg-verde text-crema'
              : 'bg-white text-tinta/50 hover:bg-tinta/5 border border-tinta/10'
          }`}
        >
          📚 MÓDULOS
        </button>
        {supportTypes.length > 0 && (
          <button
            onClick={() => setTab('material')}
            className={`text-xs font-bold px-4 py-2 rounded-lg tracking-wider transition-colors ${
              tab === 'material'
                ? 'bg-verde text-crema'
                : 'bg-white text-tinta/50 hover:bg-tinta/5 border border-tinta/10'
            }`}
          >
            📄 MATERIAL DE APOYO
          </button>
        )}
        <button
          onClick={() => setTab('predictor')}
          className={`text-xs font-bold px-4 py-2 rounded-lg tracking-wider transition-colors ${
            tab === 'predictor'
              ? 'bg-verde text-crema'
              : 'bg-white text-tinta/50 hover:bg-tinta/5 border border-tinta/10'
          }`}
        >
          📊 PREDICTOR
        </button>
      </div>

      {/* Módulos */}
      {tab === 'modulos' && (
        <div className="space-y-2 flex-1">
          {modules.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-tinta/5">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-tinta/40 text-sm">Todavía no hay módulos cargados en esta materia</p>
            </div>
          ) : (
            modules.map((mod, idx) => (
              <button
                key={mod.id}
                onClick={() => router.push(`/dashboard/${slug}/modulos/${mod.id}`)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 hover:border-verde/20 hover:shadow-md transition-all text-left group overflow-hidden relative"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    mod.completed
                      ? 'bg-verde text-crema'
                      : 'bg-verde/10 text-verde group-hover:bg-verde/20'
                  }`}>
                    {mod.completed ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${mod.completed ? 'text-tinta/60' : 'text-tinta'}`}>
                      {mod.title}
                    </p>
                    {mod.description && (
                      <p className="text-tinta/40 text-xs mt-0.5 truncate">{mod.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-bold tracking-wider shrink-0 transition-colors ${
                    mod.completed
                      ? 'text-verde'
                      : 'text-tinta/30 group-hover:text-verde'
                  }`}>
                    {mod.completed ? 'COMPLETADO' : 'LEER →'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Material de apoyo */}
      {tab === 'material' && (
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-64 shrink-0 bg-white rounded-2xl p-2 shadow-sm border border-tinta/5 flex flex-col gap-1 overflow-y-auto">
            {content.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                  selectedItem?.id === item.id
                    ? 'bg-verde text-crema shadow-sm font-bold'
                    : 'text-tinta/50 hover:bg-tinta/5 hover:text-tinta'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {item.type === 'guide' ? '📝' : item.type === 'exam_model' ? '📄' : '🎧'}
                </span>
                <span className="line-clamp-2">{item.title}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedItem ? (
              <ContentViewer key={selectedItem.id} item={selectedItem} />
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-tinta/5">
                <p className="text-tinta/40 text-sm">Seleccioná un ítem</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictor de nota */}
      {tab === 'predictor' && (
        <div className="flex-1">
          <PredictorPanel slug={slug} />
        </div>
      )}
    </div>
  )
}
