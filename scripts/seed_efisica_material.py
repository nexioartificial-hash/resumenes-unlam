import os, requests, sys
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
SUBJECT_ID = "fd4e783d-18e2-49f8-8a16-b8ada81b03c7"

GUIA_BODY = """## Cómo usar esta guía

Leé cada módulo completo antes de usar las preguntas orientadoras. Los **conceptos en negrita** son los más frecuentes en los parciales. El objetivo es que puedas responder cada pregunta sin mirar el resumen.

---

## Módulo 1 — La Educación Física

### Conceptos clave

- **Educación Física (Bracht y Caparróz, 2009)**: disciplina cuyo papel en el currículo escolar es introducir a los alumnos en el universo de la **cultura corporal de movimiento**, permitiéndoles apropiarse, reconstruir, transformar y disfrutar críticamente esa parcela de la vida humana.
- **Cultura corporal de movimiento**: conjunto de prácticas corporales históricamente construidas (deportes, juegos, danzas, gimnasia, actividades en la naturaleza) que constituyen el objeto de conocimiento específico de la EF.
- **Modelos o concepciones de EF**: distintas perspectivas sobre qué es y para qué sirve la EF. Se pueden identificar al menos dos grandes orientaciones: la **biologicista/higienista** (centrada en el cuerpo como organismo, la salud y la performance) y la **cultural/pedagógica** (centrada en el sujeto social, la ciudadanía y la cultura).
- **EF en la escuela**: la EF escolar es distinta de la EF deportiva o terapéutica. En la escuela, su objetivo es educativo: formar ciudadanos capaces de participar críticamente en la cultura corporal.
- **Docente de EF**: no solo enseña técnicas motrices sino que transmite valores, promueve la inclusión y contextualiza históricamente las prácticas corporales.

### Preguntas orientadoras

1. ¿Cuál es el papel de la Educación Física en el currículo escolar según Bracht y Caparróz?
2. ¿Qué significa "cultura corporal de movimiento" y qué prácticas incluye?
3. ¿En qué se diferencia la concepción biologicista de la EF de la concepción cultural/pedagógica?
4. ¿Por qué la EF escolar tiene objetivos distintos a la EF deportiva?
5. ¿Qué rol juega el docente de EF más allá de enseñar técnicas motrices?
6. ¿Puede la EF considerarse una ciencia, una disciplina o una práctica? ¿Qué implica cada posición?

---

## Módulo 2 — Currículum y Enseñanza

### Conceptos clave

- **Pedagogía**: estudio sistemático y científico de la educación. Interpreta las relaciones entre Escuela, Cultura, Sociedad e Infancia. Proporciona el marco conceptual para la práctica docente.
- **Currículum**: selección organizada de contenidos y experiencias de aprendizaje. No es neutral: refleja valores, prioridades sociales y visiones sobre el conocimiento. Puede ser **oficial** (prescripto), **real** (lo que efectivamente ocurre en clase) y **oculto** (lo que se aprende sin ser enseñado explícitamente).
- **Escuela**: institución social e históricamente situada. No es solo el lugar donde se aprende; también es un espacio de socialización, reproducción cultural y disputas de poder.
- **Enseñanza**: proceso intencional de transmisión cultural. El docente toma decisiones sobre qué enseñar, cómo y para qué, y esas decisiones tienen implicaciones políticas y éticas.
- **Cultura escolar**: conjunto de normas, rituales, tiempos, espacios y relaciones que caracterizan a la escuela como institución. La EF tiene su propia cultura escolar (el patio, el uniforme, la competencia).
- **Saber docente**: conocimiento práctico construido en la experiencia de enseñar. Combina saberes disciplinares, pedagógicos y experienciales. Es específico y contextual.

### Preguntas orientadoras

1. ¿Qué es el currículum y por qué no es neutral?
2. ¿Cuál es la diferencia entre currículum oficial, real y oculto?
3. ¿Qué es la pedagogía y cómo se relaciona con la práctica docente en EF?
4. ¿En qué sentido la escuela es un espacio de socialización y no solo de instrucción?
5. ¿Por qué la enseñanza tiene implicaciones políticas y éticas?
6. ¿Qué es el saber docente y cómo se construye?

---

## Módulo 3 — El Sujeto del Aprendizaje

### Conceptos clave

- **Perspectiva holística y relacional** (Giles y Rocha Bidegain, 2015): el sujeto de la EF debe entenderse como un sistema complejo de dimensiones (corporal, emocional, cognitiva, social) que requiere un abordaje interdisciplinario. Rechazo de la dicotomía cartesiana cuerpo-mente.
- **Dicotomía cartesiana**: separación filosófica entre cuerpo y mente (Descartes). La EF contemporánea la rechaza: el cuerpo no es solo un instrumento, sino parte constitutiva del sujeto.
- **Cuerpo en EF**: no es solo un organismo biológico sino un cuerpo social, cultural e históricamente producido. Las experiencias corporales son también emocionales y cognitivas.
- **Aprendizaje motor**: proceso de adquisición y perfeccionamiento de habilidades motrices a través de la práctica. Involucra mecanismos neurológicos, cognitivos y emocionales.
- **Desarrollo psicomotriz**: integración del desarrollo motor con el psicológico y social. En la infancia, el movimiento es una vía privilegiada de aprendizaje y construcción de identidad.
- **Motivación en EF**: factor clave para el aprendizaje. Puede ser intrínseca (interés propio) o extrínseca (recompensas externas). Los docentes de EF deben diseñar situaciones que promuevan la motivación intrínseca.

### Preguntas orientadoras

1. ¿Por qué la EF contemporánea rechaza la dicotomía cartesiana cuerpo-mente?
2. ¿Qué significa abordar al sujeto de la EF desde una perspectiva holística y relacional?
3. ¿Cuál es la diferencia entre el cuerpo como "organismo" y el cuerpo como "sujeto social"?
4. ¿Cómo se relacionan el aprendizaje motor y el desarrollo emocional?
5. ¿Por qué el movimiento es una vía privilegiada de aprendizaje en la infancia?
6. ¿Cómo puede el docente de EF promover la motivación intrínseca en sus alumnos?

---

## Módulo 4 — Prácticas de la Educación Física

### Conceptos clave

- **Cultura corporal** (Rozengardt y González, 2018): abarca todas las prácticas corporales desarrolladas históricamente: deportes, danzas, juegos y actividades en la naturaleza y medio acuático.
- **Juego**: actividad libre, voluntaria y placentera con reglas propias. En EF tiene valor educativo: desarrolla socialización, resolución de conflictos, creatividad. No es solo "pasar el tiempo".
- **Deporte**: práctica corporal codificada con reglas formales, instituciones y competencia. Puede ser enfocado desde una perspectiva crítica (¿reproducen valores de exclusión?) o desde su potencial educativo.
- **Danza**: expresión corporal con componente artístico y cultural. En EF promueve creatividad, expresión de emociones y diversidad cultural.
- **Actividades en la naturaleza**: prácticas que vinculan al sujeto con el entorno natural (senderismo, escalada, campamentos). Desarrollan autonomía, trabajo en equipo y vínculo con el ambiente.
- **Perspectiva crítica de las prácticas**: analizar para qué sirven las prácticas corporales, qué valores transmiten y a quiénes incluyen o excluyen.

### Preguntas orientadoras

1. ¿Qué diferencia hay entre juego y deporte? ¿Tienen el mismo valor educativo?
2. ¿Por qué Rozengardt y González hablan de "cultura corporal" y no solo de "actividad física"?
3. ¿Cuál es el valor educativo de la danza en la EF escolar?
4. ¿Qué aportan las actividades en la naturaleza que no aporta el deporte en cancha?
5. ¿Cómo puede el docente seleccionar prácticas que sean inclusivas y no reproductoras de desigualdad?
6. ¿El deporte escolar debe ser competitivo o cooperativo? Fundamentá desde la perspectiva del módulo.

---

## Módulo 5 — Educación Física Inclusiva

### Conceptos clave

- **Inclusión**: universalidad del acceso a los aprendizajes. Todos los estudiantes, independientemente de sus condiciones individuales (discapacidad, género, raza, religión), comparten el mismo espacio y logran aprendizajes. No es integración (el alumno se adapta al sistema): es el sistema el que se adapta.
- **Diferencia entre integración e inclusión**: integración = "el alumno diferente se incorpora al grupo normal". Inclusión = "el grupo se transforma para dar lugar a la diversidad".
- **Discapacidad en EF**: modelo médico (la discapacidad como déficit a corregir) vs. modelo social (la discapacidad como resultado de barreras sociales y ambientales). La EF inclusiva adopta el modelo social.
- **Adaptación curricular**: modificaciones en objetivos, contenidos, metodologías o evaluación para garantizar el acceso de todos. No implica bajar el nivel sino diversificar los caminos.
- **Responsabilidad docente**: el docente de EF inclusiva debe garantizar que todos participen, presencien y logren aprendizajes. Esto implica diseño universal del aprendizaje.
- **Cooperación y diversidad**: la EF inclusiva promueve que los alumnos aprendan a trabajar con la diversidad como valor, no como obstáculo.

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre integración e inclusión en EF?
2. ¿Por qué la EF inclusiva adopta el modelo social de la discapacidad y no el médico?
3. ¿Qué es una adaptación curricular y cómo puede aplicarse en EF?
4. ¿Qué significa "diseño universal del aprendizaje"?
5. ¿Por qué la inclusión no es solo para alumnos con discapacidad?
6. ¿Qué desafíos enfrenta el docente de EF para garantizar la inclusión real?

---

## Módulo 6 — Educación Física para la Salud

### Conceptos clave

- **Actividad física**: cualquier movimiento generado por los músculos esqueléticos que implique un gasto de energía superior al **metabolismo basal** (energía mínima para mantener los procesos vitales en reposo).
- **Metabolismo basal**: gasto energético mínimo para mantener las funciones vitales en reposo (respiración, circulación, temperatura, etc.). Base para calcular el gasto energético total.
- **Catabolismo y anabolismo**: catabolismo = degradación de moléculas complejas para obtener energía (libera ATP). Anabolismo = síntesis de moléculas complejas usando energía (gasta ATP). La actividad física potencia ambos procesos.
- **Atributos de la actividad física**: intensidad (ligera/moderada/vigorosa), frecuencia, duración, tipo (aeróbica/anaeróbica) y contexto (laboral, recreativo, deportivo).
- **Beneficios de la actividad física regular**: cardiovasculares (reduce presión arterial, mejora circulación), metabólicos (control de glucemia, lípidos), musculoesqueléticos (fortalece huesos y músculos), psicológicos (reduce estrés, depresión), inmunológicos.
- **Sedentarismo**: principal factor de riesgo modificable para enfermedades crónicas no transmisibles (ECNT): diabetes tipo 2, hipertensión, obesidad, enfermedades cardiovasculares. La OMS recomienda al menos 150 min de actividad moderada por semana para adultos.

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre actividad física y ejercicio físico?
2. ¿Qué es el metabolismo basal y por qué es importante para entender el gasto energético?
3. ¿Cómo se clasifican los atributos de la actividad física?
4. ¿Cuáles son los beneficios de la actividad física regular para la salud? Mencioná al menos cuatro dimensiones.
5. ¿Por qué el sedentarismo es considerado un factor de riesgo de las ECNT?
6. ¿Cuál es la responsabilidad de la EF escolar frente a la crisis de sedentarismo en los jóvenes?

---

## Cuadro comparativo — Concepciones de la Educación Física

| Concepción | Foco | Objetivo | Referentes |
|------------|------|----------|-----------|
| **Biologicista/Higienista** | Cuerpo como organismo | Salud, rendimiento físico | Medicina deportiva |
| **Deportivista** | Deporte de alto rendimiento | Performance, competencia | Federaciones deportivas |
| **Cultural/Pedagógica** | Sujeto social y cultural | Ciudadanía, cultura corporal | Bracht, Rozengardt |
| **Inclusiva** | Diversidad y acceso | Todos aprenden | ODS, modelo social discapacidad |

---

## Cuadro comparativo — Integración vs. Inclusión

| Aspecto | Integración | Inclusión |
|---------|-------------|-----------|
| **¿Quién se adapta?** | El alumno diferente | El sistema educativo |
| **Visión de la diferencia** | Problema a superar | Valor y riqueza |
| **Objetivo** | Incorporar al "diferente" | Transformar para todos |
| **Docente** | Intervención individual | Diseño universal |

---

## Cuadro comparativo — Actividad física: atributos

| Atributo | Descripción | Ejemplo |
|----------|-------------|---------|
| **Intensidad** | Ligera, moderada, vigorosa | Caminar vs. correr |
| **Frecuencia** | Veces por semana | 3 veces/semana |
| **Duración** | Tiempo de cada sesión | 30-60 minutos |
| **Tipo** | Aeróbica vs. anaeróbica | Natación vs. pesas |
| **Contexto** | Laboral, recreativo, deportivo | Trabajo en obra vs. fútbol |
"""

