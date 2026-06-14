import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const FUNDAMENTOS_EF_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1', label: 'La Ed. Física',        type: 'module', module_id: 'f868bf3d-36dc-4b0b-b920-f2ada3c663eb', description: 'La Educación Física',         x: 175,  y: 30 },
  { id: 'mod-2', label: 'Currículum',           type: 'module', module_id: 'b310f2cf-f8e4-44cb-941e-8840df74a099', description: 'Currículum y Enseñanza',       x: 575,  y: 30 },
  { id: 'mod-3', label: 'Sujeto Aprendizaje',   type: 'module', module_id: 'fe75caf7-a501-4939-8d05-5d55eb14e530', description: 'El Sujeto del Aprendizaje',    x: 975,  y: 30 },
  { id: 'mod-4', label: 'Prácticas de EF',      type: 'module', module_id: '5871abe5-e931-4a34-aaa0-9fadbd0506f1', description: 'Prácticas de la EF',          x: 1375, y: 30 },
  { id: 'mod-5', label: 'EF Inclusiva',         type: 'module', module_id: '66ff84c8-c075-46f3-b92c-ccb8374ce912', description: 'Educación Física Inclusiva',   x: 1775, y: 30 },
  { id: 'mod-6', label: 'EF y Salud',           type: 'module', module_id: '727da7f1-a428-4042-a9b6-7c13ab3b85b3', description: 'EF para la Salud',            x: 2175, y: 30 },

  // ── Módulo 1 — La Ed. Física ──────────────────────────────────────────────
  { id: 'autor-1a', label: 'Bracht & Caparróz', type: 'author',  parent: 'mod-1', module_id: 'f868bf3d-36dc-4b0b-b920-f2ada3c663eb', description: 'Cultura corporal de movimiento', x: 55,  y: 200 },
  { id: 'conc-1b',  label: 'Cultura Corporal',  type: 'concept', parent: 'mod-1', module_id: 'f868bf3d-36dc-4b0b-b920-f2ada3c663eb', description: 'Deportes, danzas, juegos, nat.', x: 215, y: 200 },
  { id: 'conc-1c',  label: 'Concepciones EF',   type: 'concept', parent: 'mod-1', module_id: 'f868bf3d-36dc-4b0b-b920-f2ada3c663eb', description: 'Biologicista vs. cultural/pedagógica', x: 135, y: 350 },

  // ── Módulo 2 — Currículum ─────────────────────────────────────────────────
  { id: 'conc-2a', label: 'Currículum',         type: 'concept', parent: 'mod-2', module_id: 'b310f2cf-f8e4-44cb-941e-8840df74a099', description: 'Oficial / real / oculto',        x: 455, y: 200 },
  { id: 'conc-2b', label: 'Pedagogía',          type: 'concept', parent: 'mod-2', module_id: 'b310f2cf-f8e4-44cb-941e-8840df74a099', description: 'Escuela, cultura, sociedad',     x: 615, y: 200 },
  { id: 'conc-2c', label: 'Currículum Oculto',  type: 'concept', parent: 'mod-2', module_id: 'b310f2cf-f8e4-44cb-941e-8840df74a099', description: 'Lo que se aprende sin enseñar',  x: 535, y: 350 },

  // ── Módulo 3 — Sujeto Aprendizaje ─────────────────────────────────────────
  { id: 'autor-3a', label: 'Giles & Rocha Bid.', type: 'author', parent: 'mod-3', module_id: 'fe75caf7-a501-4939-8d05-5d55eb14e530', description: 'Perspectiva holística-relacional', x: 855,  y: 200 },
  { id: 'conc-3b',  label: 'Anti-Cartesiano',    type: 'concept', parent: 'mod-3', module_id: 'fe75caf7-a501-4939-8d05-5d55eb14e530', description: 'Rechazo dic. cuerpo-mente',      x: 1015, y: 200 },
  { id: 'conc-3c',  label: 'Aprendizaje Motor',  type: 'concept', parent: 'mod-3', module_id: 'fe75caf7-a501-4939-8d05-5d55eb14e530', description: 'Motor + emocional + cognitivo',  x: 935,  y: 350 },

  // ── Módulo 4 — Prácticas de EF ────────────────────────────────────────────
  { id: 'autor-4a', label: 'Rozengardt & Glez.', type: 'author', parent: 'mod-4', module_id: '5871abe5-e931-4a34-aaa0-9fadbd0506f1', description: 'Cultura corporal histórica',      x: 1255, y: 200 },
  { id: 'conc-4b',  label: 'Juego / Deporte',    type: 'concept', parent: 'mod-4', module_id: '5871abe5-e931-4a34-aaa0-9fadbd0506f1', description: 'Libre vs. codificado',           x: 1415, y: 200 },
  { id: 'conc-4c',  label: 'Danza / Naturaleza', type: 'concept', parent: 'mod-4', module_id: '5871abe5-e931-4a34-aaa0-9fadbd0506f1', description: 'Expresión — autonomía — entorno', x: 1335, y: 350 },

  // ── Módulo 5 — EF Inclusiva ────────────────────────────────────────────────
  { id: 'conc-5a', label: 'Inclusión vs. Integr.', type: 'concept', parent: 'mod-5', module_id: '66ff84c8-c075-46f3-b92c-ccb8374ce912', description: 'Sistema se adapta vs. alumno', x: 1655, y: 200 },
  { id: 'conc-5b', label: 'Modelo Social Discap.', type: 'concept', parent: 'mod-5', module_id: '66ff84c8-c075-46f3-b92c-ccb8374ce912', description: 'Barreras sociales, no déficit',  x: 1815, y: 200 },
  { id: 'conc-5c', label: 'Diseño Universal',      type: 'concept', parent: 'mod-5', module_id: '66ff84c8-c075-46f3-b92c-ccb8374ce912', description: 'Acceso para todos — adapt. curr.', x: 1735, y: 350 },

  // ── Módulo 6 — EF y Salud ─────────────────────────────────────────────────
  { id: 'conc-6a', label: 'Actividad Física',    type: 'concept', parent: 'mod-6', module_id: '727da7f1-a428-4042-a9b6-7c13ab3b85b3', description: 'Gasto > metabolismo basal',       x: 2055, y: 200 },
  { id: 'conc-6b', label: 'Catab./Anabolismo',   type: 'concept', parent: 'mod-6', module_id: '727da7f1-a428-4042-a9b6-7c13ab3b85b3', description: 'Degradación vs. síntesis — ATP',  x: 2215, y: 200 },
  { id: 'conc-6c', label: 'Sedentarismo / ECNT', type: 'concept', parent: 'mod-6', module_id: '727da7f1-a428-4042-a9b6-7c13ab3b85b3', description: 'Factor de riesgo — OMS 150 min', x: 2135, y: 350 },
]

