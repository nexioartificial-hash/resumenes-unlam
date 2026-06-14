import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const HISTORIA_ARGENTINA_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1', label: 'Marco Teórico',     type: 'module', module_id: '5c7f9bee-bedd-4394-8cf2-dc5868beffe7', description: 'Globalización y Anomia',                x: 175,  y: 30 },
  { id: 'mod-2', label: 'Colonia',           type: 'module', module_id: '835bb16b-30b7-48d9-910d-a0b8ff774d72', description: 'La Formación Social Americana',          x: 575,  y: 30 },
  { id: 'mod-3', label: 'Independencia',     type: 'module', module_id: 'ce360e34-672d-4fae-b238-6d2c5aa6069b', description: 'Revolución de la Independencia',         x: 975,  y: 30 },
  { id: 'mod-4', label: 'Guerras Civiles',   type: 'module', module_id: 'd2ff129e-56fe-40d2-88a2-300f06b138fe', description: 'Unitarios, Federales y Confederación',   x: 1375, y: 30 },
  { id: 'mod-5', label: 'Rep. Liberal',      type: 'module', module_id: 'b05322ce-fb73-4226-bae8-f7a1677962c8', description: 'Modelo Agroexportador',                  x: 1775, y: 30 },
  { id: 'mod-6', label: 'Reforma Política',  type: 'module', module_id: '449205c2-a153-483a-b2b3-935be65555db', description: 'Ley Sáenz Peña y Yrigoyen',              x: 2175, y: 30 },
  { id: 'mod-7', label: 'Peronismo',         type: 'module', module_id: 'da8eb683-dfca-48ed-b48e-a091ae8f5473', description: 'Estado Justicialista y Dem. Tutelada',   x: 2575, y: 30 },
  { id: 'mod-8', label: 'Democracia',        type: 'module', module_id: 'b40fceaf-4331-437b-8ea2-57d45f0168d9', description: 'Apertura Democrática 1983-2001',          x: 2975, y: 30 },

  // ── Módulo 1 — Marco Teórico ──────────────────────────────────────────────
  { id: 'conc-1a', label: 'Globalización',        type: 'concept', parent: 'mod-1', module_id: '5c7f9bee-bedd-4394-8cf2-dc5868beffe7', description: 'Centro-periferia: extracción de valor', x: 55,  y: 200 },
  { id: 'conc-1b', label: 'Anomia',               type: 'concept', parent: 'mod-1', module_id: '5c7f9bee-bedd-4394-8cf2-dc5868beffe7', description: 'Incumplimiento sistemático de normas',  x: 215, y: 200 },
  { id: 'conc-1c', label: 'Violencia Estructural', type: 'concept', parent: 'mod-1', module_id: '5c7f9bee-bedd-4394-8cf2-dc5868beffe7', description: 'Generada por la desigualdad social',   x: 135, y: 350 },

  // ── Módulo 2 — Colonia ────────────────────────────────────────────────────
  { id: 'conc-2a', label: 'Régimen de Castas',   type: 'concept', parent: 'mod-2', module_id: '835bb16b-30b7-48d9-910d-a0b8ff774d72', description: 'Jerarquía étnico-jurídica colonial',   x: 455, y: 200 },
  { id: 'conc-2b', label: 'Pacto Colonial',      type: 'concept', parent: 'mod-2', module_id: '835bb16b-30b7-48d9-910d-a0b8ff774d72', description: 'Monopolio comercial con la metrópoli', x: 615, y: 200 },
  { id: 'conc-2c', label: 'Mita / Encomienda',  type: 'concept', parent: 'mod-2', module_id: '835bb16b-30b7-48d9-910d-a0b8ff774d72', description: 'Trabajo forzado e impuestos indígenas', x: 535, y: 350 },

  // ── Módulo 3 — Independencia ──────────────────────────────────────────────
  { id: 'autor-3a', label: 'San Martín / Belgrano', type: 'author',  parent: 'mod-3', module_id: 'ce360e34-672d-4fae-b238-6d2c5aa6069b', description: 'Conductores militares de la emancipación', x: 855,  y: 200 },
  { id: 'conc-3b',  label: 'Revolución de Mayo',    type: 'concept', parent: 'mod-3', module_id: 'ce360e34-672d-4fae-b238-6d2c5aa6069b', description: 'Ruptura y continuidad: 1810-1816',         x: 1015, y: 200 },
  { id: 'conc-3c',  label: 'Proceso Emancipatorio', type: 'concept', parent: 'mod-3', module_id: 'ce360e34-672d-4fae-b238-6d2c5aa6069b', description: 'De la Primera Junta a la Independencia',   x: 935,  y: 350 },

  // ── Módulo 4 — Guerras Civiles ────────────────────────────────────────────
  { id: 'autor-4a', label: 'Rosas / Urquiza',      type: 'author',  parent: 'mod-4', module_id: 'd2ff129e-56fe-40d2-88a2-300f06b138fe', description: 'Caudillos federales enfrentados en Caseros', x: 1255, y: 200 },
  { id: 'conc-4b',  label: 'Unitarios / Federales', type: 'concept', parent: 'mod-4', module_id: 'd2ff129e-56fe-40d2-88a2-300f06b138fe', description: 'Centralismo vs. autonomía provincial',        x: 1415, y: 200 },
  { id: 'conc-4c',  label: 'Constitución 1853',     type: 'concept', parent: 'mod-4', module_id: 'd2ff129e-56fe-40d2-88a2-300f06b138fe', description: 'Organización nacional federal',               x: 1335, y: 350 },

  // ── Módulo 5 — República Liberal ──────────────────────────────────────────
  { id: 'autor-5a', label: 'Julio A. Roca',          type: 'author',  parent: 'mod-5', module_id: 'b05322ce-fb73-4226-bae8-f7a1677962c8', description: 'Campaña del Desierto y orden oligárquico', x: 1655, y: 200 },
  { id: 'conc-5b',  label: 'Modelo Agroexportador',  type: 'concept', parent: 'mod-5', module_id: 'b05322ce-fb73-4226-bae8-f7a1677962c8', description: 'Granos y carnes para el mercado mundial',   x: 1815, y: 200 },
  { id: 'conc-5c',  label: 'Inmigración / Latifundio', type: 'concept', parent: 'mod-5', module_id: 'b05322ce-fb73-4226-bae8-f7a1677962c8', description: 'Mano de obra y concentración de la tierra', x: 1735, y: 350 },

  // ── Módulo 6 — Reforma Política ───────────────────────────────────────────
  { id: 'autor-6a', label: 'Yrigoyen / Lugones', type: 'author',  parent: 'mod-6', module_id: '449205c2-a153-483a-b2b3-935be65555db', description: 'Democracia y reacción antidemocrática',       x: 2055, y: 200 },
  { id: 'conc-6b',  label: 'Ley Sáenz Peña',     type: 'concept', parent: 'mod-6', module_id: '449205c2-a153-483a-b2b3-935be65555db', description: 'Voto universal, secreto y obligatorio (1912)', x: 2215, y: 200 },
  { id: 'conc-6c',  label: 'ISI / Golpe 1930',   type: 'concept', parent: 'mod-6', module_id: '449205c2-a153-483a-b2b3-935be65555db', description: 'Ind. sustitutiva y quiebre democrático',        x: 2135, y: 350 },

  // ── Módulo 7 — Peronismo ──────────────────────────────────────────────────
  { id: 'autor-7a', label: 'Perón / Eva Perón',     type: 'author',  parent: 'mod-7', module_id: 'da8eb683-dfca-48ed-b48e-a091ae8f5473', description: 'Conductor y Evita: líderes del movimiento', x: 2455, y: 200 },
  { id: 'conc-7b',  label: 'Estado Social',          type: 'concept', parent: 'mod-7', module_id: 'da8eb683-dfca-48ed-b48e-a091ae8f5473', description: 'Redistribución, IAPI, Plan Quinquenal',      x: 2615, y: 200 },
  { id: 'conc-7c',  label: 'Democracia Tutelada',    type: 'concept', parent: 'mod-7', module_id: 'da8eb683-dfca-48ed-b48e-a091ae8f5473', description: 'Peronismo proscripto, militares árbitros',   x: 2535, y: 350 },

  // ── Módulo 8 — Apertura Democrática ──────────────────────────────────────
  { id: 'autor-8a', label: 'Alfonsín / Menem',  type: 'author',  parent: 'mod-8', module_id: 'b40fceaf-4331-437b-8ea2-57d45f0168d9', description: 'Transición democrática y neoliberalismo',  x: 2855, y: 200 },
  { id: 'conc-8b',  label: 'Convertibilidad',   type: 'concept', parent: 'mod-8', module_id: 'b40fceaf-4331-437b-8ea2-57d45f0168d9', description: '1 peso = 1 dólar: estabilidad y deuda',     x: 3015, y: 200 },
  { id: 'conc-8c',  label: 'Crisis 2001',        type: 'concept', parent: 'mod-8', module_id: 'b40fceaf-4331-437b-8ea2-57d45f0168d9', description: 'Default, devaluación y colapso político',   x: 2935, y: 350 },
]

