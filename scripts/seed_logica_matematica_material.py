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


# ── 1. Obtener subject_id ─────────────────────────────────────────────────────

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/subjects?slug=eq.logica-matematica&select=id,name",
    headers=HEADERS,
)
subjects = r.json()
if not subjects:
    print("ERROR: no se encontró la materia 'logica-matematica'")
    sys.exit(1)

SUBJECT_ID = subjects[0]["id"]
print(f"✓ Subject: {subjects[0]['name']} — id={SUBJECT_ID}")


# ── 2. Verificar si ya existen content_items para no duplicar ─────────────────

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/content_items?subject_id=eq.{SUBJECT_ID}&select=id,title,type",
    headers=HEADERS,
)
all_items = r.json()
existing = [i for i in all_items if i["type"] in ("guide", "exam_model")]
if existing:
    print(f"\n⚠️  Ya existen {len(existing)} content_items de apoyo para Lógica Matemática:")
    for item in existing:
        print(f"   - [{item['type']}] {item['title']}")
    print("\nAbortando para evitar duplicados. Eliminá los existentes primero si querés regenerarlos.")
    sys.exit(0)

print("✓ No hay content_items previos — insertando materiales nuevos\n")


# ── 3. Contenido ──────────────────────────────────────────────────────────────

GUIA_BODY = """## Cómo usar esta guía

Leé cada módulo completo antes de responder las preguntas orientadoras. Los **conceptos en negrita** son los más frecuentes en los parciales. El objetivo es que puedas responder cada pregunta sin mirar el resumen.

---

## Módulo 1 — Lógica

### Conceptos clave

- **Proposición:** oración declarativa con sentido de la cual se puede inferir si es verdadera o falsa. Se simboliza con letras minúsculas. Pueden ser simples o compuestas
- **Conectivos lógicos:** símbolos que combinan proposiciones: ～ (negación), ˄ (conjunción), ˅ (disyunción incluyente), ⇒ (implicación), ⇔ (doble implicación), ⊻ (disyunción excluyente)
- **Negación (～p):** invierte el valor de verdad. Si p es V, ～p es F
- **Conjunción (p ˄ q):** verdadera solo cuando ambas proposiciones son verdaderas
- **Disyunción incluyente (p ˅ q):** falsa solo cuando ambas proposiciones son falsas
- **Implicación (p ⇒ q):** falsa ÚNICAMENTE cuando el antecedente es V y el consecuente es F. En todos los demás casos es verdadera
- **Doble implicación (p ⇔ q):** verdadera solo cuando ambas proposiciones tienen el mismo valor de verdad. Equivale a (p ⇒ q) ˄ (q ⇒ p)
- **Disyunción excluyente (p ⊻ q):** verdadera cuando exactamente una de las proposiciones es verdadera. Equivale a ～(p ⇔ q)
- **Tautología (Ley Lógica):** proposición compuesta cuya tabla de verdad resulta siempre verdadera
- **Contradicción:** proposición compuesta cuya tabla de verdad resulta siempre falsa
- **Contingencia:** proposición compuesta con resultados mixtos (V y F) en su tabla de verdad
- **Razonamiento:** conjunto de 2 o más proposiciones donde las premisas apoyan a la conclusión

### Preguntas orientadoras

1. ¿Qué es una proposición? ¿Por qué "¿Qué hora es?" no es una proposición?
2. ¿En qué único caso es FALSA la implicación p ⇒ q?
3. ¿Cuál es la diferencia entre la disyunción incluyente (˅) y la excluyente (⊻)?
4. ¿Cómo se construye la tabla de verdad de p ⇔ q a partir de (p ⇒ q) ˄ (q ⇒ p)?
5. ¿Qué diferencia hay entre una tautología, una contradicción y una contingencia?
6. Dadas p: V y q: F, calculá el valor de: (p ˄ q), (p ˅ q), (p ⇒ q), (p ⇔ q)

---

## Módulo 2 — Teoría de conjuntos

### Conceptos clave

- **Conjunto:** colección de elementos con características comunes. Se nombra con letras mayúsculas
- **Pertenencia:** ∈ (pertenece), ∉ (no pertenece)
- **Conjunto universal (U):** formado por todos los elementos del tema de interés
- **Conjunto vacío (∅):** sin elementos
- **Conjunto unitario:** con un único elemento
- **Por extensión:** se enumeran todos sus elementos. Ej: A = {a, e, i, o, u}
- **Por comprensión:** se describe la característica. Ej: A = {x / x son vocales}
- **Inclusión (A ⊂ B):** todos los elementos de A pertenecen a B
- **Igualdad (A = B):** dos conjuntos son iguales si son idénticos
- **Complemento (Aᶜ):** elementos del Universal que NO pertenecen a A
- **Intersección (A ∩ B):** elementos que pertenecen a A Y a B simultáneamente
- **Unión (A ∪ B):** elementos que pertenecen a A O a B
- **Diferencia (A - B):** elementos de A que NO pertenecen a B. NO es conmutativa
- **Diferencia simétrica (A Δ B):** unión de (A-B) y (B-A). ES conmutativa
- **Diagrama de Venn:** representación visual de conjuntos; el universal como rectángulo, los conjuntos como recintos cerrados

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre definir un conjunto por extensión y por comprensión?
2. ¿Qué significa A ⊂ B? ¿Es lo mismo que A = B?
3. ¿Cuál es la diferencia entre intersección (A ∩ B) y unión (A ∪ B)?
4. ¿Por qué la diferencia A - B NO es conmutativa? Dá un ejemplo
5. ¿Qué es el complemento de un conjunto? ¿Qué relación tiene con el conjunto universal?
6. Dados A = {1,2,3,4} y B = {3,4,5,6}, calculá: A ∩ B, A ∪ B, A - B, A Δ B

---

## Módulo 3 — Funciones

### Conceptos clave

- **Función:** relación entre dos conjuntos donde a cada elemento del dominio le corresponde un único valor del codominio. y = f(x)
- **Variable independiente (x):** dominio — valores de entrada
- **Variable dependiente (y):** codominio — valores de salida
- **Funciones algebraicas:** operaciones racionales y radicaciones (+, -, ×, ÷, √)
- **Funciones trascendentes:** variable afectada por log, trigonométricas o exponenciales
- **Función lineal:** y = mx + b. Representa una recta
  - m > 0: recta creciente | m = 0: recta constante | m < 0: recta decreciente
  - m = pendiente, b = intersección con eje y
- **Forma explícita:** y despejada. Ej: y = 2x + 1
- **Forma implícita:** sin despejar. Ej: 3y - 2x - 3 = 0 (forma Ax + By + C = 0)
- **Forma segmentaria:** recta que no pasa por el origen, x/a + y/b = 1
- **Ecuación de la recta por dos puntos:** (y - y₁)/(y₂ - y₁) = (x - x₁)/(x₂ - x₁)
- **Rectas paralelas:** m₁ = m₂ y b₁ ≠ b₂
- **Rectas perpendiculares:** m₂ = -1/m₁ (pendientes inversas y de signo opuesto)
- **Rectas secantes:** m₁ ≠ m₂

### Preguntas orientadoras

1. ¿Qué condición debe cumplir una relación para ser función?
2. ¿Cuál es la diferencia entre una función algebraica y una trascendente?
3. ¿Qué representa la pendiente (m) en una función lineal? ¿Qué pasa cuando m = 0?
4. ¿Cómo determinás si dos rectas son paralelas? ¿Y si son perpendiculares?
5. Dada la recta y = 3x - 2, ¿cuál sería la pendiente de una recta paralela? ¿Y de una perpendicular?
6. ¿Cuáles son las tres formas de expresar la ecuación de una recta? ¿En qué situación usarías cada una?

---

## Módulo 4 — Análisis combinatorio

### Conceptos clave

- **Factorial (n!):** producto de todos los enteros desde 1 hasta n. Convenio: 0! = 1
- **Variaciones (Vᵣₘ):** grupos de r elementos tomados de m, donde importa el orden y se consideran distintos si difieren en elementos o en orden. Fórmula: Vᵣₘ = m! / (m-r)!
- **Permutaciones (Pm):** variación de m elementos tomados de a m (todos). Fórmula: Pm = m!
- **Combinaciones (Cᵣₘ):** grupos de r elementos donde NO importa el orden. Fórmula: Cᵣₘ = m! / [(m-r)! × r!]
- **Número combinatorio:** Cᵣₘ también se escribe como C(m, r) o (m sobre r)
- **Regla práctica:** si importa el orden → variaciones/permutaciones; si no importa → combinaciones

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre variaciones y combinaciones?
2. ¿Cuándo se usan permutaciones en lugar de variaciones?
3. Calculá 5! y V³₆ (variaciones de 6 elementos tomados de a 3)
4. ¿Por qué en combinaciones dividimos por r!? ¿Qué estamos eliminando?
5. En un equipo de 10 jugadores, ¿de cuántas formas se puede elegir un capitán y un subcapitán? ¿Y un grupo de 2 jugadores sin roles?
6. ¿Qué tipo de conteo (V, P o C) usarías para: a) ordenar 4 libros en un estante, b) elegir un comité de 3 personas de 10, c) asignar 1er, 2do y 3er puesto a 5 corredores?

---

## Módulo 5 — Probabilidades

### Conceptos clave

- **Probabilidad:** medida de cuán esperable es que un suceso ocurra. P(S) = casos favorables / casos totales
- **Rango:** 0 ≤ P(A) ≤ 1. P = 0: suceso imposible; P = 1: suceso seguro
- **Sucesos aleatorios:** su realización depende del azar
- **Sucesos complementarios (contrarios):** ocurre siempre uno y solo uno. P(A) + P(Aᶜ) = 1
- **Sucesos incompatibles:** no pueden ocurrir simultáneamente
- **Probabilidades totales:** si A y B son incompatibles → P(A o B) = P(A) + P(B)
- **Sucesos independientes:** la probabilidad de uno no influye en la del otro. Pueden ocurrir simultáneamente
- **Probabilidades compuestas:** si A y B son independientes → P(A y B) = P(A) × P(B)

### Preguntas orientadoras

1. ¿Cómo se calcula la probabilidad de un suceso? ¿Qué significa P = 0 y P = 1?
2. ¿Cuál es la diferencia entre sucesos incompatibles e independientes?
3. Si P(A) = 0,3, ¿cuánto es P(Aᶜ)?
4. Al tirar un dado, ¿cuál es la probabilidad de sacar un número par? ¿Y de sacar par o 5?
5. ¿Cuándo se suma y cuándo se multiplica en probabilidades? ¿Qué condición debe cumplirse en cada caso?
6. Se tiran dos dados. ¿Cuál es la probabilidad de que ambos muestren un 6?

---

## Módulo 6 — Estadística

### Conceptos clave

- **Estadística:** ciencia que estudia recolección, análisis e interpretación de datos de una muestra representativa
- **Estadística descriptiva:** describe, visualiza y organiza datos
- **Estadística inferencial:** permite hacer predicciones sobre la población a partir de la muestra
- **Universo / Población:** conjunto de todas las unidades con características comunes
- **Muestra:** subconjunto representativo de la población
- **Variable cualitativa:** no medible numéricamente (sexo, nacionalidad)
- **Variable cuantitativa:** tiene valor numérico (edad, precio). Se divide en:
  - **Discreta:** toma valores naturales (cantidad de hermanos)
  - **Continua:** puede tomar cualquier valor real en un intervalo (peso, tiempo)
- **Variables por dimensión:** unidimensional (1 característica), bidimensional (2), pluridimensional (3+)
- **Frecuencia absoluta (fᵢ):** número de veces que aparece un valor en el estudio
- **Frecuencia relativa (frᵢ):** cociente entre frecuencia absoluta y total de observaciones
- **Medidas de posición:** cuantiles, percentiles, cuartiles, deciles — dividen datos en grupos iguales
- **Medidas de centralización:** media, mediana, moda — valores alrededor de los que se agrupan los datos
- **Medidas de dispersión:** varianza, desviación típica, coeficiente de variación, rango — concentración de los datos
- **Medidas de forma:** asimetría, curtosis (apuntamiento)

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre estadística descriptiva e inferencial?
2. ¿Qué diferencia hay entre población y muestra? ¿Por qué se trabaja con muestras?
3. ¿Cuál es la diferencia entre variable discreta y continua? Dá un ejemplo de cada una
4. ¿Qué información da la frecuencia relativa que no da la absoluta?
5. ¿Para qué sirven las medidas de dispersión? ¿Qué limitación tienen las medidas de centralización sin ellas?
6. Clasificá las siguientes variables: a) temperatura corporal, b) número de hijos, c) color de ojos, d) salario mensual

---

## Cuadro comparativo de conectivos lógicos

| Conectivo | Símbolo | Nombre | Cuándo es FALSO |
|-----------|---------|--------|-----------------|
| No p | ～p | Negación | Cuando p es V |
| p y q | p ˄ q | Conjunción | Cuando al menos una es F |
| p o q (inc) | p ˅ q | Disyunción incluyente | Cuando ambas son F |
| Si p, entonces q | p ⇒ q | Implicación | Solo cuando p=V y q=F |
| p si y solo si q | p ⇔ q | Doble implicación | Cuando tienen distinto valor |
| p o q (exc) | p ⊻ q | Disyunción excluyente | Cuando ambas son iguales |

## Cuadro comparativo de conteo

| Técnica | Importa el orden | Fórmula | Uso típico |
|---------|-----------------|---------|------------|
| Variaciones | Sí | m! / (m-r)! | Puestos con roles distintos |
| Permutaciones | Sí (todos) | m! | Ordenar todos los elementos |
| Combinaciones | No | m! / [(m-r)! r!] | Elegir grupos sin roles |
"""


