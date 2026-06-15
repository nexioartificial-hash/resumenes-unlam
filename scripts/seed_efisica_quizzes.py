import requests
import sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID   = "fd4e783d-18e2-49f8-8a16-b8ada81b03c7"

MODULES = {
    1: "a606c080-e25a-4746-b487-5b203c454120",
    2: "eb1e9691-a23e-4bcb-a029-3673f5a0d4a4",
    3: "bd12f80b-2615-448b-b815-c04ee948c1a1",
    4: "9a1261c0-88a8-4e74-9059-dd76d6273ea8",
    5: "760a4fe1-5a1b-49d0-8fe0-6dfadc41d141",
    6: "cc59ed31-bedf-48df-a64a-fb97fb63cd22",
}

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}

def q(question, correct, wrong1, wrong2, wrong3, explanation, difficulty="medium"):
    return {
        "question": question,
        "options": [
            {"text": correct, "is_correct": True},
            {"text": wrong1,  "is_correct": False},
            {"text": wrong2,  "is_correct": False},
            {"text": wrong3,  "is_correct": False},
        ],
        "explanation": explanation,
        "difficulty":  difficulty,
    }


# ── Módulo 1: Identidad de la Educación Física ────────────────────────────────

MOD1 = [
    q(
        "Según Bracht y Caparróz (2009), ¿cuál es el papel de la Educación Física en el currículo escolar?",
        "Introducir a los alumnos en el universo de la cultura corporal de movimiento para que puedan apropiarse y transformarla críticamente",
        "Desarrollar el rendimiento atlético de los estudiantes",
        "Enseñar técnicas específicas de deportes reglamentados",
        "Evaluar y clasificar a los estudiantes según sus capacidades físicas",
        "Bracht y Caparróz definen el papel de la EF como introducir a los alumnos en la cultura corporal de movimiento, permitiendo apropiarse, reconstruir, transformar y disfrutar críticamente esa parcela de la vida humana.",
        "easy"
    ),
    q(
        "¿Qué define Bunge (1977) como Epistemología?",
        "Una rama de la Filosofía que estudia la investigación científica y su producto, el conocimiento científico",
        "El estudio histórico de las ciencias naturales",
        "Un método para evaluar el conocimiento humano empíricamente",
        "El estudio de la pedagogía escolar y sus métodos",
        "Según Bunge (1977), la Epistemología es una rama de la Filosofía que estudia la investigación científica y su producto, el conocimiento científico.",
        "easy"
    ),
    q(
        "¿Por qué existe confusión sobre la identidad del campo de la Educación Física según el Módulo 1?",
        "Debido a sus diversos ámbitos de aplicación profesional, que evolucionaron desde la acción pedagógica escolar hacia clubes, gimnasios y otros espacios",
        "Porque no existe ninguna teoría consolidada sobre la Educación Física",
        "Porque todos los docentes la definen de manera idéntica sin debate",
        "Porque tiene un único contexto de aplicación que no ha variado en el tiempo",
        "La confusión sobre la identidad de la EF se debe a sus diversos ámbitos de aplicación profesional: surgió como acción escolar en el siglo XIX y luego se expandió a clubes, gimnasios y centros de tercera edad.",
        "medium"
    ),
    q(
        "Según Gómez (2022), ¿qué propone hacer con la identidad de la Educación Física en lugar de buscar una única identidad?",
        "Deconstruir y reconstruir sus sentidos a partir de su trayectoria histórica",
        "Establecer una definición universal e inamovible del campo",
        "Rechazar todas las definiciones previas y comenzar desde cero",
        "Focalizarse solo en los aspectos físicos y deportivos",
        "Gómez (2022) propone que no existe una identidad única que descubrir; en cambio, propone deconstruir y reconstruir los sentidos de la EF a partir de su trayectoria.",
        "medium"
    ),
    q(
        "¿Qué relación establecen Martínez y Ríos (2006) entre el conocimiento científico y el contexto?",
        "El conocimiento se produce en un contexto histórico y social específico, y depende de un discurso legitimador llamado paradigma",
        "El conocimiento científico es universal e independiente del contexto histórico o social",
        "El conocimiento es producido exclusivamente por instituciones académicas sin influencia del contexto",
        "El contexto solo determina el lenguaje del conocimiento, pero no su contenido",
        "Martínez y Ríos (2006) explican que la Epistemología estudia el origen del conocimiento, el cual se produce en un contexto histórico y social específico. Pérez y otros (2020) añaden que el conocimiento científico depende de un paradigma como discurso legitimador.",
        "hard"
    ),
]