export const HISTORIA_ARGENTINA_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía mod-1 ───────────────────────────────────────────────────────
  { id: 'e-1-1a', source: 'mod-1', target: 'conc-1a', type: 'hierarchy' },
  { id: 'e-1-1b', source: 'mod-1', target: 'conc-1b', type: 'hierarchy' },
  { id: 'e-1-1c', source: 'mod-1', target: 'conc-1c', type: 'hierarchy' },

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
  { id: 'e-5-5a', source: 'mod-5', target: 'autor-5a', type: 'hierarchy' },
  { id: 'e-5-5b', source: 'mod-5', target: 'conc-5b',  type: 'hierarchy' },
  { id: 'e-5-5c', source: 'mod-5', target: 'conc-5c',  type: 'hierarchy' },

  // ── Jerarquía mod-6 ───────────────────────────────────────────────────────
  { id: 'e-6-6a', source: 'mod-6', target: 'autor-6a', type: 'hierarchy' },
  { id: 'e-6-6b', source: 'mod-6', target: 'conc-6b',  type: 'hierarchy' },
  { id: 'e-6-6c', source: 'mod-6', target: 'conc-6c',  type: 'hierarchy' },

  // ── Jerarquía mod-7 ───────────────────────────────────────────────────────
  { id: 'e-7-7a', source: 'mod-7', target: 'autor-7a', type: 'hierarchy' },
  { id: 'e-7-7b', source: 'mod-7', target: 'conc-7b',  type: 'hierarchy' },
  { id: 'e-7-7c', source: 'mod-7', target: 'conc-7c',  type: 'hierarchy' },

  // ── Jerarquía mod-8 ───────────────────────────────────────────────────────
  { id: 'e-8-8a', source: 'mod-8', target: 'autor-8a', type: 'hierarchy' },
  { id: 'e-8-8b', source: 'mod-8', target: 'conc-8b',  type: 'hierarchy' },
  { id: 'e-8-8c', source: 'mod-8', target: 'conc-8c',  type: 'hierarchy' },

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // Pacto Colonial (M2) → Modelo Agroexportador (M5): inserción periférica continúa post-independencia
  { id: 'cx-2b-5b', source: 'conc-2b', target: 'conc-5b', type: 'cross' },
  // Revolución de Mayo (M3) → Constitución 1853 (M4): independencia → organización nacional
  { id: 'cx-3c-4c', source: 'conc-3c', target: 'conc-4c', type: 'cross' },
  // Modelo Agroexportador (M5) → ISI/Golpe 1930 (M6): crisis 1929 rompe el modelo externo
  { id: 'cx-5b-6c', source: 'conc-5b', target: 'conc-6c', type: 'cross' },
  // Anomia (M1) → Golpe 1930 (M6): la anomia institucional habilita el quiebre democrático
  { id: 'cx-1b-6c', source: 'conc-1b', target: 'conc-6c', type: 'cross' },
  // ISI (M6) → Estado Social (M7): la industrialización crea la clase obrera que sostiene el peronismo
  { id: 'cx-6c-7b', source: 'conc-6c', target: 'conc-7b', type: 'cross' },
  // Democracia Tutelada (M7) → Crisis 2001 (M8): la exclusión del peronismo y la inestabilidad como antecedentes
  { id: 'cx-7c-8c', source: 'conc-7c', target: 'conc-8c', type: 'cross' },
  // Anomia (M1) → Democracia Tutelada (M7): la anomia como constante: normas formales vs. realidad
  { id: 'cx-1b-7c', source: 'conc-1b', target: 'conc-7c', type: 'cross' },
  // Convertibilidad (M8) → Globalización (M1): la Convertibilidad como subordinación al esquema centro-periferia
  { id: 'cx-8b-1a', source: 'conc-8b', target: 'conc-1a', type: 'cross' },
]
