import type { KnowledgeNode, KnowledgeEdge } from './filosofia'

export const CONTABILIDAD_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────
  { id: 'mod-1', label: 'Conceptos Básicos', type: 'module', module_id: 'c2e31011-bc17-4a96-a6be-7c42e0663cb1', description: 'Ente, Patrimonio y Ecuación Contable',   x: 175,  y: 30 },
  { id: 'mod-2', label: 'La Contabilidad',   type: 'module', module_id: 'de69e3c1-1099-4e7d-996a-7ff43b7920ec', description: 'Sistema Contable — Fowler Newton',        x: 575,  y: 30 },
  { id: 'mod-3', label: 'Información Cont.', type: 'module', module_id: '6224f090-9d09-405a-b572-d1c2fc898763', description: 'Estados Contables y PCGA',                 x: 975,  y: 30 },
  { id: 'mod-4', label: 'Las Cuentas',       type: 'module', module_id: '1fa003ba-c645-48e9-b172-6339147c9058', description: 'Clasificación, Plan y Partida Doble',     x: 1375, y: 30 },
  { id: 'mod-5', label: 'Ciclo Contable',    type: 'module', module_id: '0bc69fbf-d29b-4693-a97c-b35f7cb8185f', description: 'Ciclo Operativo, S.A. y S.R.L.',           x: 1775, y: 30 },
  { id: 'mod-6', label: 'Operaciones',       type: 'module', module_id: '955e6bda-8177-4262-8a69-f7af8c57e74c', description: 'Compras, Ventas, CMV y Documentación',    x: 2175, y: 30 },
  { id: 'mod-7', label: 'Resultados',        type: 'module', module_id: 'badd78ff-51b4-4395-870b-d21f663f706e', description: 'Devengado y Determinación de Resultados', x: 2575, y: 30 },

  // ── Módulo 1 — Conceptos Básicos ──────────────────────────────────────────
  { id: 'conc-1a', label: 'Ecuación Contable',    type: 'concept', parent: 'mod-1', module_id: 'c2e31011-bc17-4a96-a6be-7c42e0663cb1', description: 'Activo = Pasivo + PN',                       x: 55,  y: 200 },
  { id: 'conc-1b', label: 'Variaciones Patrimon.', type: 'concept', parent: 'mod-1', module_id: 'c2e31011-bc17-4a96-a6be-7c42e0663cb1', description: 'Permutativas vs. Modificativas',             x: 215, y: 200 },
  { id: 'conc-1c', label: 'Patrimonio Neto',      type: 'concept', parent: 'mod-1', module_id: 'c2e31011-bc17-4a96-a6be-7c42e0663cb1', description: 'Capital + resultados acumulados',             x: 135, y: 350 },

  // ── Módulo 2 — La Contabilidad ────────────────────────────────────────────
  { id: 'autor-2a', label: 'Fowler Newton',        type: 'author',  parent: 'mod-2', module_id: 'de69e3c1-1099-4e7d-996a-7ff43b7920ec', description: 'Definición técnica de Contabilidad',         x: 455, y: 200 },
  { id: 'conc-2b',  label: 'Sistema Contable',     type: 'concept', parent: 'mod-2', module_id: 'de69e3c1-1099-4e7d-996a-7ff43b7920ec', description: 'Datos → Procesamiento → Informes',          x: 615, y: 200 },
  { id: 'conc-2c',  label: 'Uso Externo/Interno',  type: 'concept', parent: 'mod-2', module_id: 'de69e3c1-1099-4e7d-996a-7ff43b7920ec', description: 'Terceros vs. Dirección/Gestión',             x: 535, y: 350 },

  // ── Módulo 3 — Información Contable ───────────────────────────────────────
  { id: 'conc-3a', label: 'Estados Contables',  type: 'concept', parent: 'mod-3', module_id: '6224f090-9d09-405a-b572-d1c2fc898763', description: 'BSP, ER, EEPN, Flujo de Efectivo',            x: 855,  y: 200 },
  { id: 'conc-3b', label: 'PCGA',               type: 'concept', parent: 'mod-3', module_id: '6224f090-9d09-405a-b572-d1c2fc898763', description: '7 principios: Ente, Devengado, Realización…', x: 1015, y: 200 },
  { id: 'conc-3c', label: 'Usuarios Contables', type: 'concept', parent: 'mod-3', module_id: '6224f090-9d09-405a-b572-d1c2fc898763', description: 'Externos (bancos, inversores) vs. Internos',   x: 935,  y: 350 },

  // ── Módulo 4 — Las Cuentas ────────────────────────────────────────────────
  { id: 'conc-4a', label: 'Cuentas Patrimon./Result.', type: 'concept', parent: 'mod-4', module_id: '1fa003ba-c645-48e9-b172-6339147c9058', description: 'Activo/Pasivo/PN y Resultados (+/-)',  x: 1255, y: 200 },
  { id: 'conc-4b', label: 'Partida Doble',             type: 'concept', parent: 'mod-4', module_id: '1fa003ba-c645-48e9-b172-6339147c9058', description: 'Debe = Haber: deudor/acreedor',         x: 1415, y: 200 },
  { id: 'conc-4c', label: 'Plan y Manual de Cuentas',  type: 'concept', parent: 'mod-4', module_id: '1fa003ba-c645-48e9-b172-6339147c9058', description: 'Estructura codificada del sistema',     x: 1335, y: 350 },

  // ── Módulo 5 — Ciclo Contable ─────────────────────────────────────────────
  { id: 'conc-5a', label: 'Ciclo Operativo',  type: 'concept', parent: 'mod-5', module_id: '0bc69fbf-d29b-4693-a97c-b35f7cb8185f', description: 'Comprar → fabricar → vender → cobrar',      x: 1655, y: 200 },
  { id: 'conc-5b', label: 'S.A. / S.R.L.',   type: 'concept', parent: 'mod-5', module_id: '0bc69fbf-d29b-4693-a97c-b35f7cb8185f', description: 'Acciones vs. cuotas — suscripción/integr.', x: 1815, y: 200 },
  { id: 'conc-5c', label: 'Apertura de Libros', type: 'concept', parent: 'mod-5', module_id: '0bc69fbf-d29b-4693-a97c-b35f7cb8185f', description: 'Registro inicial de aportes de capital',   x: 1735, y: 350 },

  // ── Módulo 6 — Operaciones Básicas ────────────────────────────────────────
  { id: 'conc-6a', label: 'CMV (PEPS/UEPS/PPP)', type: 'concept', parent: 'mod-6', module_id: '955e6bda-8177-4262-8a69-f7af8c57e74c', description: 'Métodos de valuación del inventario',     x: 2055, y: 200 },
  { id: 'conc-6b', label: 'Compras / Ventas',     type: 'concept', parent: 'mod-6', module_id: '955e6bda-8177-4262-8a69-f7af8c57e74c', description: 'Hecho generador — valor de incorporación', x: 2215, y: 200 },
  { id: 'conc-6c', label: 'Documentación',        type: 'concept', parent: 'mod-6', module_id: '955e6bda-8177-4262-8a69-f7af8c57e74c', description: 'Factura, Remito, Recibo, Cheque, Pagaré', x: 2135, y: 350 },

  // ── Módulo 7 — Resultados ─────────────────────────────────────────────────
  { id: 'conc-7a', label: 'Devengado',               type: 'concept', parent: 'mod-7', module_id: 'badd78ff-51b4-4395-870b-d21f663f706e', description: 'Hecho generador ≠ cobro/pago',             x: 2455, y: 200 },
  { id: 'conc-7b', label: 'Resultados Pos. / Neg.',  type: 'concept', parent: 'mod-7', module_id: 'badd78ff-51b4-4395-870b-d21f663f706e', description: 'Ingresos/Ganancias vs. Gastos/Pérdidas',   x: 2615, y: 200 },
  { id: 'conc-7c', label: 'Costo Consumido/No Cons.', type: 'concept', parent: 'mod-7', module_id: 'badd78ff-51b4-4395-870b-d21f663f706e', description: 'Activo vs. Resultado Negativo',             x: 2535, y: 350 },
]

