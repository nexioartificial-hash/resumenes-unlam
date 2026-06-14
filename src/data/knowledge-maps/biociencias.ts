import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const BIOCIENCIAS_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1',  label: 'Salud y Ambiente',     type: 'module', module_id: '84149c21-ab46-4a45-93b1-973ad1a55311', description: 'Salud, Ambiente y Sociedad', x: 175,  y: 30 },
  { id: 'mod-2',  label: 'Biología y Ciencia',   type: 'module', module_id: '7e359539-0233-400e-be4f-6e6f4b7472b6', description: 'Biología como Ciencia',    x: 575,  y: 30 },
  { id: 'mod-3',  label: 'Química de la Vida',   type: 'module', module_id: '337be57a-4972-4908-84a9-7df85d567d7c', description: 'Química de la Vida',       x: 975,  y: 30 },
  { id: 'mod-4',  label: 'La Célula',            type: 'module', module_id: '212b5cbc-83fb-4519-a122-569d5976e221', description: 'La Célula',                x: 1375, y: 30 },
  { id: 'mod-5',  label: 'Metabolismo',          type: 'module', module_id: '4eb074ae-b60f-4e24-a7b4-6bfbf4c8db40', description: 'Metabolismo Celular',       x: 1775, y: 30 },
  { id: 'mod-6',  label: 'Transporte Celular',   type: 'module', module_id: '5560b961-b132-4b52-91e1-6d7e0ef7eaae', description: 'Transporte Celular',        x: 2175, y: 30 },
  { id: 'mod-7',  label: 'Síntesis Proteínas',   type: 'module', module_id: '8f9807da-27b9-4aad-b3e7-2e9a277c6f95', description: 'Síntesis de Proteínas',     x: 2575, y: 30 },
  { id: 'mod-8',  label: 'Rep. Celular',         type: 'module', module_id: 'd00635a1-f3b4-471d-b921-dc64fce8950e', description: 'Reproducción Celular',      x: 2975, y: 30 },
  { id: 'mod-9',  label: 'Genética',             type: 'module', module_id: 'd9affee5-d21f-4a3b-9408-0a1108720c1d', description: 'Genética',                  x: 3375, y: 30 },
  { id: 'mod-10', label: 'Tejidos y Sistemas',   type: 'module', module_id: '900c4a58-3c3b-4838-a809-ba846e21c04b', description: 'Tejidos, Sistemas y Nutrición', x: 3775, y: 30 },

  // ── Módulo 1 — Salud y Ambiente ───────────────────────────────────────────
  { id: 'conc-1a', label: 'Salud OMS/OPS',        type: 'concept', parent: 'mod-1', module_id: '84149c21-ab46-4a45-93b1-973ad1a55311', description: 'Bienestar físico, mental y social', x: 55,  y: 200 },
  { id: 'conc-1b', label: 'Ciclo Enfermedad',     type: 'concept', parent: 'mod-1', module_id: '84149c21-ab46-4a45-93b1-973ad1a55311', description: 'Pobreza → enfermedad → pobreza',    x: 215, y: 200 },
  { id: 'conc-1c', label: 'Agroquímicos',         type: 'concept', parent: 'mod-1', module_id: '84149c21-ab46-4a45-93b1-973ad1a55311', description: 'Impacto en salud ambiental',         x: 135, y: 350 },

  // ── Módulo 2 — Biología y Ciencia ─────────────────────────────────────────
  { id: 'autor-2a', label: 'Schwann/Schleiden',   type: 'author',  parent: 'mod-2', module_id: '7e359539-0233-400e-be4f-6e6f4b7472b6', description: 'Fundadores de la teoría celular',   x: 455, y: 200 },
  { id: 'autor-2b', label: 'Maturana/Varela',     type: 'author',  parent: 'mod-2', module_id: '7e359539-0233-400e-be4f-6e6f4b7472b6', description: 'Autopoiesis — autoproducción',      x: 615, y: 200 },
  { id: 'conc-2c',  label: 'Homeostasis',         type: 'concept', parent: 'mod-2', module_id: '7e359539-0233-400e-be4f-6e6f4b7472b6', description: 'Estabilidad del medio interno',     x: 535, y: 350 },

  // ── Módulo 3 — Química de la Vida ─────────────────────────────────────────
  { id: 'conc-3a', label: 'ATP',                  type: 'concept', parent: 'mod-3', module_id: '337be57a-4972-4908-84a9-7df85d567d7c', description: 'Moneda energética universal',        x: 855, y: 200 },
  { id: 'conc-3b', label: 'Puente H / pH',        type: 'concept', parent: 'mod-3', module_id: '337be57a-4972-4908-84a9-7df85d567d7c', description: 'Enlace H y buffer ácido-base',       x: 1015, y: 200 },
  { id: 'autor-3c', label: 'Watson & Crick',      type: 'author',  parent: 'mod-3', module_id: '337be57a-4972-4908-84a9-7df85d567d7c', description: 'Doble hélice ADN (1953)',            x: 935, y: 350 },

  // ── Módulo 4 — La Célula ──────────────────────────────────────────────────
  { id: 'autor-4a', label: 'Singer & Nicolson',   type: 'author',  parent: 'mod-4', module_id: '212b5cbc-83fb-4519-a122-569d5976e221', description: 'Modelo mosaico fluido (1972)',       x: 1255, y: 200 },
  { id: 'autor-4b', label: 'Lynn Margulis',       type: 'author',  parent: 'mod-4', module_id: '212b5cbc-83fb-4519-a122-569d5976e221', description: 'Teoría endosimbiótica',              x: 1415, y: 200 },
  { id: 'conc-4c',  label: 'Organelas',           type: 'concept', parent: 'mod-4', module_id: '212b5cbc-83fb-4519-a122-569d5976e221', description: 'RER, REL, Golgi, lisosomas',         x: 1335, y: 350 },

  // ── Módulo 5 — Metabolismo ────────────────────────────────────────────────
  { id: 'conc-5a', label: 'Glucólisis',           type: 'concept', parent: 'mod-5', module_id: '4eb074ae-b60f-4e24-a7b4-6bfbf4c8db40', description: '2 ATP — citoplasma — anaeróbico',    x: 1655, y: 200 },
  { id: 'conc-5b', label: 'Ciclo de Krebs',       type: 'concept', parent: 'mod-5', module_id: '4eb074ae-b60f-4e24-a7b4-6bfbf4c8db40', description: 'Matriz mitocondrial — aeróbico',     x: 1815, y: 200 },
  { id: 'conc-5c', label: 'Fosf. Oxidativa',      type: 'concept', parent: 'mod-5', module_id: '4eb074ae-b60f-4e24-a7b4-6bfbf4c8db40', description: '~32-34 ATP — cadena respiratoria',   x: 1735, y: 350 },

  // ── Módulo 6 — Transporte Celular ─────────────────────────────────────────
  { id: 'conc-6a', label: 'Difusión / Ósmosis',  type: 'concept', parent: 'mod-6', module_id: '5560b961-b132-4b52-91e1-6d7e0ef7eaae', description: 'Transporte pasivo sin ATP',          x: 2055, y: 200 },
  { id: 'conc-6b', label: 'Bomba Na⁺/K⁺',        type: 'concept', parent: 'mod-6', module_id: '5560b961-b132-4b52-91e1-6d7e0ef7eaae', description: 'Transporte activo — 1 ATP/ciclo',    x: 2215, y: 200 },
  { id: 'conc-6c', label: 'Endo/Exocitosis',     type: 'concept', parent: 'mod-6', module_id: '5560b961-b132-4b52-91e1-6d7e0ef7eaae', description: 'Vesículas — clatrina',               x: 2135, y: 350 },

  // ── Módulo 7 — Síntesis Proteínas ─────────────────────────────────────────
  { id: 'conc-7a', label: 'Código Genético',      type: 'concept', parent: 'mod-7', module_id: '8f9807da-27b9-4aad-b3e7-2e9a277c6f95', description: 'Redundante, no ambiguo, universal',  x: 2455, y: 200 },
  { id: 'conc-7b', label: 'Transcripción',        type: 'concept', parent: 'mod-7', module_id: '8f9807da-27b9-4aad-b3e7-2e9a277c6f95', description: 'ADN → ARNm (ARN polimerasa)',        x: 2615, y: 200 },
  { id: 'conc-7c', label: 'Traducción / ARNt',    type: 'concept', parent: 'mod-7', module_id: '8f9807da-27b9-4aad-b3e7-2e9a277c6f95', description: 'ARNm → proteína en ribosoma',        x: 2535, y: 350 },

  // ── Módulo 8 — Reproducción Celular ───────────────────────────────────────
  { id: 'conc-8a', label: 'Mitosis',              type: 'concept', parent: 'mod-8', module_id: 'd00635a1-f3b4-471d-b921-dc64fce8950e', description: '2n→2n, 2 células idénticas',         x: 2855, y: 200 },
  { id: 'conc-8b', label: 'Meiosis',              type: 'concept', parent: 'mod-8', module_id: 'd00635a1-f3b4-471d-b921-dc64fce8950e', description: '2n→n, 4 células — gametos',          x: 3015, y: 200 },
  { id: 'conc-8c', label: 'Crossing-over',        type: 'concept', parent: 'mod-8', module_id: 'd00635a1-f3b4-471d-b921-dc64fce8950e', description: 'Variabilidad genética — profase I',   x: 2935, y: 350 },

  // ── Módulo 9 — Genética ───────────────────────────────────────────────────
  { id: 'autor-9a', label: 'Mendel',              type: 'author',  parent: 'mod-9', module_id: 'd9affee5-d21f-4a3b-9408-0a1108720c1d', description: '3 leyes de la herencia (1865)',       x: 3255, y: 200 },
  { id: 'conc-9b', label: 'Codominancia / Ligada', type: 'concept', parent: 'mod-9', module_id: 'd9affee5-d21f-4a3b-9408-0a1108720c1d', description: 'AB, hemofilia, daltonismo',           x: 3415, y: 200 },
  { id: 'conc-9c', label: 'Trisomía 21',          type: 'concept', parent: 'mod-9', module_id: 'd9affee5-d21f-4a3b-9408-0a1108720c1d', description: 'No disyunción en meiosis — Sínd. Down', x: 3335, y: 350 },

  // ── Módulo 10 — Tejidos y Sistemas ────────────────────────────────────────
  { id: 'conc-10a', label: '4 Tejidos',           type: 'concept', parent: 'mod-10', module_id: '900c4a58-3c3b-4838-a809-ba846e21c04b', description: 'Epitelial, conectivo, muscular, nervioso', x: 3655, y: 200 },
  { id: 'conc-10b', label: 'Neurona / Neuroglía', type: 'concept', parent: 'mod-10', module_id: '900c4a58-3c3b-4838-a809-ba846e21c04b', description: 'Soma, axón, mielina, astrocitos',    x: 3815, y: 200 },
  { id: 'conc-10c', label: 'Nutrición vs. Aliment.', type: 'concept', parent: 'mod-10', module_id: '900c4a58-3c3b-4838-a809-ba846e21c04b', description: '4 sistemas interdependientes',      x: 3735, y: 350 },
]

