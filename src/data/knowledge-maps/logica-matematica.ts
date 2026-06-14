import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const LOGICA_MATEMATICA_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1', label: 'Lógica',               type: 'module', module_id: 'cc073a29-e417-47d8-af44-b269f82b6040', description: 'Proposiciones y conectivos lógicos',    x: 175,  y: 30 },
  { id: 'mod-2', label: 'Conjuntos',             type: 'module', module_id: 'd2748890-f4b6-4f59-88b2-25d580e2f93e', description: 'Teoría de conjuntos y operaciones',     x: 575,  y: 30 },
  { id: 'mod-3', label: 'Funciones',             type: 'module', module_id: '54281f88-afac-4187-89c2-c25e5bc1ab11', description: 'Dominio, imagen y tipos de funciones',   x: 975,  y: 30 },
  { id: 'mod-4', label: 'Combinatorio',          type: 'module', module_id: '3e96c221-4d36-425c-afdb-3b01c3d021d1', description: 'Análisis combinatorio y conteo',         x: 1375, y: 30 },
  { id: 'mod-5', label: 'Probabilidades',        type: 'module', module_id: '764dc5f0-7dab-400e-854f-4bb80fb4aab7', description: 'Espacio muestral y probabilidad',        x: 1775, y: 30 },
  { id: 'mod-6', label: 'Estadística',           type: 'module', module_id: '67b63fa8-adf2-4863-9e84-6cd9aa3d845f', description: 'Variables y medidas estadísticas',       x: 2175, y: 30 },

  // ── Módulo 1 — Lógica ─────────────────────────────────────────────────────
  { id: 'conc-1a', label: 'Proposición / VV',    type: 'concept', parent: 'mod-1', module_id: 'cc073a29-e417-47d8-af44-b269f82b6040', description: 'Enunciado con valor de verdad V/F',    x: 55,  y: 200 },
  { id: 'conc-1b', label: 'Conectivos Lógicos',  type: 'concept', parent: 'mod-1', module_id: 'cc073a29-e417-47d8-af44-b269f82b6040', description: '∧ ∨ → ↔ ¬: tablas de verdad',          x: 215, y: 200 },
  { id: 'conc-1c', label: 'Tautología / Equiv.', type: 'concept', parent: 'mod-1', module_id: 'cc073a29-e417-47d8-af44-b269f82b6040', description: 'Siempre V, siempre F, equivalentes',    x: 135, y: 350 },

  // ── Módulo 2 — Conjuntos ──────────────────────────────────────────────────
  { id: 'conc-2a', label: 'Conjunto / Elementos', type: 'concept', parent: 'mod-2', module_id: 'd2748890-f4b6-4f59-88b2-25d580e2f93e', description: 'Pertenencia ∈, subconjunto ⊆',          x: 455, y: 200 },
  { id: 'conc-2b', label: 'Operaciones (∪ ∩ −)',  type: 'concept', parent: 'mod-2', module_id: 'd2748890-f4b6-4f59-88b2-25d580e2f93e', description: 'Unión, intersección, diferencia, comp.', x: 615, y: 200 },
  { id: 'conc-2c', label: 'Diagramas de Venn',    type: 'concept', parent: 'mod-2', module_id: 'd2748890-f4b6-4f59-88b2-25d580e2f93e', description: 'Representación visual de conjuntos',    x: 535, y: 350 },

  // ── Módulo 3 — Funciones ──────────────────────────────────────────────────
  { id: 'conc-3a', label: 'Función (Dom./Cdom.)',   type: 'concept', parent: 'mod-3', module_id: '54281f88-afac-4187-89c2-c25e5bc1ab11', description: 'Relación unívoca entre dos conjuntos',   x: 855,  y: 200 },
  { id: 'conc-3b', label: 'Inyect./Sobreye./Biy.', type: 'concept', parent: 'mod-3', module_id: '54281f88-afac-4187-89c2-c25e5bc1ab11', description: 'Clasificación de funciones por imagen',  x: 1015, y: 200 },
  { id: 'conc-3c', label: 'Función Inversa / f∘g',  type: 'concept', parent: 'mod-3', module_id: '54281f88-afac-4187-89c2-c25e5bc1ab11', description: 'Inversa y composición de funciones',     x: 935,  y: 350 },

  // ── Módulo 4 — Combinatorio ───────────────────────────────────────────────
  { id: 'conc-4a', label: 'Principios de Conteo',   type: 'concept', parent: 'mod-4', module_id: '3e96c221-4d36-425c-afdb-3b01c3d021d1', description: 'Multiplicativo y Aditivo',               x: 1255, y: 200 },
  { id: 'conc-4b', label: 'Permut. / Variación',    type: 'concept', parent: 'mod-4', module_id: '3e96c221-4d36-425c-afdb-3b01c3d021d1', description: 'Ordenados con/sin repetición — n!',      x: 1415, y: 200 },
  { id: 'conc-4c', label: 'Combinación C(n,k)',      type: 'concept', parent: 'mod-4', module_id: '3e96c221-4d36-425c-afdb-3b01c3d021d1', description: 'Sin orden — número combinatorio',         x: 1335, y: 350 },

  // ── Módulo 5 — Probabilidades ─────────────────────────────────────────────
  { id: 'conc-5a', label: 'Espacio Muestral',    type: 'concept', parent: 'mod-5', module_id: '764dc5f0-7dab-400e-854f-4bb80fb4aab7', description: 'Ω: todos los resultados posibles',     x: 1655, y: 200 },
  { id: 'conc-5b', label: 'P(A) — Laplace',      type: 'concept', parent: 'mod-5', module_id: '764dc5f0-7dab-400e-854f-4bb80fb4aab7', description: 'Casos favorables / casos totales',     x: 1815, y: 200 },
  { id: 'conc-5c', label: 'P(A|B) / Independ.',  type: 'concept', parent: 'mod-5', module_id: '764dc5f0-7dab-400e-854f-4bb80fb4aab7', description: 'Probabilidad condicional e independencia', x: 1735, y: 350 },

  // ── Módulo 6 — Estadística ────────────────────────────────────────────────
  { id: 'conc-6a', label: 'Variable Estadística', type: 'concept', parent: 'mod-6', module_id: '67b63fa8-adf2-4863-9e84-6cd9aa3d845f', description: 'Discreta vs. continua — frecuencias',  x: 2055, y: 200 },
  { id: 'conc-6b', label: 'Media / Mediana / Moda', type: 'concept', parent: 'mod-6', module_id: '67b63fa8-adf2-4863-9e84-6cd9aa3d845f', description: 'Medidas de tendencia central',          x: 2215, y: 200 },
  { id: 'conc-6c', label: 'Varianza / Desvío σ',  type: 'concept', parent: 'mod-6', module_id: '67b63fa8-adf2-4863-9e84-6cd9aa3d845f', description: 'Medidas de dispersión',                  x: 2135, y: 350 },
]