# ── Módulo 2: Currículum y Enseñanza ─────────────────────────────────────────

MOD2 = [
    q(
        "¿Qué obra de Juan Amos Comenius promovió la democratización del conocimiento en el siglo XVII?",
        "La Didáctica Magna",
        "El Emilio",
        "La República",
        "Pedagogía del Oprimido",
        "En el siglo XVII, Juan Amos Comenius, con su obra 'La Didáctica Magna', promovió la idea de democratizar la educación, haciendo el conocimiento accesible a todos.",
        "easy"
    ),
    q(
        "¿Cómo define García Carrasco y Donoso González la Cultura?",
        "Como el proceso interactivo social donde se reproducen comportamientos útiles, abarcando conocimientos, creencias, costumbres, arte y normas",
        "Como el conjunto de disciplinas académicas reconocidas por el Estado",
        "Como el sistema formal de educación escolar de una sociedad",
        "Como un conjunto de tradiciones artísticas transmitidas oralmente",
        "García Carrasco y Donoso González (2020) definen Cultura como el proceso interactivo social donde se reproducen comportamientos útiles. Abarca conocimientos, creencias, costumbres, arte, moral y normas adquiridas por el ser humano como miembro de una sociedad.",
        "easy"
    ),
    q(
        "Según Pérez Gómez (1994), ¿cuáles son las primeras instancias educativas en el proceso de socialización?",
        "La familia y los medios de comunicación, seguidos por la escuela",
        "La escuela, ya que es la institución educativa por excelencia",
        "Los pares y amigos, porque son la influencia más directa",
        "El Estado y sus instituciones como primeras instancias normativas",
        "Pérez Gómez (1994) destaca que la familia y los medios de comunicación son las primeras instancias educativas, seguidas por la escuela como institución formal.",
        "medium"
    ),
    q(
        "¿Cuál es la diferencia clave entre educación e instrucción según el Módulo 2?",
        "La educación abarca enseñanza de conocimientos y valores humanos buscando la integridad personal; la instrucción se enfoca en aprendizajes técnicos",
        "Son términos completamente sinónimos en el ámbito pedagógico",
        "La educación es menos completa que la instrucción técnica",
        "La instrucción incluye valores mientras que la educación solo cubre lo técnico",
        "El módulo distingue educación (conocimientos + valores humanos, busca integridad de la persona) de instrucción (adquisición de conocimientos técnicos para el mundo laboral).",
        "medium"
    ),
    q(
        "¿Qué implica que la educación se convirtiera en 'razón de estado' en el siglo XIX según Narodowski (1994)?",
        "Que el Estado centralizó y sistematizó la educación para la formación social y laboral de los ciudadanos",
        "Que la educación quedó completamente en manos de las familias",
        "Que el Estado se retiró de la educación para dejar autonomía a las escuelas",
        "Que las escuelas se volvieron independientes del control estatal",
        "Narodowski (1994) señala que en el siglo XIX la educación se transformó en una razón de estado, centralizando y sistematizando la educación para la formación ciudadana y la movilidad social.",
        "hard"
    ),
]

# ── Módulo 3: Sujeto del Aprendizaje ─────────────────────────────────────────

