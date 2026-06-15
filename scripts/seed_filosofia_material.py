import requests
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}


# ── 1. Obtener subject_id de filosofia ───────────────────────────────────────

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/subjects?slug=eq.filosofia&select=id,name",
    headers=HEADERS,
)
subjects = r.json()
if not subjects:
    print("ERROR: no se encontró la materia 'filosofia'")
    sys.exit(1)

SUBJECT_ID = subjects[0]["id"]
print(f"✓ Subject: {subjects[0]['name']} — id={SUBJECT_ID}")


# ── 2. Verificar si ya existen content_items para no duplicar ────────────────

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/content_items?subject_id=eq.{SUBJECT_ID}&select=id,title,type",
    headers=HEADERS,
)
all_items = r.json()
existing = [i for i in all_items if i["type"] in ("guide", "exam_model")]
if existing:
    print(f"\n⚠️  Ya existen {len(existing)} content_items de apoyo para Filosofía:")
    for item in existing:
        print(f"   - [{item['type']}] {item['title']}")
    print("\nAbortando para evitar duplicados. Eliminá los existentes primero si querés regenerarlos.")
    sys.exit(0)

print("✓ No hay content_items previos — insertando materiales nuevos\n")


# ── 3. Contenido de los materiales ───────────────────────────────────────────