export const LOGICA_MATEMATICA_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía mod-1 ───────────────────────────────────────────────────────
  { id: 'e-1-1a', source: 'mod-1', target: 'conc-1a', type: 'hierarchy' },
  { id: 'e-1-1b', source: 'mod-1', target: 'conc-1b', type: 'hierarchy' },
  { id: 'e-1-1c', source: 'mod-1', target: 'conc-1c', type: 'hierarchy' },

  // ── Jerarquía mod-2 ───────────────────────────────────────────────────────
  { id: 'e-2-2a', source: 'mod-2', target: 'conc-2a', type: 'hierarchy' },
  { id: 'e-2-2b', source: 'mod-2', target: 'conc-2b', type: 'hierarchy' },
  { id: 'e-2-2c', source: 'mod-2', target: 'conc-2c', type: 'hierarchy' },

  // ── Jerarquía mod-3 ───────────────────────────────────────────────────────
  { id: 'e-3-3a', source: 'mod-3', target: 'conc-3a', type: 'hierarchy' },
  { id: 'e-3-3b', source: 'mod-3', target: 'conc-3b', type: 'hierarchy' },
  { id: 'e-3-3c', source: 'mod-3', target: 'conc-3c', type: 'hierarchy' },

  // ── Jerarquía mod-4 ───────────────────────────────────────────────────────
  { id: 'e-4-4a', source: 'mod-4', target: 'conc-4a', type: 'hierarchy' },
  { id: 'e-4-4b', source: 'mod-4', target: 'conc-4b', type: 'hierarchy' },
  { id: 'e-4-4c', source: 'mod-4', target: 'conc-4c', type: 'hierarchy' },

  // ── Jerarquía mod-5 ───────────────────────────────────────────────────────
  { id: 'e-5-5a', source: 'mod-5', target: 'conc-5a', type: 'hierarchy' },
  { id: 'e-5-5b', source: 'mod-5', target: 'conc-5b', type: 'hierarchy' },
  { id: 'e-5-5c', source: 'mod-5', target: 'conc-5c', type: 'hierarchy' },

  // ── Jerarquía mod-6 ───────────────────────────────────────────────────────
  { id: 'e-6-6a', source: 'mod-6', target: 'conc-6a', type: 'hierarchy' },
  { id: 'e-6-6b', source: 'mod-6', target: 'conc-6b', type: 'hierarchy' },
  { id: 'e-6-6c', source: 'mod-6', target: 'conc-6c', type: 'hierarchy' },

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // Tablas de Verdad (M1) → Diagramas de Venn (M2): ambas son representaciones de relaciones lógicas
  { id: 'cx-1b-2c', source: 'conc-1b', target: 'conc-2c', type: 'cross' },
  // Conjuntos (M2) → Función (M3): una función es una relación especial entre dos conjuntos
  { id: 'cx-2a-3a', source: 'conc-2a', target: 'conc-3a', type: 'cross' },
  // Operaciones de conjuntos (M2) → Biyectiva (M3): las funciones biyectivas preservan la cardinalidad
  { id: 'cx-2b-3b', source: 'conc-2b', target: 'conc-3b', type: 'cross' },
  // Principios de conteo (M4) → Espacio muestral (M5): el tamaño de Ω se calcula con combinatoria
  { id: 'cx-4a-5a', source: 'conc-4a', target: 'conc-5a', type: 'cross' },
  // Combinación C(n,k) (M4) → P(A) Laplace (M5): P = C(favorables)/C(totales)
  { id: 'cx-4c-5b', source: 'conc-4c', target: 'conc-5b', type: 'cross' },
  // Probabilidad condicional (M5) → Varianza (M6): distribuciones de probabilidad → estadística inferencial
  { id: 'cx-5c-6c', source: 'conc-5c', target: 'conc-6c', type: 'cross' },
  // Proposición/VV (M1) → Tautología (M1 self-cross omit) — Función inversa (M3): la negación lógica es la función complemento
  { id: 'cx-1c-2b', source: 'conc-1c', target: 'conc-2b', type: 'cross' },
]