MOD3 = [
    q(
        "¿Qué separación propone superar la dicotomía cartesiana según el Módulo 3?",
        "La separación entre cuerpo y mente",
        "La separación entre teoría y práctica docente",
        "La separación entre alumno y docente",
        "La separación entre escuela y comunidad",
        "El módulo propone alejarse de la dicotomía cartesiana (separación cuerpo-mente) y entender al organismo como una dimensión del cuerpo visto como un 'todo'.",
        "easy"
    ),
    q(
        "¿Qué son la corporeidad y la motricidad según el Módulo 3?",
        "Dimensiones que se desarrollan cuando el sujeto existe como cuerpo y se pone en acción durante la clase",
        "Medidas cuantitativas del rendimiento físico del alumno",
        "Categorías teóricas sin aplicación práctica en el aula",
        "Conceptos puramente fisiológicos sobre la estructura del cuerpo",
        "Las manifestaciones, experiencias y emociones del sujeto se ponen en juego durante cualquier actividad en clase, momento en el cual existe como cuerpo y se desarrollan la corporeidad y motricidad.",
        "easy"
    ),
    q(
        "Según Giles y Rocha Bidegain (2015), ¿cómo debe entenderse al sujeto de la Educación Física?",
        "Como un sistema complejo de dimensiones que requiere un abordaje interdisciplinario, desde una perspectiva holística y relacional",
        "Como una máquina que responde de manera automatizada ante estímulos externos",
        "Como una entidad biológica aislada de su entorno social y cultural",
        "Como un objeto pasivo de evaluación de capacidades físicas",
        "Giles y Rocha Bidegain (2015) proponen considerar al sujeto de la EF desde una perspectiva holística y relacional, como un sistema complejo de dimensiones que requiere un abordaje interdisciplinario.",
        "medium"
    ),
    q(
        "¿Qué diferencia existe entre el docente que ve al cuerpo desde la 'corporeidad' y el que lo ve como 'cuerpo-objeto'?",
        "El docente que ve corporeidad ve a una persona con deseos y emociones; el que ve cuerpo-objeto queda atrapado frente a una máquina que responde automatizadamente",
        "Ambas perspectivas son equivalentes en la práctica pedagógica actual",
        "La corporeidad se enfoca en el rendimiento físico y el cuerpo-objeto en el desarrollo emocional",
        "El cuerpo-objeto es el enfoque más moderno y recomendado en la formación docente",
        "El módulo señala que el docente que ve corporeidad ve a otra persona con sus deseos y emociones. En cambio, el docente que ve solo un cuerpo-objeto queda atrapado frente a una máquina que responde automatizadamente.",
        "medium"
    ),
    q(
        "¿Cómo evolucionaron las teorías del aprendizaje desde posiciones positivistas hasta las basadas en interacción social?",
        "Desde considerar la naturaleza humana como determinante del aprendizaje hasta basar el aprendizaje significativo en las interacciones con los demás y el conocimiento por la experiencia",
        "Desde priorizar la práctica motriz hacia la teorización exclusivamente abstracta",
        "Desde el individuo hacia el ignorar completamente el contexto social",
        "Desde la experiencia corporal hacia metodologías puramente cognitivas",
        "El módulo señala que las teorías fueron desde posiciones positivistas (naturaleza como determinante) hasta teorías que basan el aprendizaje significativo en las interacciones con los demás y el conocimiento a partir de la experiencia.",
        "hard"
    ),
]

# ── Módulo 4: Prácticas de la Educación Física ───────────────────────────────

MOD4 = [
    q(
        "Según Johan Huizinga (1972), ¿qué es el juego?",
        "Una actividad voluntaria sin interés material, realizada en ciertos límites de tiempo y espacio, con reglas acordadas y con un fin en sí misma",
        "Cualquier actividad física que involucre a un grupo de personas",
        "Una actividad competitiva con ganadores y perdedores claramente definidos",
        "Una actividad estructurada dirigida por una autoridad docente",
        "Según Huizinga (1972), el juego es una actividad voluntaria sin interés material, realizada en ciertos límites de tiempo y espacio, con reglas acordadas y con un fin en sí misma, acompañada de tensión y alegría.",
        "easy"
    ),
    q(
        "¿Qué destaca la DGCyE (2022) sobre la sociomotricidad en el contexto del juego?",
        "Que facilita la comunicación, participación y cooperación en los estudiantes",
        "Que se enfoca exclusivamente en el desarrollo físico individual",
        "Que elimina los elementos competitivos del juego escolar",
        "Que se limita a actividades deportivas formales con reglamentación",
        "La DGCyE (2022) subraya la sociomotricidad, que facilita la comunicación, participación y cooperación en los estudiantes durante el juego.",
        "easy"
    ),
    q(
        "Según Roger Callois (1958), ¿qué características definen al juego?",
        "Es libre, voluntario, separado de la realidad, improductivo, placentero, creativo, expresivo y socializador",
        "Es obligatorio, competitivo, productivo y estructurado institucionalmente",
        "Es individual, físico, evaluado y orientado al progreso académico",
        "Es organizado, grupal, competitivo y reglamentado por autoridades",
        "Roger Callois en 'Los juegos y los hombres' (1958) argumenta que el juego es libre, voluntario, separado de la realidad, improductivo, placentero, creativo, expresivo y socializador.",
        "medium"
    ),
    q(
        "¿Qué destaca Liliana Ortega sobre el rol del juego en el desarrollo infantil?",
        "El juego ayuda a los niños a conocer su cuerpo, entender su cultura, procesar emociones y desarrollar su inteligencia, todo de manera inconsciente",
        "El juego tiene solo una función recreativa y no educativa",
        "El juego siempre debe tener objetivos académicos claros para ser valioso",
        "El juego debe ser supervisado exclusivamente por especialistas para tener valor educativo",
        "Liliana Ortega destaca que el juego ayuda a los niños a conocer su cuerpo, entender su cultura, procesar emociones y desarrollar su inteligencia, todo de manera inconsciente.",
        "medium"
    ),
    q(
        "¿Cuáles son las distintas perspectivas sobre el juego en la educación según la DGCyE (2022)?",
        "Como actividad recreativa, desarrollo del pensamiento táctico, medio de socialización y objeto de conocimiento cultural",
        "Solo como rendimiento físico y competencia deportiva",
        "Exclusivamente recreativo sin objetivos educativos formales",
        "Herramienta de aprendizaje sin dimensión socializadora ni cultural",
        "La DGCyE (2022) señala que el juego en la educación tiene varias perspectivas: actividad recreativa, desarrollo del pensamiento táctico, medio de socialización y objeto de conocimiento cultural.",
        "hard"
    ),
]