GUIA_BODY = """## Cómo usar esta guía

Leé cada módulo completo antes de usar las preguntas orientadoras. Los **conceptos en negrita** son los más frecuentes en los parciales. El objetivo es que puedas responder cada pregunta sin mirar el resumen.

---

## Módulo 1 — Introducción a la Filosofía

### Conceptos clave

- **Etimología de filosofía**: *philos* (amor, amistad) + *sophia* (sabiduría) = amor a la sabiduría
- **Mythos vs. Lógos**: el mythos explica el mundo mediante relatos de dioses y héroes; el lógos lo hace mediante argumentos racionales y causas naturales. El paso del mythos al lógos marca el origen de la filosofía
- **Polis griega**: espacio de deliberación pública donde los ciudadanos debían justificar sus posiciones con argumentos; condición de posibilidad de la filosofía
- **Ironía socrática** (*eironeía*): Sócrates fingía ignorancia para que el interlocutor expusiera sus ideas y luego, mediante preguntas, lo llevaba a descubrir las contradicciones de su propio saber
- **Funciones críticas de la filosofía**: incomodar (al cuestionar lo dado por sentado), entristecer (al mostrar contradicciones de la realidad) y criticar saberes naturalizados
- **Thaumazein**: el asombro ante lo conocido es el origen y motor de la filosofía (Platón, Aristóteles)

### Preguntas orientadoras

1. ¿Qué significa etimológicamente "filosofía"? ¿Qué implica esa definición sobre la actitud del filósofo?
2. ¿En qué se diferencian el mythos y el lógos? ¿Por qué el paso de uno al otro marca el origen de la filosofía?
3. ¿Por qué la polis griega fue condición de posibilidad para el surgimiento de la filosofía?
4. ¿En qué consiste la ironía socrática? ¿Cuál es su propósito filosófico?
5. ¿Por qué la filosofía "incomoda" y "entristece"? ¿Qué función cumple eso?
6. ¿Qué relación tiene el asombro (*thaumazein*) con el inicio de la actividad filosófica?

---

## Módulo 2 — Epistemología

### Conceptos clave

- **Doxa**: opinión, conocimiento sin fundamento racional sólido, basado en la apariencia o la costumbre
- **Episteme**: conocimiento verdadero, necesario y justificado
- **Epistemología**: disciplina filosófica que estudia los tipos de conocimiento, sus fundamentos, alcances y límites
- **Ciencia moderna (s. XVII)**: Galileo, Bacon y Descartes reemplazaron la autoridad de Aristóteles con la matematización de la naturaleza y el método experimental
- **Hermenéutica**: plantea que todo conocimiento implica interpretación desde un horizonte cultural e histórico; no existe acceso neutro a la realidad
- **Dialéctica hegeliana**: tesis → antítesis → síntesis (*Aufhebung*: supera ambas conservando lo positivo de cada una en un nivel superior)
- **Ideología (Marx)**: las ideas dominantes de una época son las ideas de la clase dominante; el conocimiento no es neutro sino que refleja intereses de clase

### Preguntas orientadoras

1. ¿Qué diferencia hay entre doxa y episteme? ¿Por qué esta distinción es el punto de partida de la epistemología?
2. ¿Qué transformación representó la ciencia moderna del siglo XVII respecto al conocimiento anterior?
3. ¿Qué problema epistemológico plantea la hermenéutica? ¿Es posible el conocimiento objetivo?
4. ¿Cómo opera la dialéctica hegeliana? Explicá el concepto de *Aufhebung*.
5. ¿Qué relación hay entre el concepto marxista de "ideología" y la epistemología?
6. ¿En qué se parecen la ironía socrática y la hermenéutica como modos de acceso al conocimiento?

---

## Módulo 3 — Antropología Filosófica

### Conceptos clave

- **"Conócete a ti mismo"**: inscripción del oráculo de Delfos; sintetiza el programa de la Antropología Filosófica
- **Zoón politikón** (Aristóteles): el ser humano es por naturaleza un animal político; solo fuera de la polis puede vivir una bestia o un dios
- **Concepción griega clásica**: hombre como ser natural y político, sin dimensión sobrenatural
- **Concepción cristiana**: alma inmortal creada por Dios a imagen divina + caída por pecado original + redención
- **Ilustración** (*Aufklärung*): la razón autónoma es la facultad definitoria del ser humano (*sapere aude*: atrévete a usar tu propia razón, Kant)
- **Sartre / Existencialismo**: "la existencia precede a la esencia" — el ser humano no tiene naturaleza fija predeterminada; primero existe y luego se define mediante sus elecciones y acciones
- **Mito de Edipo**: ilustra que el autoconocimiento es un proceso doloroso; Edipo creía conocerse pero ignoraba su verdad más profunda

### Preguntas orientadoras

1. ¿Qué significa que el hombre es "zoón politikón" para Aristóteles? ¿Qué consecuencias tiene para la política?
2. ¿En qué difiere la concepción cristiana del hombre de la griega clásica?
3. ¿Qué papel le otorga la Ilustración a la razón humana?
4. ¿Qué significa que "la existencia precede a la esencia" en Sartre? ¿Qué implicancias tiene para la libertad y la responsabilidad?
5. ¿Qué revela el mito de Edipo sobre la dificultad del autoconocimiento?
6. ¿Cómo desafía el existencialismo la noción tradicional de "naturaleza humana"?

---

## Módulo 4 — Filosofía Social y Política

### Conceptos clave

- **Estado de naturaleza**: hipótesis teórica (no período histórico) sobre cómo sería la vida humana sin instituciones políticas
- **Hobbes**: estado de naturaleza = guerra de todos contra todos (*bellum omnium contra omnes*); vida "solitaria, pobre, desagradable, brutal y breve"; contrato → ceden todos los derechos al **Leviatán** (soberano absoluto e irrevocable)
- **Rousseau**: hombre naturalmente bueno ("buen salvaje"); la desigualdad no es natural sino resultado de la sociedad, especialmente de la **propiedad privada**; **voluntad general** (bien común) ≠ **voluntad de todos** (suma de intereses particulares); soberanía inalienable en el pueblo
- **Locke**: los hombres poseen **derechos naturales** (vida, libertad, propiedad) anteriores al Estado; el gobierno es un fideicomisario que los ciudadanos pueden revocar si los viola (derecho a la resistencia)
- **Marx**: **alienación** del trabajador = separación del producto, de la actividad, del ser genérico y de otros hombres; **ideología** = ideas dominantes al servicio de la clase dominante

### Preguntas orientadoras

1. ¿Cómo describe Hobbes el estado de naturaleza? ¿Por qué lleva inevitablemente al contrato social?
2. ¿En qué se diferencia el contrato social de Hobbes del de Rousseau? ¿A qué formas de gobierno lleva cada uno?
3. ¿Cuál es el aporte central de Locke sobre los derechos naturales y los límites del poder estatal?
4. ¿Qué entiende Marx por alienación? Describí al menos dos de sus cuatro dimensiones.
5. ¿En qué se diferencian la "voluntad de todos" y la "voluntad general" en Rousseau?
6. ¿En qué sentido la filosofía política moderna (Hobbes, Locke, Rousseau) rompe con Aristóteles?

---

## Módulo 5 — Ética

### Conceptos clave

- **Intelectualismo ético (Platón)**: nadie hace el mal voluntariamente; el mal proviene de la ignorancia; quien conoce el bien necesariamente lo practica → la educación filosófica es la vía hacia la virtud
- **Eudaimonía (Aristóteles)**: felicidad o florecimiento humano; fin último de la acción; se alcanza ejerciendo las virtudes como **término medio** entre dos extremos viciosos
- **Ética teleológica**: evalúa las acciones por el fin (*telos*) que persiguen
- **Ética deontológica**: evalúa las acciones por el deber y la universalidad de la máxima, independientemente de las consecuencias
- **Imperativo categórico (Kant)**: "actúa solo según aquella máxima que puedas querer que se convierta en ley universal"; incondicional (no depende de deseos ni consecuencias); su formulación práctica: tratar a la humanidad siempre como fin y nunca como mero medio → funda la **dignidad humana**
- **Levinas**: el rostro del Otro me interpela e impone una **responsabilidad incondicional** antes de cualquier elección o contrato; la ética del Otro es anterior a cualquier sistema moral
- **Nietzsche**: la moral dominante es una "moral de esclavos" que sirve al resentimiento; los valores morales no son universales sino instrumentos de poder
- **Dussel / Filosofía de la Liberación**: critica que la ética comunicativa (Habermas) ignora las asimetrías de poder y la exclusión de los pueblos periféricos

### Preguntas orientadoras

1. ¿Qué es el intelectualismo ético de Platón? ¿Qué consecuencias tiene para la educación y la política?
2. ¿Cómo define Aristóteles la eudaimonía? ¿Qué es la virtud como "término medio"?
3. ¿Qué es el imperativo categórico? ¿Por qué es "categórico" y no "hipotético"?
4. ¿En qué se diferencia la ética teleológica de la deontológica? Usá a Aristóteles y Kant como ejemplos.
5. ¿Qué propone Levinas con la "ética del Otro"? ¿Cómo se relaciona con la dignidad humana en Kant?
6. ¿Qué tienen en común Nietzsche y Marx en su crítica a la moral dominante?
7. ¿Cómo conectan el intelectualismo ético de Platón y el imperativo categórico de Kant? ¿Qué los diferencia?

---

## Cuadro comparativo de autores

| Autor | Época | Área temática | Concepto central | Posición clave |
|-------|-------|---------------|-----------------|----------------|
| **Sócrates** | s. V a.C. | Epistemología / Ética | Ironía socrática, autoconocimiento | El saber comienza por reconocer la propia ignorancia |
| **Platón** | s. IV a.C. | Ética | Intelectualismo ético | El mal es ignorancia; el bien se conoce con la razón |
| **Aristóteles** | s. IV a.C. | Antropología / Ética | *Zoón politikón*, *eudaimonía* | El hombre es social por naturaleza; la felicidad es el fin último |
| **Galileo / Bacon** | s. XVII | Epistemología | Ciencia moderna | La naturaleza es un libro escrito en lenguaje matemático |
| **Descartes** | s. XVII | Epistemología | Método racional, duda metódica | La razón es el fundamento del conocimiento verdadero |
| **Hobbes** | s. XVII | Filosofía Política | Leviatán, contrato social | Estado de naturaleza: guerra; soberano absoluto e irrevocable |
| **Locke** | s. XVII | Filosofía Política | Derechos naturales | Vida, libertad y propiedad son anteriores al Estado |
| **Rousseau** | s. XVIII | Filosofía Política | Buen salvaje, voluntad general | Hombre bueno por naturaleza; la propiedad introduce la desigualdad |
| **Kant** | s. XVIII | Ética / Epistemología | Imperativo categórico, dignidad | Ley moral racional y universal; tratar a todo ser humano como fin |
| **Hegel** | s. XIX | Epistemología | Dialéctica (Aufhebung) | El conocimiento avanza por tesis, antítesis y síntesis |
| **Marx** | s. XIX | Filosofía Política | Alienación, ideología | El capitalismo aliena al trabajador; las ideas dominantes sirven al poder |
| **Nietzsche** | s. XIX | Ética | Moral de esclavos, voluntad de poder | Los valores morales no son universales; ocultan relaciones de poder |
| **Sartre** | s. XX | Antropología | "La existencia precede a la esencia" | El ser humano no tiene naturaleza fija; se define por sus elecciones |
| **Levinas** | s. XX | Ética | Ética del Otro, responsabilidad | El rostro del Otro genera responsabilidad incondicional antes que cualquier contrato |
| **Dussel** | s. XX-XXI | Ética Política | Filosofía de la Liberación | La ética comunicativa ignora la exclusión de los pueblos periféricos |
"""


