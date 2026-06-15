import os, sys, json, requests
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    pass

sys.stdout.reconfigure(encoding="utf-8")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://dtbouycelkjgyddpftir.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
SUBJECT_ID = "5bb9f6fe-ad29-44e8-8a6e-6c546c6ae392"

# Module IDs reales de Supabase (order_indices: 1,2,3,4,6,7,8,9)
MODULE_IDS = {
    1: "c832a5d6-f50b-4a0f-9fc3-cb61aead20ce",
    2: "c6b070c4-3633-47c1-a38f-af26fcabb690",
    3: "c8e95abf-3af2-4611-9691-4be8099ec312",
    4: "141346d7-0a67-464f-b41f-5c13e9f77430",
    6: "9bb05f98-1e26-4e98-909c-b84ab727f03a",
    7: "f0d52c11-9285-46a5-b413-812589c0a75c",
    8: "94eac035-18ea-42e3-882d-490e3ee95605",
    9: "5ce23665-16cd-45a5-b972-f9dbc6b5e8ae",
}

# 5 preguntas por módulo × 8 módulos = 40 preguntas
# Basadas exclusivamente en el contenido de los módulos de Seminario
QUIZZES = [
    # ── Módulo 1 — Introducción: Lectura y Escritura ──────────────────────────
    {
        "module_order": 1,
        "question": "¿Cuál es el objetivo principal de la lectura global en el proceso de comprensión textual?",
        "options": [
            {"text": "Identificar el tema general y la estructura del texto antes de la lectura analítica", "is_correct": True},
            {"text": "Memorizar todos los detalles del texto desde la primera lectura", "is_correct": False},
            {"text": "Subrayar las palabras desconocidas para buscarlas en el diccionario", "is_correct": False},
            {"text": "Leer en voz alta para mejorar la pronunciación", "is_correct": False},
        ],
        "explanation": "La lectura global busca construir una comprensión panorámica del texto (tema, estructura, propósito) antes de profundizar en los detalles mediante la lectura analítica.",
        "difficulty": "easy",
    },
    {
        "module_order": 1,
        "question": "En el proceso de escritura, ¿qué etapa implica 'poner en texto' las ideas?",
        "options": [
            {"text": "La textualización o redacción del borrador", "is_correct": True},
            {"text": "La planificación del contenido y estructura", "is_correct": False},
            {"text": "La revisión y corrección del escrito", "is_correct": False},
            {"text": "La lectura crítica del material fuente", "is_correct": False},
        ],
        "explanation": "La 'puesta en texto' (textualización) es la segunda etapa del proceso de escritura: transforma las ideas planificadas en lenguaje escrito, produciendo un primer borrador.",
        "difficulty": "easy",
    },
    {
        "module_order": 1,
        "question": "¿Qué son los géneros discursivos según la perspectiva trabajada en el módulo?",
        "options": [
            {"text": "Tipos estables de enunciados que una esfera de actividad humana desarrolla para comunicarse", "is_correct": True},
            {"text": "Las reglas gramaticales que regulan la construcción de oraciones", "is_correct": False},
            {"text": "Los estilos literarios clasificados por el ámbito académico", "is_correct": False},
            {"text": "Las formas narrativas propias de la literatura clásica", "is_correct": False},
        ],
        "explanation": "Los géneros discursivos son formas estables de enunciados que cada esfera de actividad humana (académica, laboral, periodística, etc.) genera para sus propósitos comunicativos específicos.",
        "difficulty": "medium",
    },
    {
        "module_order": 1,
        "question": "¿Cuál de las siguientes estrategias corresponde a la etapa de 'prelectura'?",
        "options": [
            {"text": "Observar el título, subtítulos, índice y paratextos para anticipar el contenido", "is_correct": True},
            {"text": "Tomar notas detalladas mientras se lee el texto", "is_correct": False},
            {"text": "Escribir un resumen con las ideas principales al terminar de leer", "is_correct": False},
            {"text": "Releer los párrafos difíciles para comprender mejor el texto", "is_correct": False},
        ],
        "explanation": "La prelectura activa los conocimientos previos explorando los paratextos (título, índice, ilustraciones, epígrafe) para anticipar el contenido antes de comenzar la lectura.",
        "difficulty": "easy",
    },
    {
        "module_order": 1,
        "question": "¿Qué significa hacer anotaciones marginales durante la lectura?",
        "options": [
            {"text": "Escribir comentarios, preguntas y resúmenes al margen del texto para dialogar con él", "is_correct": True},
            {"text": "Copiar textualmente las ideas principales en un cuaderno aparte", "is_correct": False},
            {"text": "Subrayar todas las palabras desconocidas del texto", "is_correct": False},
            {"text": "Numerar los párrafos para facilitar la referencia posterior", "is_correct": False},
        ],
        "explanation": "Las anotaciones marginales son una técnica de lectura activa: el lector escribe comentarios, preguntas y síntesis al margen, construyendo un diálogo con el autor del texto.",
        "difficulty": "easy",
    },

    # ── Módulo 2 — El Texto: Coherencia y Cohesión ───────────────────────────
    {
        "module_order": 2,
        "question": "¿Cuál es la diferencia entre coherencia global y coherencia local en un texto?",
        "options": [
            {"text": "La global refiere al sentido unitario del texto completo; la local a la relación lógica entre oraciones adyacentes", "is_correct": True},
            {"text": "La global refiere al uso correcto de conectores; la local a la ortografía del texto", "is_correct": False},
            {"text": "La global corresponde a textos formales; la local a textos informales", "is_correct": False},
            {"text": "La global es la estructura del párrafo; la local es la estructura del texto completo", "is_correct": False},
        ],
        "explanation": "La coherencia global asegura que todo el texto gire en torno a un mismo tema e intención. La coherencia local garantiza que las oraciones y párrafos se encadenen con sentido lógico entre sí.",
        "difficulty": "medium",
    },
    {
        "module_order": 2,
        "question": "¿Qué mecanismo de cohesión consiste en utilizar un pronombre para referirse a un elemento ya mencionado en el texto?",
        "options": [
            {"text": "Referencia anafórica", "is_correct": True},
            {"text": "Sustitución léxica", "is_correct": False},
            {"text": "Elipsis", "is_correct": False},
            {"text": "Conectivo aditivo", "is_correct": False},
        ],
        "explanation": "La referencia anafórica usa elementos (pronombres, determinantes) que remiten a algo dicho previamente en el texto. Ejemplo: 'El alumno llegó tarde. Él no encontró el aula.'",
        "difficulty": "medium",
    },
    {
        "module_order": 2,
        "question": "Según Cassany, ¿qué es el contexto en la producción e interpretación de textos?",
        "options": [
            {"text": "El conjunto de factores situacionales (quién, dónde, cuándo, para qué) que condicionan el significado del texto", "is_correct": True},
            {"text": "El diccionario de términos técnicos utilizado en el texto", "is_correct": False},
            {"text": "La información explícita que se encuentra al inicio de cada párrafo", "is_correct": False},
            {"text": "Las notas al pie de página que aclaran el contenido principal", "is_correct": False},
        ],
        "explanation": "Para Cassany, el contexto es el conjunto de elementos situacionales (emisor, receptor, lugar, momento, propósito) que enmarcan el texto y condicionan su producción e interpretación.",
        "difficulty": "medium",
    },
    {
        "module_order": 2,
        "question": "¿Qué es la elipsis como mecanismo de cohesión textual?",
        "options": [
            {"text": "La omisión de un elemento que puede recuperarse por el contexto", "is_correct": True},
            {"text": "La repetición de un término clave para enfatizar su importancia", "is_correct": False},
            {"text": "El uso de sinónimos para evitar repeticiones innecesarias", "is_correct": False},
            {"text": "La conexión entre oraciones mediante conjunciones adversativas", "is_correct": False},
        ],
        "explanation": "La elipsis es la omisión de un elemento ya conocido para evitar repeticiones. Ejemplo: 'Pedro estudia Filosofía y María [estudia] Contabilidad.' El verbo se omite porque se sobreentiende.",
        "difficulty": "medium",
    },
    {
        "module_order": 2,
        "question": "¿Cuál de estas características es propia del paratexto?",
        "options": [
            {"text": "Orienta y predispone al lector antes o durante la lectura (títulos, índices, epígrafes, ilustraciones)", "is_correct": True},
            {"text": "Contiene las ideas principales del texto en forma de resumen", "is_correct": False},
            {"text": "Presenta la bibliografía citada al final del texto", "is_correct": False},
            {"text": "Es el texto que aparece después de la conclusión principal", "is_correct": False},
        ],
        "explanation": "El paratexto son todos los elementos que rodean al texto principal (título, subtítulos, índice, epígrafe, ilustraciones, notas) y que orientan la lectura condicionando la comprensión.",
        "difficulty": "easy",
    },

    # ── Módulo 3 — El Texto II: Adecuación y Registros ───────────────────────
    {
        "module_order": 3,
        "question": "¿Cuál es la diferencia entre enunciado y texto según los conceptos trabajados en el módulo?",
        "options": [
            {"text": "El enunciado es la unidad mínima de sentido emitida en una situación; el texto es la unidad comunicativa completa con coherencia y cohesión", "is_correct": True},
            {"text": "El enunciado es siempre oral; el texto es siempre escrito", "is_correct": False},
            {"text": "El enunciado es una oración; el texto es un conjunto de párrafos", "is_correct": False},
            {"text": "El enunciado pertenece al campo de la lingüística; el texto a la retórica", "is_correct": False},
        ],
        "explanation": "El enunciado es la unidad mínima de comunicación con sentido (puede ser una sola palabra o una oración). El texto es la unidad comunicativa mayor, estructurada con coherencia, cohesión y adecuación.",
        "difficulty": "medium",
    },
    {
        "module_order": 3,
        "question": "¿Qué implica la adecuación de un texto?",
        "options": [
            {"text": "Ajustar el lenguaje y contenido a la situación comunicativa: emisor, receptor, propósito y canal", "is_correct": True},
            {"text": "Usar correctamente las reglas ortográficas y gramaticales del idioma", "is_correct": False},
            {"text": "Seguir el formato establecido por las normas APA o MLA", "is_correct": False},
            {"text": "Redactar siempre con vocabulario formal y técnico independientemente del receptor", "is_correct": False},
        ],
        "explanation": "La adecuación refiere a la capacidad del texto de ajustarse a su situación comunicativa: quién habla, a quién, en qué contexto, con qué propósito. Un texto adecuado elige el registro correcto.",
        "difficulty": "medium",
    },
    {
        "module_order": 3,
        "question": "¿Cuál es la diferencia entre un registro formal y uno informal?",
        "options": [
            {"text": "El formal usa vocabulario preciso, estructura planificada y distancia entre emisor y receptor; el informal es espontáneo y con mayor proximidad", "is_correct": True},
            {"text": "El formal es el lenguaje escrito; el informal es exclusivamente oral", "is_correct": False},
            {"text": "El formal incluye jerga y coloquialismos; el informal evita tecnicismos", "is_correct": False},
            {"text": "El formal se usa solo en textos literarios; el informal en textos científicos", "is_correct": False},
        ],
        "explanation": "El registro formal se caracteriza por vocabulario preciso, estructuras planificadas y distancia comunicativa. El informal es espontáneo, con mayor cercanía y menos control lingüístico. La elección depende de la situación.",
        "difficulty": "easy",
    },
    {
        "module_order": 3,
        "question": "¿Qué es la 'conciencia retórica' en el proceso de escritura?",
        "options": [
            {"text": "La capacidad del escritor de adaptar el texto a su propósito, audiencia y contexto comunicativo específico", "is_correct": True},
            {"text": "El conocimiento de las figuras retóricas clásicas como la metáfora y la metonimia", "is_correct": False},
            {"text": "La habilidad para usar el lenguaje ornamentado propio de la literatura", "is_correct": False},
            {"text": "La técnica de argumentación que se aprende en la práctica forense", "is_correct": False},
        ],
        "explanation": "La conciencia retórica es la habilidad del escritor para considerar, al producir un texto, el propósito comunicativo, la audiencia destinataria y el contexto en que circulará el texto.",
        "difficulty": "medium",
    },
    {
        "module_order": 3,
        "question": "¿Cuál es la diferencia entre un texto masivo (divulgativo) y un texto especializado?",
        "options": [
            {"text": "El masivo se dirige a un público amplio usando lenguaje accesible; el especializado presupone conocimientos previos del campo", "is_correct": True},
            {"text": "El masivo siempre es más extenso que el especializado", "is_correct": False},
            {"text": "El masivo se publica en libros; el especializado en redes sociales", "is_correct": False},
            {"text": "El masivo carece de rigor científico; el especializado es siempre objetivo", "is_correct": False},
        ],
        "explanation": "El texto masivo (o divulgativo) adapta el conocimiento para un público general, usando lenguaje más accesible. El especializado asume que el receptor comparte un marco de conocimiento del campo disciplinar.",
        "difficulty": "easy",
    },

    # ── Módulo 4 — Géneros Discursivos y Secuencias ───────────────────────────
    {
        "module_order": 4,
        "question": "Según Jean-Michel Adam (1992), ¿cuántas secuencias textuales básicas existen?",
        "options": [
            {"text": "Seis: instructiva, dialogal, descriptiva, narrativa, explicativa y argumentativa", "is_correct": True},
            {"text": "Tres: narrativa, descriptiva y argumentativa", "is_correct": False},
            {"text": "Cuatro: expositiva, argumentativa, narrativa y descriptiva", "is_correct": False},
            {"text": "Cinco: narrativa, descriptiva, argumentativa, instructiva y dialogal", "is_correct": False},
        ],
        "explanation": "Adam (1992) propone seis prototipos de secuencias textuales: instructiva, dialogal, descriptiva, narrativa, explicativa y argumentativa. Los textos reales suelen combinar varias secuencias.",
        "difficulty": "medium",
    },
    {
        "module_order": 4,
        "question": "¿Cuáles son los rasgos internos de un género discursivo?",
        "options": [
            {"text": "Tema, estilo y composición (secuencia textual predominante)", "is_correct": True},
            {"text": "Emisor, fuente, destinatario y canal de circulación", "is_correct": False},
            {"text": "Título, extensión y vocabulario técnico utilizado", "is_correct": False},
            {"text": "Propósito, formato y cantidad de referencias bibliográficas", "is_correct": False},
        ],
        "explanation": "Los rasgos internos de un género (según la tipología trabajada) son el tema que trata, el estilo lingüístico que usa y la composición o secuencia textual que lo estructura.",
        "difficulty": "medium",
    },
    {
        "module_order": 4,
        "question": "¿Cuál es la función principal de la secuencia descriptiva?",
        "options": [
            {"text": "Representar las propiedades o características de un objeto, persona, lugar o estado", "is_correct": True},
            {"text": "Narrar una serie de eventos ordenados cronológicamente", "is_correct": False},
            {"text": "Convencer al lector de adoptar una posición frente a un tema", "is_correct": False},
            {"text": "Explicar cómo realizar una tarea paso a paso", "is_correct": False},
        ],
        "explanation": "La secuencia descriptiva representa el aspecto de objetos, personas, ambientes o estados en un momento dado. No implica acciones sino caracterización: enumera propiedades y atributos.",
        "difficulty": "easy",
    },
    {
        "module_order": 4,
        "question": "¿Qué son los 'rasgos externos' de un género discursivo?",
        "options": [
            {"text": "Las características situacionales: quién lo emite, quién lo recibe, por qué canal y con qué fuente", "is_correct": True},
            {"text": "La tipografía, el diseño gráfico y la extensión del texto", "is_correct": False},
            {"text": "Los conectores y marcadores discursivos utilizados en el texto", "is_correct": False},
            {"text": "El vocabulario especializado que identifica el campo disciplinar", "is_correct": False},
        ],
        "explanation": "Los rasgos externos de un género son los elementos de la situación comunicativa: quién es el emisor, cuál es su fuente de autoridad, quién es el destinatario previsto y qué canal usa para circular.",
        "difficulty": "medium",
    },
    {
        "module_order": 4,
        "question": "¿Cuál de los siguientes es un género académico típico del ámbito universitario?",
        "options": [
            {"text": "El parcial, el informe de lectura y la ponencia", "is_correct": True},
            {"text": "La crónica periodística, el editorial y la columna de opinión", "is_correct": False},
            {"text": "La receta, el manual de instrucciones y el contrato", "is_correct": False},
            {"text": "La novela, el cuento y el poema lírico", "is_correct": False},
        ],
        "explanation": "Los géneros académicos son los que circulan en la institución educativa: parciales, informes de lectura, monografías, ponencias, reseñas académicas, etc. Son géneros propios de la esfera académica.",
        "difficulty": "easy",
    },

    # ── Módulo 6 — La Lectura ─────────────────────────────────────────────────
    {
        "module_order": 6,
        "question": "Según Cassany (2006), ¿qué significa 'leer entre líneas'?",
        "options": [
            {"text": "Inferir lo que el texto sugiere pero no dice explícitamente: presuposiciones, ironías y sobreentendidos", "is_correct": True},
            {"text": "Leer el texto en voz baja para no distraer a otros lectores", "is_correct": False},
            {"text": "Identificar las ideas principales de cada párrafo", "is_correct": False},
            {"text": "Buscar en el diccionario el significado de las palabras desconocidas", "is_correct": False},
        ],
        "explanation": "Para Cassany (2006), 'leer entre líneas' implica recuperar la información implícita del texto: lo que se sobreentiende, las presuposiciones, las ironías y los sobreentendidos que el autor no dice directamente.",
        "difficulty": "medium",
    },
    {
        "module_order": 6,
        "question": "¿Qué implica 'leer detrás de las líneas' según Cassany?",
        "options": [
            {"text": "Adoptar una postura crítica: analizar la ideología, el punto de vista y los intereses del autor", "is_correct": True},
            {"text": "Leer los paratextos (título, índice, notas al pie) antes del texto principal", "is_correct": False},
            {"text": "Releer el texto varias veces para asegurar la comprensión total", "is_correct": False},
            {"text": "Comparar distintas versiones de un mismo texto", "is_correct": False},
        ],
        "explanation": "'Leer detrás de las líneas' es el nivel más profundo de lectura para Cassany: preguntarse quién escribe, desde qué posición ideológica, qué intereses tiene y qué deja de decir.",
        "difficulty": "medium",
    },
    {
        "module_order": 6,
        "question": "¿Qué plantea van Dijk sobre el procesamiento de textos?",
        "options": [
            {"text": "Los lectores construyen representaciones mentales del texto en distintos niveles: microestructura, macroestructura y superestructura", "is_correct": True},
            {"text": "La comprensión lectora depende exclusivamente del conocimiento previo del vocabulario", "is_correct": False},
            {"text": "La lectura es un proceso lineal que va de la primera a la última palabra", "is_correct": False},
            {"text": "Los textos escritos no tienen estructura predecible para el lector", "is_correct": False},
        ],
        "explanation": "van Dijk postula que la comprensión textual implica procesar el texto en tres niveles: microestructura (oraciones), macroestructura (tema global) y superestructura (esquema organizativo del género).",
        "difficulty": "hard",
    },
    {
        "module_order": 6,
        "question": "¿Cuál es la secuencia correcta de las etapas de lectura trabajadas en el módulo?",
        "options": [
            {"text": "Prelectura → lectura global → lectura analítica → poslectura", "is_correct": True},
            {"text": "Lectura analítica → resumen → poslectura → prelectura", "is_correct": False},
            {"text": "Lectura global → subrayado → anotaciones → revisión", "is_correct": False},
            {"text": "Lectura rápida → lectura lenta → poslectura → relectura", "is_correct": False},
        ],
        "explanation": "Las etapas trabajadas en el módulo son: prelectura (anticipación), lectura global (comprensión general), lectura analítica (profundización) y poslectura (integración y producción).",
        "difficulty": "easy",
    },
    {
        "module_order": 6,
        "question": "¿Qué son los 'hábitos de lectura crítica' según la perspectiva de Cassany?",
        "options": [
            {"text": "Estrategias para cuestionar la perspectiva del autor, identificar su posición y evaluar los argumentos desde una mirada reflexiva", "is_correct": True},
            {"text": "Técnicas de velocidad lectora para leer más textos en menos tiempo", "is_correct": False},
            {"text": "Rutinas para tomar apuntes durante la lectura", "is_correct": False},
            {"text": "Métodos para memorizar los contenidos de los textos académicos", "is_correct": False},
        ],
        "explanation": "Los hábitos de lectura crítica (Cassany) incluyen: preguntarse quién escribe y por qué, identificar el punto de vista, detectar omisiones, evaluar los argumentos y confrontar el texto con otras fuentes.",
        "difficulty": "medium",
    },

    # ── Módulo 7 — La Escritura ───────────────────────────────────────────────
    {
        "module_order": 7,
        "question": "Según Cassany (1999), ¿cuántas dimensiones tiene la competencia escritora?",
        "options": [
            {"text": "Cuatro: gramática, tipo de texto, proceso de composición y contenido", "is_correct": True},
            {"text": "Dos: gramática y vocabulario", "is_correct": False},
            {"text": "Tres: planificación, textualización y revisión", "is_correct": False},
            {"text": "Cinco: ortografía, sintaxis, cohesión, coherencia y adecuación", "is_correct": False},
        ],
        "explanation": "Cassany (1999) describe cuatro dimensiones de la escritura: gramática (corrección lingüística), tipo de texto (conocimiento del género), proceso de composición (planificación, textualización, revisión) y contenido (dominio del tema).",
        "difficulty": "medium",
    },
    {
        "module_order": 7,
        "question": "¿Cuál es la relación entre lenguaje y pensamiento según Vygotsky, aplicada a la escritura?",
        "options": [
            {"text": "El lenguaje no solo expresa el pensamiento sino que lo construye: escribir es pensar y desarrollar el conocimiento", "is_correct": True},
            {"text": "El pensamiento precede siempre al lenguaje y la escritura solo lo registra", "is_correct": False},
            {"text": "El lenguaje y el pensamiento son procesos completamente independientes", "is_correct": False},
            {"text": "La escritura interfiere con el pensamiento creativo al imponer estructuras rígidas", "is_correct": False},
        ],
        "explanation": "Para Vygotsky, lenguaje y pensamiento son inseparables: el lenguaje estructura el pensamiento y el pensamiento se desarrolla a través del lenguaje. Escribir es, en este sentido, un acto de construcción de conocimiento.",
        "difficulty": "medium",
    },
    {
        "module_order": 7,
        "question": "¿Qué ocurre durante la etapa de planificación en el proceso de escritura?",
        "options": [
            {"text": "Se generan ideas, se selecciona la información relevante y se organiza la estructura del texto antes de redactar", "is_correct": True},
            {"text": "Se corrigen los errores ortográficos y gramaticales del borrador", "is_correct": False},
            {"text": "Se publica el texto y se evalúa la recepción del lector", "is_correct": False},
            {"text": "Se redacta el texto siguiendo la estructura párrafo por párrafo", "is_correct": False},
        ],
        "explanation": "En la planificación se generan y organizan las ideas: qué decir, en qué orden, para quién y con qué propósito. Es la etapa previa a la textualización, fundamental para producir textos coherentes.",
        "difficulty": "easy",
    },
    {
        "module_order": 7,
        "question": "¿Qué caracteriza a la etapa de revisión en el proceso de escritura?",
        "options": [
            {"text": "Es iterativa: el escritor relee, evalúa y reformula el texto en múltiples niveles (frase, párrafo, estructura global)", "is_correct": True},
            {"text": "Se realiza una sola vez al finalizar el borrador para corregir errores tipográficos", "is_correct": False},
            {"text": "Solo un corrector externo puede realizar esta etapa con objetividad", "is_correct": False},
            {"text": "Es la etapa más breve del proceso y se limita a la ortografía", "is_correct": False},
        ],
        "explanation": "La revisión es un proceso recursivo y multinivel: el escritor vuelve al texto para evaluar si dice lo que quería decir, si la estructura es la adecuada y si el lenguaje es correcto, modificando lo necesario.",
        "difficulty": "medium",
    },
    {
        "module_order": 7,
        "question": "¿Qué implica el 'proceso de composición' como dimensión de la escritura según Cassany?",
        "options": [
            {"text": "El conjunto de estrategias cognitivas que el escritor usa para planificar, textualizar y revisar el texto", "is_correct": True},
            {"text": "La elección del tipo de letra y formato visual del texto", "is_correct": False},
            {"text": "El dominio de los contenidos del campo disciplinar del que trata el texto", "is_correct": False},
            {"text": "El conocimiento de las convenciones ortográficas del idioma", "is_correct": False},
        ],
        "explanation": "El 'proceso de composición' (Cassany) es la dimensión que abarca las estrategias cognitivas del escritor: cómo planifica, cómo genera y organiza el texto, y cómo lo revisa y reformula.",
        "difficulty": "medium",
    },

    # ── Módulo 8 — Enunciación y Polifonía ───────────────────────────────────
    {
        "module_order": 8,
        "question": "¿Qué son los deícticos en el lenguaje?",
        "options": [
            {"text": "Expresiones que señalan elementos de la situación comunicativa: persona, lugar y tiempo del enunciado", "is_correct": True},
            {"text": "Palabras que expresan valoraciones positivas o negativas del emisor", "is_correct": False},
            {"text": "Conectores que indican relaciones lógicas entre proposiciones", "is_correct": False},
            {"text": "Términos técnicos propios del lenguaje académico", "is_correct": False},
        ],
        "explanation": "Los deícticos son expresiones que anclan el enunciado en la situación comunicativa: los pronombres de persona (yo/tú), los adverbios de lugar (aquí/allá) y los de tiempo (ahora/ayer).",
        "difficulty": "medium",
    },
    {
        "module_order": 8,
        "question": "¿Qué son los subjetivemas?",
        "options": [
            {"text": "Palabras que expresan la subjetividad del enunciador: valoraciones, emociones y puntos de vista", "is_correct": True},
            {"text": "Pronombres que reemplazan al sujeto gramatical para evitar repeticiones", "is_correct": False},
            {"text": "Estructuras sintácticas que indican la modalidad deóntica del enunciado", "is_correct": False},
            {"text": "Términos propios del registro informal y coloquial", "is_correct": False},
        ],
        "explanation": "Los subjetivemas son unidades léxicas o sintácticas que marcan la presencia del sujeto enunciador en el texto: adjetivos valorativos, sustantivos evaluativos, verbos de actitud, etc.",
        "difficulty": "medium",
    },
    {
        "module_order": 8,
        "question": "¿Qué son los modalizadores en el discurso?",
        "options": [
            {"text": "Expresiones que indican la actitud del enunciador hacia lo que dice: certeza, duda, obligación, posibilidad", "is_correct": True},
            {"text": "Conectores que unen oraciones dentro de un párrafo", "is_correct": False},
            {"text": "Palabras que modifican al sustantivo en una oración nominal", "is_correct": False},
            {"text": "Marcas tipográficas que señalan información secundaria", "is_correct": False},
        ],
        "explanation": "Los modalizadores expresan la postura epistémica o deóntica del enunciador: 'quizás', 'es posible que' (duda/posibilidad); 'es necesario que', 'debe' (obligación); 'sin duda', 'claramente' (certeza).",
        "difficulty": "medium",
    },
    {
        "module_order": 8,
        "question": "¿Cuál es la diferencia entre un enunciado marcado subjetivamente y uno no marcado?",
        "options": [
            {"text": "El marcado exhibe la postura del enunciador; el no marcado aparenta objetividad aunque siempre hay una perspectiva implícita", "is_correct": True},
            {"text": "El marcado tiene errores gramaticales; el no marcado cumple todas las reglas lingüísticas", "is_correct": False},
            {"text": "El marcado pertenece a textos literarios; el no marcado a textos científicos", "is_correct": False},
            {"text": "El marcado usa signos de puntuación expresivos; el no marcado no los usa", "is_correct": False},
        ],
        "explanation": "Un enunciado marcado exhibe explícitamente la posición del enunciador (subjetivemas, modalizadores). El no marcado construye un efecto de objetividad, aunque siempre hay una perspectiva enunciativa subyacente.",
        "difficulty": "hard",
    },
    {
        "module_order": 8,
        "question": "¿Qué es la polifonía en el discurso?",
        "options": [
            {"text": "La presencia de múltiples voces o perspectivas en un mismo texto: el enunciador incorpora otras voces (citas, referencias, ironías)", "is_correct": True},
            {"text": "El uso de varios idiomas dentro de un mismo texto académico", "is_correct": False},
            {"text": "La repetición de un mismo argumento expresado con distintas palabras", "is_correct": False},
            {"text": "El cambio de registro entre distintos párrafos del texto", "is_correct": False},
        ],
        "explanation": "La polifonía (concepto de Bajtín) refiere a la presencia de múltiples voces en el discurso. El enunciador incorpora otras voces a través de citas directas, indirectas, alusiones e ironías.",
        "difficulty": "medium",
    },

    # ── Módulo 9 — Géneros de Estudiantes ────────────────────────────────────
    {
        "module_order": 9,
        "question": "¿Cuáles son las características principales del apunte como género académico de estudiantes?",
        "options": [
            {"text": "Economía lingüística, síntesis de lo esencial y uso de marcas visuales (subrayados, símbolos, esquemas)", "is_correct": True},
            {"text": "Extensión máxima de una carilla y lenguaje técnico propio del campo", "is_correct": False},
            {"text": "Copia literal del texto original con algunos comentarios al margen", "is_correct": False},
            {"text": "Estructura de introducción, desarrollo y conclusión con bibliografía", "is_correct": False},
        ],
        "explanation": "El apunte es un género de estudiante que se caracteriza por la economía (sintetiza lo esencial), la síntesis (selecciona lo relevante) y las marcas visuales (subrayados, flechas, cuadros, íconos) que facilitan la memorización.",
        "difficulty": "easy",
    },
    {
        "module_order": 9,
        "question": "¿Cuál es la principal diferencia entre el resumen y el apunte como géneros académicos?",
        "options": [
            {"text": "El resumen es una reformulación del texto fuente con estructura coherente; el apunte prioriza la utilidad personal del estudiante en el momento del estudio", "is_correct": True},
            {"text": "El resumen es más extenso que el apunte y utiliza lenguaje técnico", "is_correct": False},
            {"text": "El apunte cita textualmente el texto original; el resumen lo parafrasea", "is_correct": False},
            {"text": "El resumen se entrega al docente; el apunte se usa solo para el examen oral", "is_correct": False},
        ],
        "explanation": "El resumen es una producción más formal que mantiene la progresión temática del texto fuente y puede ser leído por cualquier persona. El apunte es más personal, usa marcas visuales propias y está optimizado para el uso del autor.",
        "difficulty": "medium",
    },
    {
        "module_order": 9,
        "question": "¿Qué función cumplen las marcas visuales en un apunte?",
        "options": [
            {"text": "Organizar visualmente la información para facilitar la recuperación rápida durante el estudio y el repaso", "is_correct": True},
            {"text": "Demostrar al docente que el alumno leyó el texto completo", "is_correct": False},
            {"text": "Reemplazar el lenguaje escrito por imágenes para ahorrar tiempo", "is_correct": False},
            {"text": "Indicar el nivel de dificultad de cada sección del texto", "is_correct": False},
        ],
        "explanation": "Las marcas visuales en un apunte (subrayados, colores, flechas, cuadros, íconos) organizan la información visualmente, facilitando la jerarquización de contenidos y la recuperación rápida durante el repaso.",
        "difficulty": "easy",
    },
    {
        "module_order": 9,
        "question": "¿Qué es el resumen como género académico?",
        "options": [
            {"text": "Una versión reducida pero coherente del texto fuente que mantiene las ideas principales y la progresión temática original", "is_correct": True},
            {"text": "Una opinión personal del lector sobre el texto que leyó", "is_correct": False},
            {"text": "Una lista de palabras clave extraídas del texto sin conexión entre sí", "is_correct": False},
            {"text": "Una copia fiel del texto original reducida a la mitad de su extensión", "is_correct": False},
        ],
        "explanation": "El resumen es un género que reformula el texto fuente: reduce su extensión conservando las ideas más importantes y respetando la progresión temática del original. Es coherente y puede leerse de forma autónoma.",
        "difficulty": "easy",
    },
    {
        "module_order": 9,
        "question": "¿Por qué son importantes los géneros de estudiantes (apunte y resumen) en la formación universitaria?",
        "options": [
            {"text": "Porque son herramientas que permiten procesar, organizar y apropiarse del conocimiento académico de forma activa", "is_correct": True},
            {"text": "Porque reemplazan la lectura del texto original y ahorran tiempo de estudio", "is_correct": False},
            {"text": "Porque son los únicos géneros evaluados en los exámenes finales universitarios", "is_correct": False},
            {"text": "Porque permiten copiar el texto del docente sin riesgo de plagio", "is_correct": False},
        ],
        "explanation": "Los géneros de estudiantes (apunte, resumen) son prácticas letradas fundamentales en la universidad: al producirlos, el estudiante procesa activamente el contenido, lo reorganiza y lo hace suyo, favoreciendo el aprendizaje profundo.",
        "difficulty": "medium",
    },
]