# ── Módulo 5: Educación Física Inclusiva ─────────────────────────────────────

MOD5 = [
    q(
        "¿Qué son las 'barreras' en el contexto de la educación inclusiva?",
        "Obstáculos materiales, ideológicos o culturales que impiden el desarrollo pleno de una persona",
        "Limitaciones físicas exclusivas de estudiantes con discapacidad motora",
        "Herramientas de evaluación académica para medir el progreso del alumno",
        "Requisitos curriculares previos para acceder a ciertos aprendizajes",
        "El módulo define Barreras como obstáculos materiales, ideológicos o culturales que impiden el desarrollo pleno de una persona.",
        "easy"
    ),
    q(
        "¿Cuál es la diferencia clave entre inclusión e integración según el Módulo 5?",
        "La inclusión garantiza la participación plena con adaptaciones; la integración solo habilita el acceso al espacio sin garantizar adaptaciones",
        "Son términos sinónimos usados indistintamente en educación",
        "La integración es más completa que la inclusión porque abarca más aspectos",
        "La inclusión se limita a estudiantes con discapacidades físicas únicamente",
        "El módulo distingue: Inclusión es la convivencia y participación equitativa con los apoyos necesarios; Integración es habilitar el acceso al lugar pero sin garantizar adaptaciones para la plena participación.",
        "easy"
    ),
    q(
        "¿Qué propone el Diseño Universal para el Aprendizaje (DUA)?",
        "Que el currículum educativo contemple las particularidades individuales de todos los estudiantes para asegurar su participación y aprendizaje",
        "El diseño de espacios físicos exclusivamente para estudiantes con discapacidad",
        "Un único método de enseñanza válido para todos los estudiantes",
        "Estándares de accesibilidad arquitectónica para edificios escolares",
        "El DUA propone que el currículum educativo contemple las particularidades individuales de todos los estudiantes para asegurar su participación y aprendizaje.",
        "medium"
    ),
    q(
        "¿Qué define Peters (2007) como educación inclusiva?",
        "Una filosofía que defiende el derecho de personas de colectivos vulnerados a ser educadas en igualdad de condiciones dentro del sistema general",
        "Un sistema que separa a los estudiantes con discapacidad en instituciones especializadas",
        "Un método de evaluación del rendimiento académico de estudiantes diversos",
        "Una estrategia administrativa para gestionar la diversidad en las aulas",
        "Peters (2007) define la educación inclusiva como una filosofía que defiende el derecho de las personas pertenecientes a colectivos vulnerados a ser educadas en igualdad de condiciones dentro del sistema general.",
        "medium"
    ),
    q(
        "¿Qué derecho reconoce la Convención sobre los Derechos de las Personas con Discapacidad (2006), ratificada en Argentina en 2014?",
        "El derecho de las personas con discapacidad a recibir una educación de calidad en igualdad de condiciones",
        "El derecho a instituciones educativas exclusivas y separadas del sistema general",
        "El derecho a adaptaciones solo en Educación Física y no en otras materias",
        "El derecho a exenciones académicas para estudiantes con discapacidad",
        "La Convención sobre los Derechos de las Personas con Discapacidad (2006), ratificada en Argentina en 2014, reconoce el derecho de las personas con discapacidad a recibir una educación de calidad en igualdad de condiciones.",
        "hard"
    ),
]