EXAMEN_BODY = """## Instrucciones

- Tiempo estimado: 90 minutos
- Respondé con fundamentación: no basta con definir un concepto, hay que relacionarlo con el autor y explicar el "por qué"
- Usá los términos técnicos aprendidos en el curso
- Total: 10 puntos

---

## Parte I — Conceptos fundamentales (4 puntos)

### Pregunta 1 (1 punto)

Explicá la diferencia entre **doxa** y **episteme**, y por qué esta distinción es el punto de partida de la epistemología.

**Respuesta modelo:**

La *doxa* (opinión) es un tipo de conocimiento sin fundamento racional sólido, basado en la apariencia, la costumbre o la experiencia sensorial inmediata. La *episteme* es el conocimiento verdadero: necesario, justificado y universal. La epistemología surge precisamente como la disciplina que pregunta cuándo y cómo es posible pasar de la doxa a la episteme, qué condiciones debe cumplir un conocimiento para ser genuinamente verdadero, y cuáles son sus límites. Sin esta distinción inicial no habría problema epistemológico.

---

### Pregunta 2 (1 punto)

¿Qué significa que el ser humano es un "**zoón politikón**" según Aristóteles? ¿En qué se diferencia esta posición de los contractualistas modernos (Hobbes, Locke, Rousseau)?

**Respuesta modelo:**

Para Aristóteles, el ser humano es por naturaleza un animal político: la vida en comunidad (la polis) no es algo opcional ni artificial, sino constitutiva de la naturaleza humana. Solo fuera de la polis puede vivir una bestia o un dios. La sociedad es, por tanto, natural.

Los contractualistas modernos invierten completamente este punto de partida: parten de individuos prepolíticos en un "estado de naturaleza" (que es una hipótesis teórica, no un período histórico real) y explican el origen de la sociedad como resultado de un contrato voluntario. Para Hobbes, Locke y Rousseau, la sociedad es un artificio, no algo natural. Esta inversión es la ruptura fundamental con Aristóteles.

---

### Pregunta 3 (1 punto)

¿En qué consiste el **imperativo categórico** de Kant? ¿Por qué es "categórico" y no "hipotético"?

**Respuesta modelo:**

El imperativo categórico es el principio supremo de la moral kantiana: "actúa solo según aquella máxima que puedas querer que se convierta en ley universal". Es un mandato que obliga incondicionalmente, sin depender de deseos particulares ni de las consecuencias de la acción.

Kant distingue entre imperativos hipotéticos ("si quieres X, haz Y") y categóricos ("haz Y", sin condición). Un imperativo hipotético depende de un fin subjetivo; el categórico obliga por sí mismo, porque es racional. Su formulación práctica añade: "actúa de tal modo que trates a la humanidad, en tu persona y en la de cualquier otro, siempre como fin y nunca solo como medio". Esta fórmula funda la dignidad humana incondicional.

---

### Pregunta 4 (1 punto)

¿Qué es la **alienación del trabajador** para Marx? Mencioná al menos dos de sus dimensiones.

**Respuesta modelo:**

La alienación es el proceso por el cual el trabajador, bajo el capitalismo, se vuelve extraño a sí mismo y a su actividad. Marx distingue cuatro dimensiones:

1. **Alienación del producto**: el trabajador produce objetos que no le pertenecen; el producto se enfrenta a él como una potencia extraña y hostil.
2. **Alienación de la actividad productiva**: el trabajo no es libre sino forzado; el trabajador solo se siente en sí mismo fuera del trabajo.
3. **Alienación del ser genérico**: el trabajo debería ser la expresión de la esencia humana (la actividad libre y consciente), pero bajo el capitalismo se convierte en mero medio de subsistencia.
4. **Alienación de los otros hombres**: las relaciones humanas quedan mediadas por el dinero y la competencia, distanciando a las personas entre sí.

---

## Parte II — Análisis y comparación (4 puntos)

### Pregunta 5 (2 puntos)

Comparé las concepciones del **estado de naturaleza** en Hobbes y Rousseau. ¿A qué conclusiones políticas lleva cada posición?

**Respuesta modelo:**

**Hobbes** describe el estado de naturaleza como una guerra de todos contra todos (*bellum omnium contra omnes*). Los hombres son iguales en su capacidad de hacerse daño, lo que genera un estado permanente de miedo y violencia donde la vida es "solitaria, pobre, desagradable, brutal y breve". Para salir de él, los individuos celebran un contrato por el cual ceden todos sus derechos naturales a un soberano absoluto e irrevocable, el Leviatán. Una vez cedido el poder, no hay derecho a resistencia: la paz vale más que la libertad.

**Rousseau** parte de la premisa opuesta: el hombre en el estado de naturaleza es bueno, inocente y autosuficiente (el "buen salvaje"). La desigualdad y la corrupción moral no son naturales sino históricas: surgen con la institución de la propiedad privada y la sociedad civil. Su propuesta política es radicalmente diferente: la soberanía reside siempre en la **voluntad general** (que busca el bien común), es inalienable e indivisible, y ningún gobernante puede apropiársela definitivamente. El pueblo conserva el derecho a revocar a quienes traicionan la voluntad general.

En síntesis: Hobbes justifica el absolutismo como condición de la paz; Rousseau funda la soberanía popular como condición de la justicia.

---

### Pregunta 6 (2 puntos)

Explicá la diferencia entre **ética teleológica** y **ética deontológica** usando a Aristóteles y Kant como representantes.

**Respuesta modelo:**

La **ética teleológica** (del griego *telos*: fin, propósito) evalúa la moralidad de las acciones según el fin que persiguen. En Aristóteles, el fin último de toda acción humana es la **eudaimonía** (felicidad, florecimiento): un estado de vida plena y bien vivida que se alcanza ejerciendo las virtudes. Una virtud es el término medio entre dos vicios extremos (por ejemplo, la valentía es el medio entre la cobardía y la temeridad). Una acción es buena si contribuye al florecimiento del agente y de la comunidad. Las consecuencias importan.

La **ética deontológica** (del griego *deon*: deber) evalúa la moralidad de las acciones según la intención y la universalidad de la máxima, con independencia de las consecuencias. Para Kant, una acción es moral únicamente si se realiza *por deber* y conforme al **imperativo categórico**: la máxima de la acción debe poder ser universalizada sin contradicción. No importa si el resultado es bueno o malo; lo decisivo es que la intención sea pura y la máxima universalizable. Además, el ser humano debe ser tratado siempre como fin en sí mismo y nunca como mero medio.

La diferencia central: para Aristóteles, el criterio moral es el bien como fin (*¿hacia dónde va la acción?*); para Kant, el criterio es el deber y la razón universal (*¿desde qué principio se actúa?*).

---

## Parte III — Reflexión integradora (2 puntos)

### Pregunta 7 (2 puntos)

"La existencia precede a la esencia" (Sartre). Explicá qué significa esta afirmación y cómo desafía las concepciones del ser humano estudiadas en el módulo de Antropología Filosófica.

**Respuesta modelo:**

En la metafísica tradicional, la esencia de un objeto precede a su existencia: el artesano tiene en mente el concepto (esencia) del objeto antes de fabricarlo. Aplicado al ser humano, esto significaría que existe una naturaleza humana predefinida —por Dios, por la razón, por la biología— que determina lo que el hombre debe ser y hacer.

Sartre invierte radicalmente este orden: el ser humano **primero existe** —aparece en el mundo sin ninguna naturaleza fija predeterminada— y **luego se define a sí mismo** a través de sus elecciones, acciones y compromisos. No hay esencia humana dada de antemano: el hombre es lo que hace de sí mismo. Esta afirmación implica una **libertad radical** y, con ella, una **responsabilidad radical**: no podemos culpar a nuestra naturaleza, a Dios, ni a la sociedad de lo que somos.

Esta posición desafía directamente las concepciones del módulo:

- **Aristóteles** (*zoón politikón*): postula una naturaleza humana que nos inclina constitutivamente a la vida política. Para Sartre, esa inclinación no existe como dato previo.
- **Concepción cristiana**: afirma que el alma inmortal fue creada por Dios a su imagen, con una esencia definida y una historia de caída y redención. Sartre niega toda esencia dada por Dios.
- **Ilustración**: exalta la razón como la facultad esencial del ser humano, postulando una naturaleza racional universal. El existencialismo rechaza incluso esta versión secular de la esencia humana.

La consecuencia existencial es la **angustia**: si no hay naturaleza que nos guíe, somos absolutamente responsables de cada elección, y esa responsabilidad —que abarca no solo a nosotros sino a todos los seres humanos, pues al elegir proponemos una imagen del hombre— es el peso de la libertad.

---

## Criterios de corrección

| Criterio | Descripción |
|----------|-------------|
| **Conceptual** | Define y aplica correctamente los conceptos técnicos del módulo |
| **Relacional** | Vincula los conceptos con los autores y las corrientes correspondientes |
| **Argumentativo** | No solo describe: explica el "por qué" y las implicancias de cada posición |
| **Integrador** | En preguntas comparativas, establece diferencias y similitudes con precisión |
"""


# ── 4. Insertar los content_items ────────────────────────────────────────────

items = [
    {
        "subject_id":  SUBJECT_ID,
        "title":       "Guía de Estudio",
        "body":        GUIA_BODY.strip(),
        "type":        "guide",
        "order_index": 1,
        "is_published": True,
    },
    {
        "subject_id":  SUBJECT_ID,
        "title":       "Modelo de Examen",
        "body":        EXAMEN_BODY.strip(),
        "type":        "exam_model",
        "order_index": 2,
        "is_published": True,
    },
]

for item in items:
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/content_items",
        headers=HEADERS,
        json=item,
    )
    if r.status_code in (200, 201):
        created = r.json()
        item_id = created[0]["id"] if isinstance(created, list) else created.get("id", "?")
        print(f"  ✓ [{item['type']}] '{item['title']}' — id={item_id}")
    else:
        print(f"  ✗ Error en '{item['title']}': {r.status_code} — {r.text}")

print("\n✓ Listo. Filosofía ahora tiene material de apoyo en la plataforma.")