export const FUNDAMENTOS_EF_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía mod-1 ───────────────────────────────────────────────────────
  { id: 'e-1-1a', source: 'mod-1', target: 'autor-1a', type: 'hierarchy' },
  { id: 'e-1-1b', source: 'mod-1', target: 'conc-1b',  type: 'hierarchy' },
  { id: 'e-1-1c', source: 'mod-1', target: 'conc-1c',  type: 'hierarchy' },

  // ── Jerarquía mod-2 ───────────────────────────────────────────────────────
  { id: 'e-2-2a', source: 'mod-2', target: 'conc-2a', type: 'hierarchy' },
  { id: 'e-2-2b', source: 'mod-2', target: 'conc-2b', type: 'hierarchy' },
  { id: 'e-2-2c', source: 'mod-2', target: 'conc-2c', type: 'hierarchy' },

  // ── Jerarquía mod-3 ───────────────────────────────────────────────────────
  { id: 'e-3-3a', source: 'mod-3', target: 'autor-3a', type: 'hierarchy' },
  { id: 'e-3-3b', source: 'mod-3', target: 'conc-3b',  type: 'hierarchy' },
  { id: 'e-3-3c', source: 'mod-3', target: 'conc-3c',  type: 'hierarchy' },

  // ── Jerarquía mod-4 ───────────────────────────────────────────────────────
  { id: 'e-4-4a', source: 'mod-4', target: 'autor-4a', type: 'hierarchy' },
  { id: 'e-4-4b', source: 'mod-4', target: 'conc-4b',  type: 'hierarchy' },
  { id: 'e-4-4c', source: 'mod-4', target: 'conc-4c',  type: 'hierarchy' },

  // ── Jerarquía mod-5 ───────────────────────────────────────────────────────
  { id: 'e-5-5a', source: 'mod-5', target: 'conc-5a', type: 'hierarchy' },
  { id: 'e-5-5b', source: 'mod-5', target: 'conc-5b', type: 'hierarchy' },
  { id: 'e-5-5c', source: 'mod-5', target: 'conc-5c', type: 'hierarchy' },

  // ── Jerarquía mod-6 ───────────────────────────────────────────────────────
  { id: 'e-6-6a', source: 'mod-6', target: 'conc-6a', type: 'hierarchy' },
  { id: 'e-6-6b', source: 'mod-6', target: 'conc-6b', type: 'hierarchy' },
  { id: 'e-6-6c', source: 'mod-6', target: 'conc-6c', type: 'hierarchy' },

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // Cultura corporal (M1) → Prácticas EF (M4): las prácticas son la cultura corporal
  { id: 'cx-1b-4a', source: 'conc-1b', target: 'autor-4a', type: 'cross' },
  // Currículum oculto (M2) → Inclusión (M5): el currículo oculto puede excluir
  { id: 'cx-2c-5a', source: 'conc-2c', target: 'conc-5a', type: 'cross' },
  // Holístico/Antidic. (M3) → Modelo social discap. (M5): ambos rechazan reduccionismo
  { id: 'cx-3b-5b', source: 'conc-3b', target: 'conc-5b', type: 'cross' },
  // Aprendizaje motor (M3) → Actividad física (M6): la AF produce aprendizaje motor
  { id: 'cx-3c-6a', source: 'conc-3c', target: 'conc-6a', type: 'cross' },
  // Juego/deporte (M4) → Diseño universal (M5): las prácticas deben diseñarse para todos
  { id: 'cx-4b-5c', source: 'conc-4b', target: 'conc-5c', type: 'cross' },
  // Sedentarismo (M6) → Concepciones EF (M1): EF para la salud = una concepción de EF
  { id: 'cx-6c-1c', source: 'conc-6c', target: 'conc-1c', type: 'cross' },
]
