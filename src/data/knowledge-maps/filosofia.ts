export type KnowledgeNodeType = 'module' | 'author' | 'concept'
export type EdgeType = 'hierarchy' | 'cross'

export interface KnowledgeNode {
  id:          string
  label:       string
  type:        KnowledgeNodeType
  module_id?:  string
  parent?:     string
  description: string
  x:           number
  y:           number
}

export interface KnowledgeEdge {
  id:     string
  source: string
  target: string
  type:   EdgeType
}

export const FILOSOFIA_NODES: KnowledgeNode[] = [
  // ── Módulos ───────────────────────────────────────────────────────────────────
  { id: 'mod-1', label: 'Amor por la Sabiduría',     type: 'module', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'El origen de la filosofía en la polis griega. La transición del mito al logos y el amor por el saber.', x: 175,  y: 30 },
  { id: 'mod-2', label: 'Epistemología',              type: 'module', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'El estudio del conocimiento: sus fundamentos, límites y formas de validación. Episteme vs Doxa.',       x: 560,  y: 30 },
  { id: 'mod-3', label: 'Antropología Filosófica',   type: 'module', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'La pregunta por el ser humano: autoconocimiento, naturaleza humana y concepciones históricas.',         x: 960,  y: 30 },
  { id: 'mod-4', label: 'Filosofía Social y Política', type: 'module', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El fundamento del orden social. El contrato social, la legitimidad del poder y la alienación.',       x: 1370, y: 30 },
  { id: 'mod-5', label: 'Ética',                      type: 'module', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Teorías sobre la moral, el bien y el deber. Desde la eudaimonía aristotélica hasta el imperativo categórico.', x: 1760, y: 30 },

  // ── Módulo 1 — Fila 1 ────────────────────────────────────────────────────────
  { id: 'socrates',    label: 'Sócrates',         type: 'author',  parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'Filósofo ateniense. Creador de la ironía socrática: fingir ignorancia para que el interlocutor descubra sus contradicciones. "Solo sé que no sé nada."', x: 30,  y: 240 },
  { id: 'mythos-logos', label: 'Mythos vs Lógos', type: 'concept', parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'La transición del pensamiento mítico (mythos) al pensamiento racional (lógos) marca el nacimiento de la filosofía en la Grecia antigua.', x: 200, y: 240 },
  { id: 'polis-griega', label: 'La Polis',        type: 'concept', parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'La ciudad-estado griega como marco del pensamiento filosófico. La filosofía surge en la polis como espacio de debate público y búsqueda colectiva de la verdad.', x: 360, y: 240 },

  // ── Módulo 1 — Fila 2 ────────────────────────────────────────────────────────
  { id: 'tales',         label: 'Tales de Mileto', type: 'author',  parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'Considerado el primer filósofo occidental. Propuso el agua como arché (principio originario). Inauguró la búsqueda racional de explicaciones para la naturaleza, reemplazando el mito.', x: 30,  y: 400 },
  { id: 'presocraticos', label: 'Presocráticos',   type: 'concept', parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'Primeros filósofos griegos (Tales, Heráclito, Parménides, Pitágoras). Buscaron el arché (principio originario del universo) mediante la razón, inaugurando el pensamiento filosófico occidental.', x: 200, y: 400 },
  { id: 'metodo-socratico', label: 'Mayéutica',    type: 'concept', parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'El método socrático: arte de "dar a luz" el conocimiento que el interlocutor ya tiene. Mediante preguntas, Sócrates ayudaba a los otros a descubrir la verdad por sí mismos.', x: 360, y: 400 },

  // ── Módulo 2 — Fila 1 ────────────────────────────────────────────────────────
  { id: 'episteme-doxa', label: 'Episteme vs Doxa', type: 'concept', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Episteme: conocimiento verdadero y justificado. Doxa: mera opinión o creencia sin fundamento riguroso. Distinción central de la epistemología griega.', x: 460, y: 240 },
  { id: 'hegel',         label: 'Hegel',            type: 'author',  parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Filósofo idealista alemán. Su dialéctica (tesis → antítesis → síntesis) postula que el conocimiento y la historia avanzan por contradicciones que se superan en una síntesis superior.', x: 620, y: 240 },
  { id: 'hermeneutica',  label: 'Hermenéutica',     type: 'concept', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Arte de la interpretación de textos y sentidos. Sostiene que todo conocimiento implica una pre-comprensión del intérprete (círculo hermenéutico). Gadamer y Dilthey son sus representantes modernos.', x: 780, y: 240 },

  // ── Módulo 2 — Fila 2 ────────────────────────────────────────────────────────
  { id: 'racionalismo', label: 'Racionalismo', type: 'concept', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Corriente que afirma que el conocimiento verdadero proviene de la razón pura, no de los sentidos. Las ideas innatas son su fundamento. Representantes: Descartes, Leibniz, Spinoza.', x: 460, y: 400 },
  { id: 'empirismo',    label: 'Empirismo',    type: 'concept', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'El conocimiento proviene únicamente de la experiencia sensible. La mente es una "tabula rasa" al nacer. Representantes: Locke, Hume, Berkeley. Se opone directamente al racionalismo.', x: 620, y: 400 },
  { id: 'descartes',    label: 'Descartes',    type: 'author',  parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: '"Pienso, luego existo" (cogito ergo sum). Aplica la duda metódica: poner en duda todo lo que no sea absolutamente cierto para hallar un fundamento indudable. Padre del racionalismo moderno.', x: 780, y: 400 },

  // ── Módulo 3 — Fila 1 ────────────────────────────────────────────────────────
  { id: 'autoconocimiento', label: 'Autoconocimiento', type: 'concept', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: '"Conócete a ti mismo" (oráculo de Delfos): principio que orienta la Antropología Filosófica. La pregunta por el ser del hombre como punto de partida de toda reflexión filosófica.', x: 840,  y: 240 },
  { id: 'ilustracion',      label: 'Ilustración',      type: 'concept', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Movimiento intelectual del siglo XVIII que pone a la Razón como centro del ser humano y motor del progreso histórico. "Sapere aude": atrévete a saber (Kant).', x: 1000, y: 240 },
  { id: 'sartre',           label: 'Sartre',           type: 'author',  parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Filósofo existencialista. "La existencia precede a la esencia": el ser humano no tiene una naturaleza fija previa; se define enteramente por sus actos y elecciones. La libertad como condena.', x: 1160, y: 240 },

  // ── Módulo 3 — Fila 2 ────────────────────────────────────────────────────────
  { id: 'humanismo',       label: 'Humanismo',      type: 'concept', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Corriente que coloca al ser humano como centro y medida de todas las cosas. Surge en el Renacimiento como valoración de la dignidad, la razón y el potencial creativo humano.', x: 840,  y: 400 },
  { id: 'freud',           label: 'Freud',          type: 'author',  parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Padre del psicoanálisis. Revolucionó la concepción del ser humano al descubrir el inconsciente: fuerzas psíquicas que determinan la conducta sin que el sujeto sea consciente de ellas.', x: 1000, y: 400 },
  { id: 'existencialismo', label: 'Existencialismo', type: 'concept', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Corriente filosófica centrada en la existencia concreta del individuo. El ser humano no tiene una esencia predeterminada: se constituye a través de sus decisiones. Kierkegaard, Sartre, Heidegger.', x: 1160, y: 400 },

  // ── Módulo 4 — Fila 1 ────────────────────────────────────────────────────────
  { id: 'hobbes',   label: 'Hobbes',   type: 'author', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El estado de naturaleza es una "guerra de todos contra todos" (homo homini lupus). El contrato social crea el Leviatán (Estado absoluto) para garantizar la paz y seguridad.', x: 1240, y: 240 },
  { id: 'rousseau', label: 'Rousseau', type: 'author', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El ser humano es bueno por naturaleza; la sociedad lo corrompe. El contrato social debe expresar la voluntad general del pueblo. Padre ideológico de la Revolución Francesa.', x: 1400, y: 240 },
  { id: 'marx',     label: 'Marx',     type: 'author', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'Analiza la alienación del trabajador bajo el capitalismo. El materialismo histórico: las condiciones materiales de producción determinan la conciencia y las superestructuras culturales.', x: 1560, y: 240 },

  // ── Módulo 4 — Fila 2 ────────────────────────────────────────────────────────
  { id: 'locke',          label: 'Locke',           type: 'author',  parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El estado de naturaleza es de paz y cooperación. El contrato social protege los derechos naturales: vida, libertad y propiedad. Influencia decisiva en el liberalismo y el constitucionalismo moderno.', x: 1240, y: 400 },
  { id: 'alienacion',     label: 'Alienación',      type: 'concept', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'Concepto central de Marx: bajo el capitalismo el trabajador se vuelve ajeno (alienado) respecto a su trabajo, al producto que crea, a otros trabajadores y a su propia esencia humana.', x: 1400, y: 400 },
  { id: 'contrato-social', label: 'Contrato Social', type: 'concept', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'Teoría que explica el origen y legitimidad del Estado como un acuerdo entre individuos para salir del estado de naturaleza y garantizar derechos. Debatida por Hobbes, Locke y Rousseau.', x: 1560, y: 400 },

  // ── Módulo 5 — Fila 1 ────────────────────────────────────────────────────────
  { id: 'kant',        label: 'Kant',        type: 'author', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Ética deontológica. Imperativo categórico: "Actúa solo según aquella máxima que puedas querer que sea ley universal." El deber moral es independiente de las consecuencias y de los deseos.', x: 1640, y: 240 },
  { id: 'aristoteles', label: 'Aristóteles', type: 'author', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Ética teleológica: el fin último del ser humano es la eudaimonía (felicidad/florecimiento). Define al hombre como "animal político" (zōon politikon). La virtud como término medio.', x: 1800, y: 240 },
  { id: 'platon',      label: 'Platón',      type: 'author', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Intelectualismo ético: el conocimiento del bien lleva necesariamente a obrar bien. La virtud es conocimiento; el mal es ignorancia. El Estado ideal debe ser gobernado por filósofos-reyes.', x: 1960, y: 240 },

  // ── Módulo 5 — Fila 2 ────────────────────────────────────────────────────────
  { id: 'eudaimonia',     label: 'Eudaimonía',           type: 'concept', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Concepto aristotélico: "florecimiento" o "felicidad plena". Es el bien supremo y fin último de la vida humana. Se alcanza ejerciendo la virtud (areté) conforme a la razón a lo largo de una vida completa.', x: 1640, y: 400 },
  { id: 'imperativo-cat', label: 'Imperativo Categórico', type: 'concept', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Principio moral de Kant: actuar solo según la máxima que podría convertirse en ley universal. Segunda formulación: tratar a las personas siempre como fines en sí mismas, nunca solo como medios.', x: 1800, y: 400 },
  { id: 'virtud',         label: 'La Virtud (Areté)',     type: 'concept', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Para Aristóteles: término medio entre dos extremos viciosos (ej: valor = medio entre cobardía y temeridad). Para Platón: conocimiento del bien. Para los estoicos: el único bien verdadero e incondicional.', x: 1960, y: 400 },
]

export const FILOSOFIA_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía módulo → hijos (Fila 1) ────────────────────────────────────────
  { id: 'e-m1-soc',  source: 'mod-1', target: 'socrates',         type: 'hierarchy' },
  { id: 'e-m1-ml',   source: 'mod-1', target: 'mythos-logos',     type: 'hierarchy' },
  { id: 'e-m1-pol',  source: 'mod-1', target: 'polis-griega',     type: 'hierarchy' },
  { id: 'e-m2-ed',   source: 'mod-2', target: 'episteme-doxa',    type: 'hierarchy' },
  { id: 'e-m2-heg',  source: 'mod-2', target: 'hegel',            type: 'hierarchy' },
  { id: 'e-m2-her',  source: 'mod-2', target: 'hermeneutica',     type: 'hierarchy' },
  { id: 'e-m3-aut',  source: 'mod-3', target: 'autoconocimiento', type: 'hierarchy' },
  { id: 'e-m3-ilu',  source: 'mod-3', target: 'ilustracion',      type: 'hierarchy' },
  { id: 'e-m3-sar',  source: 'mod-3', target: 'sartre',           type: 'hierarchy' },
  { id: 'e-m4-hob',  source: 'mod-4', target: 'hobbes',           type: 'hierarchy' },
  { id: 'e-m4-rou',  source: 'mod-4', target: 'rousseau',         type: 'hierarchy' },
  { id: 'e-m4-mar',  source: 'mod-4', target: 'marx',             type: 'hierarchy' },
  { id: 'e-m5-kan',  source: 'mod-5', target: 'kant',             type: 'hierarchy' },
  { id: 'e-m5-ari',  source: 'mod-5', target: 'aristoteles',      type: 'hierarchy' },
  { id: 'e-m5-pla',  source: 'mod-5', target: 'platon',           type: 'hierarchy' },

  // ── Jerarquía módulo → hijos (Fila 2) ────────────────────────────────────────
  { id: 'e-m1-tal',  source: 'mod-1', target: 'tales',            type: 'hierarchy' },
  { id: 'e-m1-pre',  source: 'mod-1', target: 'presocraticos',    type: 'hierarchy' },
  { id: 'e-m1-met',  source: 'mod-1', target: 'metodo-socratico', type: 'hierarchy' },
  { id: 'e-m2-rac',  source: 'mod-2', target: 'racionalismo',     type: 'hierarchy' },
  { id: 'e-m2-emp',  source: 'mod-2', target: 'empirismo',        type: 'hierarchy' },
  { id: 'e-m2-des',  source: 'mod-2', target: 'descartes',        type: 'hierarchy' },
  { id: 'e-m3-hum',  source: 'mod-3', target: 'humanismo',        type: 'hierarchy' },
  { id: 'e-m3-fre',  source: 'mod-3', target: 'freud',            type: 'hierarchy' },
  { id: 'e-m3-exi',  source: 'mod-3', target: 'existencialismo',  type: 'hierarchy' },
  { id: 'e-m4-loc',  source: 'mod-4', target: 'locke',            type: 'hierarchy' },
  { id: 'e-m4-ali',  source: 'mod-4', target: 'alienacion',       type: 'hierarchy' },
  { id: 'e-m4-con',  source: 'mod-4', target: 'contrato-social',  type: 'hierarchy' },
  { id: 'e-m5-eud',  source: 'mod-5', target: 'eudaimonia',       type: 'hierarchy' },
  { id: 'e-m5-imp',  source: 'mod-5', target: 'imperativo-cat',   type: 'hierarchy' },
  { id: 'e-m5-vir',  source: 'mod-5', target: 'virtud',           type: 'hierarchy' },

  // ── Cross-module: entre autores ───────────────────────────────────────────────
  { id: 'cx-soc-pla',    source: 'socrates',    target: 'platon',           type: 'cross' }, // Sócrates maestro de Platón
  { id: 'cx-pla-ari',    source: 'platon',      target: 'aristoteles',      type: 'cross' }, // Platón maestro de Aristóteles
  { id: 'cx-heg-mar',    source: 'hegel',       target: 'marx',             type: 'cross' }, // Marx invierte la dialéctica hegeliana
  { id: 'cx-loc-rou',    source: 'locke',       target: 'rousseau',         type: 'cross' }, // influencia contractualista
  { id: 'cx-hob-loc',    source: 'hobbes',      target: 'locke',            type: 'cross' }, // debate sobre estado de naturaleza
  { id: 'cx-ilu-kan',    source: 'ilustracion', target: 'kant',             type: 'cross' }, // Kant culmina la Ilustración
  { id: 'cx-fre-sar',    source: 'freud',       target: 'sartre',           type: 'cross' }, // debate inconsciente vs libertad radical

  // ── Cross-module: autor ↔ concepto ────────────────────────────────────────────
  { id: 'cx-tal-pre',    source: 'tales',            target: 'presocraticos',    type: 'cross' }, // Tales inaugura los presocráticos
  { id: 'cx-pre-ml',     source: 'presocraticos',    target: 'mythos-logos',     type: 'cross' }, // presocráticos inauguran el paso mito→logos
  { id: 'cx-soc-may',    source: 'socrates',         target: 'metodo-socratico', type: 'cross' }, // Sócrates crea la mayéutica
  { id: 'cx-her-soc',    source: 'hermeneutica',     target: 'socrates',         type: 'cross' }, // el diálogo socrático como hermenéutica
  { id: 'cx-des-rac',    source: 'descartes',        target: 'racionalismo',     type: 'cross' }, // Descartes funda el racionalismo
  { id: 'cx-rac-emp',    source: 'racionalismo',     target: 'empirismo',        type: 'cross' }, // oposición epistemológica central
  { id: 'cx-pla-epi',    source: 'platon',           target: 'episteme-doxa',    type: 'cross' }, // Platón distingue episteme de doxa
  { id: 'cx-ari-auto',   source: 'aristoteles',      target: 'autoconocimiento', type: 'cross' }, // "animal racional y político"
  { id: 'cx-ilu-hum',    source: 'ilustracion',      target: 'humanismo',        type: 'cross' }, // Ilustración amplía el humanismo renacentista
  { id: 'cx-sar-exi',    source: 'sartre',           target: 'existencialismo',  type: 'cross' }, // Sartre es la figura central del existencialismo
  { id: 'cx-mar-ali',    source: 'marx',             target: 'alienacion',       type: 'cross' }, // Marx elabora el concepto de alienación
  { id: 'cx-con-hob',    source: 'contrato-social',  target: 'hobbes',           type: 'cross' }, // Hobbes formula el contrato social
  { id: 'cx-con-rou',    source: 'contrato-social',  target: 'rousseau',         type: 'cross' }, // Rousseau reinterpreta el contrato
  { id: 'cx-ari-eud',    source: 'aristoteles',      target: 'eudaimonia',       type: 'cross' }, // Aristóteles define la eudaimonía
  { id: 'cx-kan-imp',    source: 'kant',             target: 'imperativo-cat',   type: 'cross' }, // Kant formula el imperativo categórico
  { id: 'cx-vir-ari',    source: 'virtud',           target: 'aristoteles',      type: 'cross' }, // areté como término medio
  { id: 'cx-vir-pla',    source: 'virtud',           target: 'platon',           type: 'cross' }, // virtud como conocimiento
]