EXAMEN_BODY = """## Instrucciones

- Tiempo estimado: 90 minutos
- Respondé con justificación: no basta con el resultado, hay que explicar el razonamiento
- Usá los términos técnicos del curso
- Total: 10 puntos

---

## Parte I — Conceptos fundamentales (4 puntos)

### Pregunta 1 (1 punto)

Completá la tabla de verdad de la proposición compuesta **(p ⇒ q) ˄ ～q** e indicá si es tautología, contradicción o contingencia.

**Respuesta modelo:**

| p | q | ～q | p ⇒ q | (p ⇒ q) ˄ ～q |
|---|---|-----|--------|----------------|
| V | V | F | V | F |
| V | F | V | F | F |
| F | V | F | V | F |
| F | F | V | V | V |

La proposición compuesta resulta **falsa en 3 de los 4 casos** y verdadera en uno (cuando p=F y q=F). Por lo tanto es una **contingencia** (ni tautología ni contradicción).

Recordá: la implicación p ⇒ q es FALSA únicamente cuando el antecedente (p) es verdadero y el consecuente (q) es falso. En todos los demás casos es verdadera.

---

### Pregunta 2 (1 punto)

Dados los conjuntos A = {1, 2, 3, 4, 5} y B = {3, 4, 5, 6, 7} con U = {1, 2, 3, 4, 5, 6, 7, 8, 9}. Calculá: A ∩ B, A ∪ B, A - B y Aᶜ.

**Respuesta modelo:**

- **A ∩ B** (intersección — elementos en ambos): {3, 4, 5}
- **A ∪ B** (unión — elementos en alguno de los dos): {1, 2, 3, 4, 5, 6, 7}
- **A - B** (diferencia — elementos de A que no están en B): {1, 2}
- **Aᶜ** (complemento — elementos del universal que no están en A): {6, 7, 8, 9}

Nota: la diferencia A - B ≠ B - A (no es conmutativa). B - A = {6, 7}.

---

### Pregunta 3 (1 punto)

¿Cuántas palabras de 3 letras distintas se pueden formar con las letras de la palabra RADIO? ¿Y cuántos grupos de 3 letras (sin importar el orden)?

**Respuesta modelo:**

RADIO tiene 5 letras distintas: R, A, D, I, O.

**Con orden (variaciones):** V³₅ = 5! / (5-3)! = 5! / 2! = 120 / 2 = **60 palabras**

**Sin orden (combinaciones):** C³₅ = 5! / [(5-3)! × 3!] = 120 / (2 × 6) = 120 / 12 = **10 grupos**

La diferencia: las variaciones cuentan RAD y RDA como arreglos distintos; las combinaciones los cuentan como el mismo grupo {R, A, D}.

---

### Pregunta 4 (1 punto)

En una urna hay 4 bolas rojas y 6 azules. Se extrae una bola al azar. ¿Cuál es la probabilidad de que sea roja? ¿Y de que no sea roja?

**Respuesta modelo:**

Total de bolas: 4 + 6 = 10

**P(roja)** = casos favorables / casos totales = 4/10 = **0,4 (40%)**

**P(no roja)** = 1 - P(roja) = 1 - 0,4 = **0,6 (60%)**

Verificación: P(roja) + P(no roja) = 0,4 + 0,6 = 1 ✓ (son sucesos complementarios)

---

## Parte II — Análisis y aplicación (4 puntos)

### Pregunta 5 (2 puntos)

Dadas las rectas r₁: y = 2x + 3 y r₂ que pasa por los puntos P(1, 5) y Q(3, 9). ¿Son paralelas, perpendiculares o secantes? Justificá.

**Respuesta modelo:**

**Pendiente de r₁:** m₁ = 2 (coeficiente de x en forma explícita y = mx + b)

**Pendiente de r₂:** usando la fórmula de pendiente entre dos puntos:
m₂ = (y₂ - y₁) / (x₂ - x₁) = (9 - 5) / (3 - 1) = 4 / 2 = **2**

**Conclusión:** m₁ = m₂ = 2 → las rectas son **paralelas**.

Para ser paralelas deben tener la misma pendiente y distintas ordenadas al origen. Para verificar que no son la misma recta: r₁ tiene b = 3. Para r₂, usando el punto P(1,5): 5 = 2(1) + b → b = 3. Entonces b₁ = b₂ = 3, lo que significa que son la **misma recta** (coincidentes), no apenas paralelas.

---

### Pregunta 6 (2 puntos)

En una clase de 30 alumnos, 18 aprobaron Matemática y 15 aprobaron Lógica. 8 aprobaron ambas. ¿Cuántos aprobaron al menos una materia? ¿Cuántos no aprobaron ninguna?

**Respuesta modelo:**

Usando la fórmula de la unión de conjuntos (diagrama de Venn):

|A ∪ B| = |A| + |B| - |A ∩ B|

|A ∪ B| = 18 + 15 - 8 = **25 alumnos** aprobaron al menos una materia.

**No aprobaron ninguna:** 30 - 25 = **5 alumnos**

Este problema aplica teoría de conjuntos: A = aprobaron Matemática, B = aprobaron Lógica. La intersección (8 alumnos) se resta para no contarla dos veces. Los que están solo en A: 18 - 8 = 10. Solo en B: 15 - 8 = 7. En ambas: 8. Total: 10 + 7 + 8 = 25 ✓

---

## Parte III — Integración (2 puntos)

### Pregunta 7 (2 puntos)

Un estudio mide la temperatura corporal (°C) y el número de días de fiebre de 100 pacientes. Clasificá las variables, indicá qué tipo de estadística se aplica para describir los datos del estudio y cuál se aplicaría para predecir el comportamiento en la población general. ¿Qué medidas descriptivas usarías para resumir cada variable?

**Respuesta modelo:**

**Clasificación de variables:**
- **Temperatura corporal (°C):** cuantitativa continua (puede tomar cualquier valor real dentro de un intervalo, como 37,2°C o 38,65°C)
- **Número de días de fiebre:** cuantitativa discreta (solo toma valores naturales: 0, 1, 2, 3...)

**Estadística descriptiva** se aplica para organizar y resumir los datos de los 100 pacientes del estudio: tablas de frecuencias, gráficos, medidas descriptivas.

**Estadística inferencial** se aplica para extrapolar conclusiones a la población general (todos los pacientes posibles), a partir de la muestra de 100.

**Medidas descriptivas por variable:**

*Temperatura (continua):*
- **Centralización:** media aritmética (promedio de temperaturas) y mediana (valor central)
- **Dispersión:** desviación típica y varianza (qué tan dispersas son las temperaturas alrededor del promedio)
- **Posición:** percentiles (ej: el percentil 90 indica qué temperatura supera al 90% de los pacientes)

*Días de fiebre (discreta):*
- **Centralización:** moda (cantidad de días más frecuente) y mediana
- **Dispersión:** rango (diferencia entre máximo y mínimo de días)
- Frecuencias absolutas y relativas para cada valor (0 días, 1 día, 2 días, etc.)

---

## Criterios de corrección

| Criterio | Descripción |
|----------|-------------|
| **Procedimiento** | Muestra los pasos intermedios, no solo el resultado final |
| **Conceptual** | Usa correctamente los términos técnicos del módulo |
| **Justificación** | Explica por qué aplica cada fórmula o criterio |
| **Integrador** | En preguntas mixtas, vincula conceptos de distintos módulos |
"""


# ── 4. Insertar los content_items ─────────────────────────────────────────────

items = [
    {
        "subject_id":   SUBJECT_ID,
        "title":        "Guía de Estudio",
        "body":         GUIA_BODY.strip(),
        "type":         "guide",
        "order_index":  1,
        "is_published": True,
    },
    {
        "subject_id":   SUBJECT_ID,
        "title":        "Modelo de Examen",
        "body":         EXAMEN_BODY.strip(),
        "type":         "exam_model",
        "order_index":  2,
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

print("\n✓ Listo. Lógica Matemática ahora tiene material de apoyo en la plataforma.")
