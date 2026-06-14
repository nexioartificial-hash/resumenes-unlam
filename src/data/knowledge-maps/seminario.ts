import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const SEMINARIO_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1', label: 'Lect. y Escrit.',    type: 'module', module_id: 'c832a5d6-f50b-4a0f-9fc3-cb61aead20ce', description: 'Lectura y Escritura Académicas',            x: 175,  y: 30 },
  { id: 'mod-2', label: 'El Texto I',         type: 'module', module_id: 'c6b070c4-3633-47c1-a38f-af26fcabb690', description: 'Texto, Contexto y Paratexto',               x: 575,  y: 30 },
  { id: 'mod-3', label: 'El Texto II',        type: 'module', module_id: 'c8e95abf-3af2-4611-9691-4be8099ec312', description: 'Texto, Enunciado y Discurso',               x: 975,  y: 30 },
  { id: 'mod-4', label: 'Géneros Discurs.',   type: 'module', module_id: '141346d7-0a67-464f-b41f-5c13e9f77430', description: 'Géneros Discursivos y Secuencias Textuales', x: 1375, y: 30 },
  { id: 'mod-6', label: 'La Lectura',         type: 'module', module_id: '9bb05f98-1e26-4e98-909c-b84ab727f03a', description: 'Lectura comprensiva, interpretativa, crítica', x: 1775, y: 30 },
  { id: 'mod-7', label: 'La Escritura',       type: 'module', module_id: 'f0d52c11-9285-46a5-b413-812589c0a75c', description: 'Escritura académica — proceso cognitivo-social', x: 2175, y: 30 },
  { id: 'mod-8', label: 'Enunciación',        type: 'module', module_id: '94eac035-18ea-42e3-882d-490e3ee95605', description: 'Enunciación, Polifonía y Voces del texto',    x: 2575, y: 30 },
  { id: 'mod-9', label: 'Géneros Estudiant.', type: 'module', module_id: '5ce23665-16cd-45a5-b972-f9dbc6b5e8ae', description: 'Apunte, Resumen, Informe, Monografía',        x: 2975, y: 30 },

  // ── Módulo 1 — Lectura y Escritura ───────────────────────────────────────
  { id: 'conc-1a', label: 'Lectura Académica', type: 'concept', parent: 'mod-1', module_id: 'c832a5d6-f50b-4a0f-9fc3-cb61aead20ce', description: 'Global, por párrafos, anotaciones marginales', x: 55,  y: 200 },
  { id: 'conc-1b', label: 'Proceso de Escritura', type: 'concept', parent: 'mod-1', module_id: 'c832a5d6-f50b-4a0f-9fc3-cb61aead20ce', description: 'Planificación → puesta en texto → revisión', x: 215, y: 200 },
  { id: 'conc-1c', label: 'Géneros Discursivos', type: 'concept', parent: 'mod-1', module_id: 'c832a5d6-f50b-4a0f-9fc3-cb61aead20ce', description: 'Explicativo vs. argumentativo — enunciación',   x: 135, y: 350 },

  // ── Módulo 2 — El Texto I ────────────────────────────────────────────────
  { id: 'conc-2a', label: 'Texto',     type: 'concept', parent: 'mod-2', module_id: 'c6b070c4-3633-47c1-a38f-af26fcabb690', description: 'Unidad semántico-discursiva con sentido',   x: 455, y: 200 },
  { id: 'conc-2b', label: 'Contexto',  type: 'concept', parent: 'mod-2', module_id: 'c6b070c4-3633-47c1-a38f-af26fcabb690', description: 'Situación comunicativa que rodea al texto',  x: 615, y: 200 },
  { id: 'conc-2c', label: 'Paratexto', type: 'concept', parent: 'mod-2', module_id: 'c6b070c4-3633-47c1-a38f-af26fcabb690', description: 'Títulos, índice, notas, imágenes: marco del texto', x: 535, y: 350 },

  // ── Módulo 3 — El Texto II ───────────────────────────────────────────────
  { id: 'conc-3a', label: 'Enunciado',          type: 'concept', parent: 'mod-3', module_id: 'c8e95abf-3af2-4611-9691-4be8099ec312', description: 'Unidad mínima con capacidad comunicativa',  x: 855,  y: 200 },
  { id: 'conc-3b', label: 'Discurso',           type: 'concept', parent: 'mod-3', module_id: 'c8e95abf-3af2-4611-9691-4be8099ec312', description: 'Práctica social de producción de sentido',   x: 1015, y: 200 },
  { id: 'conc-3c', label: 'Cohesión / Coherencia', type: 'concept', parent: 'mod-3', module_id: 'c8e95abf-3af2-4611-9691-4be8099ec312', description: 'Propiedades del texto bien formado',        x: 935,  y: 350 },

  // ── Módulo 4 — Géneros y Secuencias ─────────────────────────────────────
  { id: 'conc-4a', label: 'Género Discursivo',  type: 'concept', parent: 'mod-4', module_id: '141346d7-0a67-464f-b41f-5c13e9f77430', description: 'Categoría social del lenguaje — Bajtín',       x: 1255, y: 200 },
  { id: 'conc-4b', label: 'Secuencia Textual',  type: 'concept', parent: 'mod-4', module_id: '141346d7-0a67-464f-b41f-5c13e9f77430', description: 'Narr., descr., explic., argum. — Adam',         x: 1415, y: 200 },
  { id: 'conc-4c', label: 'Enunciación',        type: 'concept', parent: 'mod-4', module_id: '141346d7-0a67-464f-b41f-5c13e9f77430', description: 'Acto de producción: locutor, destinatario',     x: 1335, y: 350 },

  // ── Módulo 6 — La Lectura ─────────────────────────────────────────────────
  { id: 'autor-6a', label: 'Cassany',             type: 'author',  parent: 'mod-6', module_id: '9bb05f98-1e26-4e98-909c-b84ab727f03a', description: 'Referente en lectura y escritura académica', x: 1655, y: 200 },
  { id: 'conc-6b',  label: 'Lectura Comprens.',   type: 'concept', parent: 'mod-6', module_id: '9bb05f98-1e26-4e98-909c-b84ab727f03a', description: 'Comprensiva, interpretativa, crítica',         x: 1815, y: 200 },
  { id: 'conc-6c',  label: 'Leer entre líneas',   type: 'concept', parent: 'mod-6', module_id: '9bb05f98-1e26-4e98-909c-b84ab727f03a', description: 'Intención, ideología y crítica del texto',     x: 1735, y: 350 },

  // ── Módulo 7 — La Escritura ──────────────────────────────────────────────
  { id: 'conc-7a', label: 'Escritura Académica', type: 'concept', parent: 'mod-7', module_id: 'f0d52c11-9285-46a5-b413-812589c0a75c', description: 'Cognitiva, histórica y social — Cassany',      x: 2055, y: 200 },
  { id: 'conc-7b', label: 'Proceso Compositivo', type: 'concept', parent: 'mod-7', module_id: 'f0d52c11-9285-46a5-b413-812589c0a75c', description: 'Planif. → textualización → revisión (recursivo)', x: 2215, y: 200 },
  { id: 'conc-7c', label: 'Gramática / Estilo',  type: 'concept', parent: 'mod-7', module_id: 'f0d52c11-9285-46a5-b413-812589c0a75c', description: 'Normas lingüísticas y registro académico',      x: 2135, y: 350 },

  // ── Módulo 8 — Enunciación y Polifonía ───────────────────────────────────
  { id: 'conc-8a', label: 'Enunciación',     type: 'concept', parent: 'mod-8', module_id: '94eac035-18ea-42e3-882d-490e3ee95605', description: 'Marcas del enunciador en el texto — deícticos', x: 2455, y: 200 },
  { id: 'conc-8b', label: 'Polifonía',       type: 'concept', parent: 'mod-8', module_id: '94eac035-18ea-42e3-882d-490e3ee95605', description: 'Múltiples voces en el texto — Bajtín',           x: 2615, y: 200 },
  { id: 'conc-8c', label: 'Cita / Discurso Ref.', type: 'concept', parent: 'mod-8', module_id: '94eac035-18ea-42e3-882d-490e3ee95605', description: 'Discurso directo, indirecto, mixto',          x: 2535, y: 350 },

  // ── Módulo 9 — Géneros de Estudiantes ────────────────────────────────────
  { id: 'conc-9a', label: 'Apunte / Resumen',   type: 'concept', parent: 'mod-9', module_id: '5ce23665-16cd-45a5-b972-f9dbc6b5e8ae', description: 'Síntesis y registro de contenido académico',   x: 2855, y: 200 },
  { id: 'conc-9b', label: 'Informe / Monografía', type: 'concept', parent: 'mod-9', module_id: '5ce23665-16cd-45a5-b972-f9dbc6b5e8ae', description: 'Géneros de producción académica extendida',  x: 3015, y: 200 },
  { id: 'conc-9c', label: 'Paráfrasis / Cita',  type: 'concept', parent: 'mod-9', module_id: '5ce23665-16cd-45a5-b972-f9dbc6b5e8ae', description: 'Reformulación y referencia a fuentes',         x: 2935, y: 350 },
]