export const CONTABILIDAD_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía mod-1 ───────────────────────────────────────────────────────
  { id: 'e-1-1a', source: 'mod-1', target: 'conc-1a', type: 'hierarchy' },
  { id: 'e-1-1b', source: 'mod-1', target: 'conc-1b', type: 'hierarchy' },
  { id: 'e-1-1c', source: 'mod-1', target: 'conc-1c', type: 'hierarchy' },

  // ── Jerarquía mod-2 ───────────────────────────────────────────────────────
  { id: 'e-2-2a', source: 'mod-2', target: 'autor-2a', type: 'hierarchy' },
  { id: 'e-2-2b', source: 'mod-2', target: 'conc-2b',  type: 'hierarchy' },
  { id: 'e-2-2c', source: 'mod-2', target: 'conc-2c',  type: 'hierarchy' },

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

  // ── Conexiones cruzadas ───────────────────────────────────────────────────
  // Ecuación contable (M1) → PCGA (M3): "Bienes Económicos" y "Ente" fundamentan la ecuación
  { id: 'cx-1a-3b', source: 'conc-1a', target: 'conc-3b', type: 'cross' },
  // Variaciones Patrimoniales (M1) → Resultados +/- (M7): las modificativas son resultados
  { id: 'cx-1b-7b', source: 'conc-1b', target: 'conc-7b', type: 'cross' },
  // Estados Contables (M3) → Ciclo Contable (M5): el ciclo culmina generando estados contables
  { id: 'cx-3a-5a', source: 'conc-3a', target: 'conc-5a', type: 'cross' },
  // Partida Doble (M4) → Compras/Ventas (M6): la partida doble registra todas las operaciones
  { id: 'cx-4b-6b', source: 'conc-4b', target: 'conc-6b', type: 'cross' },
  // Devengado (M7) → PCGA (M3): el devengado es uno de los 7 principios
  { id: 'cx-7a-3b', source: 'conc-7a', target: 'conc-3b', type: 'cross' },
  // Costo consumido (M7) → CMV (M6): el CMV es el costo consumido de la actividad principal
  { id: 'cx-7c-6a', source: 'conc-7c', target: 'conc-6a', type: 'cross' },
  // Plan de Cuentas (M4) → S.A./S.R.L. (M5): cada tipo de ente usa un plan de cuentas propio
  { id: 'cx-4c-5b', source: 'conc-4c', target: 'conc-5b', type: 'cross' },
]
