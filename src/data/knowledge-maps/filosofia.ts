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
  // ── Módulos
  { id: 'mod-1', label: 'Amor por la Sabiduría', type: 'module', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'El origen de la filosofía en la polis griega. La transición del mito al logos y el amor por el saber.', x: 175, y: 30 },
  { id: 'mod-2', label: 'Epistemología', type: 'module', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'El estudio del conocimiento: sus fundamentos, límites y formas de validación. Episteme vs Doxa.', x: 525, y: 30 },
  { id: 'mod-3', label: 'Antropología Filosófica', type: 'module', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'La pregunta por el ser humano: autoconocimiento, naturaleza humana y concepciones históricas del hombre.', x: 875, y: 30 },
  { id: 'mod-4', label: 'Filosofía Social y Política', type: 'module', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El fundamento del orden social y político. El contrato social, la legitimidad del poder y la alienación.', x: 1225, y: 30 },
  { id: 'mod-5', label: 'Ética', type: 'module', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Teorías sobre la moral, el bien y el deber. Desde la eudaimonía aristotélica hasta el imperativo categórico.', x: 1575, y: 30 },

  // ── Módulo 1
  { id: 'socrates', label: 'Sócrates', type: 'author', parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'Filósofo ateniense. Creador de la ironía socrática: fingir ignorancia para que el interlocutor descubra sus contradicciones. "Solo sé que no sé nada."', x: 90, y: 260 },
  { id: 'mythos-logos', label: 'Mythos vs Lógos', type: 'concept', parent: 'mod-1', module_id: 'a5e7f9b0-95bc-4c48-9cf6-94d31cc32cf4', description: 'La transición del pensamiento mítico (mythos) al pensamiento racional (lógos) marca el nacimiento de la filosofía en la Grecia antigua.', x: 265, y: 260 },

  // ── Módulo 2
  { id: 'episteme-doxa', label: 'Episteme vs Doxa', type: 'concept', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Episteme: conocimiento verdadero y justificado. Doxa: mera opinión o creencia sin fundamento riguroso. Distinción central de la filosofía griega.', x: 395, y: 260 },
  { id: 'hegel', label: 'Hegel', type: 'author', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Filósofo alemán idealista. Su dialéctica (tesis → antítesis → síntesis) postula que el conocimiento avanza por contradicciones que se superan.', x: 530, y: 260 },
  { id: 'hermeneutica', label: 'Hermenéutica', type: 'concept', parent: 'mod-2', module_id: '77e9e311-e128-42a2-a497-f49335a1750f', description: 'Arte de la interpretación de textos y sentidos. Plantea que todo conocimiento implica una pre-comprensión del intérprete.', x: 665, y: 260 },

  // ── Módulo 3
  { id: 'autoconocimiento', label: 'Autoconocimiento', type: 'concept', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: '"Conócete a ti mismo" (oráculo de Delfos): principio que orienta la Antropología Filosófica. La pregunta por el ser del hombre como punto de partida.', x: 745, y: 260 },
  { id: 'ilustracion', label: 'Ilustración', type: 'concept', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Movimiento intelectual del siglo XVIII que pone a la Razón como centro del ser humano y motor del progreso histórico.', x: 880, y: 260 },
  { id: 'sartre', label: 'Sartre', type: 'author', parent: 'mod-3', module_id: 'a09babe4-0fce-4e44-8510-3ec33ceda9f8', description: 'Filósofo existencialista. "La existencia precede a la esencia": el ser humano se define por sus actos, no por una naturaleza fija previa.', x: 1015, y: 260 },

  // ── Módulo 4
  { id: 'hobbes', label: 'Hobbes', type: 'author', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El estado de naturaleza es una "guerra de todos contra todos". El contrato social crea el Leviatán (Estado absoluto) para garantizar la paz.', x: 1105, y: 260 },
  { id: 'rousseau', label: 'Rousseau', type: 'author', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'El hombre es bueno por naturaleza; la sociedad lo corrompe. El contrato social debe expresar la voluntad general del pueblo.', x: 1240, y: 260 },
  { id: 'marx', label: 'Marx', type: 'author', parent: 'mod-4', module_id: 'd1146168-7a21-42b8-b060-3c2d59c70c3f', description: 'Analiza la alienación del trabajador bajo el capitalismo: el obrero se vuelve ajeno a su trabajo, al producto y a sí mismo.', x: 1375, y: 260 },

  // ── Módulo 5
  { id: 'kant', label: 'Kant', type: 'author', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Ética deontológica. Imperativo categórico: "Actúa solo según aquella máxima que puedas querer que sea ley universal." El deber por sobre las consecuencias.', x: 1475, y: 260 },
  { id: 'aristoteles', label: 'Aristóteles', type: 'author', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Ética teleológica: el fin último del ser humano es la eudaimonía (felicidad/florecimiento). Define al hombre como "animal político".', x: 1610, y: 260 },
  { id: 'platon', label: 'Platón', type: 'author', parent: 'mod-5', module_id: 'b704a749-ef66-47ff-bae8-e1fb33ea0f8d', description: 'Intelectualismo ético: el conocimiento del bien lleva necesariamente a obrar bien. La virtud es conocimiento; el mal es ignorancia.', x: 1745, y: 260 },
]

export const FILOSOFIA_EDGES: KnowledgeEdge[] = [
  // Hierarchy
  { id: 'e-m1-soc',  source: 'mod-1', target: 'socrates',         type: 'hierarchy' },
  { id: 'e-m1-ml',   source: 'mod-1', target: 'mythos-logos',     type: 'hierarchy' },
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

  // Cross-module
  { id: 'cx-soc-pla',  source: 'socrates',       target: 'platon',           type: 'cross' },
  { id: 'cx-heg-mar',  source: 'hegel',           target: 'marx',             type: 'cross' },
  { id: 'cx-her-soc',  source: 'hermeneutica',    target: 'socrates',         type: 'cross' },
  { id: 'cx-ilu-kan',  source: 'ilustracion',     target: 'kant',             type: 'cross' },
  { id: 'cx-hob-rou',  source: 'hobbes',           target: 'rousseau',        type: 'cross' },
  { id: 'cx-ari-auto', source: 'aristoteles',     target: 'autoconocimiento', type: 'cross' },
]