export const BIOCIENCIAS_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía mod-1 ───────────────────────────────────────────────────────
  { id: 'e-1-1a', source: 'mod-1', target: 'conc-1a', type: 'hierarchy' },
  { id: 'e-1-1b', source: 'mod-1', target: 'conc-1b', type: 'hierarchy' },
  { id: 'e-1-1c', source: 'mod-1', target: 'conc-1c', type: 'hierarchy' },

  // ── Jerarquía mod-2 ───────────────────────────────────────────────────────
  { id: 'e-2-2a', source: 'mod-2', target: 'autor-2a', type: 'hierarchy' },
  { id: 'e-2-2b', source: 'mod-2', target: 'autor-2b', type: 'hierarchy' },
  { id: 'e-2-2c', source: 'mod-2', target: 'conc-2c',  type: 'hierarchy' },

  // ── Jerarquía mod-3 ───────────────────────────────────────────────────────
  { id: 'e-3-3a', source: 'mod-3', target: 'conc-3a',  type: 'hierarchy' },
  { id: 'e-3-3b', source: 'mod-3', target: 'conc-3b',  type: 'hierarchy' },
  { id: 'e-3-3c', source: 'mod-3', target: 'autor-3c', type: 'hierarchy' },

  // ── Jerarquía mod-4 ───────────────────────────────────────────────────────
  { id: 'e-4-4a', source: 'mod-4', target: 'autor-4a', type: 'hierarchy' },
  { id: 'e-4-4b', source: 'mod-4', target: 'autor-4b', type: 'hierarchy' },
  { id: 'e-4-4c', source: 'mod-4', target: 'conc-4c',  type: 'hierarchy' },

  // ── Jerarquía mod-5 ───────────────────────────────────────────────────────
  { id: 'e-5-5a', source: 'mod-5', target: 'conc-5a', type: 'hierarchy' },
  { id: 'e-5-5b', source: 'mod-5', target: 'conc-5b', type: 'hierarchy' },
  { id: 'e-5-5c', source: 'mod-5', target: 'conc-5c', type: 'hierarchy' },

  // ── Jerarquía mod-6 ───────────────────────────────────────────────────────
  { id: 'e-6-6a', source: 'mod-6', target: 'conc-6a', type: 'hierarchy' },
  { id: 'e-6-6b', source: 'mod-6', target: 'conc-6b', type: 'hierarchy' },
  { id: 'e-6-6c', source: 'mod-6', target: 'conc-6c', type: 'hierarchy' },

  // ── Jerarquía mod-7 ───────────────────────────────────────────────────────
  { id: 'e-7-7a', source: 'mod-7', target: 'conc-7a', type: 'hierarchy' },
  { id: 'e-7-7b', source: 'mod-7', target: 'conc-7b', type: 'hierarchy' },
  { id: 'e-7-7c', source: 'mod-7', target: 'conc-7c', type: 'hierarchy' },

  // ── Jerarquía mod-8 ───────────────────────────────────────────────────────
  { id: 'e-8-8a', source: 'mod-8', target: 'conc-8a', type: 'hierarchy' },
  { id: 'e-8-8b', source: 'mod-8', target: 'conc-8b', type: 'hierarchy' },
  { id: 'e-8-8c', source: 'mod-8', target: 'conc-8c', type: 'hierarchy' },

  // ── Jerarquía mod-9 ───────────────────────────────────────────────────────
  { id: 'e-9-9a', source: 'mod-9', target: 'autor-9a',  type: 'hierarchy' },
  { id: 'e-9-9b', source: 'mod-9', target: 'conc-9b',   type: 'hierarchy' },
  { id: 'e-9-9c', source: 'mod-9', target: 'conc-9c',   type: 'hierarchy' },

  // ── Jerarquía mod-10 ──────────────────────────────────────────────────────
  { id: 'e-10-10a', source: 'mod-10', target: 'conc-10a', type: 'hierarchy' },
  { id: 'e-10-10b', source: 'mod-10', target: 'conc-10b', type: 'hierarchy' },
  { id: 'e-10-10c', source: 'mod-10', target: 'conc-10c', type: 'hierarchy' },

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // ATP (M3) → Glucólisis (M5): ATP es producto de la glucólisis
  { id: 'cx-3a-5a', source: 'conc-3a', target: 'conc-5a', type: 'cross' },
  // ATP (M3) → Bomba Na⁺/K⁺ (M6): el transporte activo requiere ATP
  { id: 'cx-3a-6b', source: 'conc-3a', target: 'conc-6b', type: 'cross' },
  // Organelas (M4) → Ciclo Krebs (M5): Krebs ocurre en mitocondria (organela)
  { id: 'cx-4c-5b', source: 'conc-4c', target: 'conc-5b', type: 'cross' },
  // Watson&Crick (M3) → Código genético (M7): ADN codifica proteínas
  { id: 'cx-3c-7a', source: 'autor-3c', target: 'conc-7a', type: 'cross' },
  // Código genético (M7) → Mendel (M9): herencia molecular explica las leyes
  { id: 'cx-7a-9a', source: 'conc-7a', target: 'autor-9a', type: 'cross' },
  // Meiosis (M8) → Trisomía 21 (M9): errores en meiosis causan aneuploidías
  { id: 'cx-8b-9c', source: 'conc-8b', target: 'conc-9c', type: 'cross' },
  // Crossing-over (M8) → Codominancia (M9): variabilidad genética
  { id: 'cx-8c-9b', source: 'conc-8c', target: 'conc-9b', type: 'cross' },
  // Homeostasis (M2) → Nutrición (M10): los 4 sistemas mantienen la homeostasis
  { id: 'cx-2c-10c', source: 'conc-2c', target: 'conc-10c', type: 'cross' },
  // Endo/Exocitosis (M6) → Neurona (M10): vesículas sinápticas usan exocitosis
  { id: 'cx-6c-10b', source: 'conc-6c', target: 'conc-10b', type: 'cross' },
  // Margulis endosimbiosis (M4) → Fosf. Oxidativa (M5): mitocondria origen bacteriano
  { id: 'cx-4b-5c', source: 'autor-4b', target: 'conc-5c', type: 'cross' },
]
