import { FILOSOFIA_NODES, FILOSOFIA_EDGES, KnowledgeNode, KnowledgeEdge } from './filosofia'
import { BIOCIENCIAS_NODES, BIOCIENCIAS_EDGES } from './biociencias'
import { BIOLOGIA_NODES, BIOLOGIA_EDGES } from './biologia'
import { FUNDAMENTOS_EF_NODES, FUNDAMENTOS_EF_EDGES } from './fundamentos-ed-fisica'
import { HISTORIA_ARGENTINA_NODES, HISTORIA_ARGENTINA_EDGES } from './historia-argentina'
import { CONTABILIDAD_NODES, CONTABILIDAD_EDGES } from './contabilidad'
import { LOGICA_MATEMATICA_NODES, LOGICA_MATEMATICA_EDGES } from './logica-matematica'
import { SEMINARIO_NODES, SEMINARIO_EDGES } from './seminario'

// ── Para agregar una materia nueva: ──────────────────────────────────────────
// 1. Crear src/data/knowledge-maps/<slug>.ts con los nodos y edges
// 2. Importar aquí y agregar una entrada al MAP_REGISTRY
// 3. Agregar el slug al array SUBJECTS_WITH_MAP en mapa/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

export type { KnowledgeNode, KnowledgeEdge }

export type MapData = {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export const MAP_REGISTRY: Record<string, MapData> = {
  filosofia:   { nodes: FILOSOFIA_NODES,   edges: FILOSOFIA_EDGES },
  biociencias: { nodes: BIOCIENCIAS_NODES, edges: BIOCIENCIAS_EDGES },
  biologia:    { nodes: BIOLOGIA_NODES,    edges: BIOLOGIA_EDGES },
  'fundamentos-ed-fisica': { nodes: FUNDAMENTOS_EF_NODES, edges: FUNDAMENTOS_EF_EDGES },
  'historia-argentina':    { nodes: HISTORIA_ARGENTINA_NODES, edges: HISTORIA_ARGENTINA_EDGES },
  contabilidad:            { nodes: CONTABILIDAD_NODES,       edges: CONTABILIDAD_EDGES },
  'logica-matematica':     { nodes: LOGICA_MATEMATICA_NODES,  edges: LOGICA_MATEMATICA_EDGES },
  seminario:               { nodes: SEMINARIO_NODES,          edges: SEMINARIO_EDGES },

  // Agregar nuevas materias aquí:
  // logica: { nodes: LOGICA_NODES, edges: LOGICA_EDGES },
  // contabilidad: { nodes: CONTABILIDAD_NODES, edges: CONTABILIDAD_EDGES },
}

export function getMapData(slug: string): MapData | null {
  return MAP_REGISTRY[slug] ?? null
}