EXAMEN_BODY = """## Instrucciones

- Tiempo estimado: 90 minutos
- Respondé con fundamentación: no basta con definir, hay que relacionar los conceptos con autores y explicar el "por qué"
- Usá los términos técnicos del curso
- Total: 10 puntos

---

## Parte I — Conceptos fundamentales (3 puntos)

### Pregunta 1 (1 punto)

Según **Bracht y Caparróz (2009)**, ¿cuál es el papel de la Educación Física en el currículo escolar? ¿Qué significa "cultura corporal de movimiento" y por qué esta definición implica un cambio de perspectiva respecto a las concepciones tradicionales?

**Respuesta modelo:**

Bracht y Caparróz (2009) sostienen que el papel de la Educación Física en el currículo escolar es introducir a los alumnos en el universo de la **cultura corporal de movimiento**, posibilitando que se apropien, reconstruyan, transformen y disfruten críticamente esa parcela de la vida humana.

La "cultura corporal de movimiento" hace referencia al conjunto de prácticas corporales que los seres humanos han desarrollado históricamente y que forman parte de la cultura: los deportes, las danzas, los juegos, las gimnasias, las actividades en la naturaleza. No se trata de movimientos naturales o puramente biológicos, sino de prácticas sociales e históricamente construidas, que llevan marcas de los contextos en que surgieron y que transmiten valores, normas y formas de relacionarse.

Este concepto implica un cambio profundo respecto a las concepciones tradicionales de la EF, que la reducían a la higiene corporal, al rendimiento deportivo o al adiestramiento físico. Al centrar el objeto de la EF en la cultura corporal, se desplaza el foco del cuerpo como organismo biológico al sujeto como ser social y cultural. El alumno no aprende solo a "mover el cuerpo de determinada manera": aprende a participar críticamente en una práctica cultural, a cuestionarla, a transformarla y a disfrutarla. La EF deja de ser entrenamiento y se convierte en educación en el sentido pleno.

---

### Pregunta 2 (1 punto)

Explicá la diferencia entre **integración** e **inclusión** en la Educación Física. ¿Por qué la EF inclusiva adopta el modelo social de la discapacidad?

**Respuesta modelo:**

La distinción entre integración e inclusión es fundamental para comprender los enfoques modernos de la EF y la educación en general.

La **integración** parte de la idea de que existe un grupo "normal" y un grupo "diferente" que debe incorporarse a ese grupo. El alumno con discapacidad, con dificultades de aprendizaje o que pertenece a una minoría debe adaptarse al sistema existente. El docente puede hacer adaptaciones individuales, pero el sistema en sí no se modifica. El problema reside en el individuo, que debe "ponerse al día" o "insertarse".

La **inclusión**, en cambio, parte del principio de que la diversidad es la norma y no la excepción. No existe un grupo "normal" al que los demás deben integrarse: existe un grupo diverso cuyas diferencias son parte constitutiva de lo humano. El sistema educativo —incluyendo el docente, los espacios, los contenidos y las metodologías— debe transformarse para garantizar que todos participen, presencien y logren aprendizajes. El problema no está en el individuo sino en las **barreras** que el sistema interpone.

La EF inclusiva adopta el **modelo social de la discapacidad** (en oposición al modelo médico) porque entiende que la discapacidad no es un déficit intrínseco del sujeto, sino el resultado de la interacción entre las características del individuo y las barreras sociales, arquitectónicas y culturales que la sociedad construye. Un alumno en silla de ruedas no es "discapacitado" por su cuerpo, sino porque el sistema educativo no le proporciona los recursos y adaptaciones necesarias para participar plenamente. Desde esta perspectiva, el rol del docente de EF es identificar y eliminar las barreras que impiden la participación, en lugar de "tratar" la condición del alumno.

---

### Pregunta 3 (1 punto)

¿Qué es el **currículum oculto** y cómo se manifiesta en las clases de Educación Física?

**Respuesta modelo:**

El currículum oculto hace referencia a los aprendizajes que los alumnos incorporan en la escuela sin que esos aprendizajes sean enseñados explícitamente ni formen parte del programa oficial. Es lo que "se aprende sin que nadie lo enseñe", a través de la organización del espacio, los rituales institucionales, las interacciones entre pares y docentes, y las rutinas de la clase.

En la Educación Física, el currículum oculto se manifiesta de maneras diversas. La forma en que el docente organiza los equipos (¿quién elige primero?, ¿quiénes siempre quedan últimos?) transmite mensajes sobre el valor de ciertos cuerpos y habilidades. La elección de qué deportes se practican (si siempre es fútbol para varones y vóley para mujeres) comunica normas de género sin que nadie las enuncie explícitamente. La competencia excesiva enseña que lo que importa es ganar, no participar. El uso exclusivo de ciertas áreas del patio puede comunicar jerarquías entre grupos.

El currículum oculto puede reforzar desigualdades (cuando un docente premia siempre a los más habilidosos, enseña que la EF es "para los buenos") o puede ser trabajado pedagógicamente para promover la inclusión, la cooperación y el respeto por la diversidad. Reconocer el currículum oculto es parte de la formación crítica del docente de EF.

---

## Parte II — Análisis y comparación (4 puntos)

### Pregunta 4 (2 puntos)

Describí la perspectiva **holística y relacional** del sujeto de la EF (Giles y Rocha Bidegain, 2015). ¿Por qué esta perspectiva rechaza la dicotomía cartesiana? ¿Qué implicancias concretas tiene para la práctica docente?

**Respuesta modelo:**

Giles y Rocha Bidegain (2015) proponen entender al sujeto de la Educación Física desde una perspectiva holística y relacional. Holística porque el sujeto es un sistema complejo de dimensiones que se integran y se afectan mutuamente: corporal, emocional, cognitiva y social. Relacional porque ese sujeto no existe en abstracto sino en relación con otros, con un contexto histórico, social y cultural particular.

Esta perspectiva rechaza explícitamente la **dicotomía cartesiana**, el principio filosófico formulado por Descartes que separa el cuerpo y la mente como sustancias radicalmente distintas. En la tradición cartesiana, el cuerpo es una máquina, un instrumento que ejecuta lo que la mente ordena. Esta visión fue muy influyente en la EF biologicista y deportivista: el cuerpo debía ser entrenado, controlado y optimizado como un mecanismo.

La perspectiva holística invierte esta lógica: el cuerpo no es un instrumento sino una dimensión constitutiva del sujeto. Las experiencias corporales son al mismo tiempo emocionales y cognitivas. Cuando un alumno aprende a nadar, no solo adquiere una habilidad motriz: experimenta miedo, superación, placer, establece relaciones sociales y construye una imagen de sí mismo. Separar lo "físico" de lo "mental" en ese proceso es artificioso y empobrecedor.

Las implicancias para la práctica docente son concretas. El docente de EF no puede ignorar el estado emocional de sus alumnos: un alumno que viene de una pelea en el recreo o que tiene miedo a la pelota no puede "apagar" esas dimensiones cuando entra al gimnasio. El diseño de las clases debe contemplar no solo los objetivos motrices sino el clima emocional, las relaciones entre pares y el contexto social de los alumnos. La evaluación no puede reducirse al rendimiento físico sin tomar en cuenta el proceso y las condiciones particulares de cada sujeto.

---

### Pregunta 5 (2 puntos)

Explicá los conceptos de **actividad física**, **metabolismo basal**, **catabolismo** y **anabolismo**, y la relación entre el sedentarismo y las enfermedades crónicas no transmisibles (ECNT). ¿Cuál es la responsabilidad de la EF escolar frente a esta problemática?

**Respuesta modelo:**

La **actividad física** se define como cualquier movimiento generado por los músculos esqueléticos que implique un gasto de energía superior al metabolismo basal. Es un concepto amplio que incluye el deporte pero también el juego, las tareas domésticas, el transporte activo y cualquier movimiento del cuerpo en la vida cotidiana.

El **metabolismo basal** es el gasto energético mínimo que necesita el organismo para mantener sus procesos vitales en estado de reposo: la respiración, la circulación sanguínea, la regulación de la temperatura corporal, el funcionamiento del sistema nervioso y las síntesis celulares básicas. Representa aproximadamente el 60-70% del gasto energético total en personas sedentarias.

El **catabolismo** es el conjunto de reacciones metabólicas que degradan moléculas complejas en moléculas más simples, liberando energía en forma de ATP. Por ejemplo, la glucólisis degrada glucosa en piruvato liberando 2 ATP. El **anabolismo** es el proceso inverso: síntesis de moléculas complejas a partir de precursores simples, con consumo de energía. Por ejemplo, la síntesis de proteínas musculares a partir de aminoácidos. La actividad física activa y potencia ambos procesos: el catabolismo durante el esfuerzo y el anabolismo en la recuperación (síntesis de músculo).

El **sedentarismo** —entendido como la insuficiente actividad física regular— es actualmente uno de los principales factores de riesgo modificables para las enfermedades crónicas no transmisibles (ECNT). La falta de actividad física se asocia directamente con: obesidad (desequilibrio energético crónico), diabetes tipo 2 (resistencia a la insulina agravada por la inactividad), hipertensión arterial, enfermedades cardiovasculares y trastornos de salud mental (depresión, ansiedad). La OMS estima que el sedentarismo causa unos 3,2 millones de muertes anuales en el mundo y recomienda al menos 150 minutos de actividad física moderada por semana para adultos.

La **EF escolar** tiene una responsabilidad central frente a esta problemática. Es la única instancia del sistema educativo donde todos los niños y jóvenes tienen acceso garantizado a la práctica de actividad física. Más allá de las horas de clase, la EF debe contribuir a formar hábitos de vida activa que perduren más allá de la escolaridad: enseñar a los alumnos a conocer su cuerpo, a valorar el movimiento como parte del bienestar integral y a tomar decisiones informadas sobre su salud. Esto implica que la EF no puede limitarse al rendimiento deportivo ni a la competencia: debe promover el placer por el movimiento, la autonomía y la reflexión crítica sobre la propia actividad física.

---

## Parte III — Reflexión integradora (3 puntos)

### Pregunta 6 (1,5 puntos)

¿Por qué se dice que la Educación Física es una disciplina **política**? Relacioná los conceptos de currículum oculto, inclusión y cultura corporal para argumentar tu respuesta.

**Respuesta modelo:**

Decir que la EF es una disciplina política no significa que sea partidaria sino que —como toda práctica educativa— toma posiciones ante preguntas fundamentales: ¿qué cuerpos son válidos?, ¿qué movimientos valen más?, ¿quién puede participar y quién queda excluido?, ¿qué valores transmite el deporte?.

El **currículum oculto** de la EF es profundamente político. Cuando en las clases de EF se practica solo fútbol, se normaliza que el cuerpo masculino joven y hábil es el cuerpo "normal" de la EF. Cuando los equipos se forman por elección entre pares, se aprende que el rendimiento determina el valor de un sujeto. Cuando las actividades de "chicas" y "chicos" son distintas, se reproducen estereotipos de género. Todo esto ocurre sin que nadie lo enuncie explícitamente, pero forma subjetividades y legitima jerarquías.

La **cultura corporal** (Rozengardt y González) también es política: los deportes que se enseñan, las danzas que se incluyen o excluyen, los juegos que se valoran o se descalifican, todo refleja decisiones sobre qué prácticas merecen ser transmitidas y a quiénes pertenecen. Una EF crítica pregunta: ¿por qué el ajedrez no es EF?, ¿por qué la danza folklórica sí?, ¿por qué el deporte masculino occidental tiene más status que las prácticas corporales de otras culturas?

La **inclusión** es también una posición política: afirma que todos los sujetos, independientemente de sus condiciones, tienen derecho a participar y aprender. Rechazar la exclusión no es solo un gesto de compasión sino una apuesta ético-política por la igualdad. El docente de EF que elige diseñar clases inclusivas está tomando una posición respecto a quién tiene derecho a la educación corporal.

En síntesis, la EF es política porque sus decisiones curriculares (qué enseñar, a quién, cómo y para qué) nunca son neutras: siempre forman parte de proyectos sociales más amplios, que pueden reproducir o transformar desigualdades.

---

### Pregunta 7 (1,5 puntos)

"El sujeto que aprende en EF no es un cuerpo que se mueve sino un sujeto que piensa, siente y actúa en un contexto social". A partir de esta afirmación, explicá cómo los módulos de **sujeto del aprendizaje**, **prácticas de la EF** y **EF para la salud** se articulan en una visión integrada de la EF contemporánea.

**Respuesta modelo:**

La afirmación desafía la imagen más extendida de la EF: la de un espacio donde lo que importa es el cuerpo en movimiento, aislado de la mente y el contexto. Los tres módulos mencionados construyen juntos una visión radicalmente distinta.

El módulo sobre el **sujeto del aprendizaje** (Giles y Rocha Bidegain) establece la base: el sujeto de la EF es un sistema complejo e indivisible. Las emociones, los pensamientos y las relaciones sociales no son ruido de fondo de la clase de EF: son parte constitutiva del aprendizaje. Un alumno que tiene miedo a fracasar, que viene de un contexto familiar violento, que siente que no es "bueno" para el deporte, experimenta la clase de EF de manera radicalmente distinta a un alumno confiado y con experiencias previas positivas. El docente que ignora estas dimensiones no enseña con mayor "objetividad": simplemente produce exclusión sin verla.

El módulo sobre las **prácticas de la EF** (Rozengardt y González) conecta al sujeto con su contexto cultural. Las prácticas corporales —juegos, deportes, danzas, actividades en la naturaleza— no son solo ejercicios: son formas de relacionarse, de competir, de cooperar, de expresar emociones y de pertenecer a una comunidad. Cada práctica lleva valores implícitos: el deporte competitivo valora el rendimiento individual; el juego cooperativo valora la participación y el disfrute colectivo. Elegir qué prácticas enseñar es elegir qué valores transmitir. El docente de EF contemporáneo debe seleccionar prácticas que sean culturalmente significativas, que promuevan la inclusión y que den lugar a la diversidad de sujetos.

El módulo de **EF para la salud** completa el cuadro: el movimiento no tiene solo valor cultural sino también biológico y psicológico. La actividad física regular transforma el metabolismo, reduce el riesgo de ECNT, mejora el bienestar emocional y potencia el desarrollo cognitivo. Pero esta dimensión no puede separarse de las anteriores: la mejor forma de promover hábitos de vida activa en los jóvenes no es enseñar fisiología del ejercicio sino generar experiencias corporales placenteras, inclusivas y significativas que los jóvenes quieran repetir más allá de la escuela.

La visión integrada que emerge es la de una EF que educa a sujetos completos: que piensen críticamente sobre sus prácticas corporales, que sientan placer y bienestar en el movimiento, que sean capaces de incluir y ser incluidos, y que cuenten con herramientas para cuidar su salud a lo largo de toda la vida.

---

## Criterios de corrección

| Criterio | Descripción |
|----------|-------------|
| **Conceptual** | Define y aplica correctamente los términos técnicos del módulo |
| **Autoral** | Vincula los conceptos con los autores del módulo cuando corresponde |
| **Argumentativo** | No solo describe: toma posición y la fundamenta |
| **Integrador** | En las preguntas de Parte III, relaciona conceptos de distintos módulos |
"""


