import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const BIOLOGIA_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1',  label: 'Biodiversidad',       type: 'module', module_id: '6aa5d578-03d7-45a1-98e8-ca56ed22f969', description: 'Biodiversidad y Evolución',        x: 175,  y: 30 },
  { id: 'mod-2',  label: 'Química de la Vida',  type: 'module', module_id: 'c5068c09-e4eb-47cd-aa3e-4901fbaebcc8', description: 'Química de la Vida',               x: 575,  y: 30 },
  { id: 'mod-3',  label: 'Soluciones / pH',     type: 'module', module_id: '40fc0a35-7a29-4970-b59c-7712504483a5', description: 'Soluciones y Equilibrio Químico',  x: 975,  y: 30 },
  { id: 'mod-4',  label: 'Biomoléculas',        type: 'module', module_id: '69e36c04-4ed8-4dcb-bbf9-c19687115327', description: 'Biomoléculas',                     x: 1375, y: 30 },
  { id: 'mod-5',  label: 'La Célula',           type: 'module', module_id: '2cde494e-4245-4589-8586-78f4259aea7b', description: 'Generalidades de la Célula',       x: 1775, y: 30 },
  { id: 'mod-6',  label: 'Membrana Plasmática', type: 'module', module_id: '98c62085-3dd2-4798-a5d9-e24e6b86506a', description: 'Membrana Plasmática',               x: 2175, y: 30 },
  { id: 'mod-7',  label: 'Citoplasma',          type: 'module', module_id: 'c6502bb5-8619-4a87-bb28-d03dbb2b5d5d', description: 'Citoplasma y Organelas',           x: 2575, y: 30 },
  { id: 'mod-8',  label: 'Núcleo Celular',      type: 'module', module_id: 'c93afe99-5758-4aec-b390-c11e878d150e', description: 'Núcleo Celular',                   x: 2975, y: 30 },
  { id: 'mod-9',  label: 'Rep. Celular',        type: 'module', module_id: '470cbdf7-fa61-4937-a782-3d6b6d7e8725', description: 'Reproducción Celular',             x: 3375, y: 30 },
  { id: 'mod-10', label: 'Salud y Ambiente',    type: 'module', module_id: 'aefef5f8-280e-4d6a-b6c5-4a801d0a394b', description: 'Salud y Ambiente',                 x: 3775, y: 30 },

  // ── Módulo 1 — Biodiversidad ──────────────────────────────────────────────
  { id: 'conc-1a', label: 'Evolución / Selección', type: 'concept', parent: 'mod-1', module_id: '6aa5d578-03d7-45a1-98e8-ca56ed22f969', description: 'Darwin — selección natural',          x: 55,   y: 200 },
  { id: 'conc-1b', label: 'Taxonomía',             type: 'concept', parent: 'mod-1', module_id: '6aa5d578-03d7-45a1-98e8-ca56ed22f969', description: 'Clasificación — dominio a especie',   x: 215,  y: 200 },
  { id: 'conc-1c', label: 'Prop. Seres Vivos',     type: 'concept', parent: 'mod-1', module_id: '6aa5d578-03d7-45a1-98e8-ca56ed22f969', description: 'Movimiento, crecimiento, reproducción', x: 135, y: 350 },

  // ── Módulo 2 — Química de la Vida ─────────────────────────────────────────
  { id: 'conc-2a', label: 'Bioelementos',       type: 'concept', parent: 'mod-2', module_id: 'c5068c09-e4eb-47cd-aa3e-4901fbaebcc8', description: 'C, H, O, N, S, P — carbono tetravalente', x: 455, y: 200 },
  { id: 'conc-2b', label: 'Enlace Cov./Iónico', type: 'concept', parent: 'mod-2', module_id: 'c5068c09-e4eb-47cd-aa3e-4901fbaebcc8', description: 'Compartición vs. transferencia e⁻',     x: 615, y: 200 },
  { id: 'conc-2c', label: 'Puente H / Agua',    type: 'concept', parent: 'mod-2', module_id: 'c5068c09-e4eb-47cd-aa3e-4901fbaebcc8', description: 'Agua solvente universal — vida',         x: 535, y: 350 },

  // ── Módulo 3 — Soluciones / pH ────────────────────────────────────────────
  { id: 'conc-3a', label: 'pH / Buffer',        type: 'concept', parent: 'mod-3', module_id: '40fc0a35-7a29-4970-b59c-7712504483a5', description: 'pH 7,35-7,45 sangre — bicarbonato',   x: 855,  y: 200 },
  { id: 'conc-3b', label: 'Ósmosis',            type: 'concept', parent: 'mod-3', module_id: '40fc0a35-7a29-4970-b59c-7712504483a5', description: 'Agua → hipertónica a través membrana', x: 1015, y: 200 },
  { id: 'conc-3c', label: 'Molaridad',          type: 'concept', parent: 'mod-3', module_id: '40fc0a35-7a29-4970-b59c-7712504483a5', description: 'mol/L — concentración de soluciones',  x: 935,  y: 350 },

  // ── Módulo 4 — Biomoléculas ────────────────────────────────────────────────
  { id: 'conc-4a', label: 'Glúcidos',          type: 'concept', parent: 'mod-4', module_id: '69e36c04-4ed8-4dcb-bbf9-c19687115327', description: 'Glucosa, glucógeno, celulosa',       x: 1255, y: 200 },
  { id: 'conc-4b', label: 'Proteínas',         type: 'concept', parent: 'mod-4', module_id: '69e36c04-4ed8-4dcb-bbf9-c19687115327', description: 'Aminoácidos → enzimas, estructural',  x: 1415, y: 200 },
  { id: 'conc-4c', label: 'Lípidos / Ácd. Nuc.', type: 'concept', parent: 'mod-4', module_id: '69e36c04-4ed8-4dcb-bbf9-c19687115327', description: 'Membranas — ADN/ARN información',  x: 1335, y: 350 },

  // ── Módulo 5 — La Célula ──────────────────────────────────────────────────
  { id: 'conc-5a', label: 'Procariota vs. Eucariota', type: 'concept', parent: 'mod-5', module_id: '2cde494e-4245-4589-8586-78f4259aea7b', description: 'Sin/con núcleo y organelas',     x: 1655, y: 200 },
  { id: 'conc-5b', label: 'Forma-Función',     type: 'concept', parent: 'mod-5', module_id: '2cde494e-4245-4589-8586-78f4259aea7b', description: 'Eritrocito bicóncavo / neurona axón', x: 1815, y: 200 },
  { id: 'conc-5c', label: 'Organelas',         type: 'concept', parent: 'mod-5', module_id: '2cde494e-4245-4589-8586-78f4259aea7b', description: 'Mitocondria, ribosoma, vacuola',     x: 1735, y: 350 },

  // ── Módulo 6 — Membrana Plasmática ────────────────────────────────────────
  { id: 'conc-6a', label: 'Mosaico Fluido',    type: 'concept', parent: 'mod-6', module_id: '98c62085-3dd2-4798-a5d9-e24e6b86506a', description: 'Singer & Nicolson 1972',              x: 2055, y: 200 },
  { id: 'conc-6b', label: 'Transporte Activo', type: 'concept', parent: 'mod-6', module_id: '98c62085-3dd2-4798-a5d9-e24e6b86506a', description: 'Bomba Na⁺/K⁺ — contra gradiente',    x: 2215, y: 200 },
  { id: 'conc-6c', label: 'Difusión / Endo-Exocitosis', type: 'concept', parent: 'mod-6', module_id: '98c62085-3dd2-4798-a5d9-e24e6b86506a', description: 'Transporte pasivo y vesicular', x: 2135, y: 350 },

  // ── Módulo 7 — Citoplasma ─────────────────────────────────────────────────
  { id: 'conc-7a', label: 'Mitocondria',       type: 'concept', parent: 'mod-7', module_id: 'c6502bb5-8619-4a87-bb28-d03dbb2b5d5d', description: 'ATP — endosimbiosis bacteriana',      x: 2455, y: 200 },
  { id: 'conc-7b', label: 'RER / REL / Golgi', type: 'concept', parent: 'mod-7', module_id: 'c6502bb5-8619-4a87-bb28-d03dbb2b5d5d', description: 'Ruta secretora de proteínas',         x: 2615, y: 200 },
  { id: 'conc-7c', label: 'Lisosomas',         type: 'concept', parent: 'mod-7', module_id: 'c6502bb5-8619-4a87-bb28-d03dbb2b5d5d', description: 'Enzimas hidrolíticas pH 5',           x: 2535, y: 350 },

  // ── Módulo 8 — Núcleo Celular ─────────────────────────────────────────────
  { id: 'conc-8a', label: 'ADN / Cromatina',   type: 'concept', parent: 'mod-8', module_id: 'c93afe99-5758-4aec-b390-c11e878d150e', description: 'Genoma — cromosomas — histonas',      x: 2855, y: 200 },
  { id: 'conc-8b', label: 'Replicación',       type: 'concept', parent: 'mod-8', module_id: 'c93afe99-5758-4aec-b390-c11e878d150e', description: 'Semiconservativa — fase S',            x: 3015, y: 200 },
  { id: 'conc-8c', label: 'Transcripción',     type: 'concept', parent: 'mod-8', module_id: 'c93afe99-5758-4aec-b390-c11e878d150e', description: 'ADN → ARNm — ARN polimerasa',         x: 2935, y: 350 },

  // ── Módulo 9 — Reproducción Celular ───────────────────────────────────────
  { id: 'conc-9a', label: 'Ciclo Celular',     type: 'concept', parent: 'mod-9', module_id: '470cbdf7-fa61-4937-a782-3d6b6d7e8725', description: 'G1-S-G2-M — ciclinas/CDK',           x: 3255, y: 200 },
  { id: 'conc-9b', label: 'Mitosis',           type: 'concept', parent: 'mod-9', module_id: '470cbdf7-fa61-4937-a782-3d6b6d7e8725', description: '2n→2n — crecimiento y reparación',    x: 3415, y: 200 },
  { id: 'conc-9c', label: 'Meiosis',           type: 'concept', parent: 'mod-9', module_id: '470cbdf7-fa61-4937-a782-3d6b6d7e8725', description: '2n→n — gametos — variabilidad',       x: 3335, y: 350 },

  // ── Módulo 10 — Salud y Ambiente ──────────────────────────────────────────
  { id: 'conc-10a', label: 'Servicios Ecosistémicos', type: 'concept', parent: 'mod-10', module_id: 'aefef5f8-280e-4d6a-b6c5-4a801d0a394b', description: 'Agua, aire, alimento, clima',   x: 3655, y: 200 },
  { id: 'conc-10b', label: 'Crisis Ambiental', type: 'concept', parent: 'mod-10', module_id: 'aefef5f8-280e-4d6a-b6c5-4a801d0a394b', description: 'Contaminación → salud humana',        x: 3815, y: 200 },
  { id: 'conc-10c', label: 'Biodiversidad-Salud', type: 'concept', parent: 'mod-10', module_id: 'aefef5f8-280e-4d6a-b6c5-4a801d0a394b', description: 'Pérdida biod. → zoonosis',         x: 3735, y: 350 },
]