# ── Módulo 6: Educación Física para la Salud ─────────────────────────────────

MOD6 = [
    q(
        "¿Cómo se diferencia la actividad física del ejercicio físico según el Módulo 6?",
        "La actividad física es cualquier movimiento muscular con gasto de energía superior al metabolismo basal; el ejercicio es planificado y estructurado para mejorar la condición física",
        "El ejercicio es menos intenso que la actividad física general",
        "Son términos completamente sinónimos en el ámbito de la salud",
        "La actividad física solo se realiza en contextos deportivos competitivos",
        "La actividad física es cualquier movimiento generado por músculos esqueléticos que implique un gasto superior al metabolismo basal. El ejercicio físico es una actividad planificada y estructurada con el objetivo de mejorar o mantener aspectos de la condición física.",
        "easy"
    ),
    q(
        "¿Cómo define la OMS la salud?",
        "Un estado de completo bienestar físico, mental y social, y no solamente la ausencia de enfermedad",
        "La ausencia de enfermedades crónicas certificadas médicamente",
        "Un estado de óptimo rendimiento físico y deportivo",
        "La capacidad de realizar trabajos físicos sin fatiga",
        "La OMS define la salud como un estado de completo bienestar físico, mental y social, no solo la ausencia de enfermedad. Es un recurso que permite a las personas llevar una vida productiva.",
        "easy"
    ),
    q(
        "¿Qué es el metabolismo basal según el Módulo 6?",
        "La energía mínima necesaria para mantener los procesos metabólicos esenciales en estado de reposo",
        "La energía consumida durante ejercicio de alta intensidad",
        "Una medida del esfuerzo físico máximo que puede realizar una persona",
        "Las calorías quemadas durante las actividades cotidianas normales",
        "El módulo define el metabolismo basal como la energía mínima necesaria para mantener los procesos metabólicos esenciales en estado de reposo, que incluyen catabolismo (libera energía) y anabolismo (utiliza energía para construir).",
        "medium"
    ),
    q(
        "¿Cuáles son los cinco atributos que categorizan la actividad física según el Módulo 6?",
        "Intensidad, duración, ámbito o contexto, frecuencia y tipo",
        "Velocidad, flexibilidad, fuerza, resistencia y coordinación",
        "Volumen, carga, tiempo de recuperación, secuencia y modalidad",
        "Propósito, posición corporal, modalidad, equipamiento y duración",
        "El módulo establece que la actividad física puede categorizarse según: Intensidad (ligera, moderada, vigorosa), Duración, Ámbito o contexto (trabajo, tiempo libre, transporte, hogar), Frecuencia (sesiones por unidad de tiempo) y Tipo (deportiva, recreativa o de rehabilitación).",
        "medium"
    ),
    q(
        "¿Qué relación existe entre la aptitud física y la salud según el Módulo 6?",
        "La aptitud física permite realizar tareas diarias sin fatiga excesiva y resolver situaciones imprevistas; la salud requiere más que la ausencia de enfermedad",
        "La salud se define exclusivamente por la capacidad de practicar deportes competitivos",
        "La aptitud física solo importa para atletas de alto rendimiento",
        "La ausencia de enfermedad es suficiente para considerarse saludable",
        "El módulo señala que no basta la ausencia de enfermedad para estar saludable; también es crucial la aptitud física, que permite realizar tareas diarias sin excesiva fatiga y resolver situaciones imprevistas.",
        "hard"
    ),
]

# ── Preguntas generales (simulacro) ──────────────────────────────────────────

