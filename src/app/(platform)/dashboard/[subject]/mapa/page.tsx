// src/app/(platform)/dashboard/[subject]/mapa/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getMapData, type MapData } from '@/data/knowledge-maps/index'
import FeatureIntro from '@/components/ui/FeatureIntro'

const KnowledgeMap = dynamic(
  () => import('@/components/subject/KnowledgeMap'),
  {
    ssr:     false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-tinta/40 text-sm">
        Cargando mapa...
      </div>
    ),
  }
)

export default function MapaPage() {
  const { subject: slug } = useParams<{ subject: string }>()
  const router = useRouter()

  const [mastery,  setMastery]  = useState<Record<string, number>>({})
  const [loading,  setLoading]  = useState(true)
  const [fetchErr, setFetchErr] = useState(false)

  const mapData: MapData | null = getMapData(slug)
  const hasMap = mapData !== null

  useEffect(() => {
    if (!hasMap) { setLoading(false); return }
    fetch(`/api/subjects/${slug}/mapa`)
      .then(r => r.json())
      .then(data => setMastery(data.mastery ?? {}))
      .catch(() => setFetchErr(true))
      .finally(() => setLoading(false))
  }, [slug, hasMap])

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>
      <FeatureIntro
        featureKey="mapa"
        icon="🗺️"
        title="Mapa de conocimiento"
        description="Visualizá cómo se conectan los conceptos, autores e ideas de la materia. Cada nodo te lleva al módulo correspondiente."
        steps={[
          { icon: '🔵', text: 'Los módulos son los nodos principales (azules).' },
          { icon: '🟡', text: 'Las conexiones muestran cómo se relacionan los temas entre sí.' },
          { icon: '👆', text: 'Hacé clic en un nodo para ir directo a ese módulo.' },
          { icon: '🖱️', text: 'Podés hacer zoom y mover el mapa libremente.' },
        ]}
        ctaLabel="Explorar mapa"
      />
      {/* Header */}
      <div className="bg-white border-b border-tinta/10 px-5 py-3 flex items-center gap-4 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-tinta/40 hover:text-tinta text-sm transition-colors"
        >
          ←
        </button>
        <h1 className="font-display text-verde text-lg flex-1">MAPA DE CONOCIMIENTO</h1>
        <div className="hidden sm:flex items-center gap-4 text-xs text-tinta/40">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block bg-verde" />
            Dominado (≥70%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block bg-amarillo" />
            En progreso
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block bg-rojo" />
            A reforzar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block bg-tinta/20" />
            Sin datos
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-tinta/40 text-sm">
            Cargando...
          </div>
        ) : fetchErr ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="text-4xl">⚠️</div>
            <p className="text-tinta/40 text-sm">No se pudo cargar el mapa. Intentá de nuevo.</p>
            <button
              onClick={() => router.back()}
              className="bg-tinta/10 text-tinta font-bold text-xs px-5 py-2.5 rounded-xl tracking-wider hover:bg-tinta/20 transition-colors"
            >
              ← VOLVER
            </button>
          </div>
        ) : !hasMap ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="text-4xl">🗺️</div>
            <h2 className="font-display text-verde text-xl">Próximamente</h2>
            <p className="text-tinta/40 text-sm text-center max-w-sm">
              El mapa de conocimiento para esta materia está en desarrollo.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-tinta/10 text-tinta font-bold text-xs px-5 py-2.5 rounded-xl tracking-wider hover:bg-tinta/20 transition-colors"
            >
              ← VOLVER
            </button>
          </div>
        ) : (
          <KnowledgeMap mastery={mastery} slug={slug} nodes={mapData.nodes} edges={mapData.edges} />
        )}
      </div>
    </div>
  )
}