export const BIOLOGIA_EDGES: KnowledgeEdge[] = [
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

  // ── Jerarquía mod-10 ──────────────────────────────────────────────────────
  { id: 'e-10-10a', source: 'mod-10', target: 'conc-10a', type: 'hierarchy' },
  { id: 'e-10-10b', source: 'mod-10', target: 'conc-10b', type: 'hierarchy' },
  { id: 'e-10-10c', source: 'mod-10', target: 'conc-10c', type: 'hierarchy' },

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // Evolución (M1) → Biodiversidad-Salud (M10): pérdida biod. consecuencia evolución
  { id: 'cx-1a-10c', source: 'conc-1a', target: 'conc-10c', type: 'cross' },
  // Bioelementos (M2) → Biomoléculas glúcidos (M4): C,H,O forman glúcidos
  { id: 'cx-2a-4a', source: 'conc-2a', target: 'conc-4a', type: 'cross' },
  // Puente H (M2) → pH/Buffer (M3): puente H mantiene estructura del agua y buffers
  { id: 'cx-2c-3a', source: 'conc-2c', target: 'conc-3a', type: 'cross' },
  // Ósmosis (M3) → Membrana mosaico fluido (M6): ósmosis ocurre a través de membrana
  { id: 'cx-3b-6a', source: 'conc-3b', target: 'conc-6a', type: 'cross' },
  // Proteínas (M4) → Transporte activo (M6): bomba Na⁺/K⁺ es una proteína
  { id: 'cx-4b-6b', source: 'conc-4b', target: 'conc-6b', type: 'cross' },
  // Organelas (M5) → Citoplasma/Mitocondria (M7): organelas = contenido del citoplasma
  { id: 'cx-5c-7a', source: 'conc-5c', target: 'conc-7a', type: 'cross' },
  // ADN/Cromatina (M8) → Replicación ciclo (M9): ciclo celular incluye fase S/replicación
  { id: 'cx-8b-9a', source: 'conc-8b', target: 'conc-9a', type: 'cross' },
  // Transcripción (M8) → Proteínas (M4): ADN → ARNm → proteínas (dogma central)
  { id: 'cx-8c-4b', source: 'conc-8c', target: 'conc-4b', type: 'cross' },
  // Meiosis (M9) → Biodiversidad (M1): variabilidad genética sustenta la evolución
  { id: 'cx-9c-1a', source: 'conc-9c', target: 'conc-1a', type: 'cross' },
  // Crisis ambiental (M10) → Prop. seres vivos (M1): ambiente afecta condiciones de vida
  { id: 'cx-10b-1c', source: 'conc-10b', target: 'conc-1c', type: 'cross' },
]