GENERALS = [
    q(
        "¿Qué son las 'prácticas corporales' según Rozengardt y González (2018)?",
        "Todas las prácticas corporales desarrolladas históricamente, como deportes, danzas, juegos y actividades en la naturaleza y medio acuático",
        "Solo los deportes competitivos reconocidos por organismos internacionales",
        "Actividades físicas realizadas exclusivamente en clases de Educación Física",
        "Ejercicios individuales para la mejora de la condición física",
        "Rozengardt y González (2018) explican que la cultura corporal abarca todas las prácticas corporales desarrolladas históricamente, como deportes, danzas, juegos, y actividades en la naturaleza y medio acuático.",
        "medium"
    ),
    q(
        "¿Qué diferencia existe entre ver al alumno desde la 'corporeidad' y verlo como 'cuerpo-objeto' (Módulo 3)?",
        "La corporeidad ve a una persona con deseos y emociones; el cuerpo-objeto trata al alumno como una máquina que responde automatizadamente",
        "La corporeidad se enfoca en el rendimiento; el cuerpo-objeto en el desarrollo emocional",
        "Ambas son perspectivas equivalentes en la pedagogía contemporánea",
        "La corporeidad es un concepto desactualizado reemplazado por el enfoque de cuerpo-objeto",
        "El módulo señala: el docente que ve corporeidad ve a otra persona con sus deseos y emociones; el que ve cuerpo-objeto queda atrapado frente a una máquina que responde automatizadamente.",
        "medium"
    ),
    q(
        "¿Qué establecieron Bracht y Caparróz (2009) como propósito central de la Educación Física escolar?",
        "Introducir a los alumnos en el universo de la cultura corporal de movimiento para que puedan apropiarse, reconstruir, transformar y disfrutar críticamente de ella",
        "Desarrollar el rendimiento deportivo de los estudiantes para competencias escolares",
        "Enseñar exclusivamente los reglamentos de los deportes más practicados",
        "Evaluar y clasificar a los alumnos según sus capacidades físicas medibles",
        "Bracht y Caparróz (2009:63) definen el papel de la EF como introducir a los alumnos en el universo de la cultura corporal de movimiento, permitiendo apropiarse, reconstruir, transformar y disfrutar críticamente esa parcela de la vida humana.",
        "easy"
    ),
    q(
        "¿Cuál es el rol de la escuela en la transmisión de la cultura según el Módulo 2?",
        "Es un espacio de socialización donde se transmite la cultura de forma sistemática, luego de la familia y los medios de comunicación",
        "Es la primera y única institución educativa de la sociedad",
        "Se enfoca exclusivamente en la instrucción académica sin función cultural",
        "Ha reemplazado completamente a la familia en la transmisión cultural",
        "Según el módulo, la escuela es una institución de socialización donde se transmite la cultura, siendo la tercera instancia educativa después de la familia y los medios de comunicación (Pérez Gómez, 1994).",
        "medium"
    ),
    q(
        "¿Qué hace única a la Educación Física entre las asignaturas escolares?",
        "Su enfoque en la cultura del movimiento corporal, donde el saber se manifiesta como experiencia corporal vivida que involucra emociones y motricidad",
        "Su foco exclusivo en el deporte competitivo de alto rendimiento",
        "El hecho de que no requiere fundamento teórico ni epistemológico",
        "Su separación total de los contextos culturales y sociales",
        "La EF es única porque introduce a los alumnos en la cultura corporal de movimiento, donde el saber se manifiesta como experiencia corporal que involucra emociones, motricidad y la persona en su totalidad.",
        "medium"
    ),
    q(
        "¿Qué plantea Piaget (1964) sobre la relación entre juego e inteligencia infantil?",
        "El juego es parte de la inteligencia del niño, representando la asimilación de la realidad según la etapa evolutiva",
        "El juego es una distracción que interfiere con el aprendizaje académico serio",
        "El juego tiene únicamente función física y no involucra componentes cognitivos",
        "El juego es una actividad compensatoria para niños con dificultades de aprendizaje",
        "Para Piaget (1964), el juego es parte de la inteligencia del niño, representando la asimilación de la realidad según la etapa evolutiva del desarrollo.",
        "easy"
    ),
    q(
        "¿Qué diferencia hay entre 'facilitadores' y 'barreras' en la educación física inclusiva?",
        "Las barreras son obstáculos al desarrollo pleno; los facilitadores son configuraciones o actitudes que permiten la participación de personas con discapacidad",
        "Ambos hacen referencia a los mismos aspectos de accesibilidad física",
        "Los facilitadores son herramientas de evaluación académica diferenciada",
        "Las barreras son solo elementos arquitectónicos físicos en el edificio escolar",
        "El módulo define: Barreras son obstáculos materiales, ideológicos o culturales que impiden el desarrollo pleno. Facilitadores son configuraciones o actitudes que la sociedad adopta para permitir la participación de personas con discapacidad.",
        "medium"
    ),
    q(
        "¿Qué implica la aptitud física en relación con la salud integral según el Módulo 6?",
        "Permite realizar tareas diarias sin fatiga excesiva y resolver situaciones imprevistas; la salud requiere bienestar físico, mental y social, no solo ausencia de enfermedad",
        "La aptitud física es el único indicador válido de buena salud",
        "La salud se alcanza exclusivamente mediante ejercicio físico planificado",
        "La aptitud física solo es relevante para quienes practican deportes de competencia",
        "El módulo señala que la aptitud física permite realizar tareas diarias sin excesiva fatiga y resolver situaciones imprevistas. A su vez, la OMS define salud como bienestar físico, mental y social, no solo ausencia de enfermedad.",
        "hard"
    ),
    q(
        "¿Cómo se relaciona la perspectiva epistemológica del Módulo 1 con las teorías del aprendizaje del Módulo 3?",
        "Ambas señalan que el conocimiento se construye en contextos histórico-sociales específicos: la epistemología a nivel científico y las teorías del aprendizaje a nivel individual y educativo",
        "Son campos completamente independientes sin ninguna relación entre sí",
        "La epistemología estudia solo el conocimiento científico sin relación con el aprendizaje escolar",
        "Las teorías del aprendizaje no son relevantes para la Educación Física",
        "El Módulo 1 establece que el conocimiento se produce en contextos histórico-sociales (Martínez y Ríos). El Módulo 3 muestra que el aprendizaje también es social y experiencial. Ambos convergen en que el conocimiento/aprendizaje no es universal ni descontextualizado.",
        "hard"
    ),
    q(
        "¿Cómo conecta la evolución histórica de la Educación Física (Módulo 1) con su enfoque inclusivo actual (Módulo 5)?",
        "La EF expandió sus espacios de acción (de escuelas a clubes, gimnasios y centros de tercera edad), lo que se conecta con el enfoque inclusivo que trasciende el acceso físico para garantizar participación real de todos",
        "La evolución histórica no tiene ninguna relación con las prácticas inclusivas actuales",
        "La EF histórica ya era completamente inclusiva desde sus orígenes",
        "La expansión a nuevos espacios hizo a la EF menos inclusiva al diversificar sin unificar",
        "La EF surgió como acción pedagógica escolar (siglo XIX) y se expandió a clubes, gimnasios y centros de tercera edad (siglo XX), ampliando su alcance. Esto conecta con el enfoque inclusivo moderno que también expande quiénes participan y cómo.",
        "hard"
    ),
]