export const SEMINARIO_EDGES: KnowledgeEdge[] = [
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

  // ── Jerarquía mod-6 ───────────────────────────────────────────────────────
  { id: 'e-6-6a', source: 'mod-6', target: 'autor-6a', type: 'hierarchy' },
  { id: 'e-6-6b', source: 'mod-6', target: 'conc-6b',  type: 'hierarchy' },
  { id: 'e-6-6c', source: 'mod-6', target: 'conc-6c',  type: 'hierarchy' },

  // ── Jerarquía mod-7 ───────────────────────────────────────────────────────
  { id: 'e-7-7a', source: 'mod-7', target: 'conc-7a', type: 'hierarchy' },
  { id: 'e-7-7b', source: 'mod-7', target: 'conc-7b', type: 'hierarchy' },
  { id: 'e-7-7c', source: 'mod-7', target: 'conc-7c', type: 'hierarchy' },

  // ── Jerarquía mod-8 ───────────────────────────────────────────────────────
  { id: 'e-8-8a', source: 'mod-8', target: 'conc-8a', type: 'hierarchy' },
  { id: 'e-8-8b', source: 'mod-8', target: 'conc-8b', type: 'hierarchy' },
  { id: 'e-8-8c', source: 'mod-8', target: 'conc-8c', type: 'hierarchy' },

  // ── Jerarquía mod-9 ───────────────────────────────────────────────────────
  { id: 'e-9-9a', source: 'mod-9', target: 'conc-9a', type: 'hierarchy' },
  { id: 'e-9-9b', source: 'mod-9', target: 'conc-9b', type: 'hierarchy' },
  { id: 'e-9-9c', source: 'mod-9', target: 'conc-9c', type: 'hierarchy' },

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // Géneros Discursivos (M1) → Género Discursivo (M4): M1 introduce, M4 profundiza con Bajtín
  { id: 'cx-1c-4a', source: 'conc-1c', target: 'conc-4a', type: 'cross' },
  // Texto (M2) → Cohesión/Coherencia (M3): las propiedades del texto son coherencia y cohesión
  { id: 'cx-2a-3c', source: 'conc-2a', target: 'conc-3c', type: 'cross' },
  // Enunciación (M4) → Polifonía (M8): la enunciación introduce las voces del texto
  { id: 'cx-4c-8b', source: 'conc-4c', target: 'conc-8b', type: 'cross' },
  // Lectura Comprensiva (M6) → Escritura Académica (M7): leer críticamente es condición para escribir bien
  { id: 'cx-6b-7a', source: 'conc-6b', target: 'conc-7a', type: 'cross' },
  // Cassany (M6) → Proceso Compositivo (M7): el mismo autor fundamenta la escritura como proceso
  { id: 'cx-6a-7b', source: 'autor-6a', target: 'conc-7b', type: 'cross' },
  // Secuencia Textual (M4) → Géneros Académicos (M9): los géneros de estudiantes usan secuencias definidas
  { id: 'cx-4b-9b', source: 'conc-4b', target: 'conc-9b', type: 'cross' },
  // Cita / Discurso Ref. (M8) → Paráfrasis/Cita (M9): el discurso referido se materializa en citas y paráfrasis
  { id: 'cx-8c-9c', source: 'conc-8c', target: 'conc-9c', type: 'cross' },
  // Proceso de Escritura (M1) → Proceso Compositivo (M7): M7 desarrolla en profundidad lo introducido en M1
  { id: 'cx-1b-7b', source: 'conc-1b', target: 'conc-7b', type: 'cross' },
]