def upsert_item(title, body, item_type, order_index):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/content_items"
        f"?subject_id=eq.{SUBJECT_ID}&type=eq.{item_type}&select=id",
        headers=HEADERS,
    )
    existing = r.json() if r.status_code == 200 else []
    if not isinstance(existing, list):
        existing = []

    if existing:
        item_id = existing[0]["id"]
        r2 = requests.patch(
            f"{SUPABASE_URL}/rest/v1/content_items?id=eq.{item_id}",
            headers=HEADERS,
            json={"title": title, "body": body, "is_published": True},
        )
        action = "PATCH"
    else:
        r2 = requests.post(
            f"{SUPABASE_URL}/rest/v1/content_items",
            headers=HEADERS,
            json={
                "subject_id": SUBJECT_ID,
                "title": title,
                "body": body,
                "type": item_type,
                "order_index": order_index,
                "is_published": True,
            },
        )
        action = "POST"

    ok = r2.status_code in (200, 201, 204)
    print(f"  [{'OK' if ok else 'ERR'}] {action} {item_type}: HTTP {r2.status_code}")
    if not ok:
        print(f"    {r2.text[:300]}")
    return ok


if __name__ == "__main__":
    print("=== Fundamentos Ed. Fisica - material de apoyo ===")
    ok1 = upsert_item("Guia de Estudio de Fundamentos de Ed. Fisica", GUIA_BODY, "guide", 1)
    ok2 = upsert_item("Modelo de Examen - Fundamentos de Ed. Fisica", EXAMEN_BODY, "exam_model", 2)
    if ok1 and ok2:
        print("\nOK - Todo subido correctamente.")
    else:
        print("\nERROR - Revisa la salida.")