# ── Insertar preguntas ────────────────────────────────────────────────────────

MODULE_GROUPS = [
    (MODULES[1], MOD1),
    (MODULES[2], MOD2),
    (MODULES[3], MOD3),
    (MODULES[4], MOD4),
    (MODULES[5], MOD5),
    (MODULES[6], MOD6),
    (None,       GENERALS),
]


inserted = 0
errors   = 0

for module_id, questions in MODULE_GROUPS:
    label = f"Módulo {list(MODULES.values()).index(module_id) + 1}" if module_id else "General"
    group_inserted = 0

    for order_index, question in enumerate(questions, start=1):
        payload = {
            "subject_id":   SUBJECT_ID,
            "module_id":    module_id,
            "question":     question["question"],
            "options":      question["options"],
            "explanation":  question["explanation"],
            "difficulty":   question["difficulty"],
            "order_index":  order_index,
            "is_published": True,
        }
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/quiz_questions",
            headers=HEADERS,
            json=payload,
        )
        if resp.status_code in [200, 201]:
            inserted += 1
            group_inserted += 1
        else:
            print(f"  x Error {label} q{order_index}: {resp.status_code} {resp.text[:150]}")
            errors += 1

    print(f"  {label}: {group_inserted} preguntas insertadas ✓")

print(f"\nTotal: {inserted} insertadas, {errors} con error.")