def get_existing_order_indices(module_id):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/quiz_questions",
        headers=HEADERS,
        params={
            "module_id": f"eq.{module_id}",
            "select": "order_index",
            "order": "order_index.desc",
            "limit": "1",
        },
    )
    data = r.json() if r.status_code == 200 else []
    if data and isinstance(data, list) and data[0].get("order_index") is not None:
        return data[0]["order_index"]
    return 0


def insert_quizzes():
    # Agrupar preguntas por módulo
    by_module = {}
    for q in QUIZZES:
        mo = q["module_order"]
        by_module.setdefault(mo, []).append(q)

    total_ok = 0
    total_err = 0

    for mod_order, questions in by_module.items():
        mod_id = MODULE_IDS.get(mod_order)
        if not mod_id:
            print(f"  ⚠️ No se encontró ID para módulo order={mod_order}, saltando.")
            continue

        # Obtener el último order_index existente
        last_idx = get_existing_order_indices(mod_id)
        start_idx = max(last_idx + 1, 100)  # partir de 100 para no pisar quizzes existentes

        print(f"  Módulo {mod_order} (id: {mod_id[:8]}...) — insertando {len(questions)} preguntas desde order_index {start_idx}...")

        for i, q in enumerate(questions):
            payload = {
                "subject_id": SUBJECT_ID,
                "module_id": mod_id,
                "question": q["question"],
                "options": q["options"],
                "explanation": q["explanation"],
                "difficulty": q["difficulty"],
                "order_index": start_idx + i,
                "is_published": True,
            }
            r = requests.post(
                f"{SUPABASE_URL}/rest/v1/quiz_questions",
                headers=HEADERS,
                json=payload,
            )
            if r.status_code in (200, 201):
                total_ok += 1
            else:
                total_err += 1
                print(f"    ❌ ERR {r.status_code}: {r.text[:200]}")

    print(f"\n  ✓ Insertadas: {total_ok} | Errores: {total_err}")


if __name__ == "__main__":
    print("=== Seminario — 40 quizzes extra ===")
    insert_quizzes()
    print("Listo.")
